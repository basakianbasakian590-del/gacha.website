import { Router } from "express";
import { db, chestsTable, itemsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { UpdateChestParams, UpdateChestBody, DeleteChestParams, CreateChestBody } from "@workspace/api-zod";

const router = Router();

router.get("/chests", async (req, res) => {
  const chests = await db.select().from(chestsTable);
  const itemCounts = await db.select({ chestId: itemsTable.chestId, cnt: count() })
    .from(itemsTable)
    .groupBy(itemsTable.chestId);

  const countMap = new Map(itemCounts.map(r => [r.chestId, r.cnt]));

  res.json(chests.map(c => ({
    ...c,
    imageUrl: c.imageUrl ?? null,
    itemCount: Number(countMap.get(c.id) ?? 0),
    createdAt: undefined,
  })));
});

router.post("/chests", async (req, res) => {
  const body = CreateChestBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const [chest] = await db.insert(chestsTable).values({
    name: body.data.name,
    type: body.data.type,
    imageUrl: body.data.imageUrl ?? null,
    costPerPull: body.data.costPerPull,
    isActive: body.data.isActive ?? true,
  }).returning();

  res.status(201).json({ ...chest, imageUrl: chest.imageUrl ?? null, itemCount: 0, createdAt: undefined });
});

router.patch("/chests/:id", async (req, res) => {
  const paramParse = UpdateChestParams.safeParse({ id: Number(req.params.id) });
  if (!paramParse.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const body = UpdateChestBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const updates: Partial<typeof chestsTable.$inferInsert> = {};
  if (body.data.name !== undefined) updates.name = body.data.name;
  if (body.data.type !== undefined) updates.type = body.data.type;
  if (body.data.imageUrl !== undefined) updates.imageUrl = body.data.imageUrl;
  if (body.data.costPerPull !== undefined) updates.costPerPull = body.data.costPerPull;
  if (body.data.isActive !== undefined) updates.isActive = body.data.isActive;

  const [chest] = await db.update(chestsTable).set(updates).where(eq(chestsTable.id, paramParse.data.id)).returning();
  if (!chest) { res.status(404).json({ error: "Chest not found" }); return; }

  const [{ cnt }] = await db.select({ cnt: count() }).from(itemsTable).where(eq(itemsTable.chestId, chest.id));
  res.json({ ...chest, imageUrl: chest.imageUrl ?? null, itemCount: Number(cnt), createdAt: undefined });
});

router.delete("/chests/:id", async (req, res) => {
  const parse = DeleteChestParams.safeParse({ id: Number(req.params.id) });
  if (!parse.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(chestsTable).where(eq(chestsTable.id, parse.data.id));
  res.json({ success: true, message: "Chest deleted" });
});

export default router;
