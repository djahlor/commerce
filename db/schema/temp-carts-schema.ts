/*
Defines the database schema for temporary carts used as a workaround for Polar metadata.
*/

import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const tempCartsTable = pgTable("temp_carts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tempCartId: text("temp_cart_id").notNull().unique(), // ID passed to Polar as metadata
  url: text("url"), // The URL for product analysis
  cartData: jsonb("cart_data").notNull(), // JSON data of the cart items
  processed: text("processed").default("false").notNull(), // "true" or "false"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertTempCart = typeof tempCartsTable.$inferInsert
export type SelectTempCart = typeof tempCartsTable.$inferSelect 