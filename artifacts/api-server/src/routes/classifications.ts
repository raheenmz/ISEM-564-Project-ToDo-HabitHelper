import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, classificationsTable } from "@workspace/db";
import {
  GetClassificationsResponse,
  CreateClassificationBody,
  DeleteClassificationParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/classifications", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const rows = await db
    .select()
    .from(classificationsTable)
    .where(eq(classificationsTable.userId, userId));

  res.json(
    GetClassificationsResponse.parse(
      rows.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
    ),
  );
});

router.post("/classifications", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const parsed = CreateClassificationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [classification] = await db
    .insert(classificationsTable)
    .values({ ...parsed.data, userId, type: "CUSTOM" })
    .returning();

  res.status(201).json({
    ...classification,
    createdAt: classification.createdAt.toISOString(),
  });
});

router.delete(
  "/classifications/:id",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = req.session.userId!;

    const params = DeleteClassificationParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [existing] = await db
      .select()
      .from(classificationsTable)
      .where(
        and(
          eq(classificationsTable.id, params.data.id),
          eq(classificationsTable.userId, userId),
        ),
      );

    if (!existing) {
      res.status(404).json({ error: "Classification not found" });
      return;
    }

    if (existing.type === "DEFAULT") {
      res.status(403).json({ error: "Cannot delete a default classification" });
      return;
    }

    await db
      .delete(classificationsTable)
      .where(
        and(
          eq(classificationsTable.id, params.data.id),
          eq(classificationsTable.userId, userId),
        ),
      );

    res.sendStatus(204);
  },
);

export default router;
