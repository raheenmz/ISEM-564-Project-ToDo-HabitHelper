import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const classificationsTable = pgTable("classifications", {
  id: serial("classification_id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  name: text("name").notNull(),
  type: text("type").notNull().default("CUSTOM"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Classification = typeof classificationsTable.$inferSelect;
export type InsertClassification = typeof classificationsTable.$inferInsert;
