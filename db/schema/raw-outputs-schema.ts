/*
Defines the database schema for raw AI outputs before PDF generation.
*/

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { purchasesTable } from "./purchases-schema"

export const rawOutputsTable = pgTable("raw_outputs", {
  id: uuid("id").defaultRandom().primaryKey(),
  purchaseId: uuid("purchase_id")
    .references(() => purchasesTable.id, { onDelete: "cascade" })
    .notNull(),
  type: text("type").notNull(), // "blueprint", "persona", "ad-script", etc.
  content: text("content").notNull(), // The raw AI-generated content
  metadata: text("metadata"), // Optional JSON metadata about the generation
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertRawOutput = typeof rawOutputsTable.$inferInsert
export type SelectRawOutput = typeof rawOutputsTable.$inferSelect 