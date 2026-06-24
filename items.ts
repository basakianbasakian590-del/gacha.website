import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const itemsTable = pgTable("gacha_items", {
  id: serial("id").primaryKey(),
  chestId: integer("chest_id").notNull(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  chance: real("chance").notNull().default(10),
  rarity: text("rarity", { enum: ["common", "rare", "legendary"] }).notNull().default("common"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertItemSchema = createInsertSchema(itemsTable).omit({ id: true, createdAt: true });
export type InsertItem = z.infer<typeof insertItemSchema>;
export type GachaItem = typeof itemsTable.$inferSelect;
