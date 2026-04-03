import { useLocation } from "wouter";
import { useGetMyBookings, useCancelBooking, getGetMyBookingsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect } from "react";
import { LayoutDashboard, MapPin, Calendar, Users, AlertCircle, X, CheckCircle, Clock } from "lucide-react";
import { Link } from "wouter";

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-red-100 text-red-700",
};
const STATUS_ICONS: Record<string, React.ReactNode> = {
  CONFIRMED: <CheckCircle className="w-3.5 h-3.5" />,
  PENDING: <Clock className="w-3.5 h-3.5" />,
  CANCELLED: <X className="w-3.5 h-3.5" />,
};

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate("/login");
  }, [isAuthenticated, authLoading]);

  const { data: bookings, isLoading } = useGetMyBookings({
    query: { enabled: isAuthenticated, queryKey: getGetMyBookingsQueryKey() },
  });

  const cancelMutation = useCancelBooking({
    mutation: {
      onSuccess: () => {
        toast.success("Booking cancelled. Refund initiated.");
        queryClient.invalidateQueries({ queryKey: getGetMyBookingsQueryKey() });
      },
      onError: () => toast.error("Could not cancel booking."),
    },
  });

  if (authLoading || !isAuthenticated) return null;

  const activeBookings = bookings?.filter((b) => b.status !== "CANCELLED") ?? [];
  const cancelledBookings = bookings?.filter((b) => b.status === "CANCELLED") ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">My Bookings</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Bookings", value: bookings?.length ?? 0 },
            { label: "Active", value: activeBookings.length },
            { label: "Cancelled", value: cancelledBookings.length },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Bookings list */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-border p-5 animate-pulse">
                <div className="h-5 bg-muted rounded w-2/3 mb-3"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : bookings && bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  {/* Room image */}
                  <div className="sm:w-40 h-32 sm:h-auto shrink-0 bg-muted relative overflow-hidden">
                    {booking.room?.images?.[0] ? (
                      <img
                        src={booking.room.images[0]}
                        alt={booking.room.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <span className="text-primary/40 text-2xl font-bold">
                          {booking.room?.title?.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <Link
                          href={`/rooms/${booking.room?.id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                        >
                          {booking.room?.title}
                        </Link>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {booking.room?.city}
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[booking.status]}`}>
                        {STATUS_ICONS[booking.status]}
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{booking.checkIn} — {booking.checkOut}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{booking.guestCount} guest{booking.guestCount > 1 ? "s" : ""}</span>
                      </div>
                      <div className="font-semibold text-foreground">
                        ₹{booking.totalPrice.toLocaleString("en-IN")} total
                      </div>
                    </div>

                    {booking.paymentStatus && (
                      <p className="text-xs text-muted-foreground mb-2">
                        Payment: <span className="font-medium text-foreground">{booking.paymentStatus}</span>
                        {booking.transactionId && (
                          <span className="ml-1 text-muted-foreground/60">({booking.transactionId})</span>
                        )}
                      </p>
                    )}

                    {booking.status !== "CANCELLED" && (
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to cancel this booking?")) {
                            cancelMutation.mutate({ id: booking.id });
                          }
                        }}
                        disabled={cancelMutation.isPending}
                        className="flex items-center gap-1.5 text-xs text-destructive hover:text-destructive/80 font-medium transition-colors disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-border">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No bookings yet</h3>
            <p className="text-sm text-muted-foreground mb-6">When you book a room, it'll appear here.</p>
            <Link
              href="/rooms"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Browse Rooms
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
