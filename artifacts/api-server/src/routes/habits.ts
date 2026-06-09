import { Router, type IRouter } from "express";
import { eq, and, inArray } from "drizzle-orm";
import { db, habitsTable, tasksTable, classificationsTable, habitSkipsTable } from "@workspace/db";
import {
  GetHabitsResponse,
  GetHabitResponse,
  GetHabitParams,
  CreateHabitBody,
  UpdateHabitBody,
  UpdateHabitParams,
  DeleteHabitParams,
  AiSuggestHabitTasksBody,
  SkipHabitTodayParams,
  UnskipHabitTodayParams,
  HabitRobotChatBody,
  UpdateHabitTaskStatusBody,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { suggestTasksForGoal, chatWithHabitRobot } from "../services/ai";
import { generateDailyHabitTasks } from "../services/habitGeneration";
import { addSubscriber, emitHabitProgressEvent } from "../lib/sse";

const router: IRouter = Router();

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

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function computeStreak(
  doneDates: Set<string>,
  startDate: string,
): number {
  let streak = 0;
  const base = new Date();
  let i = 0;
  while (true) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (dateStr < startDate) break;
    if (doneDates.has(dateStr)) {
      streak++;
      i++;
    } else {
      break;
    }
  }
  return streak;
}

async function attachSkipData(
  habits: (typeof habitsTable.$inferSelect)[],
  userId: number,
): Promise<(typeof habitsTable.$inferSelect & { isSkippedToday: boolean; skippedDates: string[]; streak: number })[]> {
  if (habits.length === 0) return [];

  const today = todayStr();
  const habitIds = habits.map((h) => h.id);

  const [skipRows, taskRows] = await Promise.all([
    db
      .select({ habitId: habitSkipsTable.habitId, skipDate: habitSkipsTable.skipDate })
      .from(habitSkipsTable)
      .where(
        and(
          eq(habitSkipsTable.userId, userId),
          inArray(habitSkipsTable.habitId, habitIds),
        ),
      ),
    db
      .select({ habitId: tasksTable.habitId, deadline: tasksTable.deadline, status: tasksTable.status })
      .from(tasksTable)
      .where(
        and(
          eq(tasksTable.userId, userId),
          inArray(tasksTable.habitId, habitIds),
        ),
      ),
  ]);

  const skipsByHabit = new Map<number, string[]>();
  for (const row of skipRows) {
    const existing = skipsByHabit.get(row.habitId) ?? [];
    existing.push(row.skipDate);
    skipsByHabit.set(row.habitId, existing);
  }

  const doneDatesByHabit = new Map<number, Set<string>>();
  for (const row of taskRows) {
    if (row.habitId == null || row.deadline == null || row.status !== "DONE") continue;
    const existing = doneDatesByHabit.get(row.habitId) ?? new Set<string>();
    existing.add(row.deadline);
    doneDatesByHabit.set(row.habitId, existing);
  }

  return habits.map((h) => {
    const skippedDates = skipsByHabit.get(h.id) ?? [];
    const doneDates = doneDatesByHabit.get(h.id) ?? new Set<string>();
    const streak = computeStreak(doneDates, h.startDate);
    return {
      ...h,
      isSkippedToday: skippedDates.includes(today),
      skippedDates,
      streak,
    };
  });
}

function serializeHabit(
  h: typeof habitsTable.$inferSelect & { isSkippedToday: boolean; skippedDates: string[]; streak: number },
) {
  return {
    ...h,
    createdAt: h.createdAt.toISOString(),
    updatedAt: h.updatedAt.toISOString(),
  };
}

router.get("/habits", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const rows = await db
    .select()
    .from(habitsTable)
    .where(eq(habitsTable.userId, userId))
    .orderBy(habitsTable.createdAt);

  const enriched = await attachSkipData(rows, userId);
  res.json(GetHabitsResponse.parse(enriched.map(serializeHabit)));
});

router.post("/habits", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const parsed = CreateHabitBody.safeParse(req.body);
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

  const [habit] = await db
    .insert(habitsTable)
    .values({
      ...rest,
      userId,
      classificationId: classificationId ?? null,
      recurrenceType: "DAILY",
      isActive: rest.isActive ?? true,
    })
    .returning();

  const [enriched] = await attachSkipData([habit], userId);
  res.status(201).json(GetHabitResponse.parse(serializeHabit(enriched)));
});

router.get("/habits/today-progress", requireAuth, async (req, res): Promise<void> => {
  try {
    const userId = req.session.userId!;
    const today = todayStr();

    const habitTasks = await db
      .select({ id: tasksTable.id, status: tasksTable.status })
      .from(tasksTable)
      .where(
        and(
          eq(tasksTable.userId, userId),
          eq(tasksTable.isHabitTask, true),
          eq(tasksTable.deadline, today),
        ),
      );

    const total = habitTasks.length;
    const done = habitTasks.filter((t) => t.status === "DONE").length;
    const inProgress = habitTasks.filter((t) => t.status === "IN_PROGRESS").length;
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

    const allDoneTasks = await db
      .select({ deadline: tasksTable.deadline })
      .from(tasksTable)
      .where(
        and(
          eq(tasksTable.userId, userId),
          eq(tasksTable.isHabitTask, true),
          eq(tasksTable.status, "DONE"),
        ),
      );

    const doneDates = new Set(allDoneTasks.map((t) => t.deadline).filter(Boolean) as string[]);

    let streak = 0;
    const base = new Date();
    for (let i = 0; i <= 365; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      if (doneDates.has(dateStr)) {
        streak++;
      } else {
        break;
      }
    }

    res.json({ total, done, inProgress, percentage, streak });
  } catch (err) {
    console.error("[today-progress] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/habits/progress-events", requireAuth, (req, res): void => {
  try {
    const userId = req.session.userId!;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    res.write(": connected\n\n");

    const remove = addSubscriber(userId, (chunk) => res.write(chunk), "habits");

    const heartbeat = setInterval(() => {
      try {
        res.write(": ping\n\n");
      } catch {
        clearInterval(heartbeat);
      }
    }, 25000);

    req.on("close", () => {
      clearInterval(heartbeat);
      remove();
    });
  } catch (err) {
    console.error("[progress-events] error:", err);
    if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/habits/tasks/:taskId/status", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const taskId = parseInt(req.params.taskId as string, 10);
  if (isNaN(taskId)) {
    res.status(400).json({ error: "Invalid taskId" });
    return;
  }

  const parsed = UpdateHabitTaskStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select({
      id: tasksTable.id,
      userId: tasksTable.userId,
      isHabitTask: tasksTable.isHabitTask,
      status: tasksTable.status,
    })
    .from(tasksTable)
    .where(eq(tasksTable.id, taskId));

  if (!existing) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  if (existing.userId !== userId || !existing.isHabitTask) {
    res.status(403).json({ error: "Not a habit task or not owned by user" });
    return;
  }

  const { status: newStatus } = parsed.data;
  const oldStatus = existing.status;

  await db.update(tasksTable).set({ status: newStatus }).where(eq(tasksTable.id, taskId));

  let xpDelta = 0;
  if (newStatus === "DONE" && oldStatus !== "DONE") xpDelta = 10;
  else if (newStatus !== "DONE" && oldStatus === "DONE") xpDelta = -10;

  emitHabitProgressEvent(userId);

  res.json({ taskId, status: newStatus, xpDelta });
});

router.get("/habits/:habitId", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const params = GetHabitParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [habit] = await db
    .select()
    .from(habitsTable)
    .where(and(eq(habitsTable.id, params.data.habitId), eq(habitsTable.userId, userId)));

  if (!habit) {
    res.status(404).json({ error: "Habit not found" });
    return;
  }

  const [enriched] = await attachSkipData([habit], userId);
  res.json(GetHabitResponse.parse(serializeHabit(enriched)));
});

router.patch("/habits/:habitId", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const params = UpdateHabitParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateHabitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(habitsTable)
    .where(and(eq(habitsTable.id, params.data.habitId), eq(habitsTable.userId, userId)));

  if (!existing) {
    res.status(404).json({ error: "Habit not found" });
    return;
  }

  const d = parsed.data;

  if (d.classificationId != null) {
    const owned = await verifyClassificationOwnership(d.classificationId, userId);
    if (!owned) {
      res.status(403).json({ error: "Classification does not belong to you" });
      return;
    }
  }

  const updateValues: Partial<typeof habitsTable.$inferInsert> = {};
  if (d.title !== undefined)          updateValues.title            = d.title;
  if (d.description !== undefined)    updateValues.description      = d.description ?? null;
  if (d.priority !== undefined)       updateValues.priority         = d.priority;
  if (d.startDate !== undefined)      updateValues.startDate        = d.startDate;
  if (d.isActive !== undefined)       updateValues.isActive         = d.isActive;
  if ("classificationId" in d)        updateValues.classificationId = d.classificationId ?? null;

  const [updated] = await db
    .update(habitsTable)
    .set(updateValues)
    .where(and(eq(habitsTable.id, params.data.habitId), eq(habitsTable.userId, userId)))
    .returning();

  const [enriched] = await attachSkipData([updated], userId);
  res.json(GetHabitResponse.parse(serializeHabit(enriched)));
});

router.delete("/habits/:habitId", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const params = DeleteHabitParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(habitsTable)
    .where(and(eq(habitsTable.id, params.data.habitId), eq(habitsTable.userId, userId)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Habit not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/habits/:habitId/skip-today", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const today = todayStr();

  const params = SkipHabitTodayParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [habit] = await db
    .select({ id: habitsTable.id })
    .from(habitsTable)
    .where(and(eq(habitsTable.id, params.data.habitId), eq(habitsTable.userId, userId)));

  if (!habit) {
    res.status(404).json({ error: "Habit not found" });
    return;
  }

  await db
    .insert(habitSkipsTable)
    .values({ habitId: habit.id, userId, skipDate: today })
    .onConflictDoNothing();

  res.json({ habitId: habit.id, skipDate: today });
});

router.delete("/habits/:habitId/skip-today", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const today = todayStr();

  const params = UnskipHabitTodayParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [habit] = await db
    .select({ id: habitsTable.id })
    .from(habitsTable)
    .where(and(eq(habitsTable.id, params.data.habitId), eq(habitsTable.userId, userId)));

  if (!habit) {
    res.status(404).json({ error: "Habit not found" });
    return;
  }

  await db
    .delete(habitSkipsTable)
    .where(
      and(
        eq(habitSkipsTable.habitId, habit.id),
        eq(habitSkipsTable.userId, userId),
        eq(habitSkipsTable.skipDate, today),
      ),
    );

  res.sendStatus(204);
});

router.post("/habits/generate-today", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const result = await generateDailyHabitTasks(userId);
  res.json(result);
});

router.post("/habits/auto-generate", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const result = await generateDailyHabitTasks(userId);
  res.json(result);
});

router.post("/habits/ai-suggest", requireAuth, async (req, res): Promise<void> => {
  const parsed = AiSuggestHabitTasksBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const suggestions = await suggestTasksForGoal(parsed.data.goal, parsed.data.targetDate ?? undefined);
  res.json({ suggestions });
});

router.post("/habits/robot-chat", requireAuth, async (req, res): Promise<void> => {
  const parsed = HabitRobotChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const reply = await chatWithHabitRobot(
    parsed.data.habits.map((h) => ({
      id: h.id,
      title: h.title,
      classification: h.classification ?? null,
      priority: h.priority,
      tasksThisMonth: h.tasksThisMonth,
      completedThisMonth: h.completedThisMonth,
      completedToday: h.completedToday,
    })),
    parsed.data.message ?? undefined,
  );
  res.json({ reply });
});

export default router;
