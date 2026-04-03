import { Link } from "wouter";
import { Star, MapPin, Wifi, AirVent, Bath } from "lucide-react";
import type { Room } from "@workspace/api-client-react";
import { motion } from "framer-motion";

const TYPE_LABELS: Record<string, string> = {
  ENTIRE: "Entire Place",
  PRIVATE: "Private Room",
  SHARED: "Shared Room",
};

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-3 h-3" />,
  AC: <AirVent className="w-3 h-3" />,
  "Attached Bathroom": <Bath className="w-3 h-3" />,
};

function RoomImage({ images, title }: { images: string[]; title: string }) {
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        <span className="text-sm text-muted-foreground font-medium">{title.charAt(0)}</span>
      </div>
    );
  }
  return (
    <img
      src={images[0]}
      alt={title}
      className="w-full h-full object-cover"
      onError={(e) => {
        const target = e.currentTarget;
        target.style.display = "none";
        const parent = target.parentElement;
        if (parent) {
          parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"><span class="text-sm text-muted-foreground font-medium">${title.charAt(0)}</span></div>`;
        }
      }}
    />
  );
}

interface RoomCardProps {
  room: Room;
  index?: number;
}

export default function RoomCard({ room, index = 0 }: RoomCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
    >
      <Link href={`/rooms/${room.id}`}>
        <div className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
          <div className="relative h-52 overflow-hidden bg-muted">
            <RoomImage images={room.images} title={room.title} />
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-foreground backdrop-blur-sm shadow-sm">
                {TYPE_LABELS[room.type] ?? room.type}
              </span>
            </div>
            {!room.isAvailable && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white font-semibold text-sm bg-black/60 px-3 py-1.5 rounded-full">
                  Not Available
                </span>
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors flex-1">
                {room.title}
              </h3>
              {room.avgRating != null && (
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
                  <span className="text-xs font-semibold text-foreground">{room.avgRating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({room.reviewCount})</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground mb-3">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="text-xs truncate">{room.city}</span>
            </div>
            {room.amenities && room.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {room.amenities.slice(0, 3).map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-muted-foreground bg-muted"
                  >
                    {AMENITY_ICONS[amenity]}
                    {amenity}
                  </span>
                ))}
                {room.amenities.length > 3 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs text-muted-foreground bg-muted">
                    +{room.amenities.length - 3}
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <div>
                <span className="text-lg font-bold text-foreground">₹{room.pricePerNight.toLocaleString("en-IN")}</span>
                <span className="text-xs text-muted-foreground"> /night</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>by</span>
                <span className="font-medium text-foreground">{room.host?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
