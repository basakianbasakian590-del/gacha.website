import { pgTable, serial, text, integer, boolean } from "drizzle-orm/pg-core";

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull().default("AndraDev"),
  renewalCostPerDay: integer("renewal_cost_per_day").notNull().default(5000),
  maintenanceMode: boolean("maintenance_mode").notNull().default(false),
  primaryColor: text("primary_color").notNull().default("#00D4FF"),
  bgType: text("bg_type").notNull().default("particles"),
  bgValue: text("bg_value").notNull().default(""),
  themeMode: text("theme_mode").notNull().default("dark"),
  customLabels: text("custom_labels").notNull().default("{}"),
  musicUrl: text("music_url").notNull().default(""),
});

export type SiteSettings = typeof siteSettingsTable.$inferSelect;
