"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  niche?: string;
  videosPosted?: number;
  monthlyRetainer?: number;
}

interface Lead {
  id: string;
  name: string;
  stage: string;
  followUpDate?: string;
}

interface Stats {
  contentGenerated?: number;
  trendsAnalyzed?: number;
  linksAnalyzed?: number;
}

const quickActions = [
  {
    href: "/outreach",
    label: "AI Outreach",
    description: "Research a business + generate personalised email",
    icon: Mail,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
  {
    href: "/generate",
    label: "Content Generator",
    description: "Create scripts, captions, hashtags in one click",
    icon: Wand2,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
  },
  {
    href: "/clients",
    label: "Clients",
    description: "Track client content plans and video pipeline",
    icon: Users,
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/20",
  },
  {
    href: "/pipeline",
    label: "Pipeline",
    description: "Manage leads from prospect to closed",
    icon: GitBranch,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    href: "/invoices",
    label: "Invoices",
    description: "Create and print professional invoices",
    icon: Receipt,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
  },
  {
    href: "/growth",
    label: "Growth Tracker",
    description: "Track follower growth and KPIs per client",
    icon: TrendingUp,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
  },
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

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cactus-clients");
      if (raw) setClients(JSON.parse(raw));
    } catch {}
    try {
      const raw = localStorage.getItem("cactus-leads");
      if (raw) setLeads(JSON.parse(raw));
    } catch {}
    try {
      const raw = localStorage.getItem("cactus-stats");
      if (raw) setStats(JSON.parse(raw));
    } catch {}
  }, []);

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const greetingHour = now.getHours();
  const greeting =
    greetingHour < 12 ? "Good morning" : greetingHour < 18 ? "Good afternoon" : "Good evening";
  const todayLabel = now.toLocaleDateString("en-AE", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const activeLeads = leads.filter(
    (l) => l.stage !== "Closed" && l.stage !== "Lost"
  );

  const followUpsDue = leads.filter((l) => {
    if (l.stage === "Closed" || l.stage === "Lost") return false;
    if (!l.followUpDate) return false;
    return l.followUpDate <= todayStr;
  });

  const monthlyRevenue = clients.reduce(
    (sum, c) => sum + (c.monthlyRetainer ?? 5500),
    0
  );

  // Leads sorted by soonest follow-up, non-Closed/Lost only
  const upcomingFollowUps = [...activeLeads]
    .filter((l) => l.followUpDate)
    .sort((a, b) => (a.followUpDate! < b.followUpDate! ? -1 : 1))
    .slice(0, 3);

  function followUpColor(date: string) {
    if (date < todayStr) return "text-red-400";
    if (date === todayStr) return "text-yellow-400";
    return "text-[#888]";
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-AE", { month: "short", day: "numeric" });
  }

  const topStats = [
    {
      label: "Active Clients",
      value: clients.length,
      sub: clients.length > 0 ? `AED ${monthlyRevenue.toLocaleString()}/mo` : "No clients yet",
      subColor: "text-green-400",
    },
    {
      label: "Leads in Pipeline",
      value: activeLeads.length,
      sub: activeLeads.length === 1 ? "1 active lead" : `${activeLeads.length} active leads`,
      subColor: "text-blue-400",
    },
    {
      label: "Content Generated",
      value: stats.contentGenerated ?? 0,
      sub: "Total AI packs",
      subColor: "text-purple-400",
    },
    {
      label: "Follow-ups Due",
      value: followUpsDue.length,
      sub: followUpsDue.length > 0 ? "Action needed" : "All clear",
      subColor: followUpsDue.length > 0 ? "text-red-400" : "text-green-400",
    },
  ];

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">{greeting}, Awab</h1>
        <p className="text-[#666] mt-1">{todayLabel}</p>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {topStats.map((s) => (
          <div
            key={s.label}
            className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5"
          >
            <p className="text-[#666] text-xs font-medium mb-2">{s.label}</p>
            <p className="text-white text-3xl font-bold leading-none mb-1.5">
              {s.value}
            </p>
            <p className={`text-xs font-medium ${s.subColor}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Bottom 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions — 1/3 */}
        <div className="lg:col-span-1 bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-1">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#1a1a1a] transition-colors group"
                >
                  <div className={`${action.bgColor} border ${action.borderColor} rounded-lg p-1.5 flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${action.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium leading-tight group-hover:text-white">
                      {action.label}
                    </p>
                    <p className="text-[#555] text-xs mt-0.5 truncate">{action.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity — 2/3 */}
        <div className="lg:col-span-2 space-y-4">
          {/* Clients */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Clients</h3>
              <Link href="/clients" className="text-[#555] text-xs hover:text-white transition-colors">
                View all
              </Link>
            </div>
            {clients.length === 0 ? (
              <div className="flex items-center gap-2 text-[#444] text-sm py-4">
                <Users className="w-4 h-4" />
                <span>No clients yet — add one in Clients</span>
              </div>
            ) : (
              <div className="space-y-3">
                {clients.map((client) => {
                  const posted = client.videosPosted ?? 0;
                  const pct = Math.min(100, Math.round((posted / 15) * 100));
                  return (
                    <div key={client.id} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white text-sm font-medium truncate">{client.name}</span>
                          {client.niche && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${getNicheColor(client.niche)}`}>
                              {client.niche}
                            </span>
                          )}
                          <span className="text-[#555] text-xs ml-auto flex-shrink-0">
                            {posted}/15 videos
                          </span>
                        </div>
                        <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Follow-ups */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Follow-ups</h3>
              <Link href="/pipeline" className="text-[#555] text-xs hover:text-white transition-colors">
                View pipeline
              </Link>
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
                    <div
                      key={lead.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a]"
                    >
                      {isOverdue ? (
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      ) : isToday ? (
                        <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-[#444] flex-shrink-0" />
                      )}
                      <span className="text-white text-sm font-medium flex-1 truncate">{lead.name}</span>
                      <span className="text-[#555] text-xs px-2 py-0.5 rounded-full bg-[#1a1a1a] flex-shrink-0">
                        {lead.stage}
                      </span>
                      <span className={`text-xs font-medium flex-shrink-0 ${dateColor}`}>
                        {formatDate(lead.followUpDate!)}
                      </span>
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
