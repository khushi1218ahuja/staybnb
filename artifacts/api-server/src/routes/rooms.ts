import { Router } from "express";
import { db, roomsTable, usersTable, reviewsTable } from "@workspace/db";
import { eq, and, gte, lte, ilike, or, sql } from "drizzle-orm";
import { CreateRoomBody, UpdateRoomBody, ListRoomsQueryParams } from "@workspace/api-zod";
import { authenticate, requireRole, formatUser } from "../lib/auth";

const router = Router();

function formatRoom(room: typeof roomsTable.$inferSelect, host: typeof usersTable.$inferSelect) {
  return {
    id: room.id,
    title: room.title,
    description: room.description,
    type: room.type,
    pricePerNight: room.pricePerNight,
    location: room.location,
    city: room.city,
    amenities: room.amenities,
    images: room.images,
    isAvailable: room.isAvailable,
    avgRating: room.avgRating,
    reviewCount: room.reviewCount,
    host: formatUser(host),
    createdAt: room.createdAt,
  };
}

router.get("/rooms", async (req, res) => {
  const parsed = ListRoomsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const { city, type, minPrice, maxPrice, keyword, page = 1, limit = 12 } = parsed.data;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (city) conditions.push(ilike(roomsTable.city, `%${city}%`));
  if (type) conditions.push(eq(roomsTable.type, type as "ENTIRE" | "PRIVATE" | "SHARED"));
  if (minPrice !== undefined) conditions.push(gte(roomsTable.pricePerNight, minPrice));
  if (maxPrice !== undefined) conditions.push(lte(roomsTable.pricePerNight, maxPrice));
  if (keyword) {
    conditions.push(
      or(
        ilike(roomsTable.title, `%${keyword}%`),
        ilike(roomsTable.description, `%${keyword}%`),
        ilike(roomsTable.city, `%${keyword}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rooms, [countResult]] = await Promise.all([
    db
      .select()
      .from(roomsTable)
      .leftJoin(usersTable, eq(roomsTable.hostId, usersTable.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(roomsTable)
      .where(whereClause),
  ]);

  const total = countResult?.count ?? 0;
  const totalPages = Math.ceil(total / limit);

  const formatted = rooms
    .filter((r) => r.users !== null)
    .map((r) => formatRoom(r.rooms, r.users!));

  res.json({ rooms: formatted, total, page, limit, totalPages });
});

router.get("/rooms/host/my", authenticate, requireRole("HOST", "ADMIN"), async (req, res) => {
  const rooms = await db
    .select()
    .from(roomsTable)
    .leftJoin(usersTable, eq(roomsTable.hostId, usersTable.id))
    .where(eq(roomsTable.hostId, req.user!.userId));

  const formatted = rooms
    .filter((r) => r.users !== null)
    .map((r) => formatRoom(r.rooms, r.users!));

  res.json(formatted);
});

router.get("/rooms/:id", async (req, res) => {
  const id = parseInt(req.params.id ?? "0");
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [roomRow] = await db
    .select()
    .from(roomsTable)
    .leftJoin(usersTable, eq(roomsTable.hostId, usersTable.id))
    .where(eq(roomsTable.id, id));

  if (!roomRow || !roomRow.users) {
    res.status(404).json({ error: "Not found", message: "Room not found" });
    return;
  }

  const reviews = await db
    .select()
    .from(reviewsTable)
    .leftJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
    .where(eq(reviewsTable.roomId, id));

  const formattedReviews = reviews
    .filter((r) => r.users !== null)
    .map((r) => ({
      id: r.reviews.id,
      roomId: r.reviews.roomId,
      user: formatUser(r.users!),
      rating: r.reviews.rating,
      comment: r.reviews.comment,
      createdAt: r.reviews.createdAt,
    }));

  res.json({ ...formatRoom(roomRow.rooms, roomRow.users), reviews: formattedReviews });
});

router.post("/rooms", authenticate, requireRole("HOST", "ADMIN"), async (req, res) => {
  const parsed = CreateRoomBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const [room] = await db
    .insert(roomsTable)
    .values({
      hostId: req.user!.userId,
      title: data.title,
      description: data.description,
      type: data.type as "ENTIRE" | "PRIVATE" | "SHARED",
      pricePerNight: data.pricePerNight,
      location: data.location,
      city: data.city,
      amenities: data.amenities ?? [],
      images: data.images ?? [],
      isAvailable: data.isAvailable ?? true,
    })
    .returning();

  const [host] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId));
  res.status(201).json(formatRoom(room, host));
});

router.put("/rooms/:id", authenticate, requireRole("HOST", "ADMIN"), async (req, res) => {
  const id = parseInt(req.params.id ?? "0");
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [existing] = await db.select().from(roomsTable).where(eq(roomsTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  if (existing.hostId !== req.user!.userId && req.user!.role !== "ADMIN") {
    res.status(403).json({ error: "Forbidden", message: "Not the room owner" });
    return;
  }

  const parsed = UpdateRoomBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const [updated] = await db
    .update(roomsTable)
    .set({
      title: data.title,
      description: data.description,
      type: data.type as "ENTIRE" | "PRIVATE" | "SHARED",
      pricePerNight: data.pricePerNight,
      location: data.location,
      city: data.city,
      amenities: data.amenities ?? [],
      images: data.images ?? [],
      isAvailable: data.isAvailable ?? true,
    })
    .where(eq(roomsTable.id, id))
    .returning();

  const [host] = await db.select().from(usersTable).where(eq(usersTable.id, updated.hostId));
  res.json(formatRoom(updated, host));
});

router.delete("/rooms/:id", authenticate, requireRole("HOST", "ADMIN"), async (req, res) => {
  const id = parseInt(req.params.id ?? "0");
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [existing] = await db.select().from(roomsTable).where(eq(roomsTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  if (existing.hostId !== req.user!.userId && req.user!.role !== "ADMIN") {
    res.status(403).json({ error: "Forbidden", message: "Not the room owner" });
    return;
  }

  await db.delete(roomsTable).where(eq(roomsTable.id, id));
  res.status(204).send();
});

export default router;
