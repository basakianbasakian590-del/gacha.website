import { Router } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateSettingsBody } from "@workspace/api-zod";

const router = Router();

const DEFAULT_SETTINGS = {
  siteName: "AndraDev",
  renewalCostPerDay: 5000,
  maintenanceMode: false,
  primaryColor: "#00D4FF",
  bgType: "particles",
  bgValue: "",
  themeMode: "dark",
  customLabels: "{}",
  musicUrl: "",
};

async function getOrCreateSettings() {
  let [settings] = await db.select().from(siteSettingsTable);
  if (!settings) {
    [settings] = await db.insert(siteSettingsTable).values(DEFAULT_SETTINGS).returning();
  }
  return settings;
}

router.get("/settings", async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json(settings);
});

router.patch("/settings", async (req, res) => {
  const body = UpdateSettingsBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid body" }); return; }

  const existing = await getOrCreateSettings();

  const updates: Partial<typeof siteSettingsTable.$inferInsert> = {};
  if (body.data.siteName !== undefined) updates.siteName = body.data.siteName;
  if (body.data.renewalCostPerDay !== undefined) updates.renewalCostPerDay = body.data.renewalCostPerDay;
  if (body.data.maintenanceMode !== undefined) updates.maintenanceMode = body.data.maintenanceMode;
  if (body.data.primaryColor !== undefined) updates.primaryColor = body.data.primaryColor;
  if ((body.data as any).bgType !== undefined) updates.bgType = (body.data as any).bgType;
  if ((body.data as any).bgValue !== undefined) updates.bgValue = (body.data as any).bgValue;
  if ((body.data as any).themeMode !== undefined) updates.themeMode = (body.data as any).themeMode;
  if ((body.data as any).customLabels !== undefined) updates.customLabels = (body.data as any).customLabels;
  if ((body.data as any).musicUrl !== undefined) updates.musicUrl = (body.data as any).musicUrl;

  const [settings] = await db.update(siteSettingsTable).set(updates).where(eq(siteSettingsTable.id, existing.id)).returning();
  res.json(settings);
});

export default router;
