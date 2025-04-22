import { jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { purchasesTable } from "./purchases-schema";

export const scrapedDataTable = pgTable("scraped_data", {
  id: uuid("id").defaultRandom().primaryKey(),
  purchaseId: uuid("purchase_id")
    .references(() => purchasesTable.id, { onDelete: "cascade" })
    .notNull()
    .unique(), // Ensure one scrape result per purchase
  url: text("url").notNull(),
  scrapedContent: jsonb("scraped_content"), // Store Markdown (as JSON string) or extracted JSON directly
  contentType: varchar("content_type", { length: 50 }).notNull(), // 'markdown' or 'json'
  status: varchar("status", { length: 50 }).default('pending').notNull(), // 'pending', 'completed', 'failed'
  errorMessage: text("error_message"),
  scrapedAt: timestamp("scraped_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date())
});

export type InsertScrapedData = typeof scrapedDataTable.$inferInsert;
export type SelectScrapedData = typeof scrapedDataTable.$inferSelect; 