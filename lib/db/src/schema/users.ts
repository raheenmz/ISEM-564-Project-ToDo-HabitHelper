import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: serial("user_id").primaryKey(),
  name: text("name").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
