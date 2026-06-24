import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const chestsTable = pgTable("chests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: ["basic", "rare", "mythic"] }).notNull(),
  imageUrl: text("image_url"),
  costPerPull: integer("cost_per_pull").notNull().default(10000),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertChestSchema = createInsertSchema(chestsTable).omit({ id: true, createdAt: true });
export type InsertChest = z.infer<typeof insertChestSchema>;
export type Chest = typeof chestsTable.$inferSelect;
