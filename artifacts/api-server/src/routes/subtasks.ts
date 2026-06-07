import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, tasksTable, subtasksTable } from "@workspace/db";
import {
  GetSubtasksParams,
  GetSubtasksResponse,
  CreateSubtaskParams,
  CreateSubtaskBody,
  UpdateSubtaskParams,
  UpdateSubtaskBody,
  UpdateSubtaskResponse,
  DeleteSubtaskParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function formatSubtask(s: typeof subtasksTable.$inferSelect) {
  return {
    id: s.id,
    taskId: s.taskId,
    title: s.title,
    completed: s.completed,
    createdAt: s.createdAt.toISOString(),
  };
}

async function verifyTaskOwner(taskId: number, userId: number): Promise<boolean> {
  const [task] = await db
    .select({ id: tasksTable.id })
    .from(tasksTable)
    .where(and(eq(tasksTable.id, taskId), eq(tasksTable.userId, userId)));
  return !!task;
}

router.get("/tasks/:id/subtasks", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const params = GetSubtasksParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid task id" });
    return;
  }

  const owned = await verifyTaskOwner(params.data.id, userId);
  if (!owned) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const rows = await db
    .select()
    .from(subtasksTable)
    .where(eq(subtasksTable.taskId, params.data.id))
    .orderBy(subtasksTable.createdAt);

  res.json(GetSubtasksResponse.parse(rows.map(formatSubtask)));
});

router.post("/tasks/:id/subtasks", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const params = CreateSubtaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid task id" });
    return;
  }

  const owned = await verifyTaskOwner(params.data.id, userId);
  if (!owned) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const body = CreateSubtaskBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [created] = await db
    .insert(subtasksTable)
    .values({ taskId: params.data.id, title: body.data.title })
    .returning();

  res.status(201).json(formatSubtask(created));
});

router.patch("/tasks/:id/subtasks/:subtaskId", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const params = UpdateSubtaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }

  const owned = await verifyTaskOwner(params.data.id, userId);
  if (!owned) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const body = UpdateSubtaskBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updateVals: Partial<typeof subtasksTable.$inferInsert> = {};
  if (body.data.title !== undefined) updateVals.title = body.data.title;
  if (body.data.completed !== undefined) updateVals.completed = body.data.completed;

  if (Object.keys(updateVals).length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }

  const [updated] = await db
    .update(subtasksTable)
    .set(updateVals)
    .where(
      and(
        eq(subtasksTable.id, params.data.subtaskId),
        eq(subtasksTable.taskId, params.data.id),
      ),
    )
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Subtask not found" });
    return;
  }

  res.json(UpdateSubtaskResponse.parse(formatSubtask(updated)));
});

router.delete("/tasks/:id/subtasks/:subtaskId", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const params = DeleteSubtaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }

  const owned = await verifyTaskOwner(params.data.id, userId);
  if (!owned) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const [deleted] = await db
    .delete(subtasksTable)
    .where(
      and(
        eq(subtasksTable.id, params.data.subtaskId),
        eq(subtasksTable.taskId, params.data.id),
      ),
    )
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Subtask not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
