import { Router, type IRouter } from "express";
import { eq, and, or, desc, sql, inArray } from "drizzle-orm";
import { db, groupsTable, groupMembersTable, groupNotesTable, usersTable, tasksTable, subtasksTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { addSubscriber, emitGroupEvent } from "../lib/sse";

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

  const rawTasks = await db
    .select({
      id: tasksTable.id,
      title: tasksTable.title,
      status: tasksTable.status,
      priority: tasksTable.priority,
      assigneeName: usersTable.name,
      assignedUserId: tasksTable.assignedUserId,
    })
    .from(tasksTable)
    .leftJoin(usersTable, eq(tasksTable.assignedUserId, usersTable.id))
    .where(eq(tasksTable.groupId, groupId));

  const taskIds = rawTasks.map((t) => t.id);
  let subtaskCountMap = new Map<number, { total: number; completed: number }>();
  if (taskIds.length > 0) {
    const counts = await db
      .select({
        taskId: subtasksTable.taskId,
        total: sql<number>`COUNT(*)::int`,
        completed: sql<number>`COUNT(*) FILTER (WHERE ${subtasksTable.completed} = true)::int`,
      })
      .from(subtasksTable)
      .where(inArray(subtasksTable.taskId, taskIds))
      .groupBy(subtasksTable.taskId);
    counts.forEach((c) => subtaskCountMap.set(c.taskId, { total: c.total, completed: c.completed }));
  }

  const tasks = rawTasks.map((t) => {
    const counts = subtaskCountMap.get(t.id) ?? { total: 0, completed: 0 };
    return { ...t, subtaskCount: counts.total, completedSubtaskCount: counts.completed };
  });

  const notes = await db
    .select({
      id: groupNotesTable.id,
      authorId: groupNotesTable.authorId,
      authorName: usersTable.name,
      noteText: groupNotesTable.noteText,
      createdAt: groupNotesTable.createdAt,
    })
    .from(groupNotesTable)
    .innerJoin(usersTable, eq(groupNotesTable.authorId, usersTable.id))
    .where(eq(groupNotesTable.groupId, groupId))
    .orderBy(desc(groupNotesTable.createdAt));

  return {
    id: group.id,
    name: group.groupName,
    color: group.color ?? "#14b8a6",
    createdBy: group.createdBy,
    members,
    tasks,
    notes,
  };
}

router.get("/groups/events", requireAuth, (req, res): void => {
  const userId = req.session.userId!;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  res.write(": connected\n\n");

  const remove = addSubscriber(userId, (chunk) => res.write(chunk));

  const heartbeat = setInterval(() => {
    try {
      res.write(": ping\n\n");
    } catch {
      clearInterval(heartbeat);
    }
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    remove();
  });
});

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
  const color =
    typeof req.body?.color === "string" && req.body.color.trim()
      ? req.body.color.trim()
      : "#14b8a6";

  const [group] = await db
    .insert(groupsTable)
    .values({ groupName: name, createdBy: userId, color })
    .returning();

  await db.insert(groupMembersTable).values({ groupId: group.id, userId });

  const result = await getGroupWithDetails(group.id);

  emitGroupEvent({ type: "group:created", groupId: group.id });

  res.status(201).json(result);
});

router.patch("/groups/:id", requireAuth, async (req, res): Promise<void> => {
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
    res.status(403).json({ error: "Only the group creator can edit it" });
    return;
  }

  const updates: { groupName?: string; color?: string } = {};
  if (typeof req.body?.name === "string" && req.body.name.trim()) {
    updates.groupName = req.body.name.trim();
  }
  if (typeof req.body?.color === "string" && req.body.color.trim()) {
    updates.color = req.body.color.trim();
  }

  if (Object.keys(updates).length > 0) {
    await db.update(groupsTable).set(updates).where(eq(groupsTable.id, groupId));
  }

  const result = await getGroupWithDetails(groupId);
  res.json(result);
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

  await db.delete(groupNotesTable).where(eq(groupNotesTable.groupId, groupId));
  await db.delete(groupMembersTable).where(eq(groupMembersTable.groupId, groupId));
  await db.update(tasksTable).set({ groupId: null }).where(eq(tasksTable.groupId, groupId));
  await db.delete(groupsTable).where(eq(groupsTable.id, groupId));

  emitGroupEvent({ type: "group:deleted", groupId });

  res.sendStatus(204);
});

router.post("/groups/:id/members", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const groupId = parseInt(String(req.params.id), 10);

  if (isNaN(groupId)) {
    res.status(400).json({ error: "Invalid group id" });
    return;
  }

  const memberName =
    typeof req.body?.memberName === "string" ? req.body.memberName.trim() : "";
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
    .where(
      and(eq(groupMembersTable.groupId, groupId), eq(groupMembersTable.userId, userId))
    )
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
    .where(
      and(
        eq(groupMembersTable.groupId, groupId),
        eq(groupMembersTable.userId, targetUser.id)
      )
    )
    .then((rows) => rows.length > 0);

  if (alreadyMember) {
    res.status(409).json({ error: `"${memberName}" is already a member` });
    return;
  }

  await db.insert(groupMembersTable).values({ groupId, userId: targetUser.id });

  const result = await getGroupWithDetails(groupId);

  emitGroupEvent({ type: "member:added", groupId });

  res.json(result);
});

router.delete(
  "/groups/:id/members/:memberId",
  requireAuth,
  async (req, res): Promise<void> => {
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
      .where(
        and(eq(groupMembersTable.id, memberId), eq(groupMembersTable.groupId, groupId))
      );

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
      .where(
        and(eq(groupMembersTable.id, memberId), eq(groupMembersTable.groupId, groupId))
      );

    emitGroupEvent({ type: "member:removed", groupId });

    res.sendStatus(204);
  }
);

router.get("/groups/:id/notes", requireAuth, async (req, res): Promise<void> => {
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

  const isMember = await db
    .select({ id: groupMembersTable.id })
    .from(groupMembersTable)
    .where(
      and(eq(groupMembersTable.groupId, groupId), eq(groupMembersTable.userId, userId))
    )
    .then((rows) => rows.length > 0);

  if (!isMember && group.createdBy !== userId) {
    res.status(403).json({ error: "Not a member of this group" });
    return;
  }

  const notes = await db
    .select({
      id: groupNotesTable.id,
      authorId: groupNotesTable.authorId,
      authorName: usersTable.name,
      noteText: groupNotesTable.noteText,
      createdAt: groupNotesTable.createdAt,
    })
    .from(groupNotesTable)
    .innerJoin(usersTable, eq(groupNotesTable.authorId, usersTable.id))
    .where(eq(groupNotesTable.groupId, groupId))
    .orderBy(desc(groupNotesTable.createdAt));

  res.json(notes);
});

router.post("/groups/:id/notes", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const groupId = parseInt(String(req.params.id), 10);

  if (isNaN(groupId)) {
    res.status(400).json({ error: "Invalid group id" });
    return;
  }

  const noteText =
    typeof req.body?.noteText === "string" ? req.body.noteText.trim() : "";
  if (!noteText) {
    res.status(400).json({ error: "noteText is required" });
    return;
  }

  const authorId =
    typeof req.body?.authorId === "number" ? req.body.authorId : userId;

  const [group] = await db
    .select()
    .from(groupsTable)
    .where(eq(groupsTable.id, groupId));

  if (!group) {
    res.status(404).json({ error: "Group not found" });
    return;
  }

  const authorIsMember = await db
    .select({ id: groupMembersTable.id })
    .from(groupMembersTable)
    .where(
      and(eq(groupMembersTable.groupId, groupId), eq(groupMembersTable.userId, authorId))
    )
    .then((rows) => rows.length > 0);

  if (!authorIsMember && group.createdBy !== authorId) {
    res.status(403).json({ error: "Author is not a member of this group" });
    return;
  }

  const [note] = await db
    .insert(groupNotesTable)
    .values({ groupId, authorId, noteText })
    .returning();

  const [noteWithAuthor] = await db
    .select({
      id: groupNotesTable.id,
      authorId: groupNotesTable.authorId,
      authorName: usersTable.name,
      noteText: groupNotesTable.noteText,
      createdAt: groupNotesTable.createdAt,
    })
    .from(groupNotesTable)
    .innerJoin(usersTable, eq(groupNotesTable.authorId, usersTable.id))
    .where(eq(groupNotesTable.id, note.id));

  res.status(201).json(noteWithAuthor);
});

router.delete(
  "/groups/:id/notes/:noteId",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = req.session.userId!;
    const groupId = parseInt(String(req.params.id), 10);
    const noteId = parseInt(String(req.params.noteId), 10);

    if (isNaN(groupId) || isNaN(noteId)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const [note] = await db
      .select()
      .from(groupNotesTable)
      .where(and(eq(groupNotesTable.id, noteId), eq(groupNotesTable.groupId, groupId)));

    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    const [group] = await db
      .select()
      .from(groupsTable)
      .where(eq(groupsTable.id, groupId));

    if (note.authorId !== userId && group?.createdBy !== userId) {
      res.status(403).json({ error: "Not authorized to delete this note" });
      return;
    }

    await db
      .delete(groupNotesTable)
      .where(
        and(eq(groupNotesTable.id, noteId), eq(groupNotesTable.groupId, groupId))
      );

    res.sendStatus(204);
  }
);

export default router;
