"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Mail,
  Wand2,
  Users,
  GitBranch,
  Receipt,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Pencil,
  X,
  Camera,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Client {
  id: string;
  name: string;
  logoUrl?: string;
  niche?: string;
  retainerAED?: number;
  discountedRate?: number;
  fullRateDate?: string;
  // legacy fields (old format)
  monthlyRetainer?: number;
}

function clientEffectiveRate(c: Client): number {
  if (
    c.discountedRate && c.discountedRate > 0 &&
    c.fullRateDate &&
    new Date() < new Date(c.fullRateDate + "T00:00:00")
  ) return c.discountedRate;
  return c.retainerAED ?? c.monthlyRetainer ?? 5500;
}

interface Lead {
  id: string;
  name: string;
  stage: string;
  followUpDate?: string;
}

interface Stats {
  contentGenerated?: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  email: string;
}

const DEFAULT_TEAM: TeamMember[] = [
  { id: "1", name: "Awab Sirelkhatim", role: "CEO", avatarUrl: "", email: "awab.sirelkhatim@gmail.com" },
  { id: "2", name: "Abdulrahman Abuzaid", role: "Operations Manager", avatarUrl: "", email: "abdul.ahmed.eg@gmail.com" },
];

const quickActions = [
  { href: "/outreach", label: "AI Outreach", description: "Research a business + generate personalised email", icon: Mail, color: "text-purple-400", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/20" },
  { href: "/generate", label: "Content Generator", description: "Create scripts, captions, hashtags in one click", icon: Wand2, color: "text-green-400", bgColor: "bg-green-500/10", borderColor: "border-green-500/20" },
  { href: "/clients", label: "Clients", description: "Track client content plans and video pipeline", icon: Users, color: "text-teal-400", bgColor: "bg-teal-500/10", borderColor: "border-teal-500/20" },
  { href: "/pipeline", label: "Pipeline", description: "Manage leads from prospect to closed", icon: GitBranch, color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20" },
  { href: "/invoices", label: "Invoices", description: "Create and print professional invoices", icon: Receipt, color: "text-yellow-400", bgColor: "bg-yellow-500/10", borderColor: "border-yellow-500/20" },
  { href: "/growth", label: "Growth Tracker", description: "Track follower growth and KPIs per client", icon: TrendingUp, color: "text-orange-400", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/20" },
];

function getNicheColor(niche?: string) {
  const n = (niche || "").toLowerCase();
  if (n.includes("pet")) return "bg-teal-500/15 text-teal-400";
  if (n.includes("food") || n.includes("spice")) return "bg-orange-500/15 text-orange-400";
  if (n.includes("perfume") || n.includes("watch")) return "bg-purple-500/15 text-purple-400";
  if (n.includes("car")) return "bg-blue-500/15 text-blue-400";
  if (n.includes("recruit")) return "bg-yellow-500/15 text-yellow-400";
  return "bg-[#222] text-[#888]";
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Team Member Card ────────────────────────────────────────────────────────
function TeamCard({
  member,
  onUpdate,
  onDelete,
  isOnline,
}: {
  member: TeamMember;
  onUpdate: (m: TeamMember) => void;
  onDelete: (id: string) => void;
  isOnline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: member.name, role: member.role, avatarUrl: member.avatarUrl, email: member.email });
  const urlInputRef = useRef<HTMLInputElement>(null);

  const save = () => {
    onUpdate({ ...member, ...form });
    setEditing(false);
  };

  const cancel = () => {
    setForm({ name: member.name, role: member.role, avatarUrl: member.avatarUrl, email: member.email });
    setEditing(false);
  };

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5 flex flex-col items-center gap-3 relative group min-w-[140px]">
      {/* Edit / delete buttons */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setEditing(true)} className="p-1 rounded-lg hover:bg-[#222] text-[#555] hover:text-white transition-colors">
          <Pencil className="w-3 h-3" />
        </button>
        <button onClick={() => onDelete(member.id)} className="p-1 rounded-lg hover:bg-red-900/20 text-[#555] hover:text-red-400 transition-colors">
          <X className="w-3 h-3" />
        </button>
      </div>

      {editing ? (
        <div className="w-full space-y-2">
          {/* Avatar URL input */}
          <div className="relative mx-auto w-fit">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a] mx-auto">
              {form.avatarUrl
                ? <img src={form.avatarUrl} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[#666]">{initials(form.name || "?")}</div>
              }
            </div>
            <button
              onClick={() => urlInputRef.current?.focus()}
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
            >
              <Camera className="w-2.5 h-2.5 text-black" />
            </button>
          </div>
          <input
            ref={urlInputRef}
            value={form.avatarUrl}
            onChange={e => setForm(f => ({ ...f, avatarUrl: e.target.value }))}
            placeholder="Photo URL (paste link)"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-2 py-1.5 text-xs text-white placeholder-[#444] focus:outline-none focus:border-green-500/50"
          />
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Full name"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-2 py-1.5 text-xs text-white placeholder-[#444] focus:outline-none focus:border-green-500/50"
          />
          <input
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            placeholder="Role"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-2 py-1.5 text-xs text-white placeholder-[#444] focus:outline-none focus:border-green-500/50"
          />
          <input
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="Email (for online indicator)"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-2 py-1.5 text-xs text-white placeholder-[#444] focus:outline-none focus:border-green-500/50"
          />
          <div className="flex gap-1.5">
            <button onClick={save} className="flex-1 bg-green-500 hover:bg-green-400 text-black text-xs font-semibold py-1.5 rounded-lg transition-colors">Save</button>
            <button onClick={cancel} className="flex-1 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-[#888] text-xs py-1.5 rounded-lg transition-colors">Cancel</button>
          </div>
        </div>
      ) : (
        <>
          {/* Avatar with online indicator */}
          <div className="relative">
            <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[#2a2a2a]">
              {member.avatarUrl
                ? <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                : (
                  <div className="w-full h-full bg-gradient-to-br from-green-500/30 to-green-700/20 flex items-center justify-center text-base font-bold text-green-300">
                    {initials(member.name)}
                  </div>
                )
              }
            </div>
            {isOnline && (
              <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-[#111] shadow-lg" />
            )}
          </div>
          <div className="text-center">
            <p className="text-white text-sm font-semibold leading-tight">{member.name}</p>
            <p className="text-[#555] text-xs mt-0.5">{member.role}</p>
            {isOnline && <p className="text-green-400 text-[10px] mt-0.5 font-medium">● Online</p>}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats>({});
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [addingMember, setAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", role: "", avatarUrl: "", email: "" });
  const [currentUserName, setCurrentUserName] = useState("there");
  const [onlineEmails, setOnlineEmails] = useState<Set<string>>(new Set());

  useEffect(() => {
    try { const r = localStorage.getItem("cactus-clients"); if (r) setClients(JSON.parse(r)); } catch {}
    try { const r = localStorage.getItem("cactus-leads"); if (r) setLeads(JSON.parse(r)); } catch {}
    try { const r = localStorage.getItem("cactus-stats"); if (r) setStats(JSON.parse(r)); } catch {}
    try {
      const r = localStorage.getItem("cactus-team");
      if (r) {
        const parsed = JSON.parse(r);
        // Migrate: add email field if missing
        const migrated = parsed.map((m: TeamMember, i: number) => ({
          ...m,
          email: m.email || DEFAULT_TEAM[i]?.email || "",
        }));
        setTeam(migrated);
      } else {
        setTeam(DEFAULT_TEAM);
        localStorage.setItem("cactus-team", JSON.stringify(DEFAULT_TEAM));
      }
    } catch {}

    // Load current user name + set up Realtime presence
    const supabase = createClient();
    let presenceChannel: ReturnType<typeof supabase.channel> | null = null;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const meta = user.user_metadata || {};
      const name = meta.full_name || meta.name || user.email?.split("@")[0] || "there";
      setCurrentUserName(name.split(" ")[0]);

      presenceChannel = supabase.channel("os-presence");
      presenceChannel
        .on("presence", { event: "sync" }, () => {
          if (!presenceChannel) return;
          const state = presenceChannel.presenceState<{ email: string }>();
          const emails = new Set<string>();
          Object.values(state).forEach((presences) => {
            presences.forEach((p) => { if (p.email) emails.add(p.email); });
          });
          setOnlineEmails(emails);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await presenceChannel?.track({ email: user.email });
          }
        });
    });

    return () => {
      if (presenceChannel) {
        supabase.removeChannel(presenceChannel);
      }
    };
  }, []);

  const saveTeam = (updated: TeamMember[]) => {
    setTeam(updated);
    localStorage.setItem("cactus-team", JSON.stringify(updated));
  };

  const handleAddMember = () => {
    if (!newMember.name.trim()) return;
    const member: TeamMember = { id: Date.now().toString(), ...newMember };
    saveTeam([...team, member]);
    setNewMember({ name: "", role: "", avatarUrl: "", email: "" });
    setAddingMember(false);
  };

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const greetingHour = now.getHours();
  const greeting = greetingHour < 12 ? "Good morning" : greetingHour < 18 ? "Good afternoon" : "Good evening";
  const todayLabel = now.toLocaleDateString("en-AE", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const activeLeads = leads.filter(l => l.stage !== "Closed" && l.stage !== "Lost");
  const followUpsDue = leads.filter(l => l.stage !== "Closed" && l.stage !== "Lost" && l.followUpDate && l.followUpDate <= todayStr);
  const monthlyRevenue = clients.reduce((sum, c) => sum + clientEffectiveRate(c), 0);
  const upcomingFollowUps = [...activeLeads].filter(l => l.followUpDate).sort((a, b) => a.followUpDate! < b.followUpDate! ? -1 : 1).slice(0, 3);

  function followUpColor(date: string) {
    if (date < todayStr) return "text-red-400";
    if (date === todayStr) return "text-yellow-400";
    return "text-[#888]";
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-AE", { month: "short", day: "numeric" });
  }

  const topStats = [
    { label: "Active Clients", value: clients.length, sub: clients.length > 0 ? `AED ${monthlyRevenue.toLocaleString()}/mo` : "No clients yet", subColor: "text-green-400" },
    { label: "Leads in Pipeline", value: activeLeads.length, sub: `${activeLeads.length} active leads`, subColor: "text-blue-400" },
    { label: "Content Generated", value: stats.contentGenerated ?? 0, sub: "Total AI packs", subColor: "text-purple-400" },
    { label: "Follow-ups Due", value: followUpsDue.length, sub: followUpsDue.length > 0 ? "Action needed" : "All clear", subColor: followUpsDue.length > 0 ? "text-red-400" : "text-green-400" },
  ];

  return (
    <div className="space-y-8 fade-in">

      {/* ── Header with team strip ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-white text-2xl font-bold">{greeting}, {currentUserName}</h1>
          <p className="text-[#666] mt-1">{todayLabel}</p>
        </div>

        {/* Team strip — right of header */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {team.map((member) => {
            const online = !!(member.email && onlineEmails.has(member.email));
            return (
              <div key={member.id} className="relative group/avatar">
                <div className={`w-9 h-9 rounded-full overflow-hidden ring-2 transition-all cursor-default ${online ? "ring-green-400" : "ring-[#1e1e1e] hover:ring-green-500/40"}`}>
                  {member.avatarUrl
                    ? <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-green-500/30 to-green-700/20 flex items-center justify-center text-xs font-bold text-green-300">{initials(member.name)}</div>
                  }
                </div>
                {online && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#0f0f0f]" />}
                {/* Tooltip */}
                <div className="absolute top-full right-0 mt-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2 text-left whitespace-nowrap opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                  <p className="text-white text-xs font-semibold">{member.name}</p>
                  <p className="text-[#555] text-[11px]">{member.role}</p>
                  {online && <p className="text-green-400 text-[10px] mt-0.5">● Online now</p>}
                </div>
              </div>
            );
          })}
          <button
            onClick={() => setAddingMember(true)}
            className="w-9 h-9 rounded-full border border-dashed border-[#2a2a2a] hover:border-green-500/40 flex items-center justify-center text-[#444] hover:text-green-400 transition-all"
            title="Add team member"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Add member modal ───────────────────────────────────────────── */}
      {addingMember && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setAddingMember(false)}>
          <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-6 w-80 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-white font-semibold">Add Team Member</h3>
              <button onClick={() => setAddingMember(false)} className="text-[#555] hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            {/* Avatar preview */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-[#2a2a2a]">
                {newMember.avatarUrl
                  ? <img src={newMember.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center text-xl font-bold text-[#444]">{newMember.name ? initials(newMember.name) : "?"}</div>
                }
              </div>
            </div>
            <input
              value={newMember.avatarUrl}
              onChange={e => setNewMember(p => ({ ...p, avatarUrl: e.target.value }))}
              placeholder="Photo URL (paste image link)"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-green-500/50"
            />
            <input
              value={newMember.name}
              onChange={e => setNewMember(p => ({ ...p, name: e.target.value }))}
              placeholder="Full name"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-green-500/50"
              autoFocus
            />
            <input
              value={newMember.role}
              onChange={e => setNewMember(p => ({ ...p, role: e.target.value }))}
              placeholder="Role (e.g. Video Editor)"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-green-500/50"
            />
            <input
              value={newMember.email}
              onChange={e => setNewMember(p => ({ ...p, email: e.target.value }))}
              placeholder="Email (for online indicator)"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-green-500/50"
              onKeyDown={e => e.key === "Enter" && handleAddMember()}
            />
            <button
              onClick={handleAddMember}
              disabled={!newMember.name.trim()}
              className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              Add to Team
            </button>
          </div>
        </div>
      )}

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {topStats.map((s) => (
          <div key={s.label} className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5">
            <p className="text-[#666] text-xs font-medium mb-2">{s.label}</p>
            <p className="text-white text-3xl font-bold leading-none mb-1.5">{s.value}</p>
            <p className={`text-xs font-medium ${s.subColor}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Team cards ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Team</h3>
          <button onClick={() => setAddingMember(true)} className="flex items-center gap-1.5 text-xs text-[#555] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-3 py-1.5 rounded-lg transition-all">
            <Plus className="w-3 h-3" />
            Add member
          </button>
        </div>
        <div className="flex flex-wrap gap-4">
          {team.map(member => (
            <TeamCard
              key={member.id}
              member={member}
              isOnline={!!(member.email && onlineEmails.has(member.email))}
              onUpdate={updated => saveTeam(team.map(m => m.id === updated.id ? updated : m))}
              onDelete={id => saveTeam(team.filter(m => m.id !== id))}
            />
          ))}
        </div>
      </div>

      {/* ── Bottom grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-1">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#1a1a1a] transition-colors group">
                  <div className={`${action.bgColor} border ${action.borderColor} rounded-lg p-1.5 flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${action.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium leading-tight">{action.label}</p>
                    <p className="text-[#555] text-xs mt-0.5 truncate">{action.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          {/* Clients */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Clients</h3>
              <Link href="/clients" className="text-[#555] text-xs hover:text-white transition-colors">View all</Link>
            </div>
            {clients.length === 0 ? (
              <div className="flex items-center gap-2 text-[#444] text-sm py-4">
                <Users className="w-4 h-4" />
                <span>No clients yet — add one in Clients</span>
              </div>
            ) : (
              <div className="space-y-3">
                {clients.map((client) => (
                  <div key={client.id} className="flex items-center gap-3">
                    {client.logoUrl ? (
                      <img src={client.logoUrl} alt={client.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium truncate">{client.name}</span>
                        {client.niche && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${getNicheColor(client.niche)}`}>{client.niche}</span>
                        )}
                        <span className="text-green-400 text-xs ml-auto flex-shrink-0 font-medium">
                          AED {clientEffectiveRate(client).toLocaleString()}/mo
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Follow-ups */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Follow-ups</h3>
              <Link href="/pipeline" className="text-[#555] text-xs hover:text-white transition-colors">View pipeline</Link>
            </div>
            {upcomingFollowUps.length === 0 ? (
              <div className="flex items-center gap-2 text-[#444] text-sm py-4">
                <CheckCircle2 className="w-4 h-4" />
                <span>No upcoming follow-ups</span>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingFollowUps.map((lead) => {
                  const dateColor = followUpColor(lead.followUpDate!);
                  const isOverdue = lead.followUpDate! < todayStr;
                  const isToday = lead.followUpDate === todayStr;
                  return (
                    <div key={lead.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]">
                      {isOverdue ? <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        : isToday ? <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                        : <CheckCircle2 className="w-4 h-4 text-[#444] flex-shrink-0" />}
                      <span className="text-white text-sm font-medium flex-1 truncate">{lead.name}</span>
                      <span className="text-[#555] text-xs px-2 py-0.5 rounded-full bg-[#1a1a1a] flex-shrink-0">{lead.stage}</span>
                      <span className={`text-xs font-medium flex-shrink-0 ${dateColor}`}>{formatDate(lead.followUpDate!)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
