import { Router } from "express";
import { db, usersTable, roomsTable, bookingsTable, reviewsTable } from "@workspace/db";
import { eq, sql, avg, count } from "drizzle-orm";
import { authenticate } from "../lib/auth";

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
    host: {
      id: host.id,
      name: host.name,
      email: host.email,
      role: host.role,
      phone: host.phone,
      address: host.address,
      profilePicture: host.profilePicture,
      isVerified: host.isVerified,
      createdAt: host.createdAt,
    },
    createdAt: room.createdAt,
  };
}

router.get("/stats/summary", authenticate, async (req, res) => {
  if (req.user!.role !== "ADMIN") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [userStats] = await db.select({
    totalUsers: count(),
    totalHosts: sql<number>`count(*) filter (where role = 'HOST')::int`,
    totalGuests: sql<number>`count(*) filter (where role = 'GUEST')::int`,
  }).from(usersTable);

  const [roomStats] = await db.select({
    totalRooms: count(),
    avgRating: avg(roomsTable.avgRating),
  }).from(roomsTable);

  const [bookingStats] = await db.select({
    totalBookings: count(),
    confirmedBookings: sql<number>`count(*) filter (where status = 'CONFIRMED')::int`,
    cancelledBookings: sql<number>`count(*) filter (where status = 'CANCELLED')::int`,
    pendingBookings: sql<number>`count(*) filter (where status = 'PENDING')::int`,
    totalRevenue: sql<number>`coalesce(sum(total_price) filter (where status = 'CONFIRMED'), 0)::float`,
  }).from(bookingsTable);

  res.json({
    totalUsers: userStats?.totalUsers ?? 0,
    totalHosts: userStats?.totalHosts ?? 0,
    totalGuests: userStats?.totalGuests ?? 0,
    totalRooms: roomStats?.totalRooms ?? 0,
    totalBookings: bookingStats?.totalBookings ?? 0,
    confirmedBookings: bookingStats?.confirmedBookings ?? 0,
    cancelledBookings: bookingStats?.cancelledBookings ?? 0,
    pendingBookings: bookingStats?.pendingBookings ?? 0,
    totalRevenue: Number(bookingStats?.totalRevenue) || 0,
    avgRating: Number(roomStats?.avgRating) || 0,
  });
});

router.get("/stats/host-summary", authenticate, async (req, res) => {
  const hostId = req.user!.userId;

  const hostRooms = await db.select().from(roomsTable).where(eq(roomsTable.hostId, hostId));
  const roomIds = hostRooms.map((r) => r.id);

  if (roomIds.length === 0) {
    res.json({
      totalListings: 0,
      activeListings: 0,
      totalBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      totalRevenue: 0,
      avgRating: 0,
    });
    return;
  }

  const allBookings = await db.select().from(bookingsTable);
  const hostBookings = allBookings.filter((b) => roomIds.includes(b.roomId));

  const totalRevenue = hostBookings
    .filter((b) => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const [avgResult] = await db
    .select({ avg: avg(reviewsTable.rating) })
    .from(reviewsTable)
    .where(sql`${reviewsTable.roomId} = any(${sql`array[${roomIds.map(() => "?").join(",")}]::int[]`})`);

  const [ratingRow] = await db
    .select({ avgRating: sql<number>`coalesce(avg(avg_rating), 0)::float` })
    .from(roomsTable)
    .where(eq(roomsTable.hostId, hostId));

  res.json({
    totalListings: hostRooms.length,
    activeListings: hostRooms.filter((r) => r.isAvailable).length,
    totalBookings: hostBookings.length,
    pendingBookings: hostBookings.filter((b) => b.status === "PENDING").length,
    confirmedBookings: hostBookings.filter((b) => b.status === "CONFIRMED").length,
    totalRevenue,
    avgRating: Number(ratingRow?.avgRating) || 0,
  });
});

router.get("/stats/featured-rooms", async (_req, res) => {
  const rooms = await db
    .select()
    .from(roomsTable)
    .leftJoin(usersTable, eq(roomsTable.hostId, usersTable.id))
    .where(eq(roomsTable.isAvailable, true))
    .orderBy(sql`avg_rating desc nulls last, review_count desc`)
    .limit(8);

  const formatted = rooms
    .filter((r) => r.users !== null)
    .map((r) => formatRoom(r.rooms, r.users!));

  res.json(formatted);
});

router.get("/stats/cities", async (_req, res) => {
  const cities = await db
    .select({
      city: roomsTable.city,
      roomCount: count(),
      avgPrice: sql<number>`coalesce(avg(price_per_night), 0)::float`,
    })
    .from(roomsTable)
    .groupBy(roomsTable.city)
    .orderBy(sql`count(*) desc`)
    .limit(8);

  res.json(cities);
});

export default router;
