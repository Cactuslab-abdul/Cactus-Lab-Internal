"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle, PlayCircle, TrendingUp, FileText,
  Clock, Eye, Activity, Loader2
} from "lucide-react";
import type { Metric, Invoice } from "@/lib/portal/types";
import { useRefreshOnFocus } from "@/lib/portal/useRefresh";

interface Video { id: string; status: string; month: string; title: string; }

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

function fmtMonth(ym: string) {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-AE", { month: "long", year: "numeric" });
}

export default function ClientDashboard() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : Array.isArray(params.slug) ? params.slug[0] : "";

  const [videos, setVideos] = useState<Video[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!slug) return;
    const [v, m, i] = await Promise.all([
      fetch(`/api/portal/v2/videos?slug=${slug}`).then(r => r.ok ? r.json() : []),
      fetch(`/api/portal/v2/metrics?slug=${slug}`).then(r => r.ok ? r.json() : []),
      fetch(`/api/portal/v2/invoices?slug=${slug}`).then(r => r.ok ? r.json() : []),
    ]);
    setVideos(Array.isArray(v) ? v : []);
    setMetrics(Array.isArray(m) ? m : []);
    setInvoices(Array.isArray(i) ? i : []);
    setLoading(false);
  }, [slug]);

  useEffect(() => { void load(); }, [load]);
  useRefreshOnFocus(load);

  const pendingVideos = videos.filter(v => v.status === "idea_pending" || v.status === "ready_for_review");
  const unpaidInvoices = invoices.filter(i => i.status === "pending" || i.status === "overdue");
  const latestMetric = metrics[0] ?? null;

  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthVideos = videos.filter(v => (v.month || "").slice(0, 7) === thisMonth);
  const delivered = thisMonthVideos.filter(v => v.status === "posted" || v.status === "client_approved").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-[#333] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Action required banner */}
      {(pendingVideos.length > 0 || unpaidInvoices.length > 0) && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-amber-400 font-semibold text-sm">Action Required</p>
            <div className="mt-1 space-y-0.5">
              {pendingVideos.length > 0 && (
                <p className="text-[#888] text-sm">
                  {pendingVideos.length} video{pendingVideos.length !== 1 ? "s" : ""} waiting for your approval.{" "}
                  <Link href={`/portal/client/${slug}/content`} className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors">
                    Review now →
                  </Link>
                </p>
              )}
              {unpaidInvoices.length > 0 && (
                <p className="text-[#888] text-sm">
                  {unpaidInvoices.length} unpaid invoice{unpaidInvoices.length !== 1 ? "s" : ""}.{" "}
                  <Link href={`/portal/client/${slug}/billing`} className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors">
                    View billing →
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-white text-2xl font-bold">Welcome back</h1>
        <p className="text-[#555] text-sm mt-1">Here&apos;s your content overview for this month.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<PlayCircle className="w-3.5 h-3.5" />}
          label="Delivered"
          value={`${delivered}`}
          sub="Videos this month"
          color="text-green-400"
        />
        <StatCard
          icon={<Clock className="w-3.5 h-3.5" />}
          label="Pending Approval"
          value={`${pendingVideos.length}`}
          sub={pendingVideos.length > 0 ? "Needs your review" : "All caught up"}
          color={pendingVideos.length > 0 ? "text-amber-400" : "text-white"}
        />
        {latestMetric ? (
          <>
            <StatCard
              icon={<Eye className="w-3.5 h-3.5" />}
              label="Total Views"
              value={latestMetric.views >= 1000 ? `${(latestMetric.views / 1000).toFixed(1)}K` : `${latestMetric.views}`}
              sub={fmtMonth(latestMetric.month)}
            />
            <StatCard
              icon={<Activity className="w-3.5 h-3.5" />}
              label="Engagement"
              value={`${latestMetric.engagement_rate}%`}
              sub={latestMetric.engagement_rate >= 3 ? "Strong" : "Building"}
              color={latestMetric.engagement_rate >= 3 ? "text-green-400" : "text-white"}
            />
          </>
        ) : (
          <>
            <StatCard icon={<Eye className="w-3.5 h-3.5" />} label="Total Views" value="—" sub="No data yet" />
            <StatCard icon={<Activity className="w-3.5 h-3.5" />} label="Engagement" value="—" sub="No data yet" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { href: `/portal/client/${slug}/content`, icon: PlayCircle, label: "Review Content", desc: pendingVideos.length > 0 ? `${pendingVideos.length} awaiting approval` : "All up to date", urgent: pendingVideos.length > 0 },
          { href: `/portal/client/${slug}/analytics`, icon: TrendingUp, label: "See Analytics", desc: latestMetric ? `${fmtMonth(latestMetric.month)} data available` : "Analytics coming soon" },
          { href: `/portal/client/${slug}/billing`, icon: FileText, label: "Billing", desc: unpaidInvoices.length > 0 ? `${unpaidInvoices.length} unpaid invoice${unpaidInvoices.length !== 1 ? "s" : ""}` : "All paid up", urgent: unpaidInvoices.length > 0 },
        ].map(({ href, icon: Icon, label, desc, urgent }) => (
          <Link
            key={href}
            href={href}
            className={`bg-[#111] border rounded-2xl p-5 hover:border-[#2a2a2a] transition-all group ${
              urgent ? "border-amber-500/20 hover:border-amber-500/30" : "border-[#1e1e1e]"
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              urgent ? "bg-amber-500/10" : "bg-[#1a1a1a] group-hover:bg-[#222]"
            }`}>
              <Icon className={`w-4 h-4 ${urgent ? "text-amber-400" : "text-[#666] group-hover:text-white"}`} />
            </div>
            <p className="text-white text-sm font-semibold">{label}</p>
            <p className={`text-xs mt-0.5 ${urgent ? "text-amber-400" : "text-[#555]"}`}>{desc}</p>
          </Link>
        ))}
      </div>

      {videos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[#555] text-xs uppercase tracking-wide font-medium">Recent Videos</p>
            <Link href={`/portal/client/${slug}/content`} className="text-[#555] hover:text-white text-xs transition-colors">
              View all →
            </Link>
          </div>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
            {videos.slice(0, 5).map((v, i) => {
              const isPending = v.status === "idea_pending" || v.status === "ready_for_review";
              return (
                <div key={v.id} className={`flex items-center gap-3 px-4 py-3 ${i < Math.min(videos.length, 5) - 1 ? "border-b border-[#141414]" : ""}`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    v.status === "posted" ? "bg-teal-400" :
                    v.status === "client_approved" ? "bg-green-400" :
                    isPending ? "bg-amber-400" :
                    v.status === "in_production" ? "bg-blue-400" : "bg-[#333]"
                  }`} />
                  <p className="flex-1 text-[#aaa] text-sm truncate">{v.title}</p>
                  {isPending && (
                    <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                      Needs review
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
