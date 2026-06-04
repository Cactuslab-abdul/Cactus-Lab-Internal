"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { TrendingUp, Users, Eye, Activity, Star, Loader2, ExternalLink, Download } from "lucide-react";
import type { Metric, PlatformStats } from "@/lib/portal/types";
import { useRefreshOnFocus } from "@/lib/portal/useRefresh";

type Platform = "all" | "instagram" | "facebook" | "tiktok" | "linkedin";

const PLATFORM_TABS: { key: Platform; label: string }[] = [
  { key: "all",       label: "All Platforms" },
  { key: "instagram", label: "Instagram" },
  { key: "facebook",  label: "Facebook" },
  { key: "tiktok",    label: "TikTok" },
  { key: "linkedin",  label: "LinkedIn" },
];

function fmtMonth(ym: string) {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-AE", { month: "long", year: "numeric" });
}

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;
}

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5">
      <div className="flex items-center gap-2 text-[#555] text-xs uppercase tracking-wide font-medium mb-3">
        {icon}{label}
      </div>
      <p className={`text-2xl font-bold ${color ?? "text-white"}`}>{value}</p>
      {sub && <p className="text-[#555] text-sm mt-1">{sub}</p>}
    </div>
  );
}

function getStats(m: Metric, platform: Platform): PlatformStats | null {
  if (platform === "all") {
    return {
      followers: m.followers,
      followers_change: m.followers_change,
      views: m.views,
      reach: m.reach,
      engagement_rate: Number(m.engagement_rate),
    };
  }
  return m.platform_data?.[platform] ?? null;
}

export default function AnalyticsPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : Array.isArray(params.slug) ? params.slug[0] : "";
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState<Platform>("all");

  const load = useCallback(async () => {
    if (!slug) return;
    const r = await fetch(`/api/portal/v2/metrics?slug=${slug}`);
    setMetrics(r.ok ? await r.json() : []);
    setLoading(false);
  }, [slug]);

  useEffect(() => { void load(); }, [load]);
  useRefreshOnFocus(load);

  const downloadCSV = () => {
    const rows: string[][] = [
      ["Month", "Platform", "Followers", "Follower Change", "Views", "Reach", "Engagement Rate (%)"],
    ];
    for (const m of metrics) {
      if (m.platform_data) {
        const platforms: [string, PlatformStats | undefined][] = [
          ["Instagram", m.platform_data.instagram],
          ["Facebook",  m.platform_data.facebook],
          ["TikTok",    m.platform_data.tiktok],
          ["LinkedIn",  m.platform_data.linkedin],
        ];
        for (const [name, stats] of platforms) {
          if (stats) {
            rows.push([fmtMonth(m.month), name,
              String(stats.followers), String(stats.followers_change),
              String(stats.views), String(stats.reach), String(stats.engagement_rate)]);
          }
        }
        rows.push([fmtMonth(m.month), "TOTAL (all platforms)",
          String(m.followers), String(m.followers_change),
          String(m.views), String(m.reach), String(m.engagement_rate)]);
      } else {
        rows.push([fmtMonth(m.month), "All Platforms",
          String(m.followers), String(m.followers_change),
          String(m.views), String(m.reach), String(m.engagement_rate)]);
      }
    }
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${slug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-[#333] animate-spin" /></div>;

  if (metrics.length === 0) {
    return (
      <div className="space-y-5 fade-in">
        <div>
          <h1 className="text-white text-2xl font-bold">Analytics</h1>
          <p className="text-[#555] text-sm mt-1">Your performance data will appear here.</p>
        </div>
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-16 text-center">
          <TrendingUp className="w-10 h-10 text-[#2a2a2a] mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">Analytics coming soon</p>
          <p className="text-[#555] text-sm">We&apos;ll start logging your monthly performance data here once your first month wraps up.</p>
        </div>
      </div>
    );
  }

  const latest = metrics[0];
  const latestStats = getStats(latest, platform);

  // Filter platform tabs — only show platforms that have data
  const availableTabs = PLATFORM_TABS.filter(tab => {
    if (tab.key === "all") return true;
    return metrics.some(m => m.platform_data?.[tab.key as Exclude<Platform, "all">]);
  });

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-white text-2xl font-bold">Analytics</h1>
          <p className="text-[#555] text-sm mt-1">Your monthly performance overview.</p>
        </div>
        <button onClick={downloadCSV}
          className="flex items-center gap-2 border border-[#2a2a2a] hover:border-[#444] text-[#666] hover:text-white text-xs px-3 py-2 rounded-lg transition-all flex-shrink-0">
          <Download className="w-3.5 h-3.5" />Export CSV
        </button>
      </div>

      {/* Platform tabs */}
      {availableTabs.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {availableTabs.map(tab => (
            <button key={tab.key} onClick={() => setPlatform(tab.key)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                platform === tab.key
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-[#111] border-[#1e1e1e] text-[#666] hover:text-white"
              }`}>{tab.label}</button>
          ))}
        </div>
      )}

      {/* Latest month */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-semibold">
            Latest — {fmtMonth(latest.month)}
            {platform !== "all" && <span className="ml-2 text-[#555] font-normal text-sm">· {PLATFORM_TABS.find(t => t.key === platform)?.label}</span>}
          </p>
        </div>

        {latestStats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              icon={<Users className="w-3.5 h-3.5" />}
              label="Followers"
              value={latestStats.followers.toLocaleString()}
              sub={latestStats.followers_change > 0 ? `+${latestStats.followers_change} this month` : latestStats.followers_change < 0 ? `${latestStats.followers_change} this month` : "No change"}
              color={latestStats.followers_change > 0 ? "text-green-400" : "text-white"}
            />
            <StatCard
              icon={<Eye className="w-3.5 h-3.5" />}
              label="Total Views"
              value={fmt(latestStats.views)}
            />
            <StatCard
              icon={<Activity className="w-3.5 h-3.5" />}
              label="Engagement"
              value={`${latestStats.engagement_rate}%`}
              sub={latestStats.engagement_rate >= 3 ? "Strong" : "Building"}
              color={latestStats.engagement_rate >= 3 ? "text-green-400" : "text-white"}
            />
            <StatCard
              icon={<TrendingUp className="w-3.5 h-3.5" />}
              label="Reach"
              value={fmt(latestStats.reach)}
              sub="Unique accounts"
            />
          </div>
        ) : (
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-8 text-center">
            <p className="text-[#555] text-sm">No {PLATFORM_TABS.find(t => t.key === platform)?.label} data for this month yet.</p>
          </div>
        )}

        {latest.notes && (
          <div className="mt-3 bg-[#111] border border-[#1e1e1e] rounded-xl px-4 py-3">
            <p className="text-[#777] text-sm italic">&quot;{latest.notes}&quot;</p>
          </div>
        )}

        {latest.top_post_url && (
          <a href={latest.top_post_url} target="_blank" rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 bg-[#111] border border-[#1e1e1e] hover:border-[#2a2a2a] rounded-xl px-4 py-3 text-[#888] hover:text-white text-sm transition-colors">
            <Star className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            View top performing post this month
            <ExternalLink className="w-3.5 h-3.5 ml-auto" />
          </a>
        )}
      </div>

      {/* Per-platform breakdown for latest month */}
      {platform === "all" && latest.platform_data && (
        <div>
          <p className="text-[#555] text-xs uppercase tracking-wide font-medium mb-3">Platform Breakdown — {fmtMonth(latest.month)}</p>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="text-left text-[#555] text-xs font-medium px-4 py-3">Platform</th>
                  <th className="text-right text-[#555] text-xs font-medium px-4 py-3">Followers</th>
                  <th className="text-right text-[#555] text-xs font-medium px-4 py-3 hidden sm:table-cell">Views</th>
                  <th className="text-right text-[#555] text-xs font-medium px-4 py-3 hidden sm:table-cell">Reach</th>
                  <th className="text-right text-[#555] text-xs font-medium px-4 py-3">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {([
                  ["Instagram", latest.platform_data.instagram],
                  ["Facebook",  latest.platform_data.facebook],
                  ["TikTok",    latest.platform_data.tiktok],
                  ["LinkedIn",  latest.platform_data.linkedin],
                ] as [string, PlatformStats | undefined][])
                  .filter(([, s]) => s && (s.followers > 0 || s.views > 0))
                  .map(([name, s], i, arr) => (
                    <tr key={name} className={i < arr.length - 1 ? "border-b border-[#141414]" : ""}>
                      <td className="px-4 py-3 text-white font-medium">{name}</td>
                      <td className="px-4 py-3 text-right text-[#aaa]">
                        {s!.followers.toLocaleString()}
                        {s!.followers_change !== 0 && (
                          <span className={`ml-1 text-xs ${s!.followers_change > 0 ? "text-green-400" : "text-red-400"}`}>
                            {s!.followers_change > 0 ? "+" : ""}{s!.followers_change}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-[#aaa] hidden sm:table-cell">{fmt(s!.views)}</td>
                      <td className="px-4 py-3 text-right text-[#aaa] hidden sm:table-cell">{fmt(s!.reach)}</td>
                      <td className={`px-4 py-3 text-right font-medium ${s!.engagement_rate >= 3 ? "text-green-400" : "text-[#888]"}`}>
                        {s!.engagement_rate}%
                      </td>
                    </tr>
                  ))}
                {/* Totals row */}
                <tr className="border-t border-[#2a2a2a] bg-[#141414]">
                  <td className="px-4 py-3 text-[#555] text-xs font-semibold uppercase tracking-wide">Total</td>
                  <td className="px-4 py-3 text-right text-white font-semibold">{latest.followers.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-white font-semibold hidden sm:table-cell">{fmt(latest.views)}</td>
                  <td className="px-4 py-3 text-right text-white font-semibold hidden sm:table-cell">{fmt(latest.reach)}</td>
                  <td className="px-4 py-3 text-right text-white font-semibold">{latest.engagement_rate}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History table */}
      {metrics.length > 1 && (
        <div>
          <p className="text-[#555] text-xs uppercase tracking-wide font-medium mb-3">Monthly History</p>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="text-left text-[#555] text-xs font-medium px-4 py-3">Month</th>
                  <th className="text-right text-[#555] text-xs font-medium px-4 py-3">Followers</th>
                  <th className="text-right text-[#555] text-xs font-medium px-4 py-3 hidden sm:table-cell">Views</th>
                  <th className="text-right text-[#555] text-xs font-medium px-4 py-3">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m, i) => {
                  const s = getStats(m, platform);
                  if (!s) return null;
                  return (
                    <tr key={m.id} className={i < metrics.length - 1 ? "border-b border-[#141414]" : ""}>
                      <td className="px-4 py-3 text-[#888]">{fmtMonth(m.month)}</td>
                      <td className="px-4 py-3 text-right text-white font-medium">
                        {s.followers.toLocaleString()}
                        {s.followers_change !== 0 && (
                          <span className={`ml-1.5 text-xs ${s.followers_change > 0 ? "text-green-400" : "text-red-400"}`}>
                            {s.followers_change > 0 ? "+" : ""}{s.followers_change}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-[#888] hidden sm:table-cell">{fmt(s.views)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-medium ${s.engagement_rate >= 3 ? "text-green-400" : "text-[#888]"}`}>
                          {s.engagement_rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
