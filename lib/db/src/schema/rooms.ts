import { pgTable, serial, text, boolean, timestamp, doublePrecision, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const roomTypeEnum = pgEnum("room_type", ["ENTIRE", "PRIVATE", "SHARED"]);

export const roomsTable = pgTable("rooms", {
  id: serial("id").primaryKey(),
  hostId: integer("host_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: roomTypeEnum("type").notNull(),
  pricePerNight: doublePrecision("price_per_night").notNull(),
  location: text("location").notNull(),
  city: text("city").notNull(),
  amenities: text("amenities").array().notNull().default([]),
  images: text("images").array().notNull().default([]),
  isAvailable: boolean("is_available").notNull().default(true),
  avgRating: doublePrecision("avg_rating"),
  reviewCount: integer("review_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRoomSchema = createInsertSchema(roomsTable).omit({ id: true, createdAt: true, avgRating: true, reviewCount: true });
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof roomsTable.$inferSelect;
