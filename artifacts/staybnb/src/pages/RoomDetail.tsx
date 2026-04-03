import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import {
  useGetRoom,
  useGetRoomReviews,
  useCreateBooking,
  useCreateReview,
  getGetRoomQueryKey,
  getGetRoomReviewsQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Star, MapPin, Users, Calendar, ChevronLeft, Wifi, AirVent, Bath,
  Check, Bed, Home, Lock, AlertCircle
} from "lucide-react";
import { Link } from "wouter";

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-4 h-4" />,
  AC: <AirVent className="w-4 h-4" />,
  "Attached Bathroom": <Bath className="w-4 h-4" />,
  Balcony: <Home className="w-4 h-4" />,
  Security: <Lock className="w-4 h-4" />,
};

const TYPE_LABELS: Record<string, string> = {
  ENTIRE: "Entire Place",
  PRIVATE: "Private Room",
  SHARED: "Shared Room",
};

export default function RoomDetail() {
  const [, params] = useRoute("/rooms/:id");
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  const roomId = params?.id ? parseInt(params.id) : 0;

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  const { data: room, isLoading } = useGetRoom(roomId, {
    query: { enabled: !!roomId, queryKey: getGetRoomQueryKey(roomId) },
  });

  const { data: reviews } = useGetRoomReviews(roomId, {
    query: { enabled: !!roomId, queryKey: getGetRoomReviewsQueryKey(roomId) },
  });

  const createBookingMutation = useCreateBooking({
    mutation: {
      onSuccess: () => {
        toast.success("Booking confirmed! Check your dashboard for details.");
        setCheckIn("");
        setCheckOut("");
        setGuestCount(1);
        navigate("/dashboard");
      },
      onError: (error: any) => {
        const msg = error?.data?.message ?? error?.message ?? "Booking failed. Please try again.";
        toast.error(msg);
      },
    },
  });

  const createReviewMutation = useCreateReview({
    mutation: {
      onSuccess: () => {
        toast.success("Review posted!");
        setReviewComment("");
        setReviewRating(5);
        queryClient.invalidateQueries({ queryKey: getGetRoomQueryKey(roomId) });
        queryClient.invalidateQueries({ queryKey: getGetRoomReviewsQueryKey(roomId) });
      },
      onError: (error: any) => {
        const msg = error?.data?.message ?? "Could not post review. You need a confirmed booking.";
        toast.error(msg);
      },
    },
  });

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const a = new Date(checkIn);
    const b = new Date(checkOut);
    const diff = Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const nights = calculateNights();
  const totalPrice = nights > 0 && room ? nights * room.pricePerNight * guestCount : 0;

  const handleBook = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!checkIn || !checkOut) {
      toast.error("Please select check-in and check-out dates.");
      return;
    }
    if (nights < 1) {
      toast.error("Check-out must be after check-in.");
      return;
    }
    createBookingMutation.mutate({
      data: { roomId, checkIn, checkOut, guestCount },
    });
  };

  const handleReview = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!reviewComment.trim()) {
      toast.error("Please write a comment.");
      return;
    }
    createReviewMutation.mutate({
      id: roomId,
      data: { rating: reviewRating, comment: reviewComment },
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-80 bg-muted rounded-xl mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-6 bg-muted rounded w-2/3"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-4/5"></div>
            </div>
            <div className="h-64 bg-muted rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-semibold text-lg text-foreground mb-2">Room not found</h2>
        <Link href="/rooms" className="text-primary hover:underline text-sm">Browse all rooms</Link>
      </div>
    );
  }

  const allImages = room.images && room.images.length > 0 ? room.images : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <Link href="/rooms" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
          <ChevronLeft className="w-4 h-4" />
          Back to rooms
        </Link>

        {/* Title */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">{room.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {room.location}, {room.city}
                </div>
                {room.avgRating != null && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-secondary text-secondary" />
                    <span className="font-semibold text-foreground">{room.avgRating.toFixed(1)}</span>
                    <span>({room.reviewCount} reviews)</span>
                  </div>
                )}
                <span className="px-2.5 py-1 rounded-full bg-muted text-xs font-medium">
                  {TYPE_LABELS[room.type] ?? room.type}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-8">
          {allImages.length > 0 ? (
            <div>
              <div className="relative h-72 md:h-96 rounded-xl overflow-hidden mb-2">
                <img
                  src={allImages[activeImage]}
                  alt={room.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800";
                  }}
                />
                {!room.isAvailable && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">Not Available</span>
                  </div>
                )}
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-2">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                        activeImage === i ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-72 md:h-96 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Bed className="w-16 h-16 text-primary/40" />
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Host */}
            <div className="flex items-center gap-3 pb-6 border-b border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">{room.host?.name?.charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Hosted by {room.host?.name}</p>
                <p className="text-sm text-muted-foreground capitalize">{room.host?.role?.toLowerCase()}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-semibold text-lg text-foreground mb-3">About this place</h2>
              <p className="text-muted-foreground leading-relaxed">{room.description}</p>
            </div>

            {/* Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <div>
                <h2 className="font-semibold text-lg text-foreground mb-4">What's included</h2>
                <div className="grid grid-cols-2 gap-3">
                  {room.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="text-primary">
                        {AMENITY_ICONS[amenity] ?? <Check className="w-4 h-4" />}
                      </div>
                      <span className="text-sm font-medium text-foreground">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-semibold text-lg text-foreground">Reviews</h2>
                {room.avgRating != null && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-secondary text-secondary" />
                    <span className="font-semibold text-foreground">{room.avgRating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">({room.reviewCount})</span>
                  </div>
                )}
              </div>

              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 rounded-xl bg-white border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary text-xs font-bold">{review.user?.name?.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{review.user?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < review.rating ? "fill-secondary text-secondary" : "text-muted-foreground"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No reviews yet. Be the first to review!</p>
              )}

              {/* Post review */}
              {isAuthenticated && (
                <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border">
                  <h3 className="font-medium text-foreground mb-3 text-sm">Leave a review</h3>
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setReviewRating(star)}>
                        <Star
                          className={`w-6 h-6 transition-colors ${star <= reviewRating ? "fill-secondary text-secondary" : "text-muted-foreground"}`}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                  <button
                    onClick={handleReview}
                    disabled={createReviewMutation.isPending}
                    className="mt-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    {createReviewMutation.isPending ? "Posting..." : "Post Review"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-border shadow-lg p-6">
              <div className="mb-4">
                <span className="text-2xl font-bold text-foreground">₹{room.pricePerNight.toLocaleString("en-IN")}</span>
                <span className="text-sm text-muted-foreground"> / night</span>
              </div>

              {!room.isAvailable && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  This room is currently not available for booking.
                </div>
              )}

              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Check-in</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={checkIn}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Check-out</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn || new Date().toISOString().split("T")[0]}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Guests</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="number"
                      value={guestCount}
                      min={1}
                      max={10}
                      onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {nights > 0 && (
                <div className="mb-4 p-3 rounded-xl bg-muted/50 border border-border">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">₹{room.pricePerNight.toLocaleString("en-IN")} × {nights} night{nights > 1 ? "s" : ""} × {guestCount} guest{guestCount > 1 ? "s" : ""}</span>
                    <span className="text-foreground">₹{totalPrice.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t border-border pt-2 mt-2">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">₹{totalPrice.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleBook}
                disabled={createBookingMutation.isPending || !room.isAvailable}
                className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {createBookingMutation.isPending
                  ? "Booking..."
                  : !isAuthenticated
                  ? "Sign in to book"
                  : room.isAvailable
                  ? "Reserve now"
                  : "Not available"}
              </button>

              <p className="text-xs text-center text-muted-foreground mt-3">
                No charge until after confirmation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
