"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Incorrect email or password");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-4 mb-10">
          <img src="https://tpxyegbeluspgashouzb.supabase.co/storage/v1/object/public/avatars/cactus%20lab%20social%20logo.png" alt="Cactus Lab" className="w-14 h-14 rounded-2xl object-contain flex-shrink-0" />
          <div>
            <h1 className="text-white text-xl font-bold">Cactus Lab Agency OS</h1>
            <p className="text-[#555] text-sm mt-0.5">Sign in to access your workspace</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoFocus
            required
            className="w-full bg-[#111] border border-[#2a2a2a] focus:border-green-500/50 rounded-xl px-4 py-3.5 text-white placeholder-[#444] text-sm outline-none transition-colors"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full bg-[#111] border border-[#2a2a2a] focus:border-green-500/50 rounded-xl px-4 py-3.5 text-white placeholder-[#444] text-sm outline-none transition-colors"
          />

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold py-3.5 rounded-xl text-sm transition-colors mt-1"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-[#333] text-xs text-center mt-8">Cactus Lab FZ LLC · Internal use only</p>
      </div>
    </div>
  );
}
