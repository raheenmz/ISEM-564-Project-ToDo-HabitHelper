import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { classificationsTable } from "./classifications";

export const habitsTable = pgTable("habits", {
  id: serial("habit_id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  classificationId: integer("classification_id").references(() => classificationsTable.id),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("MEDIUM"),
  recurrenceType: text("recurrence_type").notNull().default("DAILY"),
  startDate: date("start_date", { mode: "string" }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type Habit = typeof habitsTable.$inferSelect;
export type InsertHabit = typeof habitsTable.$inferInsert;
