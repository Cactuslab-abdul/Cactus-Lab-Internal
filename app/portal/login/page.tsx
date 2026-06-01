"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, LogIn } from "lucide-react";

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !data.user) {
      setError("Incorrect email or password. Please try again.");
      setLoading(false);
      return;
    }

    // Look up role and redirect accordingly
    const meRes = await fetch("/api/portal/v2/me");
    if (!meRes.ok) {
      await supabase.auth.signOut();
      setError("This account doesn't have portal access. Contact your account manager.");
      setLoading(false);
      return;
    }
    const me = await meRes.json() as { role: string; company?: { slug: string } };

    if (me.role === "CLIENT" && me.company?.slug) {
      router.push(`/portal/client/${me.company.slug}`);
    } else if (me.role === "ADMIN" || me.role === "EDITOR") {
      router.push("/portal/internal");
    } else {
      await supabase.auth.signOut();
      setError("This account doesn't have portal access. Contact your account manager.");
      setLoading(false);
      return;
    }
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <img src="/logo-cactus.png" alt="Cactus Lab" className="w-12 h-12 rounded-2xl object-cover" />
        <div className="text-center">
          <p className="text-white font-bold text-lg leading-tight">Cactus Lab</p>
          <p className="text-[#555] text-sm">Client Portal</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-[#111] border border-[#1e1e1e] rounded-2xl p-8 space-y-6">
        <div>
          <h1 className="text-white text-xl font-bold">Welcome back</h1>
          <p className="text-[#555] text-sm mt-1">Sign in with your company email to view your portal.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="you@company.com"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#444] focus:border-[#3a3a3a] outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#444] focus:border-[#3a3a3a] outline-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
              : <><LogIn className="w-4 h-4" /> Sign In</>
            }
          </button>
        </form>
      </div>

      <p className="text-[#444] text-xs mt-8 text-center">
        Having trouble? Contact <span className="text-[#666]">your account manager on WhatsApp</span>.
      </p>
    </div>
  );
}
