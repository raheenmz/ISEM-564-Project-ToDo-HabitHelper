import { pgTable, serial, integer, date, unique } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { habitsTable } from "./habits";

export const habitSkipsTable = pgTable(
  "habit_skips",
  {
    id: serial("skip_id").primaryKey(),
    habitId: integer("habit_id")
      .notNull()
      .references(() => habitsTable.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id),
    skipDate: date("skip_date", { mode: "string" }).notNull(),
  },
  (t) => [unique("habit_skip_unique").on(t.habitId, t.skipDate)],
);

export type HabitSkip = typeof habitSkipsTable.$inferSelect;
export type InsertHabitSkip = typeof habitSkipsTable.$inferInsert;
