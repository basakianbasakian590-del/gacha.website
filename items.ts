import { Router } from "express";
import { db, itemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ListItemsQueryParams, UpdateItemParams, UpdateItemBody, DeleteItemParams, CreateItemBody } from "@workspace/api-zod";

const router = Router();

router.get("/items", async (req, res) => {
  const qp = ListItemsQueryParams.safeParse({ chest_id: req.query.chest_id ? Number(req.query.chest_id) : undefined });
  let items;
  if (qp.data?.chest_id) {
    items = await db.select().from(itemsTable).where(eq(itemsTable.chestId, qp.data.chest_id));
  } else {
    items = await db.select().from(itemsTable);
  }
  res.json(items.map(i => ({ ...i, imageUrl: i.imageUrl ?? null, createdAt: undefined })));
});

router.post("/items", async (req, res) => {
  const body = CreateItemBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const [item] = await db.insert(itemsTable).values({
    chestId: body.data.chestId,
    name: body.data.name,
    imageUrl: body.data.imageUrl ?? null,
    chance: body.data.chance,
    rarity: body.data.rarity,
  }).returning();

  res.status(201).json({ ...item, imageUrl: item.imageUrl ?? null, createdAt: undefined });
});

router.patch("/items/:id", async (req, res) => {
  const paramParse = UpdateItemParams.safeParse({ id: Number(req.params.id) });
  if (!paramParse.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const body = UpdateItemBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const updates: Partial<typeof itemsTable.$inferInsert> = {};
  if (body.data.name !== undefined) updates.name = body.data.name;
  if (body.data.imageUrl !== undefined) updates.imageUrl = body.data.imageUrl;
  if (body.data.chance !== undefined) updates.chance = body.data.chance;
  if (body.data.rarity !== undefined) updates.rarity = body.data.rarity;

  const [item] = await db.update(itemsTable).set(updates).where(eq(itemsTable.id, paramParse.data.id)).returning();
  if (!item) { res.status(404).json({ error: "Item not found" }); return; }
  res.json({ ...item, imageUrl: item.imageUrl ?? null, createdAt: undefined });
});

router.delete("/items/:id", async (req, res) => {
  const parse = DeleteItemParams.safeParse({ id: Number(req.params.id) });
  if (!parse.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(itemsTable).where(eq(itemsTable.id, parse.data.id));
  res.json({ success: true, message: "Item deleted" });
});

export default router;
