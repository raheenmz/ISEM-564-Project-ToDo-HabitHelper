import { Router, type IRouter } from "express";
import { eq, and, sql, inArray } from "drizzle-orm";
import { db, tasksTable, classificationsTable, groupsTable, groupMembersTable, usersTable, subtasksTable } from "@workspace/db";
import {
  GetTasksResponse,
  GetTaskResponse,
  GetTaskParams,
  CreateTaskBody,
  UpdateTaskBody,
  UpdateTaskParams,
  UpdateTaskResponse,
  DeleteTaskParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { sendTaskAssignedEmail, sendTaskCreatedEmail } from "../services/email";
import { emitGroupEvent } from "../lib/sse";

const router: IRouter = Router();

function computeIsOverdue(deadline: string | null, status: string): boolean {
  if (!deadline || status === "DONE") return false;
  const today = new Date().toISOString().split("T")[0];
  return deadline < today;
}

function taskWithOverdue(task: {
  id: number;
  userId: number;
  classificationId: number | null;
  classificationName: string | null;
  groupId: number | null;
  assignedUserId: number | null;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  deadline: string | null;
  createdAt: Date;
  updatedAt: Date;
  subtaskCount?: number;
  completedSubtaskCount?: number;
  emailNotificationSent?: boolean;
}) {
  return {
    ...task,
    subtaskCount: task.subtaskCount ?? 0,
    completedSubtaskCount: task.completedSubtaskCount ?? 0,
    emailNotificationSent: task.emailNotificationSent ?? false,
    isOverdue: computeIsOverdue(task.deadline, task.status),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

async function getSubtaskCounts(taskIds: number[]): Promise<Map<number, { total: number; completed: number }>> {
  const map = new Map<number, { total: number; completed: number }>();
  if (taskIds.length === 0) return map;

  const counts = await db
    .select({
      taskId: subtasksTable.taskId,
      total: sql<number>`COUNT(*)::int`,
      completed: sql<number>`COUNT(*) FILTER (WHERE ${subtasksTable.completed} = true)::int`,
    })
    .from(subtasksTable)
    .where(inArray(subtasksTable.taskId, taskIds))
    .groupBy(subtasksTable.taskId);

  counts.forEach((c) => map.set(c.taskId, { total: c.total, completed: c.completed }));
  return map;
}

async function verifyClassificationOwnership(
  classificationId: number,
  userId: number,
): Promise<boolean> {
  const [row] = await db
    .select({ id: classificationsTable.id })
    .from(classificationsTable)
    .where(
      and(
        eq(classificationsTable.id, classificationId),
        eq(classificationsTable.userId, userId),
      ),
    );
  return !!row;
}

async function verifyGroupMembership(groupId: number, userId: number): Promise<boolean> {
  const [member] = await db
    .select({ id: groupMembersTable.id })
    .from(groupMembersTable)
    .where(and(eq(groupMembersTable.groupId, groupId), eq(groupMembersTable.userId, userId)));
  if (member) return true;
  const [creator] = await db
    .select({ id: groupsTable.id })
    .from(groupsTable)
    .where(and(eq(groupsTable.id, groupId), eq(groupsTable.createdBy, userId)));
  return !!creator;
}

router.get("/tasks", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const rows = await db
    .select({
      id: tasksTable.id,
      userId: tasksTable.userId,
      classificationId: tasksTable.classificationId,
      classificationName: classificationsTable.name,
      groupId: tasksTable.groupId,
      assignedUserId: tasksTable.assignedUserId,
      title: tasksTable.title,
      description: tasksTable.description,
      priority: tasksTable.priority,
      status: tasksTable.status,
      deadline: tasksTable.deadline,
      createdAt: tasksTable.createdAt,
      updatedAt: tasksTable.updatedAt,
    })
    .from(tasksTable)
    .leftJoin(
      classificationsTable,
      eq(tasksTable.classificationId, classificationsTable.id),
    )
    .where(eq(tasksTable.userId, userId));

  const subtaskCounts = await getSubtaskCounts(rows.map((r) => r.id));

  const result = rows.map((r) => {
    const counts = subtaskCounts.get(r.id) ?? { total: 0, completed: 0 };
    return taskWithOverdue({ ...r, subtaskCount: counts.total, completedSubtaskCount: counts.completed });
  });

  res.json(GetTasksResponse.parse(result));
});

router.post("/tasks", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { classificationId, groupId, ...rest } = parsed.data;

  if (classificationId != null) {
    const owned = await verifyClassificationOwnership(classificationId, userId);
    if (!owned) {
      res.status(403).json({ error: "Classification does not belong to you" });
      return;
    }
  }

  if (groupId != null) {
    const isMember = await verifyGroupMembership(groupId, userId);
    if (!isMember) {
      res.status(403).json({ error: "You are not a member of that group" });
      return;
    }
  }

  const [task] = await db
    .insert(tasksTable)
    .values({ ...rest, userId, classificationId: classificationId ?? null, groupId: groupId ?? null })
    .returning();

  const classificationName = classificationId
    ? await db
        .select({ name: classificationsTable.name })
        .from(classificationsTable)
        .where(eq(classificationsTable.id, classificationId))
        .then((rows) => rows[0]?.name ?? null)
    : null;

  let emailNotificationSent = false;

  if (groupId != null) {
    try {
      const [group] = await db
        .select({ name: groupsTable.groupName })
        .from(groupsTable)
        .where(eq(groupsTable.id, groupId));

      const [creator] = await db
        .select({ name: usersTable.name })
        .from(usersTable)
        .where(eq(usersTable.id, userId));

      const members = await db
        .select({ email: usersTable.email, name: usersTable.name, uid: usersTable.id })
        .from(groupMembersTable)
        .innerJoin(usersTable, eq(groupMembersTable.userId, usersTable.id))
        .where(eq(groupMembersTable.groupId, groupId));

      const groupName = group?.name ?? "your group";
      const creatorName = creator?.name ?? "a team member";

      const results = await Promise.all(
        members
          .filter((m) => m.uid !== userId)
          .map((m) =>
            sendTaskCreatedEmail({
              toEmail: m.email,
              toName: m.name,
              taskTitle: task.title,
              groupName,
              creatorName,
              deadline: task.deadline ?? null,
            }),
          ),
      );
      emailNotificationSent = results.some(Boolean);
    } catch {
      // email errors are non-fatal
    }
  }

  if (task.groupId != null) {
    emitGroupEvent({ type: "task:created", groupId: task.groupId });
  }

  res.status(201).json(
    GetTaskResponse.parse(
      taskWithOverdue({
        ...task,
        classificationName: classificationName ?? null,
        subtaskCount: 0,
        completedSubtaskCount: 0,
        emailNotificationSent,
      }),
    ),
  );
});

router.get("/tasks/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const params = GetTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select({
      id: tasksTable.id,
      userId: tasksTable.userId,
      classificationId: tasksTable.classificationId,
      classificationName: classificationsTable.name,
      groupId: tasksTable.groupId,
      assignedUserId: tasksTable.assignedUserId,
      title: tasksTable.title,
      description: tasksTable.description,
      priority: tasksTable.priority,
      status: tasksTable.status,
      deadline: tasksTable.deadline,
      createdAt: tasksTable.createdAt,
      updatedAt: tasksTable.updatedAt,
    })
    .from(tasksTable)
    .leftJoin(
      classificationsTable,
      eq(tasksTable.classificationId, classificationsTable.id),
    )
    .where(and(eq(tasksTable.id, params.data.id), eq(tasksTable.userId, userId)));

  if (!row) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const subtaskCounts = await getSubtaskCounts([row.id]);
  const counts = subtaskCounts.get(row.id) ?? { total: 0, completed: 0 };

  res.json(GetTaskResponse.parse(taskWithOverdue({ ...row, subtaskCount: counts.total, completedSubtaskCount: counts.completed })));
});

router.put("/tasks/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const params = UpdateTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(tasksTable)
    .where(and(eq(tasksTable.id, params.data.id), eq(tasksTable.userId, userId)));

  if (!existing) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  if (parsed.data.classificationId != null) {
    const owned = await verifyClassificationOwnership(parsed.data.classificationId, userId);
    if (!owned) {
      res.status(403).json({ error: "Classification does not belong to you" });
      return;
    }
  }

  if (parsed.data.groupId != null) {
    const isMember = await verifyGroupMembership(parsed.data.groupId, userId);
    if (!isMember) {
      res.status(403).json({ error: "You are not a member of that group" });
      return;
    }
  }

  const d = parsed.data;
  const updateValues: Partial<typeof tasksTable.$inferInsert> = {};
  if (d.title !== undefined)       updateValues.title            = d.title;
  if (d.description !== undefined) updateValues.description      = d.description ?? null;
  if (d.priority !== undefined)    updateValues.priority         = d.priority;
  if (d.status !== undefined)      updateValues.status           = d.status;
  if (d.deadline !== undefined)    updateValues.deadline         = d.deadline ?? null;
  if ("classificationId" in d)     updateValues.classificationId = d.classificationId ?? null;
  if ("groupId" in d)              updateValues.groupId          = d.groupId ?? null;
  if ("assignedUserId" in d)       updateValues.assignedUserId   = d.assignedUserId ?? null;

  const [updated] = await db
    .update(tasksTable)
    .set(updateValues)
    .where(and(eq(tasksTable.id, params.data.id), eq(tasksTable.userId, userId)))
    .returning();

  const classificationId = updated.classificationId;
  const classificationName = classificationId
    ? await db
        .select({ name: classificationsTable.name })
        .from(classificationsTable)
        .where(eq(classificationsTable.id, classificationId))
        .then((rows) => rows[0]?.name ?? null)
    : null;

  const subtaskCounts = await getSubtaskCounts([updated.id]);
  const counts = subtaskCounts.get(updated.id) ?? { total: 0, completed: 0 };

  let emailNotificationSent = false;

  const prevAssignedUserId = existing.assignedUserId;
  const newAssignedUserId = updated.assignedUserId;
  const groupId = updated.groupId;

  if (
    newAssignedUserId != null &&
    newAssignedUserId !== prevAssignedUserId &&
    groupId != null
  ) {
    try {
      const [assignee] = await db
        .select({ email: usersTable.email, name: usersTable.name })
        .from(usersTable)
        .where(eq(usersTable.id, newAssignedUserId));

      const [group] = await db
        .select({ name: groupsTable.groupName })
        .from(groupsTable)
        .where(eq(groupsTable.id, groupId));

      if (assignee) {
        emailNotificationSent = await sendTaskAssignedEmail({
          toEmail: assignee.email,
          toName: assignee.name,
          taskTitle: updated.title,
          groupName: group?.name ?? "your group",
          priority: updated.priority,
          deadline: updated.deadline ?? null,
        });
      }
    } catch {
      // email errors are non-fatal
    }
  }

  if (updated.groupId != null) {
    emitGroupEvent({ type: "task:updated", groupId: updated.groupId });
  } else if (existing.groupId != null) {
    emitGroupEvent({ type: "task:updated", groupId: existing.groupId });
  }

  res.json(
    UpdateTaskResponse.parse(
      taskWithOverdue({
        ...updated,
        classificationName: classificationName ?? null,
        subtaskCount: counts.total,
        completedSubtaskCount: counts.completed,
        emailNotificationSent,
      }),
    ),
  );
});

router.delete("/tasks/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const params = DeleteTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(tasksTable)
    .where(and(eq(tasksTable.id, params.data.id), eq(tasksTable.userId, userId)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  if (deleted.groupId != null) {
    emitGroupEvent({ type: "task:deleted", groupId: deleted.groupId });
  }

  res.sendStatus(204);
});

export default router;
