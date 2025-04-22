/*
Defines the database schema for profiles.
*/

import { pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const profilesTable = pgTable("profiles", {
  id: text("id").primaryKey().notNull(), // Clerk user ID
  email: text("email").notNull().unique(), // User's email
  firstName: text("first_name"),
  lastName: text("last_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertProfile = typeof profilesTable.$inferInsert
export type SelectProfile = typeof profilesTable.$inferSelect
