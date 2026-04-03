import { Router } from "express";
import { db, usersTable, roomsTable, bookingsTable, reviewsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword } from "../lib/auth";
import { logger } from "../lib/logger";

const router = Router();

router.post("/seed", async (_req, res) => {
  try {
    const existingUsers = await db.select().from(usersTable).limit(1);
    if (existingUsers.length > 0) {
      res.json({ message: "Already seeded" });
      return;
    }

    const [admin] = await db.insert(usersTable).values({
      name: "Admin User",
      email: "admin@staybnb.com",
      password: hashPassword("admin123"),
      role: "ADMIN",
      isVerified: true,
    }).returning();

    const [host1] = await db.insert(usersTable).values({
      name: "Rahul Sharma",
      email: "rahul@staybnb.com",
      password: hashPassword("host123"),
      role: "HOST",
      phone: "+91 9876543210",
      address: "Mumbai, Maharashtra",
      isVerified: true,
    }).returning();

    const [host2] = await db.insert(usersTable).values({
      name: "Priya Patel",
      email: "priya@staybnb.com",
      password: hashPassword("host123"),
      role: "HOST",
      phone: "+91 9876543211",
      address: "Bangalore, Karnataka",
      isVerified: true,
    }).returning();

    const [guest1] = await db.insert(usersTable).values({
      name: "Arjun Kumar",
      email: "arjun@staybnb.com",
      password: hashPassword("guest123"),
      role: "GUEST",
      phone: "+91 9876543212",
      isVerified: true,
    }).returning();

    const [guest2] = await db.insert(usersTable).values({
      name: "Sneha Mehta",
      email: "sneha@staybnb.com",
      password: hashPassword("guest123"),
      role: "GUEST",
      isVerified: false,
    }).returning();

    const rooms = await db.insert(roomsTable).values([
      {
        hostId: host1.id,
        title: "Cozy Private Room in Bandra West",
        description: "A beautiful, well-furnished private room in the heart of Bandra West. Walking distance to cafes, restaurants, and the sea. Perfect for working professionals and travelers seeking comfort and connectivity in Mumbai.",
        type: "PRIVATE",
        pricePerNight: 1200,
        location: "Bandra West, Mumbai",
        city: "Mumbai",
        amenities: ["WiFi", "AC", "Attached Bathroom", "Wardrobe", "24/7 Water", "Housekeeping"],
        images: [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
        ],
        isAvailable: true,
        avgRating: 4.5,
        reviewCount: 2,
      },
      {
        hostId: host1.id,
        title: "Shared PG Room near Powai Lake",
        description: "Affordable shared PG accommodation near Powai Lake and Hiranandani Gardens. Twin sharing available. Ideal for IT professionals working in the Powai-Vikhroli corridor. Meals available on request.",
        type: "SHARED",
        pricePerNight: 650,
        location: "Powai, Mumbai",
        city: "Mumbai",
        amenities: ["WiFi", "Fan", "Common Bathroom", "Laundry", "Meals Available", "Security"],
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
        ],
        isAvailable: true,
        avgRating: 4.0,
        reviewCount: 1,
      },
      {
        hostId: host2.id,
        title: "Modern Entire Studio in Koramangala",
        description: "A fully furnished, modern studio apartment in the vibrant Koramangala neighborhood of Bangalore. Features a fully equipped kitchen, high-speed internet, and a dedicated workspace. Perfect for remote workers and digital nomads.",
        type: "ENTIRE",
        pricePerNight: 2800,
        location: "Koramangala 5th Block, Bangalore",
        city: "Bangalore",
        amenities: ["WiFi", "AC", "Full Kitchen", "TV", "Washing Machine", "Parking", "Work Desk"],
        images: [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
          "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800",
        ],
        isAvailable: true,
        avgRating: 4.8,
        reviewCount: 2,
      },
      {
        hostId: host2.id,
        title: "Private Room near HSR Layout",
        description: "Well-maintained private room in a quiet residential area near HSR Layout, Bangalore. The room is furnished with all essential amenities. Close to major tech parks and public transport. Safe neighborhood with 24/7 security.",
        type: "PRIVATE",
        pricePerNight: 900,
        location: "HSR Layout, Bangalore",
        city: "Bangalore",
        amenities: ["WiFi", "AC", "Attached Bathroom", "Balcony", "Security", "CCTV"],
        images: [
          "https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=800",
          "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800",
        ],
        isAvailable: true,
        avgRating: 4.2,
        reviewCount: 1,
      },
      {
        hostId: host1.id,
        title: "Budget PG in Andheri East",
        description: "Clean, affordable PG accommodation near Andheri East metro station. Ideal for students and working professionals on a budget. Common areas maintained to a high standard with regular housekeeping.",
        type: "SHARED",
        pricePerNight: 500,
        location: "Andheri East, Mumbai",
        city: "Mumbai",
        amenities: ["WiFi", "Fan", "Common Bathroom", "Housekeeping", "RO Water", "Metro Nearby"],
        images: [
          "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800",
        ],
        isAvailable: true,
        avgRating: null,
        reviewCount: 0,
      },
    ]).returning();

    const [room1, , room3, room4] = rooms;

    const pastDate = (daysAgo: number) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split("T")[0]!;
    };

    const [booking1] = await db.insert(bookingsTable).values({
      roomId: room1.id,
      guestId: guest1.id,
      checkIn: pastDate(30),
      checkOut: pastDate(27),
      guestCount: 1,
      totalPrice: 3600,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      transactionId: "TXN_SEED001",
    }).returning();

    const [booking2] = await db.insert(bookingsTable).values({
      roomId: room3.id,
      guestId: guest2.id,
      checkIn: pastDate(15),
      checkOut: pastDate(10),
      guestCount: 2,
      totalPrice: 28000,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      transactionId: "TXN_SEED002",
    }).returning();

    const [booking3] = await db.insert(bookingsTable).values({
      roomId: room4.id,
      guestId: guest1.id,
      checkIn: pastDate(7),
      checkOut: pastDate(5),
      guestCount: 1,
      totalPrice: 1800,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      transactionId: "TXN_SEED003",
    }).returning();

    await db.insert(reviewsTable).values([
      {
        roomId: room1.id,
        userId: guest1.id,
        rating: 5,
        comment: "Absolutely loved staying here! The room was clean, well-furnished, and the host was very responsive. The location in Bandra is perfect — close to everything. Will definitely book again.",
      },
      {
        roomId: room1.id,
        userId: guest2.id,
        rating: 4,
        comment: "Great room in a prime location. The AC worked perfectly and the attached bathroom was spotless. WiFi was reliable for video calls. Slightly pricey but worth it for Bandra.",
      },
      {
        roomId: room3.id,
        userId: guest2.id,
        rating: 5,
        comment: "This studio in Koramangala is exactly what I needed for my week-long work trip. The kitchen is well-stocked, the workspace setup is excellent, and the entire apartment was immaculate. Highly recommend!",
      },
      {
        roomId: room3.id,
        userId: guest1.id,
        rating: 5,
        comment: "Perfect location in Koramangala. The apartment is modern, clean, and the WiFi was blazing fast — critical for remote work. The host is very professional and responsive.",
      },
      {
        roomId: room4.id,
        userId: guest1.id,
        rating: 4,
        comment: "Good value for money in HSR Layout. The room is clean and comfortable, and the area is very safe. A bit basic but everything you need is there. Good connectivity to the tech parks.",
      },
    ]);

    await db.select().from(usersTable).where(eq(usersTable.id, guest2.id));

    logger.info("Database seeded successfully");
    res.json({
      message: "Seeded successfully",
      accounts: {
        admin: { email: "admin@staybnb.com", password: "admin123" },
        host1: { email: "rahul@staybnb.com", password: "host123" },
        host2: { email: "priya@staybnb.com", password: "host123" },
        guest1: { email: "arjun@staybnb.com", password: "guest123" },
        guest2: { email: "sneha@staybnb.com", password: "guest123" },
      }
    });
  } catch (err) {
    logger.error({ err }, "Seed failed");
    res.status(500).json({ error: "Seed failed", message: String(err) });
  }
});

export default router;
