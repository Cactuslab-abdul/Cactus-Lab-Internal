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
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 mb-5">
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.5 3-4 5-4 8a4 4 0 008 0c0-3-2.5-5-4-8z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v10M9 18h6" />
            </svg>
          </div>
          <h1 className="text-white text-xl font-bold">Cactus Lab Agency OS</h1>
          <p className="text-[#555] text-sm mt-1">Sign in to access your workspace</p>
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
