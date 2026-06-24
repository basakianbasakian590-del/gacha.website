import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { LoginBody } from "@workspace/api-zod";

const router = Router();

function getTokenPayload(req: any): { id: number; role: string } | null {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return null;
    return JSON.parse(Buffer.from(auth.slice(7), "base64").toString());
  } catch { return null; }
}

function safeUser(user: typeof usersTable.$inferSelect) {
  const { passwordHash: _, ...rest } = user;
  return {
    ...rest,
    expiresAt: rest.expiresAt?.toISOString() ?? null,
    createdAt: rest.createdAt.toISOString(),
  };
}

router.post("/auth/login", async (req, res) => {
  const parse = LoginBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { username, password } = parse.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
  if (!user) {
    res.status(401).json({ error: "Username atau password salah", attemptsLeft: null });
    return;
  }

  if (user.isBlocked) {
    res.status(401).json({ error: "Akun kamu diblokir. Hubungi admin.", attemptsLeft: 0 });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const newAttempts = user.failedAttempts + 1;
    const blocked = newAttempts >= 3;
    await db.update(usersTable)
      .set({ failedAttempts: newAttempts, isBlocked: blocked })
      .where(eq(usersTable.id, user.id));
    const attemptsLeft = Math.max(0, 3 - newAttempts);
    if (blocked) {
      res.status(401).json({ error: "Akun kamu diblokir karena 3x salah password.", attemptsLeft: 0 });
    } else {
      res.status(401).json({ error: `Password salah. Sisa percobaan: ${attemptsLeft}`, attemptsLeft });
    }
    return;
  }

  await db.update(usersTable).set({ failedAttempts: 0 }).where(eq(usersTable.id, user.id));

  const token = Buffer.from(JSON.stringify({ id: user.id, role: user.role })).toString("base64");
  res.json({ user: safeUser(user), token });
});

router.post("/auth/logout", (req, res) => {
  res.json({ success: true, message: "Logged out" });
});

router.get("/auth/me", async (req, res) => {
  const payload = getTokenPayload(req);
  if (!payload) { res.status(401).json({ error: "Not authenticated" }); return; }
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.id));
    if (!user) { res.status(401).json({ error: "User not found" }); return; }
    res.json(safeUser(user));
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

router.post("/auth/change-password", async (req, res) => {
  const payload = getTokenPayload(req);
  if (!payload) { res.status(401).json({ error: "Not authenticated" }); return; }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: "Password lama dan baru diperlukan" });
    return;
  }
  if (newPassword.length < 6) {
    res.status(400).json({ error: "Password baru minimal 6 karakter" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.id));
  if (!user) { res.status(404).json({ error: "User tidak ditemukan" }); return; }

  if (user.passwordChangeLocked) {
    res.status(400).json({ error: "Ganti password sudah mencapai batas maksimal (3x). Hubungi admin." });
    return;
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Password lama salah" });
    return;
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  const newCount = user.passwordChanges + 1;
  const locked = newCount >= 3;

  await db.update(usersTable)
    .set({ passwordHash: newHash, passwordChanges: newCount, passwordChangeLocked: locked })
    .where(eq(usersTable.id, user.id));

  res.json({
    success: true,
    message: locked
      ? "Password berhasil diubah. Batas maksimal tercapai, tidak bisa ganti lagi."
      : `Password berhasil diubah. Sisa kesempatan: ${3 - newCount}x`,
  });
});

export default router;
