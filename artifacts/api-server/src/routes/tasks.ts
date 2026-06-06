import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, tasksTable, classificationsTable } from "@workspace/db";
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
  title: string;
  description: string | null;
  priority: string;
  status: string;
  deadline: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...task,
    isOverdue: computeIsOverdue(task.deadline, task.status),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
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

router.get("/tasks", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const rows = await db
    .select({
      id: tasksTable.id,
      userId: tasksTable.userId,
      classificationId: tasksTable.classificationId,
      classificationName: classificationsTable.name,
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

  const result = rows.map(taskWithOverdue);
  res.json(GetTasksResponse.parse(result));
});

router.post("/tasks", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { classificationId, ...rest } = parsed.data;

  if (classificationId != null) {
    const owned = await verifyClassificationOwnership(classificationId, userId);
    if (!owned) {
      res.status(403).json({ error: "Classification does not belong to you" });
      return;
    }
  }

  const [task] = await db
    .insert(tasksTable)
    .values({ ...rest, userId, classificationId: classificationId ?? null })
    .returning();

  const classificationName = classificationId
    ? await db
        .select({ name: classificationsTable.name })
        .from(classificationsTable)
        .where(eq(classificationsTable.id, classificationId))
        .then((rows) => rows[0]?.name ?? null)
    : null;

  res.status(201).json(
    GetTaskResponse.parse(
      taskWithOverdue({ ...task, classificationName: classificationName ?? null }),
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

  res.json(GetTaskResponse.parse(taskWithOverdue(row)));
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

  const updateData: Record<string, unknown> = { ...parsed.data };
  if ("classificationId" in parsed.data && parsed.data.classificationId === undefined) {
    delete updateData.classificationId;
  }

  const [updated] = await db
    .update(tasksTable)
    .set(updateData)
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

  res.json(
    UpdateTaskResponse.parse(
      taskWithOverdue({ ...updated, classificationName: classificationName ?? null }),
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

  res.sendStatus(204);
});

export default router;
