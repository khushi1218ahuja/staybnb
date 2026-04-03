import { Router } from "express";
import { db, reviewsTable, bookingsTable, roomsTable, usersTable } from "@workspace/db";
import { eq, avg, count } from "drizzle-orm";
import { CreateReviewBody } from "@workspace/api-zod";
import { authenticate, formatUser } from "../lib/auth";

const router = Router();

router.get("/rooms/:id/reviews", async (req, res) => {
  const roomId = parseInt(req.params.id ?? "0");
  if (isNaN(roomId)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const reviews = await db
    .select()
    .from(reviewsTable)
    .leftJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
    .where(eq(reviewsTable.roomId, roomId));

  const formatted = reviews
    .filter((r) => r.users !== null)
    .map((r) => ({
      id: r.reviews.id,
      roomId: r.reviews.roomId,
      user: formatUser(r.users!),
      rating: r.reviews.rating,
      comment: r.reviews.comment,
      createdAt: r.reviews.createdAt,
    }));

  res.json(formatted);
});

router.post("/rooms/:id/reviews", authenticate, async (req, res) => {
  const roomId = parseInt(req.params.id ?? "0");
  if (isNaN(roomId)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const [room] = await db.select().from(roomsTable).where(eq(roomsTable.id, roomId));
  if (!room) {
    res.status(404).json({ error: "Not found", message: "Room not found" });
    return;
  }

  const completedBooking = await db
    .select()
    .from(bookingsTable)
    .where(
      eq(bookingsTable.roomId, roomId)
    );

  const userBooking = completedBooking.find(
    (b) => b.guestId === req.user!.userId && b.status === "CONFIRMED"
  );

  if (!userBooking) {
    res.status(403).json({ error: "Forbidden", message: "You need a confirmed booking to review this room" });
    return;
  }

  const { rating, comment } = parsed.data;
  const [review] = await db
    .insert(reviewsTable)
    .values({ roomId, userId: req.user!.userId, rating, comment })
    .returning();

  const [avgResult] = await db
    .select({ avg: avg(reviewsTable.rating), count: count() })
    .from(reviewsTable)
    .where(eq(reviewsTable.roomId, roomId));

  await db
    .update(roomsTable)
    .set({
      avgRating: Number(avgResult?.avg) || null,
      reviewCount: avgResult?.count ?? 0,
    })
    .where(eq(roomsTable.id, roomId));

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId));

  res.status(201).json({
    id: review.id,
    roomId: review.roomId,
    user: formatUser(user),
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  });
});

router.delete("/reviews/:id", authenticate, async (req, res) => {
  const id = parseInt(req.params.id ?? "0");
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [review] = await db.select().from(reviewsTable).where(eq(reviewsTable.id, id));
  if (!review) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  if (review.userId !== req.user!.userId && req.user!.role !== "ADMIN") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const roomId = review.roomId;
  await db.delete(reviewsTable).where(eq(reviewsTable.id, id));

  const [avgResult] = await db
    .select({ avg: avg(reviewsTable.rating), count: count() })
    .from(reviewsTable)
    .where(eq(reviewsTable.roomId, roomId));

  await db
    .update(roomsTable)
    .set({
      avgRating: Number(avgResult?.avg) || null,
      reviewCount: avgResult?.count ?? 0,
    })
    .where(eq(roomsTable.id, roomId));

  res.status(204).send();
});

export default router;
