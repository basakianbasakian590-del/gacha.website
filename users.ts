import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetUserParams,
  UpdateUserParams,
  UpdateUserBody,
  DeleteUserParams,
  AdjustBalanceParams,
  AdjustBalanceBody,
} from "@workspace/api-zod";

const router = Router();

function safeUser(user: typeof usersTable.$inferSelect) {
  const { passwordHash: _, ...rest } = user;
  return {
    ...rest,
    expiresAt: rest.expiresAt?.toISOString() ?? null,
    createdAt: rest.createdAt.toISOString(),
  };
}

router.get("/users", async (req, res) => {
  const users = await db.select().from(usersTable);
  res.json(users.map(safeUser));
});

router.post("/users", async (req, res) => {
  const { username, password, role, balance, expiresAt } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    username,
    passwordHash,
    role: role ?? "member",
    balance: balance ?? 0,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  }).returning();
  res.status(201).json(safeUser(user));
});

router.get("/users/:id", async (req, res) => {
  const parse = GetUserParams.safeParse({ id: Number(req.params.id) });
  if (!parse.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, parse.data.id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(safeUser(user));
});

router.patch("/users/:id", async (req, res) => {
  const paramParse = UpdateUserParams.safeParse({ id: Number(req.params.id) });
  if (!paramParse.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const body = UpdateUserBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (body.data.username !== undefined) updates.username = body.data.username;
  if (body.data.password !== undefined) updates.passwordHash = await bcrypt.hash(body.data.password, 10);
  if (body.data.role !== undefined) updates.role = body.data.role;
  if (body.data.balance !== undefined) updates.balance = body.data.balance;
  if (body.data.isBlocked !== undefined) updates.isBlocked = body.data.isBlocked;
  if (body.data.expiresAt !== undefined) updates.expiresAt = body.data.expiresAt ? new Date(body.data.expiresAt) : null;
  if (body.data.isBlocked === false) updates.failedAttempts = 0;

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, paramParse.data.id)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(safeUser(user));
});

router.delete("/users/:id", async (req, res) => {
  const parse = DeleteUserParams.safeParse({ id: Number(req.params.id) });
  if (!parse.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(usersTable).where(eq(usersTable.id, parse.data.id));
  res.json({ success: true, message: "User deleted" });
});

router.post("/users/:id/balance", async (req, res) => {
  const paramParse = AdjustBalanceParams.safeParse({ id: Number(req.params.id) });
  if (!paramParse.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const body = AdjustBalanceBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const [current] = await db.select().from(usersTable).where(eq(usersTable.id, paramParse.data.id));
  if (!current) { res.status(404).json({ error: "User not found" }); return; }

  const newBalance = body.data.mode === "add" ? current.balance + body.data.amount : body.data.amount;
  const [user] = await db.update(usersTable).set({ balance: newBalance }).where(eq(usersTable.id, paramParse.data.id)).returning();
  res.json(safeUser(user));
});

export default router;
