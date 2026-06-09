import { and, eq, lte, inArray } from "drizzle-orm";
import { db, habitsTable, tasksTable, classificationsTable, habitSkipsTable } from "@workspace/db";

export interface HabitGenerationResult {
  generated: number;
  skipped: number;
}

export async function generateDailyHabitTasks(userId: number): Promise<HabitGenerationResult> {
  const today = new Date().toISOString().split("T")[0];

  return await db.transaction(async (tx) => {
    const activeHabits = await tx
      .select()
      .from(habitsTable)
      .where(
        and(
          eq(habitsTable.userId, userId),
          eq(habitsTable.isActive, true),
          lte(habitsTable.startDate, today),
        ),
      );

    if (activeHabits.length === 0) {
      return { generated: 0, skipped: 0 };
    }

    const habitIds = activeHabits.map((h) => h.id);

    const skippedToday = await tx
      .select({ habitId: habitSkipsTable.habitId })
      .from(habitSkipsTable)
      .where(
        and(
          eq(habitSkipsTable.userId, userId),
          eq(habitSkipsTable.skipDate, today),
          inArray(habitSkipsTable.habitId, habitIds),
        ),
      );

    const skippedHabitIds = new Set(skippedToday.map((r) => r.habitId));

    let generated = 0;
    let skipped = 0;

    for (const habit of activeHabits) {
      if (skippedHabitIds.has(habit.id)) {
        skipped++;
        continue;
      }

      const existing = await tx
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
        ? await tx
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

      const [inserted] = await tx
        .insert(tasksTable)
        .values({
          userId,
          title: `${habit.title}${titleSuffix}`,
          description: habit.description ?? null,
          priority: habit.priority,
          status: "TODO",
          isHabitTask: true,
          deadline: today,
          classificationId: habit.classificationId ?? null,
          habitId: habit.id,
        })
        .onConflictDoNothing()
        .returning({ id: tasksTable.id });

      if (inserted) {
        generated++;
      } else {
        skipped++;
      }
    }

    return { generated, skipped };
  });
}
