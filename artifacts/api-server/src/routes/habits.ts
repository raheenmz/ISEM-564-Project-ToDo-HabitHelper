import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, habitsTable, tasksTable, classificationsTable } from "@workspace/db";
import {
  GetHabitsResponse,
  GetHabitResponse,
  GetHabitParams,
  CreateHabitBody,
  UpdateHabitBody,
  UpdateHabitParams,
  DeleteHabitParams,
  AiSuggestHabitTasksBody,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { suggestTasksForGoal } from "../services/ai";

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

function serializeHabit(h: typeof habitsTable.$inferSelect) {
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

  res.json(GetHabitsResponse.parse(rows.map(serializeHabit)));
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

  res.status(201).json(GetHabitResponse.parse(serializeHabit(habit)));
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

  res.json(GetHabitResponse.parse(serializeHabit(habit)));
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

  res.json(GetHabitResponse.parse(serializeHabit(updated)));
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

router.post("/habits/generate-today", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const today = new Date().toISOString().split("T")[0];

  const activeHabits = await db
    .select()
    .from(habitsTable)
    .where(and(eq(habitsTable.userId, userId), eq(habitsTable.isActive, true)));

  let generated = 0;
  let skipped = 0;

  for (const habit of activeHabits) {
    const existing = await db
      .select({ id: tasksTable.id })
      .from(tasksTable)
      .where(
        and(
          eq(tasksTable.userId, userId),
          eq(tasksTable.habitId, habit.id),
          eq(tasksTable.deadline, today),
        ),
      );

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    const classificationName = habit.classificationId
      ? await db
          .select({ name: classificationsTable.name })
          .from(classificationsTable)
          .where(
            and(
              eq(classificationsTable.id, habit.classificationId),
              eq(classificationsTable.userId, userId),
            ),
          )
          .then((rows) => rows[0]?.name ?? null)
      : null;

    const titleSuffix = classificationName ? ` [${classificationName}]` : "";

    await db.insert(tasksTable).values({
      userId,
      title: `${habit.title}${titleSuffix}`,
      description: habit.description ?? null,
      priority: habit.priority,
      status: "TODO",
      deadline: today,
      classificationId: habit.classificationId ?? null,
      habitId: habit.id,
    });

    generated++;
  }

  res.json({ generated, skipped });
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

export default router;
