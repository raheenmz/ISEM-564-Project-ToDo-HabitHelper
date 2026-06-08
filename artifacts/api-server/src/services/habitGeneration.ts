import { and, eq, lte } from "drizzle-orm";
import { db, habitsTable, tasksTable, classificationsTable } from "@workspace/db";

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

    let generated = 0;
    let skipped = 0;

    for (const habit of activeHabits) {
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
