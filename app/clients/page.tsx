"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ArrowRight,
  Edit2,
} from "lucide-react";
import Link from "next/link";

interface Video {
  id: number;
  title: string;
  type: "educational" | "comedic" | "brand_story" | "testimonial" | "trend";
  status: "idea" | "scripted" | "filmed" | "edited" | "posted";
  notes: string;
}

interface Client {
  id: number;
  name: string;
  niche: string;
  monthlyVideos: number;
  videos: Video[];
  createdAt: string;
}

const STATUS_COLORS: Record<Video["status"], string> = {
  idea: "bg-[#2a2a2a] text-[#888] border-[#333]",
  scripted: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  filmed: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  edited: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  posted: "bg-green-500/15 text-green-400 border-green-500/25",
};

const TYPE_COLORS: Record<Video["type"], string> = {
  educational: "text-blue-400",
  comedic: "text-yellow-400",
  brand_story: "text-purple-400",
  testimonial: "text-orange-400",
  trend: "text-pink-400",
};

const VIDEO_TYPES: Video["type"][] = ["educational", "comedic", "brand_story", "testimonial", "trend"];
const VIDEO_STATUSES: Video["status"][] = ["idea", "scripted", "filmed", "edited", "posted"];

const NICHES = [
  "Pets & Pet Products",
  "Perfume & Watches",
  "Cars & Automotive",
  "Recruitment & HR",
  "Food & Spices",
  "Fashion & Lifestyle",
  "Real Estate",
  "Fitness & Wellness",
  "Other",
];

const DEFAULT_VIDEO_PLAN = (count: number): Video[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Video ${i + 1}`,
    type: (["educational", "comedic", "brand_story", "testimonial", "trend"] as Video["type"][])[i % 5],
    status: "idea",
    notes: "",
  }));

function ClientCard({ client, onUpdate, onDelete }: {
  client: Client;
  onUpdate: (updated: Client) => void;
  onDelete: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<number | null>(null);

  const postedCount = client.videos.filter((v) => v.status === "posted").length;
  const progressPercent = Math.round((postedCount / client.monthlyVideos) * 100);

  const updateVideo = (videoId: number, updates: Partial<Video>) => {
    onUpdate({
      ...client,
      videos: client.videos.map((v) => (v.id === videoId ? { ...v, ...updates } : v)),
    });
  };

  const addVideo = () => {
    const newVideo: Video = {
      id: Date.now(),
      title: `Video ${client.videos.length + 1}`,
      type: "educational",
      status: "idea",
      notes: "",
    };
    onUpdate({ ...client, videos: [...client.videos, newVideo] });
  };

  const deleteVideo = (videoId: number) => {
    onUpdate({ ...client, videos: client.videos.filter((v) => v.id !== videoId) });
  };

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
      {/* Client header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-5 hover:bg-[#161616] transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-green-400 font-bold text-sm">{client.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <span className="text-white font-semibold">{client.name}</span>
            <span className="text-xs text-[#555] border border-[#2a2a2a] px-2 py-0.5 rounded-md">{client.niche}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 max-w-48 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-700 to-green-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[#666] text-xs">{postedCount}/{client.monthlyVideos} posted</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`text-sm font-bold ${progressPercent === 100 ? "text-green-400" : progressPercent > 50 ? "text-yellow-400" : "text-[#666]"}`}>
            {progressPercent}%
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-[#555]" /> : <ChevronDown className="w-4 h-4 text-[#555]" />}
        </div>
      </button>

      {/* Video list */}
      {expanded && (
        <div className="border-t border-[#1e1e1e] p-5 space-y-3">
          {/* Summary stats */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {VIDEO_STATUSES.map((status) => {
              const count = client.videos.filter((v) => v.status === status).length;
              return (
                <div key={status} className="text-center bg-[#1a1a1a] border border-[#252525] rounded-xl py-2">
                  <div className="text-white font-bold text-lg">{count}</div>
                  <div className="text-[#555] text-xs capitalize">{status}</div>
                </div>
              );
            })}
          </div>

          {/* Videos */}
          <div className="space-y-2">
            {client.videos.map((video) => (
              <div
                key={video.id}
                className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-3"
              >
                {editingVideoId === video.id ? (
                  <div className="space-y-2">
                    <input
                      value={video.title}
                      onChange={(e) => updateVideo(video.id, { title: e.target.value })}
                      className="w-full bg-[#222] border border-[#333] rounded-lg px-3 py-2 text-white text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={video.type}
                        onChange={(e) => updateVideo(video.id, { type: e.target.value as Video["type"] })}
                        className="bg-[#222] border border-[#333] rounded-lg px-3 py-2 text-white text-xs appearance-none"
                      >
                        {VIDEO_TYPES.map((t) => (
                          <option key={t} value={t}>{t.replace("_", " ")}</option>
                        ))}
                      </select>
                      <select
                        value={video.status}
                        onChange={(e) => updateVideo(video.id, { status: e.target.value as Video["status"] })}
                        className="bg-[#222] border border-[#333] rounded-lg px-3 py-2 text-white text-xs appearance-none"
                      >
                        {VIDEO_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <textarea
                      value={video.notes}
                      onChange={(e) => updateVideo(video.id, { notes: e.target.value })}
                      placeholder="Notes (hook idea, reference, etc.)"
                      className="w-full bg-[#222] border border-[#333] rounded-lg px-3 py-2 text-white text-xs placeholder-[#444] resize-none"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingVideoId(null)}
                        className="bg-green-500 hover:bg-green-400 text-black font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
                      >
                        Done
                      </button>
                      <button
                        onClick={() => deleteVideo(video.id)}
                        className="bg-red-900/20 hover:bg-red-900/30 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div
                      className="flex-shrink-0 cursor-pointer"
                      onClick={() => updateVideo(video.id, {
                        status: VIDEO_STATUSES[(VIDEO_STATUSES.indexOf(video.status) + 1) % VIDEO_STATUSES.length]
                      })}
                    >
                      {video.status === "posted" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#444]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-medium ${video.status === "posted" ? "text-[#666] line-through" : "text-white"}`}>
                          {video.title}
                        </span>
                        <span className={`text-xs capitalize ${TYPE_COLORS[video.type]}`}>
                          {video.type.replace("_", " ")}
                        </span>
                      </div>
                      {video.notes && (
                        <p className="text-[#555] text-xs mt-0.5 truncate">{video.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-md border capitalize ${STATUS_COLORS[video.status]}`}>
                        {video.status}
                      </span>
                      <button
                        onClick={() => setEditingVideoId(video.id)}
                        className="text-[#444] hover:text-white transition-colors p-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        href={`/generate?niche=${encodeURIComponent(client.niche)}&topic=${encodeURIComponent(video.title)}`}
                        className="text-green-400/50 hover:text-green-400 transition-colors p-1"
                        title="Generate script"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add video + actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={addVideo}
              className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-[#888] hover:text-white px-4 py-2 rounded-xl text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Video
            </button>
            <button
              onClick={() => onDelete(client.id)}
              className="flex items-center gap-2 bg-red-900/10 hover:bg-red-900/20 border border-red-500/15 text-red-400/70 hover:text-red-400 px-4 py-2 rounded-xl text-sm transition-colors ml-auto"
            >
              <Trash2 className="w-4 h-4" />
              Remove Client
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", niche: NICHES[0], monthlyVideos: 15 });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cactus-clients");
      if (saved) setClients(JSON.parse(saved));
      else {
        // Seed with Pets Delight as the first client
        const initial: Client[] = [{
          id: Date.now(),
          name: "Pets Delight",
          niche: "Pets & Pet Products",
          monthlyVideos: 15,
          videos: DEFAULT_VIDEO_PLAN(15),
          createdAt: new Date().toISOString(),
        }];
        setClients(initial);
        localStorage.setItem("cactus-clients", JSON.stringify(initial));
      }
    } catch {}
  }, []);

  const saveClients = (updated: Client[]) => {
    setClients(updated);
    localStorage.setItem("cactus-clients", JSON.stringify(updated));
  };

  const handleAddClient = () => {
    if (!newClient.name) return;
    const client: Client = {
      id: Date.now(),
      name: newClient.name,
      niche: newClient.niche,
      monthlyVideos: newClient.monthlyVideos,
      videos: DEFAULT_VIDEO_PLAN(newClient.monthlyVideos),
      createdAt: new Date().toISOString(),
    };
    saveClients([...clients, client]);
    setNewClient({ name: "", niche: NICHES[0], monthlyVideos: 15 });
    setShowAddForm(false);
  };

  const handleUpdateClient = (updated: Client) => {
    saveClients(clients.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteClient = (id: number) => {
    saveClients(clients.filter((c) => c.id !== id));
  };

  const totalVideos = clients.reduce((sum, c) => sum + c.monthlyVideos, 0);
  const totalPosted = clients.reduce((sum, c) => sum + c.videos.filter((v) => v.status === "posted").length, 0);

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-2">
            <Users className="w-4 h-4" />
            Client Plans
          </div>
          <h1 className="text-white text-2xl font-bold">Client Content Plans</h1>
          <p className="text-[#666] mt-1">
            Track 15 videos/month per client — from idea to posted.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Summary stats */}
      {clients.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5">
            <div className="text-white text-2xl font-bold mb-1">{clients.length}</div>
            <div className="text-[#666] text-sm">Active Clients</div>
            <div className="text-green-400 text-xs mt-1">AED {(clients.length * 5500).toLocaleString()}/mo revenue</div>
          </div>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5">
            <div className="text-white text-2xl font-bold mb-1">{totalPosted}/{totalVideos}</div>
            <div className="text-[#666] text-sm">Videos Posted This Month</div>
            <div className="text-[#555] text-xs mt-1">{totalVideos - totalPosted} remaining</div>
          </div>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5">
            <div className="text-white text-2xl font-bold mb-1">
              {totalVideos > 0 ? Math.round((totalPosted / totalVideos) * 100) : 0}%
            </div>
            <div className="text-[#666] text-sm">Monthly Completion</div>
            <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-green-700 to-green-400 rounded-full transition-all"
                style={{ width: `${totalVideos > 0 ? (totalPosted / totalVideos) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add client form */}
      {showAddForm && (
        <div className="bg-[#111] border border-green-500/20 rounded-2xl p-6 fade-in">
          <h3 className="text-white font-semibold mb-4">Add New Client</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-[#888] text-xs font-medium mb-2 uppercase tracking-wide">Client Name</label>
              <input
                value={newClient.name}
                onChange={(e) => setNewClient((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Perfume Palace Dubai"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#444] focus:border-green-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#888] text-xs font-medium mb-2 uppercase tracking-wide">Niche</label>
              <select
                value={newClient.niche}
                onChange={(e) => setNewClient((p) => ({ ...p, niche: e.target.value }))}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm appearance-none cursor-pointer"
              >
                {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[#888] text-xs font-medium mb-2 uppercase tracking-wide">Videos/Month</label>
              <select
                value={newClient.monthlyVideos}
                onChange={(e) => setNewClient((p) => ({ ...p, monthlyVideos: Number(e.target.value) }))}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm appearance-none cursor-pointer"
              >
                {[5, 10, 15, 20, 30].map((n) => <option key={n} value={n}>{n} videos/month</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAddClient}
              className="bg-green-500 hover:bg-green-400 text-black font-semibold px-5 py-2 rounded-xl text-sm transition-colors"
            >
              Create Client Plan
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-white font-medium px-5 py-2 rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Client list */}
      {clients.length === 0 && !showAddForm ? (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-16 text-center">
          <Users className="w-10 h-10 text-[#333] mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">No clients yet</p>
          <p className="text-[#666] text-sm mb-5">Add your first client to start tracking their monthly content plan.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-500 hover:bg-green-400 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Add Your First Client
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onUpdate={handleUpdateClient}
              onDelete={handleDeleteClient}
            />
          ))}
        </div>
      )}
    </div>
  );
}
