import { Router, type IRouter } from "express";
import { eq, and, inArray, or } from "drizzle-orm";
import { db, groupsTable, groupMembersTable, usersTable, tasksTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

async function getGroupWithDetails(groupId: number) {
  const group = await db
    .select()
    .from(groupsTable)
    .where(eq(groupsTable.id, groupId))
    .then((rows) => rows[0] ?? null);

  if (!group) return null;

  const members = await db
    .select({
      id: groupMembersTable.id,
      userId: groupMembersTable.userId,
      name: usersTable.name,
    })
    .from(groupMembersTable)
    .innerJoin(usersTable, eq(groupMembersTable.userId, usersTable.id))
    .where(eq(groupMembersTable.groupId, groupId));

  const tasks = await db
    .select({
      id: tasksTable.id,
      title: tasksTable.title,
      status: tasksTable.status,
      priority: tasksTable.priority,
    })
    .from(tasksTable)
    .where(eq(tasksTable.groupId, groupId));

  return {
    id: group.id,
    name: group.groupName,
    color: group.color ?? "#14b8a6",
    createdBy: group.createdBy,
    members,
    tasks,
  };
}

router.get("/groups", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const memberRows = await db
    .select({ groupId: groupMembersTable.groupId })
    .from(groupMembersTable)
    .where(eq(groupMembersTable.userId, userId));

  const createdRows = await db
    .select({ id: groupsTable.id })
    .from(groupsTable)
    .where(eq(groupsTable.createdBy, userId));

  const allGroupIds = [
    ...new Set([
      ...memberRows.map((r) => r.groupId),
      ...createdRows.map((r) => r.id),
    ]),
  ];

  if (allGroupIds.length === 0) {
    res.json([]);
    return;
  }

  const results = await Promise.all(allGroupIds.map(getGroupWithDetails));
  res.json(results.filter(Boolean));
});

router.post("/groups", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }
  const color = typeof req.body?.color === "string" && req.body.color.trim()
    ? req.body.color.trim()
    : "#14b8a6";

  const [group] = await db
    .insert(groupsTable)
    .values({ groupName: name, createdBy: userId, color })
    .returning();

  await db.insert(groupMembersTable).values({ groupId: group.id, userId });

  const result = await getGroupWithDetails(group.id);
  res.status(201).json(result);
});

router.delete("/groups/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const groupId = parseInt(String(req.params.id), 10);

  if (isNaN(groupId)) {
    res.status(400).json({ error: "Invalid group id" });
    return;
  }

  const [group] = await db
    .select()
    .from(groupsTable)
    .where(eq(groupsTable.id, groupId));

  if (!group) {
    res.status(404).json({ error: "Group not found" });
    return;
  }

  if (group.createdBy !== userId) {
    res.status(403).json({ error: "Only the group creator can delete it" });
    return;
  }

  await db.delete(groupMembersTable).where(eq(groupMembersTable.groupId, groupId));
  await db.update(tasksTable).set({ groupId: null }).where(eq(tasksTable.groupId, groupId));
  await db.delete(groupsTable).where(eq(groupsTable.id, groupId));

  res.sendStatus(204);
});

router.post("/groups/:id/members", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const groupId = parseInt(String(req.params.id), 10);

  if (isNaN(groupId)) {
    res.status(400).json({ error: "Invalid group id" });
    return;
  }

  const memberName = typeof req.body?.memberName === "string" ? req.body.memberName.trim() : "";
  if (!memberName) {
    res.status(400).json({ error: "memberName is required" });
    return;
  }

  const [group] = await db
    .select()
    .from(groupsTable)
    .where(eq(groupsTable.id, groupId));

  if (!group) {
    res.status(404).json({ error: "Group not found" });
    return;
  }

  const isMember = await db
    .select({ id: groupMembersTable.id })
    .from(groupMembersTable)
    .where(and(eq(groupMembersTable.groupId, groupId), eq(groupMembersTable.userId, userId)))
    .then((rows) => rows.length > 0);

  if (!isMember && group.createdBy !== userId) {
    res.status(403).json({ error: "Not a member of this group" });
    return;
  }

  const isEmail = memberName.includes("@");
  const [targetUser] = await db
    .select()
    .from(usersTable)
    .where(
      isEmail
        ? eq(usersTable.email, memberName)
        : or(eq(usersTable.name, memberName), eq(usersTable.email, memberName))!
    );

  if (!targetUser) {
    res.status(404).json({ error: `User "${memberName}" not found` });
    return;
  }

  const alreadyMember = await db
    .select({ id: groupMembersTable.id })
    .from(groupMembersTable)
    .where(and(eq(groupMembersTable.groupId, groupId), eq(groupMembersTable.userId, targetUser.id)))
    .then((rows) => rows.length > 0);

  if (alreadyMember) {
    res.status(409).json({ error: `"${memberName}" is already a member` });
    return;
  }

  await db.insert(groupMembersTable).values({ groupId, userId: targetUser.id });

  const result = await getGroupWithDetails(groupId);
  res.json(result);
});

router.delete("/groups/:id/members/:memberId", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const groupId = parseInt(String(req.params.id), 10);
  const memberId = parseInt(String(req.params.memberId), 10);

  if (isNaN(groupId) || isNaN(memberId)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [group] = await db
    .select()
    .from(groupsTable)
    .where(eq(groupsTable.id, groupId));

  if (!group) {
    res.status(404).json({ error: "Group not found" });
    return;
  }

  const [member] = await db
    .select()
    .from(groupMembersTable)
    .where(and(eq(groupMembersTable.id, memberId), eq(groupMembersTable.groupId, groupId)));

  if (!member) {
    res.status(404).json({ error: "Member not found" });
    return;
  }

  if (group.createdBy !== userId && member.userId !== userId) {
    res.status(403).json({ error: "Not authorized to remove this member" });
    return;
  }

  if (member.userId === group.createdBy) {
    res.status(403).json({ error: "Cannot remove the group creator" });
    return;
  }

  await db
    .delete(groupMembersTable)
    .where(and(eq(groupMembersTable.id, memberId), eq(groupMembersTable.groupId, groupId)));

  res.sendStatus(204);
});

export default router;
