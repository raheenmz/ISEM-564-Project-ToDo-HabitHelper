import { pgTable, text, serial, integer, timestamp, date } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { classificationsTable } from "./classifications";

export const tasksTable = pgTable("tasks", {
  id: serial("task_id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  assignedUserId: integer("assigned_user_id").references(() => usersTable.id),
  classificationId: integer("classification_id").references(
    () => classificationsTable.id,
    { onDelete: "set null" },
  ),
  groupId: integer("group_id"),
  habitId: integer("habit_id"),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("MEDIUM"),
  status: text("status").notNull().default("TODO"),
  deadline: date("deadline", { mode: "string" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type Task = typeof tasksTable.$inferSelect;
export type InsertTask = typeof tasksTable.$inferInsert;
