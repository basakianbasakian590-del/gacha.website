import { Router } from "express";
import { db, usersTable, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { TransferBalanceBody, RenewAccountBody } from "@workspace/api-zod";

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

function safeUser(user: typeof usersTable.$inferSelect) {
  const { passwordHash: _, ...rest } = user;
  return {
    ...rest,
    expiresAt: rest.expiresAt?.toISOString() ?? null,
    createdAt: rest.createdAt.toISOString(),
  };
}

router.post("/balance/transfer", async (req, res) => {
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }

  const body = TransferBalanceBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const { toUsername, amount } = body.data;
  if (amount <= 0) { res.status(400).json({ error: "Amount harus lebih dari 0" }); return; }
  if (user.balance < amount) { res.status(400).json({ error: "Saldo tidak cukup" }); return; }
  if (user.username === toUsername) { res.status(400).json({ error: "Tidak bisa transfer ke diri sendiri" }); return; }

  const [toUser] = await db.select().from(usersTable).where(eq(usersTable.username, toUsername));
  if (!toUser) { res.status(404).json({ error: "Username tujuan tidak ditemukan" }); return; }

  await db.update(usersTable).set({ balance: user.balance - amount }).where(eq(usersTable.id, user.id));
  await db.update(usersTable).set({ balance: toUser.balance + amount }).where(eq(usersTable.id, toUser.id));

  res.json({
    success: true,
    fromBalance: user.balance - amount,
    toUsername,
    amount,
  });
});

router.post("/balance/renew", async (req, res) => {
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }

  const body = RenewAccountBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const { days } = body.data;
  if (days <= 0) { res.status(400).json({ error: "Days harus lebih dari 0" }); return; }

  const [settings] = await db.select().from(siteSettingsTable);
  const costPerDay = settings?.renewalCostPerDay ?? 5000;
  const totalCost = costPerDay * days;

  if (user.balance < totalCost) {
    res.status(400).json({ error: `Saldo tidak cukup. Butuh Rp ${totalCost.toLocaleString("id-ID")}` });
    return;
  }

  const now = new Date();
  const currentExpiry = user.expiresAt && user.expiresAt > now ? user.expiresAt : now;
  const newExpiry = new Date(currentExpiry);
  newExpiry.setDate(newExpiry.getDate() + days);

  const [updatedUser] = await db.update(usersTable)
    .set({ balance: user.balance - totalCost, expiresAt: newExpiry })
    .where(eq(usersTable.id, user.id))
    .returning();

  res.json(safeUser(updatedUser));
});

export default router;
