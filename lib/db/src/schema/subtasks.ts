import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { tasksTable } from "./tasks";

export const subtasksTable = pgTable("subtasks", {
  id: serial("subtask_id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasksTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Subtask = typeof subtasksTable.$inferSelect;
export type InsertSubtask = typeof subtasksTable.$inferInsert;
