import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable, classificationsTable } from "@workspace/db";
import { logger } from "./lib/logger";

const DEMO_USERS = [
  { name: "alice", email: "alice@taskforce.demo", password: "test123" },
  { name: "bob", email: "bob@taskforce.demo", password: "test123" },
  { name: "charlie", email: "charlie@taskforce.demo", password: "test123" },
];

const DEFAULT_CLASSIFICATIONS = ["PERSONAL", "WORK", "SCHOOL"];

export async function seedDemoData(): Promise<void> {
  let seeded = 0;

  for (const userData of DEMO_USERS) {
    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.name, userData.name));

    if (!existing) {
      const passwordHash = await bcrypt.hash(userData.password, 10);
      const [user] = await db
        .insert(usersTable)
        .values({
          name: userData.name,
          email: userData.email,
          passwordHash,
        })
        .returning({ id: usersTable.id });

      for (const name of DEFAULT_CLASSIFICATIONS) {
        await db.insert(classificationsTable).values({
          userId: user.id,
          name,
          type: "DEFAULT",
        });
      }

      seeded++;
    }
  }

  if (seeded > 0) {
    logger.info({ seeded }, "Demo users seeded");
  } else {
    logger.info("Demo users already present — skipping seed");
  }
}
