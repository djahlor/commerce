/*
Defines the database schema for temporary carts used as a workaround for Polar metadata.
*/

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

/**
 * Temporary carts table for storing metadata that might be lost in Polar checkout
 * This is used as a workaround for passing URL metadata through Polar webhooks
 */
export const tempCartsTable = pgTable("temp_carts", {
  id: uuid("id").defaultRandom().primaryKey(),
  cartId: text("cart_id").notNull().unique(), // Unique ID for the cart (generated client-side)
  url: text("url"), // URL for analysis
  metadata: text("metadata"), // Additional JSON metadata if needed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(), // Auto-cleanup after expiration
})

export type InsertTempCart = typeof tempCartsTable.$inferInsert
export type SelectTempCart = typeof tempCartsTable.$inferSelect 