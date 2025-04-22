/*
Defines the database schema for purchases.
*/

import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { profilesTable } from "./profiles-schema"

export const purchaseStatusEnum = pgEnum("purchase_status", ["processing", "completed", "failed"])

export const purchasesTable = pgTable("purchases", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: text("clerk_user_id").references(() => profilesTable.userId), // Linked post-purchase/login
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