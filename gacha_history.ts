import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";

export const gachaHistoryTable = pgTable("gacha_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  itemId: integer("item_id").notNull(),
  chestId: integer("chest_id").notNull(),
  pulledAt: timestamp("pulled_at").notNull().defaultNow(),
});

export type GachaHistory = typeof gachaHistoryTable.$inferSelect;
