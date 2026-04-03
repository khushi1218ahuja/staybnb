import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  useGetHostRooms,
  useGetHostBookings,
  useGetHostStats,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
  getGetHostRoomsQueryKey,
  getGetHostBookingsQueryKey,
  getGetHostStatsQueryKey,
} from "@workspace/api-client-react";
import type { Room } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Building2, Plus, Edit, Trash2, MapPin, Star, CheckCircle, Clock, X,
  TrendingUp, Users, Home, DollarSign
} from "lucide-react";
import { Link } from "wouter";

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const AMENITIES_OPTIONS = ["WiFi", "AC", "Attached Bathroom", "Balcony", "Security", "CCTV", "Parking", "Laundry", "Meals Available", "RO Water", "Housekeeping", "TV", "Full Kitchen", "Washing Machine", "Work Desk", "24/7 Water", "Wardrobe", "Fan", "Common Bathroom", "Metro Nearby"];

function RoomFormModal({
  room,
  onClose,
  onSaved,
}: {
  room?: Room | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(room?.title ?? "");
  const [description, setDescription] = useState(room?.description ?? "");
  const [type, setType] = useState<"ENTIRE" | "PRIVATE" | "SHARED">(room?.type ?? "PRIVATE");
  const [pricePerNight, setPricePerNight] = useState(room?.pricePerNight?.toString() ?? "");
  const [location, setLocation] = useState(room?.location ?? "");
  const [city, setCity] = useState(room?.city ?? "");
  const [amenities, setAmenities] = useState<string[]>(room?.amenities ?? []);
  const [images, setImages] = useState(room?.images?.join("\n") ?? "");
  const [isAvailable, setIsAvailable] = useState(room?.isAvailable ?? true);

  const createMutation = useCreateRoom({ mutation: { onSuccess: () => { toast.success("Room created!"); onSaved(); }, onError: (e: any) => toast.error(e?.data?.message ?? "Failed to create room") } });
  const updateMutation = useUpdateRoom({ mutation: { onSuccess: () => { toast.success("Room updated!"); onSaved(); }, onError: (e: any) => toast.error(e?.data?.message ?? "Failed to update room") } });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title, description, type,
      pricePerNight: Number(pricePerNight),
      location, city,
      amenities,
      images: images.split("\n").map(s => s.trim()).filter(Boolean),
      isAvailable,
    };
    if (room) {
      updateMutation.mutate({ id: room.id, data });
    } else {
      createMutation.mutate({ data });
    }
  };

  const toggleAmenity = (a: string) => {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-white z-10">
          <h2 className="font-semibold text-foreground">{room ? "Edit Room" : "Add New Room"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Title *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Cozy Private Room in Bandra" className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Description *</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={3} placeholder="Describe your room..." className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Room Type *</label>
              <select value={type} onChange={e => setType(e.target.value as typeof type)} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="ENTIRE">Entire Place</option>
                <option value="PRIVATE">Private Room</option>
                <option value="SHARED">Shared Room</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Price per Night (₹) *</label>
              <input type="number" value={pricePerNight} onChange={e => setPricePerNight(e.target.value)} required min={1} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Location *</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} required placeholder="e.g. Bandra West" className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">City *</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)} required placeholder="e.g. Mumbai" className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITIES_OPTIONS.map(a => (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${amenities.includes(a) ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Image URLs (one per line)</label>
            <textarea value={images} onChange={e => setImages(e.target.value)} rows={3} placeholder="https://example.com/image.jpg" className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none font-mono" />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="available" checked={isAvailable} onChange={e => setIsAvailable(e.target.checked)} className="rounded" />
            <label htmlFor="available" className="text-sm font-medium text-foreground">Available for booking</label>
          </div>

          <div className="flex gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={isPending} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
              {isPending ? "Saving..." : room ? "Update Room" : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function HostDashboard() {
  const [, navigate] = useLocation();
  const { isAuthenticated, isHost, isAdmin, isLoading: authLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"listings" | "bookings">("listings");
  const [showForm, setShowForm] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (!isHost && !isAdmin))) navigate("/login");
  }, [isAuthenticated, isHost, isAdmin, authLoading]);

  const { data: rooms, isLoading: roomsLoading } = useGetHostRooms({ query: { enabled: isAuthenticated, queryKey: getGetHostRoomsQueryKey() } });
  const { data: bookings, isLoading: bookingsLoading } = useGetHostBookings({ query: { enabled: isAuthenticated, queryKey: getGetHostBookingsQueryKey() } });
  const { data: stats } = useGetHostStats({ query: { enabled: isAuthenticated, queryKey: getGetHostStatsQueryKey() } });

  const deleteMutation = useDeleteRoom({
    mutation: {
      onSuccess: () => {
        toast.success("Room deleted.");
        queryClient.invalidateQueries({ queryKey: getGetHostRoomsQueryKey() });
      },
      onError: () => toast.error("Could not delete room."),
    },
  });

  const handleSaved = () => {
    setShowForm(false);
    setEditRoom(null);
    queryClient.invalidateQueries({ queryKey: getGetHostRoomsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetHostStatsQueryKey() });
  };

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      {(showForm || editRoom) && (
        <RoomFormModal
          room={editRoom}
          onClose={() => { setShowForm(false); setEditRoom(null); }}
          onSaved={handleSaved}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Host Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage your listings and bookings</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Room
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Listings", value: stats?.totalListings ?? 0, icon: Home },
            { label: "Active Listings", value: stats?.activeListings ?? 0, icon: CheckCircle },
            { label: "Total Bookings", value: stats?.totalBookings ?? 0, icon: Users },
            { label: "Revenue", value: `₹${(stats?.totalRevenue ?? 0).toLocaleString("en-IN")}`, icon: TrendingUp },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-6 w-fit">
          {(["listings", "bookings"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Listings tab */}
        {tab === "listings" && (
          <div>
            {roomsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => <div key={i} className="h-56 bg-muted rounded-xl animate-pulse" />)}
              </div>
            ) : rooms && rooms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map((room) => (
                  <div key={room.id} className="bg-white rounded-xl border border-border overflow-hidden">
                    <div className="relative h-40 bg-muted">
                      {room.images?.[0] ? (
                        <img src={room.images[0]} alt={room.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Home className="w-8 h-8 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${room.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {room.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <Link href={`/rooms/${room.id}`} className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1 text-sm">{room.title}</Link>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 mb-2">
                        <MapPin className="w-3 h-3" />
                        {room.city}
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-foreground">₹{room.pricePerNight.toLocaleString("en-IN")}<span className="text-xs font-normal text-muted-foreground">/night</span></span>
                        {room.avgRating != null && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
                            <span className="text-xs font-semibold">{room.avgRating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditRoom(room)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button onClick={() => { if (confirm("Delete this room?")) deleteMutation.mutate({ id: room.id }); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-destructive/30 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-border">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">No listings yet</h3>
                <p className="text-sm text-muted-foreground mb-5">Add your first room to start earning.</p>
                <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add First Room
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bookings tab */}
        {tab === "bookings" && (
          <div className="space-y-3">
            {bookingsLoading ? (
              [...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)
            ) : bookings && bookings.length > 0 ? (
              bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link href={`/rooms/${booking.room?.id}`} className="font-medium text-foreground hover:text-primary transition-colors text-sm line-clamp-1">{booking.room?.title}</Link>
                      <p className="text-xs text-muted-foreground">Guest: <span className="font-medium text-foreground">{booking.guest?.name}</span></p>
                      <p className="text-xs text-muted-foreground">{booking.checkIn} to {booking.checkOut} · {booking.guestCount} guest{booking.guestCount > 1 ? "s" : ""}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-foreground text-sm">₹{booking.totalPrice.toLocaleString("en-IN")}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[booking.status]}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-border">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">No bookings yet</h3>
                <p className="text-sm text-muted-foreground">Bookings on your listings will appear here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
