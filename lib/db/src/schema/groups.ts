import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const groupsTable = pgTable("groups", {
  id: serial("group_id").primaryKey(),
  createdBy: integer("created_by").notNull().references(() => usersTable.id),
  groupName: text("group_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const groupMembersTable = pgTable("group_members", {
  id: serial("group_member_id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groupsTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  role: text("role").notNull().default("MEMBER"),
});

export type Group = typeof groupsTable.$inferSelect;
export type GroupMember = typeof groupMembersTable.$inferSelect;
