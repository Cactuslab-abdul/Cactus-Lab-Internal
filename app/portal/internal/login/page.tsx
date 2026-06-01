"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

export default function InternalLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/portal/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/portal/internal");
    } else {
      setError("Incorrect password.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6">
      <div className="mb-10 flex flex-col items-center gap-3">
        <img src="/logo-cactus.png" alt="Cactus Lab" className="w-12 h-12 rounded-2xl object-cover" />
        <div className="text-center">
          <p className="text-white font-bold text-lg leading-tight">Cactus Lab</p>
          <p className="text-[#555] text-sm">Agency Portal</p>
        </div>
      </div>

      <div className="w-full max-w-sm bg-[#111] border border-[#1e1e1e] rounded-2xl p-8 space-y-6">
        <div>
          <h1 className="text-white text-xl font-bold">Admin Access</h1>
          <p className="text-[#555] text-sm mt-1">Enter the portal password to continue.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoFocus
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
            disabled={loading || !password}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
              : <><Lock className="w-4 h-4" /> Enter Portal</>
            }
          </button>
        </form>
      </div>
    </div>
  );
}
