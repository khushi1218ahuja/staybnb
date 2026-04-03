import { Router } from "express";
import { db, usersTable, bookingsTable, roomsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AdminUpdateBookingStatusBody } from "@workspace/api-zod";
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

router.get("/admin/users", authenticate, requireRole("ADMIN"), async (_req, res) => {
  const users = await db.select().from(usersTable);
  res.json(users.map(formatUser));
});

router.delete("/admin/users/:id", authenticate, requireRole("ADMIN"), async (req, res) => {
  const id = parseInt(req.params.id ?? "0");
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.status(204).send();
});

router.get("/admin/bookings", authenticate, requireRole("ADMIN"), async (_req, res) => {
  const bookings = await db.select().from(bookingsTable);

  const formatted = await Promise.all(
    bookings.map(async (booking) => {
      const [roomRow] = await db
        .select()
        .from(roomsTable)
        .leftJoin(usersTable, eq(roomsTable.hostId, usersTable.id))
        .where(eq(roomsTable.id, booking.roomId));

      const [guest] = await db.select().from(usersTable).where(eq(usersTable.id, booking.guestId));

      if (!roomRow || !roomRow.users || !guest) return null;
      return {
        id: booking.id,
        room: formatRoom(roomRow.rooms, roomRow.users),
        guest: formatUser(guest),
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guestCount: booking.guestCount,
        totalPrice: booking.totalPrice,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        transactionId: booking.transactionId,
        createdAt: booking.createdAt,
      };
    })
  );

  res.json(formatted.filter(Boolean));
});

router.put("/admin/bookings/:id/status", authenticate, requireRole("ADMIN"), async (req, res) => {
  const id = parseInt(req.params.id ?? "0");
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const parsed = AdminUpdateBookingStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(bookingsTable)
    .set({ status: parsed.data.status as "PENDING" | "CONFIRMED" | "CANCELLED" })
    .where(eq(bookingsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const [roomRow] = await db
    .select()
    .from(roomsTable)
    .leftJoin(usersTable, eq(roomsTable.hostId, usersTable.id))
    .where(eq(roomsTable.id, updated.roomId));

  const [guest] = await db.select().from(usersTable).where(eq(usersTable.id, updated.guestId));

  if (!roomRow || !roomRow.users || !guest) {
    res.status(500).json({ error: "Internal error" });
    return;
  }

  res.json({
    id: updated.id,
    room: formatRoom(roomRow.rooms, roomRow.users),
    guest: formatUser(guest),
    checkIn: updated.checkIn,
    checkOut: updated.checkOut,
    guestCount: updated.guestCount,
    totalPrice: updated.totalPrice,
    status: updated.status,
    paymentStatus: updated.paymentStatus,
    transactionId: updated.transactionId,
    createdAt: updated.createdAt,
  });
});

router.get("/admin/rooms", authenticate, requireRole("ADMIN"), async (_req, res) => {
  const rooms = await db
    .select()
    .from(roomsTable)
    .leftJoin(usersTable, eq(roomsTable.hostId, usersTable.id));

  const formatted = rooms
    .filter((r) => r.users !== null)
    .map((r) => formatRoom(r.rooms, r.users!));

  res.json(formatted);
});

export default router;
