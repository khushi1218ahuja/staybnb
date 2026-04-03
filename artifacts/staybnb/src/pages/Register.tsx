import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Home, Eye, EyeOff, UserPlus, Building2, User } from "lucide-react";
import type { AuthResponse } from "@workspace/api-client-react";

export default function Register() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"GUEST" | "HOST">("GUEST");
  const [showPassword, setShowPassword] = useState(false);

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (data: AuthResponse) => {
        login(data);
        toast.success(`Account created! Welcome, ${data.user.name}!`);
        if (data.user.role === "HOST") navigate("/host");
        else navigate("/rooms");
      },
      onError: (error: any) => {
        const msg = error?.data?.message ?? "Registration failed. Please try again.";
        toast.error(msg);
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    registerMutation.mutate({
      data: { name: name.trim(), email, password, role, phone: phone || undefined },
    });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-2xl font-bold text-foreground">StayBnB</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-6 mb-1">Create an account</h1>
          <p className="text-sm text-muted-foreground">Join thousands of travelers and hosts</p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole("GUEST")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              role === "GUEST"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            <User className="w-6 h-6" />
            <div className="text-left">
              <p className="font-semibold text-sm">I'm a Guest</p>
              <p className="text-xs opacity-70">Find & book rooms</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setRole("HOST")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              role === "HOST"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            <Building2 className="w-6 h-6" />
            <div className="text-left">
              <p className="font-semibold text-sm">I'm a Host</p>
              <p className="text-xs opacity-70">List your property</p>
            </div>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Phone (optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {registerMutation.isPending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {registerMutation.isPending ? "Creating account..." : `Create ${role === "HOST" ? "Host" : "Guest"} Account`}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
