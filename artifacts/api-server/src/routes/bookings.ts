import { Router } from "express";
import { db, bookingsTable, roomsTable, usersTable } from "@workspace/db";
import { eq, and, lt, gt, ne } from "drizzle-orm";
import { CreateBookingBody } from "@workspace/api-zod";
import { authenticate, formatUser } from "../lib/auth";
import { logger } from "../lib/logger";

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

function formatBooking(
  booking: typeof bookingsTable.$inferSelect,
  room: typeof roomsTable.$inferSelect,
  host: typeof usersTable.$inferSelect,
  guest: typeof usersTable.$inferSelect
) {
  return {
    id: booking.id,
    room: formatRoom(room, host),
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
}

function mockCharge(amount: number): string {
  const txnId = `TXN_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
  logger.info({ amount, txnId }, "Mock payment charge");
  return txnId;
}

function mockRefund(txnId: string) {
  logger.info({ txnId }, "Mock payment refund");
}

async function getFullBooking(bookingId: number) {
  const [row] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, bookingId));

  if (!row) return null;

  const [roomRow] = await db
    .select()
    .from(roomsTable)
    .leftJoin(usersTable, eq(roomsTable.hostId, usersTable.id))
    .where(eq(roomsTable.id, row.roomId));

  const [guest] = await db.select().from(usersTable).where(eq(usersTable.id, row.guestId));

  if (!roomRow || !roomRow.users || !guest) return null;
  return formatBooking(row, roomRow.rooms, roomRow.users, guest);
}

router.post("/bookings", authenticate, async (req, res) => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const { roomId, checkIn, checkOut, guestCount } = parsed.data;

  const [room] = await db.select().from(roomsTable).where(eq(roomsTable.id, roomId));
  if (!room) {
    res.status(404).json({ error: "Not found", message: "Room not found" });
    return;
  }

  if (!room.isAvailable) {
    res.status(409).json({ error: "Conflict", message: "Room is not available" });
    return;
  }

  const overlapping = await db
    .select()
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.roomId, roomId),
        ne(bookingsTable.status, "CANCELLED"),
        lt(bookingsTable.checkIn, checkOut),
        gt(bookingsTable.checkOut, checkIn)
      )
    );

  if (overlapping.length > 0) {
    res.status(409).json({ error: "Conflict", message: "Room is already booked for these dates" });
    return;
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  if (nights < 1) {
    res.status(400).json({ error: "Validation error", message: "Check-out must be after check-in" });
    return;
  }

  const totalPrice = room.pricePerNight * nights * guestCount;
  const transactionId = mockCharge(totalPrice);

  const [booking] = await db
    .insert(bookingsTable)
    .values({
      roomId,
      guestId: req.user!.userId,
      checkIn,
      checkOut,
      guestCount,
      totalPrice,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      transactionId,
    })
    .returning();

  const full = await getFullBooking(booking.id);
  res.status(201).json(full);
});

router.get("/bookings/my", authenticate, async (req, res) => {
  const bookings = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.guestId, req.user!.userId))
    .orderBy(bookingsTable.createdAt);

  const formatted = await Promise.all(bookings.map((b) => getFullBooking(b.id)));
  res.json(formatted.filter(Boolean));
});

router.get("/bookings/host", authenticate, async (req, res) => {
  const hostRooms = await db
    .select()
    .from(roomsTable)
    .where(eq(roomsTable.hostId, req.user!.userId));

  const roomIds = hostRooms.map((r) => r.id);
  if (roomIds.length === 0) {
    res.json([]);
    return;
  }

  const bookings = await db
    .select()
    .from(bookingsTable)
    .orderBy(bookingsTable.createdAt);

  const hostBookings = bookings.filter((b) => roomIds.includes(b.roomId));
  const formatted = await Promise.all(hostBookings.map((b) => getFullBooking(b.id)));
  res.json(formatted.filter(Boolean));
});

router.get("/bookings/:id", authenticate, async (req, res) => {
  const id = parseInt(req.params.id ?? "0");
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const full = await getFullBooking(id);
  if (!full) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  if (full.guest.id !== req.user!.userId && full.room.host.id !== req.user!.userId && req.user!.role !== "ADMIN") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  res.json(full);
});

router.put("/bookings/:id/cancel", authenticate, async (req, res) => {
  const id = parseInt(req.params.id ?? "0");
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id));
  if (!booking) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  if (booking.guestId !== req.user!.userId && req.user!.role !== "ADMIN") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  if (booking.status === "CANCELLED") {
    res.status(400).json({ error: "Already cancelled" });
    return;
  }

  if (booking.transactionId) {
    mockRefund(booking.transactionId);
  }

  const [updated] = await db
    .update(bookingsTable)
    .set({ status: "CANCELLED", paymentStatus: "REFUNDED" })
    .where(eq(bookingsTable.id, id))
    .returning();

  const full = await getFullBooking(updated.id);
  res.json(full);
});

export default router;
