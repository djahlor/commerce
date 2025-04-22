/*
Defines the database schema for outputs (generated PDF files).
*/

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { purchasesTable } from "./purchases-schema"

export const outputsTable = pgTable("outputs", {
  id: uuid("id").defaultRandom().primaryKey(),
  purchaseId: uuid("purchase_id")
    .references(() => purchasesTable.id, { onDelete: "cascade" })
    .notNull(),
  type: text("type").notNull(), // "blueprint", "persona", "ad-script", etc.
  filePath: text("file_path").notNull(), // Supabase Storage path
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertOutput = typeof outputsTable.$inferInsert
export type SelectOutput = typeof outputsTable.$inferSelect 