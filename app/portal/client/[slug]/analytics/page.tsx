"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { TrendingUp, Users, Eye, Activity, Star, Loader2, ExternalLink } from "lucide-react";
import type { Metric } from "@/lib/portal/types";
import { useRefreshOnFocus } from "@/lib/portal/useRefresh";

function fmtMonth(ym: string) {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-AE", { month: "long", year: "numeric" });
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

export default function AnalyticsPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : Array.isArray(params.slug) ? params.slug[0] : "";
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!slug) return;
    const r = await fetch(`/api/portal/v2/metrics?slug=${slug}`);
    setMetrics(r.ok ? await r.json() : []);
    setLoading(false);
  }, [slug]);

  useEffect(() => { void load(); }, [load]);
  useRefreshOnFocus(load);

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

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-white text-2xl font-bold">Analytics</h1>
        <p className="text-[#555] text-sm mt-1">Your monthly performance overview.</p>
      </div>

      {/* Latest month highlight */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-semibold">Latest — {fmtMonth(latest.month)}</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={<Users className="w-3.5 h-3.5" />}
            label="Followers"
            value={latest.followers.toLocaleString()}
            sub={latest.followers_change > 0 ? `+${latest.followers_change} this month` : latest.followers_change < 0 ? `${latest.followers_change} this month` : "No change"}
            color={latest.followers_change > 0 ? "text-green-400" : "text-white"}
          />
          <StatCard
            icon={<Eye className="w-3.5 h-3.5" />}
            label="Total Views"
            value={latest.views >= 1000 ? `${(latest.views / 1000).toFixed(1)}K` : `${latest.views}`}
          />
          <StatCard
            icon={<Activity className="w-3.5 h-3.5" />}
            label="Engagement"
            value={`${latest.engagement_rate}%`}
            sub={latest.engagement_rate >= 3 ? "Strong" : "Building"}
            color={latest.engagement_rate >= 3 ? "text-green-400" : "text-white"}
          />
          <StatCard
            icon={<TrendingUp className="w-3.5 h-3.5" />}
            label="Reach"
            value={latest.reach >= 1000 ? `${(latest.reach / 1000).toFixed(1)}K` : `${latest.reach}`}
            sub="Unique accounts"
          />
        </div>

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
                {metrics.map((m, i) => (
                  <tr key={m.id} className={i < metrics.length - 1 ? "border-b border-[#141414]" : ""}>
                    <td className="px-4 py-3 text-[#888]">{fmtMonth(m.month)}</td>
                    <td className="px-4 py-3 text-right text-white font-medium">
                      {m.followers.toLocaleString()}
                      {m.followers_change !== 0 && (
                        <span className={`ml-1.5 text-xs ${m.followers_change > 0 ? "text-green-400" : "text-red-400"}`}>
                          {m.followers_change > 0 ? "+" : ""}{m.followers_change}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-[#888] hidden sm:table-cell">
                      {m.views >= 1000 ? `${(m.views / 1000).toFixed(1)}K` : m.views}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${m.engagement_rate >= 3 ? "text-green-400" : "text-[#888]"}`}>
                        {m.engagement_rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
