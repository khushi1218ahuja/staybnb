import { useState } from "react";
import { useLocation } from "wouter";
import { Search, MapPin, Calendar, Users, Star, ArrowRight, Shield, Clock, Heart } from "lucide-react";
import { useGetFeaturedRooms, useGetPopularCities } from "@workspace/api-client-react";
import RoomCard from "@/components/RoomCard";
import RoomSkeleton from "@/components/RoomSkeleton";
import { motion } from "framer-motion";
import { Link } from "wouter";

const CITY_IMAGES: Record<string, string> = {
  Mumbai: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=400",
  Bangalore: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400",
  Delhi: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400",
  Hyderabad: "https://images.unsplash.com/photo-1629291776898-2cae53c2d6a2?w=400",
  Chennai: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400",
  Pune: "https://images.unsplash.com/photo-1625731226313-4fe91fc8a9b7?w=400",
};

export default function Home() {
  const [, navigate] = useLocation();
  const [searchCity, setSearchCity] = useState("");

  const { data: featuredRooms, isLoading: featuredLoading } = useGetFeaturedRooms();
  const { data: cities, isLoading: citiesLoading } = useGetPopularCities();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.set("city", searchCity);
    navigate(`/rooms?${params.toString()}`);
  };

  const handleCityClick = (city: string) => {
    navigate(`/rooms?city=${encodeURIComponent(city)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1800')] bg-cover bg-center opacity-15"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/80"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-6">
              <Star className="w-3.5 h-3.5 fill-secondary" />
              India's best PG & room booking platform
            </span>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Find your perfect
              <span className="text-secondary block">home away from home</span>
            </h1>
            <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
              From cozy PG rooms to entire studio apartments — discover thousands of verified stays across India's top cities.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 shadow-2xl max-w-2xl mx-auto">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-4 py-2">
                  <MapPin className="w-5 h-5 text-secondary shrink-0" />
                  <input
                    type="text"
                    placeholder="Where are you going? (City)"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="flex-1 text-sm text-foreground placeholder-muted-foreground bg-transparent outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shrink-0"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 48h1440V24C1440 24 1080 0 720 0S0 24 0 24V48z" fill="hsl(36 33% 97%)" />
          </svg>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-3 gap-6 divide-x divide-border">
            {[
              { label: "Rooms Listed", value: "5,000+", icon: Heart },
              { label: "Happy Guests", value: "20,000+", icon: Star },
              { label: "Cities Covered", value: "50+", icon: MapPin },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center px-4">
                <span className="text-2xl font-bold text-primary">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl font-bold text-foreground">Popular cities</h2>
            <p className="text-muted-foreground mt-1">Where thousands of travelers stay</p>
          </div>
          <Link href="/rooms" className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {citiesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 rounded-xl bg-muted animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(cities ?? []).slice(0, 8).map((city, i) => (
              <motion.button
                key={city.city}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleCityClick(city.city)}
                className="relative h-40 rounded-xl overflow-hidden group cursor-pointer border border-border"
              >
                <img
                  src={CITY_IMAGES[city.city] ?? `https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400`}
                  alt={city.city}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = `https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-left">
                  <p className="text-white font-semibold text-sm">{city.city}</p>
                  <p className="text-white/70 text-xs">{city.roomCount} rooms</p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </section>

      {/* Featured Rooms */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl font-bold text-foreground">Top rated stays</h2>
              <p className="text-muted-foreground mt-1">Loved by our guests</p>
            </div>
            <Link href="/rooms" className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => <RoomSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {(featuredRooms ?? []).slice(0, 8).map((room, i) => (
                <RoomCard key={room.id} room={room} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why StayBnB */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-3">Why choose StayBnB</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We make finding and booking PG accommodations simple, safe, and stress-free.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: "Verified Listings",
              desc: "Every room is verified by our team. What you see is what you get — no surprises at check-in.",
            },
            {
              icon: Clock,
              title: "Instant Booking",
              desc: "Book your stay in minutes. No back-and-forth emails. Instant confirmation with secure payments.",
            },
            {
              icon: Heart,
              title: "Loved by Thousands",
              desc: "Over 20,000 guests have found their perfect stay through StayBnB. Join the community.",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6 rounded-xl bg-white border border-border shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">Have a room to rent?</h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Join thousands of hosts earning extra income by listing their PG rooms on StayBnB.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-foreground rounded-xl font-semibold hover:bg-secondary/90 transition-colors"
          >
            List your property <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white/60 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                <span className="text-foreground font-bold text-xs">S</span>
              </div>
              <span className="font-serif font-bold text-white">StayBnB</span>
            </div>
            <p className="text-sm">© 2026 StayBnB. All rights reserved.</p>
            <div className="flex gap-4 text-sm">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-white cursor-pointer transition-colors">Support</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
