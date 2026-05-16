"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Plus, X, ChevronDown, ChevronUp } from "lucide-react";

interface GrowthEntry {
  date: string;
  followers: number;
  notes: string;
}

interface GrowthClient {
  id: string;
  name: string;
  platform: string;
  startFollowers: number;
  currentFollowers: number;
  goalFollowers: number;
  goalDate: string;
  entries: GrowthEntry[];
}

const STORAGE_KEY = "cactus-growth-clients";

const FALLBACK_LOGOS: Record<string, string> = {
  "Pets Delight": "/logo-pets-delight.jpg",
};

function buildLogoMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem("cactus-clients");
    if (raw) {
      const clients: { name: string; logoUrl?: string }[] = JSON.parse(raw);
      if (Array.isArray(clients)) {
        const map: Record<string, string> = { ...FALLBACK_LOGOS };
        clients.forEach((c) => {
          if (c.name && c.logoUrl) map[c.name] = c.logoUrl;
        });
        return map;
      }
    }
  } catch {}
  return { ...FALLBACK_LOGOS };
}

function ClientLogo({ name, size = "sm" }: { name: string; size?: "sm" | "lg" }) {
  const logoUrl = buildLogoMap()[name];
  const dim = size === "lg" ? "w-12 h-12" : "w-9 h-9";
  if (logoUrl) {
    return <img src={logoUrl} alt={name} className={`${dim} rounded-xl object-cover flex-shrink-0`} />;
  }
  return (
    <div className={`${dim} rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

const DEFAULT_CLIENT: GrowthClient = {
  id: "pets-delight",
  name: "Pets Delight",
  platform: "Instagram",
  startFollowers: 0,
  currentFollowers: 7260,
  goalFollowers: 15000,
  goalDate: "2026-12-31",
  entries: [],
};

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "LinkedIn", "Twitter/X", "Facebook"];

function pct(current: number, start: number, goal: number) {
  const range = goal - start;
  if (range <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round(((current - start) / range) * 100)));
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-AE", { month: "short", day: "numeric", year: "numeric" });
}

export default function GrowthTrackerPage() {
  const [clients, setClients] = useState<GrowthClient[]>([]);
  const [showAddClient, setShowAddClient] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updateTarget, setUpdateTarget] = useState<string | null>(null);

  // Add client form state
  const [newName, setNewName] = useState("");
  const [newPlatform, setNewPlatform] = useState("Instagram");
  const [newStart, setNewStart] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [newGoalDate, setNewGoalDate] = useState("");

  // Update form state
  const [updateFollowers, setUpdateFollowers] = useState("");
  const [updateNotes, setUpdateNotes] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const migrated = parsed.map((c: GrowthClient) => {
            if (c.id === "pets-delight") {
              return {
                ...c,
                currentFollowers: c.currentFollowers > 0 ? c.currentFollowers : 7260,
                goalFollowers: c.goalFollowers ?? 15000,
                goalDate: c.goalDate ?? "2026-12-31",
              };
            }
            return c;
          });
          setClients(migrated);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          return;
        }
      }
    } catch {}
    // Pre-seed with Pets Delight
    const initial = [DEFAULT_CLIENT];
    setClients(initial);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  }, []);

  function save(updated: GrowthClient[]) {
    setClients(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function addClient() {
    if (!newName.trim() || !newGoal) return;
    const startVal = parseInt(newStart) || 0;
    const client: GrowthClient = {
      id: Date.now().toString(),
      name: newName.trim(),
      platform: newPlatform,
      startFollowers: startVal,
      currentFollowers: startVal,
      goalFollowers: parseInt(newGoal) || 10000,
      goalDate: newGoalDate || "2026-12-31",
      entries: [],
    };
    save([...clients, client]);
    setNewName("");
    setNewPlatform("Instagram");
    setNewStart("");
    setNewGoal("");
    setNewGoalDate("");
    setShowAddClient(false);
  }

  function addUpdate(clientId: string) {
    if (!updateFollowers) return;
    const today = new Date().toISOString().split("T")[0];
    const entry: GrowthEntry = {
      date: today,
      followers: parseInt(updateFollowers),
      notes: updateNotes.trim(),
    };
    const updated = clients.map((c) => {
      if (c.id !== clientId) return c;
      return {
        ...c,
        currentFollowers: parseInt(updateFollowers),
        entries: [entry, ...c.entries],
      };
    });
    save(updated);
    setUpdateFollowers("");
    setUpdateNotes("");
    setUpdateTarget(null);
  }

  function removeClient(clientId: string) {
    if (!confirm("Remove this client from Growth Tracker?")) return;
    save(clients.filter((c) => c.id !== clientId));
  }

  const platformColor: Record<string, string> = {
    Instagram: "bg-pink-500/15 text-pink-400",
    TikTok: "bg-[#222] text-white",
    YouTube: "bg-red-500/15 text-red-400",
    LinkedIn: "bg-blue-500/15 text-blue-400",
    "Twitter/X": "bg-sky-500/15 text-sky-400",
    Facebook: "bg-indigo-500/15 text-indigo-400",
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold">Growth Tracker</h1>
            <p className="text-[#666] text-sm mt-0.5">Track follower growth and KPIs per client</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddClient(true)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold text-lg">Add Growth Client</h2>
              <button onClick={() => setShowAddClient(false)} className="text-[#555] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[#888] text-xs font-medium block mb-1.5">Client Name</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Pets Delight"
                  className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-green-500/50"
                />
              </div>
              <div>
                <label className="text-[#888] text-xs font-medium block mb-1.5">Platform</label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500/50"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#888] text-xs font-medium block mb-1.5">Starting Followers</label>
                  <input
                    type="number"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    placeholder="0"
                    className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-green-500/50"
                  />
                </div>
                <div>
                  <label className="text-[#888] text-xs font-medium block mb-1.5">Goal Followers</label>
                  <input
                    type="number"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="10000"
                    className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-green-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-[#888] text-xs font-medium block mb-1.5">Goal Date</label>
                <input
                  type="date"
                  value={newGoalDate}
                  onChange={(e) => setNewGoalDate(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500/50"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddClient(false)}
                className="flex-1 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addClient}
                disabled={!newName.trim() || !newGoal}
                className="flex-1 bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
              >
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Cards */}
      {clients.length === 0 ? (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-12 text-center">
          <TrendingUp className="w-8 h-8 text-[#333] mx-auto mb-3" />
          <p className="text-[#555] text-sm">No growth clients yet. Add one to start tracking.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => {
            const progress = pct(client.currentFollowers, client.startFollowers, client.goalFollowers);
            const gain = client.currentFollowers - client.startFollowers;
            const remaining = client.goalFollowers - client.currentFollowers;
            const isExpanded = expandedId === client.id;
            const isUpdating = updateTarget === client.id;
            const platColor = platformColor[client.platform] ?? "bg-[#222] text-[#888]";

            return (
              <div key={client.id} className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
                {/* Card header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <ClientLogo name={client.name} size="sm" />
                      <div>
                        <h3 className="text-white font-semibold text-base">{client.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${platColor}`}>
                          {client.platform}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setUpdateTarget(isUpdating ? null : client.id)}
                        className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 px-3 py-1.5 rounded-lg font-medium transition-colors"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => removeClient(client.id)}
                        className="text-[#444] hover:text-red-400 transition-colors p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-4 mb-5">
                    <div>
                      <p className="text-[#555] text-xs mb-0.5">Current</p>
                      <p className="text-white font-bold text-xl">{client.currentFollowers.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[#555] text-xs mb-0.5">Goal</p>
                      <p className="text-white font-bold text-xl">{client.goalFollowers.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[#555] text-xs mb-0.5">Remaining</p>
                      <p className={`font-bold text-xl ${remaining <= 0 ? "text-green-400" : "text-white"}`}>
                        {remaining <= 0 ? "Done!" : remaining.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar: start → current → goal */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-[#555] mb-1.5">
                      <span>{client.startFollowers.toLocaleString()} start</span>
                      <span className="text-green-400 font-medium">{progress}% to goal</span>
                      <span>{client.goalFollowers.toLocaleString()} goal</span>
                    </div>
                    <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-[#555] text-xs">
                      +{gain.toLocaleString()} gained · Goal by {formatDate(client.goalDate)}
                    </p>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : client.id)}
                      className="flex items-center gap-1 text-[#555] hover:text-white text-xs transition-colors"
                    >
                      History
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Update form */}
                {isUpdating && (
                  <div className="px-6 pb-5 border-t border-[#1a1a1a] pt-4">
                    <p className="text-white text-sm font-medium mb-3">Log today&apos;s follower count</p>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        value={updateFollowers}
                        onChange={(e) => setUpdateFollowers(e.target.value)}
                        placeholder="Current followers"
                        className="flex-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm placeholder-[#444] focus:outline-none focus:border-green-500/50"
                      />
                      <input
                        value={updateNotes}
                        onChange={(e) => setUpdateNotes(e.target.value)}
                        placeholder="Notes (optional)"
                        className="flex-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm placeholder-[#444] focus:outline-none focus:border-green-500/50"
                      />
                      <button
                        onClick={() => addUpdate(client.id)}
                        disabled={!updateFollowers}
                        className="bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}

                {/* History */}
                {isExpanded && (
                  <div className="border-t border-[#1a1a1a]">
                    {client.entries.length === 0 ? (
                      <p className="text-[#444] text-sm px-6 py-4">No entries yet. Hit Update to log your first count.</p>
                    ) : (
                      <div className="divide-y divide-[#1a1a1a]">
                        {client.entries.map((entry, i) => (
                          <div key={i} className="flex items-center gap-4 px-6 py-3">
                            <span className="text-[#555] text-xs w-24 flex-shrink-0">{formatDate(entry.date)}</span>
                            <span className="text-white text-sm font-semibold w-24 flex-shrink-0">
                              {entry.followers.toLocaleString()}
                            </span>
                            {entry.notes && (
                              <span className="text-[#666] text-xs truncate">{entry.notes}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
