import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, tasksTable } from "@workspace/db";
import { GetDashboardSummaryResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard/summary", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const tasks = await db
    .select({
      status: tasksTable.status,
      deadline: tasksTable.deadline,
    })
    .from(tasksTable)
    .where(eq(tasksTable.userId, userId));

  const today = new Date().toISOString().split("T")[0];

  let todoCount = 0;
  let inProgressCount = 0;
  let doneCount = 0;
  let overdueCount = 0;
  let todayCount = 0;

  for (const task of tasks) {
    if (task.status === "TODO") todoCount++;
    else if (task.status === "IN_PROGRESS") inProgressCount++;
    else if (task.status === "DONE") doneCount++;

    if (task.deadline === today) todayCount++;

    if (task.deadline && task.deadline < today && task.status !== "DONE") {
      overdueCount++;
    }
  }

  res.json(
    GetDashboardSummaryResponse.parse({
      totalTasks: tasks.length,
      todoCount,
      inProgressCount,
      doneCount,
      overdueCount,
      todayCount,
    }),
  );
});

export default router;
