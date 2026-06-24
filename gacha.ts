import { Router } from "express";
import { db, usersTable, chestsTable, itemsTable, gachaHistoryTable } from "@workspace/db";
import { eq, desc, count, sql } from "drizzle-orm";
import { PullGachaBody } from "@workspace/api-zod";

const router = Router();

async function getUserFromToken(authHeader: string | undefined) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const payload = JSON.parse(Buffer.from(authHeader.slice(7), "base64").toString());
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.id));
    return user ?? null;
  } catch {
    return null;
  }
}

router.post("/gacha/pull", async (req, res) => {
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }
  if (user.isBlocked) { res.status(403).json({ error: "Akun diblokir" }); return; }

  const body = PullGachaBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const [chest] = await db.select().from(chestsTable).where(eq(chestsTable.id, body.data.chestId));
  if (!chest) { res.status(404).json({ error: "Chest not found" }); return; }
  if (!chest.isActive) { res.status(400).json({ error: "Chest tidak aktif" }); return; }

  if (user.balance < chest.costPerPull) {
    res.status(400).json({ error: `Saldo tidak cukup. Butuh Rp ${chest.costPerPull.toLocaleString("id-ID")}` });
    return;
  }

  const items = await db.select().from(itemsTable).where(eq(itemsTable.chestId, chest.id));
  if (items.length === 0) {
    res.status(400).json({ error: "Chest tidak memiliki item" });
    return;
  }

  const roll = Math.random() * 100;
  let cumulative = 0;
  let selectedItem = items[0];

  const sorted = [...items].sort((a, b) => b.chance - a.chance);
  for (const item of sorted) {
    cumulative += item.chance;
    if (roll <= cumulative) {
      selectedItem = item;
      break;
    }
  }

  const newBalance = user.balance - chest.costPerPull;
  await db.update(usersTable).set({ balance: newBalance }).where(eq(usersTable.id, user.id));
  await db.insert(gachaHistoryTable).values({
    userId: user.id,
    itemId: selectedItem.id,
    chestId: chest.id,
  });

  const [itemCnt] = await db.select({ cnt: count() }).from(itemsTable).where(eq(itemsTable.chestId, chest.id));

  res.json({
    item: { ...selectedItem, imageUrl: selectedItem.imageUrl ?? null, createdAt: undefined },
    chest: { ...chest, imageUrl: chest.imageUrl ?? null, itemCount: Number(itemCnt.cnt), createdAt: undefined },
    remainingBalance: newBalance,
  });
});

router.get("/gacha/history", async (req, res) => {
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }

  const rows = await db
    .select({
      id: gachaHistoryTable.id,
      pulledAt: gachaHistoryTable.pulledAt,
      itemId: itemsTable.id,
      itemName: itemsTable.name,
      itemImageUrl: itemsTable.imageUrl,
      itemRarity: itemsTable.rarity,
      chestName: chestsTable.name,
      chestType: chestsTable.type,
    })
    .from(gachaHistoryTable)
    .innerJoin(itemsTable, eq(gachaHistoryTable.itemId, itemsTable.id))
    .innerJoin(chestsTable, eq(gachaHistoryTable.chestId, chestsTable.id))
    .where(eq(gachaHistoryTable.userId, user.id))
    .orderBy(desc(gachaHistoryTable.pulledAt))
    .limit(50);

  res.json(rows.map(r => ({
    id: r.id,
    itemName: r.itemName,
    itemImageUrl: r.itemImageUrl ?? null,
    itemRarity: r.itemRarity,
    chestName: r.chestName,
    chestType: r.chestType,
    pulledAt: r.pulledAt.toISOString(),
  })));
});

router.get("/gacha/stats", async (req, res) => {
  const [totalPullsRow] = await db.select({ cnt: count() }).from(gachaHistoryTable);
  const [totalUsersRow] = await db.select({ cnt: count() }).from(usersTable);
  const activeUsersResult = await db.select({ cnt: count() }).from(usersTable)
    .where(sql`${usersTable.isBlocked} = false`);
  const balanceResult = await db.select({ total: sql<number>`sum(${usersTable.balance})` }).from(usersTable);

  const topItemsRaw = await db
    .select({
      itemName: itemsTable.name,
      pullCount: count(),
    })
    .from(gachaHistoryTable)
    .innerJoin(itemsTable, eq(gachaHistoryTable.itemId, itemsTable.id))
    .groupBy(itemsTable.name)
    .orderBy(desc(count()))
    .limit(5);

  res.json({
    totalPulls: Number(totalPullsRow.cnt),
    totalUsers: Number(totalUsersRow.cnt),
    activeUsers: Number(activeUsersResult[0]?.cnt ?? 0),
    totalBalanceCirculating: Number(balanceResult[0]?.total ?? 0),
    topItems: topItemsRaw.map(r => ({ itemName: r.itemName, pullCount: Number(r.pullCount) })),
  });
});

export default router;
