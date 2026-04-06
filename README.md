# StayBnB

A full-stack PG and room booking platform for the Indian market — built with React, Node.js, and PostgreSQL.

![StayBnB](https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80)

## Features

- **Room Listings** — Browse, search, and filter rooms by city, type, price range, and keyword
- **Booking System** — Conflict-aware booking with date validation and mock payment processing
- **Reviews** — Guests can rate and review rooms after booking
- **Role-based Auth** — JWT authentication with GUEST, HOST, and ADMIN roles
- **Guest Dashboard** — View and cancel bookings
- **Host Dashboard** — Manage listings (create, edit, delete), view bookings and earnings
- **Admin Panel** — Platform-wide overview, user management, room management, booking oversight

## Tech Stack

### Frontend (`artifacts/staybnb`)
- **React 18** + **Vite**
- **Wouter** for client-side routing
- **TanStack Query** for server state management
- **Tailwind CSS** with a custom deep navy + warm amber design system
- **Framer Motion** for animations
- **Sonner** for toast notifications
- **Lucide React** for icons
- Fonts: **Inter** (sans) + **Playfair Display** (serif headings)

### Backend (`artifacts/api-server`)
- **Node.js** + **Fastify**
- **JWT** authentication with `jsonwebtoken`
- **bcryptjs** for password hashing
- **Drizzle ORM** for type-safe database queries

### Database (`lib/db`)
- **PostgreSQL** via Replit's managed database
- Schema: `users`, `rooms`, `bookings`, `reviews` with proper enums and foreign keys

### API Client (`lib/api-client-react`)
- Auto-generated from OpenAPI spec using **orval**
- Type-safe React Query hooks for all 30+ endpoints

## Project Structure

```
.
├── artifacts/
│   ├── api-server/          # Fastify REST API
│   │   └── src/
│   │       ├── routes/      # auth, rooms, bookings, reviews, admin, stats
│   │       └── middleware/  # JWT auth middleware
│   └── staybnb/             # React frontend
│       └── src/
│           ├── pages/       # Home, Rooms, RoomDetail, Login, Register, Dashboard, HostDashboard, AdminPanel
│           ├── components/  # Navbar, RoomCard, RoomSkeleton
│           └── context/     # AuthContext (JWT + React Query)
└── lib/
    ├── api-spec/            # OpenAPI 3.0 specification (openapi.yaml)
    ├── api-client-react/    # Auto-generated typed API hooks
    └── db/                  # Drizzle ORM schema + migrations
```

## Demo Accounts

| Role  | Email                    | Password  |
|-------|--------------------------|-----------|
| Guest | arjun@staybnb.com        | guest123  |
| Guest | sneha@staybnb.com        | guest123  |
| Host  | rahul@staybnb.com        | host123   |
| Host  | priya@staybnb.com        | host123   |
| Admin | admin@staybnb.com        | admin123  |

## API Endpoints

| Method | Endpoint                    | Auth         | Description              |
|--------|-----------------------------|--------------|--------------------------|
| POST   | `/api/auth/register`        | Public       | Register new user        |
| POST   | `/api/auth/login`           | Public       | Login, returns JWT       |
| GET    | `/api/auth/me`              | Any          | Get current user         |
| GET    | `/api/rooms`                | Public       | List/search/filter rooms |
| POST   | `/api/rooms`                | HOST/ADMIN   | Create room listing      |
| GET    | `/api/rooms/:id`            | Public       | Get room details         |
| PUT    | `/api/rooms/:id`            | HOST/ADMIN   | Update room              |
| DELETE | `/api/rooms/:id`            | HOST/ADMIN   | Delete room              |
| GET    | `/api/rooms/host/my`        | HOST/ADMIN   | Get host's rooms         |
| GET    | `/api/rooms/:id/reviews`    | Public       | Get room reviews         |
| POST   | `/api/rooms/:id/reviews`    | GUEST        | Post a review            |
| POST   | `/api/bookings`             | GUEST        | Create booking           |
| GET    | `/api/bookings/my`          | GUEST        | Get my bookings          |
| DELETE | `/api/bookings/:id`         | GUEST        | Cancel booking           |
| GET    | `/api/bookings/host`        | HOST/ADMIN   | Get bookings for host    |
| GET    | `/api/admin/users`          | ADMIN        | List all users           |
| GET    | `/api/admin/rooms`          | ADMIN        | List all rooms           |
| GET    | `/api/admin/bookings`       | ADMIN        | List all bookings        |
| GET    | `/api/stats/summary`        | ADMIN        | Platform statistics      |
| GET    | `/api/stats/host-summary`   | HOST/ADMIN   | Host earnings summary    |
| GET    | `/api/stats/featured-rooms` | Public       | Top-rated rooms          |
| GET    | `/api/stats/cities`         | Public       | Popular cities           |

## Currency

All prices are in Indian Rupees (₹). Booking total = `pricePerNight × nights × guestCount`.

## Getting Started

This project is built for the [Replit](https://replit.com) environment and uses Replit's managed PostgreSQL database. Environment variables required:

```
DATABASE_URL=       # PostgreSQL connection string
SESSION_SECRET=     # Secret for session management
```

To seed the database with sample data:
```
GET /api/seed
```
