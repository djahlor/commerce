/*
Defines the database schema for purchases.
*/

import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { profilesTable } from "./profiles-schema"

// Using the original enum name to avoid migration issues
export const purchaseStatusEnum = pgEnum("purchase_status", [
  "processing", 
  "pending_scrape", 
  "scrape_complete", 
  "completed", 
  "scrape_failed", 
  "generation_failed",
  "failed" // Kept original failed for broader errors
])

export const purchasesTable = pgTable("purchases", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: text("clerk_user_id").references(() => profilesTable.userId, { onDelete: "set null" }), // Linked post-purchase/login
  polarOrderId: text("polar_order_id").notNull().unique(),
  customerEmail: text("customer_email").notNull(), // From Polar Order
  tier: text("tier").notNull(), // "base", "full-stack", "upsell-competitor", etc.
  url: text("url"), // Input URL (null for upsells without URL input)
  amount: integer("amount").notNull(), // Amount in cents from Polar order
  status: purchaseStatusEnum("status").default("processing").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertPurchase = typeof purchasesTable.$inferInsert
export type SelectPurchase = typeof purchasesTable.$inferSelect 