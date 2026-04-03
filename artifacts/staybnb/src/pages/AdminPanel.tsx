import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import {
  useAdminGetUsers,
  useAdminGetRooms,
  useAdminGetBookings,
  useGetPlatformStats,
  getAdminGetUsersQueryKey,
  getAdminGetRoomsQueryKey,
  getAdminGetBookingsQueryKey,
  getGetPlatformStatsQueryKey,
} from "@workspace/api-client-react";
import {
  ShieldCheck, Users, Home, Calendar, TrendingUp,
  CheckCircle, XCircle, Search
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  HOST: "bg-blue-100 text-blue-700",
  GUEST: "bg-gray-100 text-gray-700",
};

type Tab = "overview" | "users" | "rooms" | "bookings";

export default function AdminPanel() {
  const [, navigate] = useLocation();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [userSearch, setUserSearch] = useState("");
  const [roomSearch, setRoomSearch] = useState("");

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) navigate("/login");
  }, [isAuthenticated, isAdmin, authLoading]);

  const { data: stats } = useGetPlatformStats({
    query: { enabled: isAdmin, queryKey: getGetPlatformStatsQueryKey() },
  });
  const { data: users, isLoading: usersLoading } = useAdminGetUsers({
    query: { enabled: isAdmin && tab === "users", queryKey: getAdminGetUsersQueryKey() },
  });
  const { data: rooms, isLoading: roomsLoading } = useAdminGetRooms({
    query: { enabled: isAdmin && tab === "rooms", queryKey: getAdminGetRoomsQueryKey() },
  });
  const { data: bookings, isLoading: bookingsLoading } = useAdminGetBookings({
    query: { enabled: isAdmin && tab === "bookings", queryKey: getAdminGetBookingsQueryKey() },
  });

  if (authLoading || !isAuthenticated) return null;

  const filteredUsers = users?.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  ) ?? [];

  const filteredRooms = rooms?.filter(r =>
    r.title.toLowerCase().includes(roomSearch.toLowerCase()) ||
    r.city.toLowerCase().includes(roomSearch.toLowerCase())
  ) ?? [];

  const TABS: { id: Tab; label: string; icon: typeof ShieldCheck }[] = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "users", label: "Users", icon: Users },
    { id: "rooms", label: "Rooms", icon: Home },
    { id: "bookings", label: "Bookings", icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Platform overview and management</p>
          </div>
        </div>

        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-8 w-fit flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-600" },
                { label: "Total Rooms", value: stats?.totalRooms ?? 0, icon: Home, color: "text-green-600" },
                { label: "Total Bookings", value: stats?.totalBookings ?? 0, icon: Calendar, color: "text-amber-600" },
                { label: "Total Revenue", value: `₹${(stats?.totalRevenue ?? 0).toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-purple-600" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-border p-5">
                  <div className={`mb-2 ${stat.color}`}><stat.icon className="w-5 h-5" /></div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-semibold text-foreground mb-3 text-sm">Users by Role</h3>
                <div className="space-y-2">
                  {stats?.usersByRole && Object.entries(stats.usersByRole).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[role] ?? "bg-gray-100 text-gray-700"}`}>{role}</span>
                      <span className="font-semibold text-foreground">{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-semibold text-foreground mb-3 text-sm">Bookings by Status</h3>
                <div className="space-y-2">
                  {stats?.bookingsByStatus && Object.entries(stats.bookingsByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700"}`}>{status}</span>
                      <span className="font-semibold text-foreground">{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "users" && (
          <div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full max-w-xs pl-9 pr-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="border-b border-border">
                          <td colSpan={3} className="px-4 py-3">
                            <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
                          </td>
                        </tr>
                      ))
                    ) : filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[u.role] ?? ""}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{u.phone ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "rooms" && (
          <div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
                className="w-full max-w-xs pl-9 pr-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Room</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Host</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomsLoading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="border-b border-border">
                          <td colSpan={4} className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded w-2/3"></div></td>
                        </tr>
                      ))
                    ) : filteredRooms.map((r) => (
                      <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground line-clamp-1">{r.title}</p>
                          <p className="text-xs text-muted-foreground">{r.city}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{r.host?.name}</td>
                        <td className="px-4 py-3 font-medium text-foreground">₹{r.pricePerNight.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${r.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {r.isAvailable ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {r.isAvailable ? "Available" : "Unavailable"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "bookings" && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Room</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Guest</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Dates</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingsLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-border">
                        <td colSpan={5} className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded w-3/4"></div></td>
                      </tr>
                    ))
                  ) : bookings && bookings.length > 0 ? bookings.map((b) => (
                    <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground line-clamp-1">{b.room?.title}</p>
                        <p className="text-xs text-muted-foreground">{b.room?.city}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-foreground">{b.guest?.name}</p>
                        <p className="text-xs text-muted-foreground">{b.guest?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{b.checkIn} to {b.checkOut}</td>
                      <td className="px-4 py-3 font-medium text-foreground">₹{b.totalPrice.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[b.status] ?? ""}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No bookings found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
