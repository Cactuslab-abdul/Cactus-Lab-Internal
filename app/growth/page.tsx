"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Plus, X, ChevronDown, ChevronUp } from "lucide-react";

interface GrowthEntry {
  date: string;
  followers: number;
  notes: string;
}

interface PlatformTracker {
  platform: string;
  startFollowers: number;
  currentFollowers: number;
  goalFollowers: number;
  goalDate: string;
  entries: GrowthEntry[];
}

interface GrowthClient {
  id: string;
  name: string;
  platforms: PlatformTracker[];
}

// Old format for migration
interface LegacyGrowthClient {
  id: string;
  name: string;
  platform?: string;
  platforms?: PlatformTracker[];
  startFollowers?: number;
  currentFollowers?: number;
  goalFollowers?: number;
  goalDate?: string;
  entries?: GrowthEntry[];
}

interface CactusClient {
  id: string;
  name: string;
  logoUrl?: string;
}

const STORAGE_KEY = "cactus-growth-clients";
const CLIENTS_KEY = "cactus-clients";

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "LinkedIn", "Twitter/X", "Facebook"];

const PLATFORM_COLORS: Record<string, { tab: string; active: string; badge: string }> = {
  Instagram: {
    tab: "text-[#555] hover:text-pink-400",
    active: "bg-pink-500/15 text-pink-400 border-pink-500/30",
    badge: "bg-pink-500/15 text-pink-400",
  },
  TikTok: {
    tab: "text-[#555] hover:text-white",
    active: "bg-[#222] text-white border-[#444]",
    badge: "bg-[#222] text-white",
  },
  YouTube: {
    tab: "text-[#555] hover:text-red-400",
    active: "bg-red-500/15 text-red-400 border-red-500/30",
    badge: "bg-red-500/15 text-red-400",
  },
  LinkedIn: {
    tab: "text-[#555] hover:text-blue-400",
    active: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    badge: "bg-blue-500/15 text-blue-400",
  },
  "Twitter/X": {
    tab: "text-[#555] hover:text-sky-400",
    active: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    badge: "bg-sky-500/15 text-sky-400",
  },
  Facebook: {
    tab: "text-[#555] hover:text-indigo-400",
    active: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    badge: "bg-indigo-500/15 text-indigo-400",
  },
};

const FALLBACK_LOGOS: Record<string, string> = {
  "Pets Delight": "/logo-pets-delight.jpg",
};

function buildLogoMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CLIENTS_KEY);
    if (raw) {
      const clients: CactusClient[] = JSON.parse(raw);
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

function ClientLogo({ name }: { name: string }) {
  const logoUrl = buildLogoMap()[name];
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
      />
    );
  }
  return (
    <div className="w-9 h-9 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function defaultPlatformTracker(platform: string = "Instagram"): PlatformTracker {
  return {
    platform,
    startFollowers: 0,
    currentFollowers: 0,
    goalFollowers: 10000,
    goalDate: "2026-12-31",
    entries: [],
  };
}

function migrateClient(raw: LegacyGrowthClient): GrowthClient {
  // Already new format
  if (Array.isArray(raw.platforms)) {
    return { id: raw.id, name: raw.name, platforms: raw.platforms };
  }
  // Old flat format — promote to platforms array
  return {
    id: raw.id,
    name: raw.name,
    platforms: [
      {
        platform: raw.platform ?? "Instagram",
        startFollowers: raw.startFollowers ?? 0,
        currentFollowers: raw.currentFollowers ?? 0,
        goalFollowers: raw.goalFollowers ?? 10000,
        goalDate: raw.goalDate ?? "2026-12-31",
        entries: raw.entries ?? [],
      },
    ],
  };
}

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

  // activePlatform[clientId] = platform name currently selected
  const [activePlatform, setActivePlatform] = useState<Record<string, string>>({});

  // expandedId = clientId whose history is open
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // updateTarget = clientId whose update form is open
  const [updateTarget, setUpdateTarget] = useState<string | null>(null);

  // addPlatformTarget = clientId whose "add platform" form is open
  const [addPlatformTarget, setAddPlatformTarget] = useState<string | null>(null);

  // Update form
  const [updateFollowers, setUpdateFollowers] = useState("");
  const [updateNotes, setUpdateNotes] = useState("");

  // Add platform form
  const [newPlatformName, setNewPlatformName] = useState("TikTok");
  const [newPlatformStart, setNewPlatformStart] = useState("");
  const [newPlatformGoal, setNewPlatformGoal] = useState("");
  const [newPlatformGoalDate, setNewPlatformGoalDate] = useState("");

  // ── Load & sync on mount ──────────────────────────────────────────────────
  useEffect(() => {
    let growthClients: GrowthClient[] = [];

    // 1. Load existing growth data (with migration)
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: LegacyGrowthClient[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          growthClients = parsed.map(migrateClient);
          // Special: ensure pets-delight has sensible defaults if currentFollowers is 0
          growthClients = growthClients.map((c) => {
            if (c.id === "pets-delight") {
              return {
                ...c,
                platforms: c.platforms.map((p) =>
                  p.platform === "Instagram"
                    ? {
                        ...p,
                        currentFollowers: p.currentFollowers > 0 ? p.currentFollowers : 7260,
                        goalFollowers: p.goalFollowers > 0 ? p.goalFollowers : 15000,
                        goalDate: p.goalDate || "2026-12-31",
                      }
                    : p
                ),
              };
            }
            return c;
          });
        }
      }
    } catch {}

    // 2. Auto-sync from cactus-clients
    try {
      const raw = localStorage.getItem(CLIENTS_KEY);
      if (raw) {
        const cactusClients: CactusClient[] = JSON.parse(raw);
        if (Array.isArray(cactusClients)) {
          const existingIds = new Set(growthClients.map((c) => c.id));
          const toAdd: GrowthClient[] = cactusClients
            .filter((c) => !existingIds.has(c.id))
            .map((c) => ({
              id: c.id,
              name: c.name,
              platforms: [defaultPlatformTracker("Instagram")],
            }));
          growthClients = [...growthClients, ...toAdd];
        }
      }
    } catch {}

    // 3. If still empty, seed with Pets Delight
    if (growthClients.length === 0) {
      growthClients = [
        {
          id: "pets-delight",
          name: "Pets Delight",
          platforms: [
            {
              platform: "Instagram",
              startFollowers: 0,
              currentFollowers: 7260,
              goalFollowers: 15000,
              goalDate: "2026-12-31",
              entries: [],
            },
          ],
        },
      ];
    }

    setClients(growthClients);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(growthClients));

    // 4. Set default active platform per client
    const ap: Record<string, string> = {};
    growthClients.forEach((c) => {
      if (c.platforms.length > 0) ap[c.id] = c.platforms[0].platform;
    });
    setActivePlatform(ap);
  }, []);

  // ── Persist helpers ───────────────────────────────────────────────────────
  function save(updated: GrowthClient[]) {
    setClients(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function getActivePlatformData(client: GrowthClient): PlatformTracker | null {
    const name = activePlatform[client.id] ?? client.platforms[0]?.platform;
    return client.platforms.find((p) => p.platform === name) ?? client.platforms[0] ?? null;
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  function logUpdate(clientId: string) {
    if (!updateFollowers) return;
    const today = new Date().toISOString().split("T")[0];
    const activePlat = activePlatform[clientId];
    const entry: GrowthEntry = {
      date: today,
      followers: parseInt(updateFollowers),
      notes: updateNotes.trim(),
    };
    const updated = clients.map((c) => {
      if (c.id !== clientId) return c;
      return {
        ...c,
        platforms: c.platforms.map((p) => {
          if (p.platform !== activePlat) return p;
          return {
            ...p,
            currentFollowers: parseInt(updateFollowers),
            entries: [entry, ...p.entries],
          };
        }),
      };
    });
    save(updated);
    setUpdateFollowers("");
    setUpdateNotes("");
    setUpdateTarget(null);
  }

  function addPlatform(clientId: string) {
    if (!newPlatformName) return;
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    // Don't add duplicate
    if (client.platforms.some((p) => p.platform === newPlatformName)) {
      setAddPlatformTarget(null);
      return;
    }
    const tracker: PlatformTracker = {
      platform: newPlatformName,
      startFollowers: parseInt(newPlatformStart) || 0,
      currentFollowers: parseInt(newPlatformStart) || 0,
      goalFollowers: parseInt(newPlatformGoal) || 10000,
      goalDate: newPlatformGoalDate || "2026-12-31",
      entries: [],
    };
    const updated = clients.map((c) => {
      if (c.id !== clientId) return c;
      return { ...c, platforms: [...c.platforms, tracker] };
    });
    save(updated);
    setActivePlatform((prev) => ({ ...prev, [clientId]: newPlatformName }));
    // Reset form
    setNewPlatformName("TikTok");
    setNewPlatformStart("");
    setNewPlatformGoal("");
    setNewPlatformGoalDate("");
    setAddPlatformTarget(null);
  }

  function removePlatform(clientId: string, platformName: string) {
    const client = clients.find((c) => c.id === clientId);
    if (!client || client.platforms.length <= 1) return;
    const updated = clients.map((c) => {
      if (c.id !== clientId) return c;
      const remaining = c.platforms.filter((p) => p.platform !== platformName);
      return { ...c, platforms: remaining };
    });
    save(updated);
    // If removed platform was active, switch to first remaining
    if (activePlatform[clientId] === platformName) {
      const remaining = client.platforms.filter((p) => p.platform !== platformName);
      if (remaining.length > 0) {
        setActivePlatform((prev) => ({ ...prev, [clientId]: remaining[0].platform }));
      }
    }
  }

  function removeClient(clientId: string) {
    if (!confirm("Remove this client from Growth Tracker? Their data in Clients won't be affected.")) return;
    save(clients.filter((c) => c.id !== clientId));
  }

  // ── Render ────────────────────────────────────────────────────────────────
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
            <p className="text-[#666] text-sm mt-0.5">Track follower growth across platforms per client</p>
          </div>
        </div>
      </div>

      {/* Client Cards */}
      {clients.length === 0 ? (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-12 text-center">
          <TrendingUp className="w-8 h-8 text-[#333] mx-auto mb-3" />
          <p className="text-[#555] text-sm">No clients yet. Add one in the Clients section — they&apos;ll appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => {
            const platData = getActivePlatformData(client);
            const isExpanded = expandedId === client.id;
            const isUpdating = updateTarget === client.id;
            const isAddingPlatform = addPlatformTarget === client.id;
            const currentActivePlat = activePlatform[client.id] ?? client.platforms[0]?.platform;

            const progress = platData
              ? pct(platData.currentFollowers, platData.startFollowers, platData.goalFollowers)
              : 0;
            const gain = platData ? platData.currentFollowers - platData.startFollowers : 0;
            const remaining = platData ? platData.goalFollowers - platData.currentFollowers : 0;

            // Available platforms to add (not already present)
            const existingPlatNames = new Set(client.platforms.map((p) => p.platform));
            const availablePlatforms = PLATFORMS.filter((p) => !existingPlatNames.has(p));

            return (
              <div key={client.id} className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
                {/* Card header row */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    {/* Left: logo + name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <ClientLogo name={client.name} />
                      <h3 className="text-white font-semibold text-base truncate">{client.name}</h3>
                    </div>

                    {/* Right: platform tabs + controls */}
                    <div className="flex items-center gap-2 flex-wrap justify-end flex-shrink-0">
                      {/* Platform tab buttons */}
                      {client.platforms.map((p) => {
                        const colors = PLATFORM_COLORS[p.platform] ?? {
                          tab: "text-[#555] hover:text-white",
                          active: "bg-[#222] text-white border-[#444]",
                          badge: "bg-[#222] text-white",
                        };
                        const isActive = currentActivePlat === p.platform;
                        return (
                          <div key={p.platform} className="relative flex items-center">
                            <button
                              onClick={() =>
                                setActivePlatform((prev) => ({ ...prev, [client.id]: p.platform }))
                              }
                              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                                isActive
                                  ? colors.active
                                  : "border-transparent text-[#555] hover:text-[#aaa]"
                              }`}
                            >
                              {p.platform}
                            </button>
                            {/* Remove platform X — only shown when more than 1 platform */}
                            {client.platforms.length > 1 && (
                              <button
                                onClick={() => removePlatform(client.id, p.platform)}
                                className="ml-0.5 text-[#333] hover:text-red-400 transition-colors"
                                title={`Remove ${p.platform}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {/* Add Platform button */}
                      {availablePlatforms.length > 0 && (
                        <button
                          onClick={() => {
                            setAddPlatformTarget(isAddingPlatform ? null : client.id);
                            setNewPlatformName(availablePlatforms[0]);
                          }}
                          className="text-xs px-2.5 py-1 rounded-lg border border-dashed border-[#333] text-[#555] hover:text-green-400 hover:border-green-500/40 transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Platform
                        </button>
                      )}

                      {/* Update button */}
                      <button
                        onClick={() => setUpdateTarget(isUpdating ? null : client.id)}
                        className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 px-3 py-1.5 rounded-lg font-medium transition-colors"
                      >
                        Update
                      </button>

                      {/* Remove client X */}
                      <button
                        onClick={() => removeClient(client.id)}
                        className="text-[#444] hover:text-red-400 transition-colors p-1"
                        title="Remove from tracker"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Add Platform inline form */}
                  {isAddingPlatform && (
                    <div className="mb-4 p-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl">
                      <p className="text-white text-sm font-medium mb-3">Add a platform</p>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="text-[#666] text-xs mb-1 block">Platform</label>
                          <select
                            value={newPlatformName}
                            onChange={(e) => setNewPlatformName(e.target.value)}
                            className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500/50"
                          >
                            {availablePlatforms.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[#666] text-xs mb-1 block">Starting Followers</label>
                          <input
                            type="number"
                            value={newPlatformStart}
                            onChange={(e) => setNewPlatformStart(e.target.value)}
                            placeholder="0"
                            className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm placeholder-[#444] focus:outline-none focus:border-green-500/50"
                          />
                        </div>
                        <div>
                          <label className="text-[#666] text-xs mb-1 block">Goal Followers</label>
                          <input
                            type="number"
                            value={newPlatformGoal}
                            onChange={(e) => setNewPlatformGoal(e.target.value)}
                            placeholder="10000"
                            className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm placeholder-[#444] focus:outline-none focus:border-green-500/50"
                          />
                        </div>
                        <div>
                          <label className="text-[#666] text-xs mb-1 block">Goal Date</label>
                          <input
                            type="date"
                            value={newPlatformGoalDate}
                            onChange={(e) => setNewPlatformGoalDate(e.target.value)}
                            className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500/50"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAddPlatformTarget(null)}
                          className="flex-1 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-white font-medium px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => addPlatform(client.id)}
                          className="flex-1 bg-green-500 hover:bg-green-400 text-black font-semibold px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Stats for active platform */}
                  {platData && (
                    <>
                      <div className="grid grid-cols-3 gap-4 mb-5">
                        <div>
                          <p className="text-[#555] text-xs mb-0.5">Current</p>
                          <p className="text-white font-bold text-xl">{platData.currentFollowers.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[#555] text-xs mb-0.5">Goal</p>
                          <p className="text-white font-bold text-xl">{platData.goalFollowers.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[#555] text-xs mb-0.5">Remaining</p>
                          <p className={`font-bold text-xl ${remaining <= 0 ? "text-green-400" : "text-white"}`}>
                            {remaining <= 0 ? "Done!" : remaining.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-[#555] mb-1.5">
                          <span>{platData.startFollowers.toLocaleString()} start</span>
                          <span className="text-green-400 font-medium">{progress}% to goal</span>
                          <span>{platData.goalFollowers.toLocaleString()} goal</span>
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
                          +{gain.toLocaleString()} gained · Goal by {formatDate(platData.goalDate)}
                        </p>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : client.id)}
                          className="flex items-center gap-1 text-[#555] hover:text-white text-xs transition-colors"
                        >
                          History
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Update form */}
                {isUpdating && (
                  <div className="px-6 pb-5 border-t border-[#1a1a1a] pt-4">
                    <p className="text-white text-sm font-medium mb-3">
                      Log today&apos;s count for{" "}
                      <span className="text-green-400">{currentActivePlat}</span>
                    </p>
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
                        onClick={() => logUpdate(client.id)}
                        disabled={!updateFollowers}
                        className="bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}

                {/* History for active platform */}
                {isExpanded && platData && (
                  <div className="border-t border-[#1a1a1a]">
                    {platData.entries.length === 0 ? (
                      <p className="text-[#444] text-sm px-6 py-4">
                        No entries yet for {platData.platform}. Hit Update to log your first count.
                      </p>
                    ) : (
                      <div className="divide-y divide-[#1a1a1a]">
                        {platData.entries.map((entry, i) => (
                          <div key={i} className="flex items-center gap-4 px-6 py-3">
                            <span className="text-[#555] text-xs w-24 flex-shrink-0">
                              {formatDate(entry.date)}
                            </span>
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
