"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2, Clock, AlertCircle, PlayCircle, Star, ExternalLink,
  TrendingUp, Users, Eye, Activity, FileText, Package,
  ChevronUp, ChevronDown, MessageCircle, Check, X, RotateCcw,
  CalendarDays, BadgeCheck, Loader2, LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugForEmail } from "@/lib/portal-auth";
import type { PortalData, ContentItem, ContentStatus, AnalyticsWeek, PortalInvoice } from "@/lib/portal-types";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso + (iso.includes("T") ? "" : "T00:00:00")).toLocaleDateString("en-AE", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function formatMonth(ym: string) {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-AE", { month: "long", year: "numeric" });
}

function formatWeek(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const end = new Date(d);
  end.setDate(d.getDate() + 6);
  return `${d.toLocaleDateString("en-AE", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}`;
}

function aed(n: number) {
  return `AED ${n.toLocaleString("en-AE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function monthsActive(startDate: string) {
  const start = new Date(startDate + "T00:00:00");
  const now = new Date();
  return Math.max(1, Math.round((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
}

// ─── Status config ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ContentStatus, { label: string; color: string; icon: React.ReactNode; showActions: boolean }> = {
  idea_pending: {
    label: "Awaiting Your Approval",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    showActions: true,
  },
  idea_revision: {
    label: "Revision Requested",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    icon: <RotateCcw className="w-3.5 h-3.5" />,
    showActions: false,
  },
  idea_approved: {
    label: "Idea Approved",
    color: "bg-green-500/10 text-green-400 border-green-500/20",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    showActions: false,
  },
  in_production: {
    label: "In Production",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: <Clock className="w-3.5 h-3.5" />,
    showActions: false,
  },
  ready_for_review: {
    label: "Ready for Review",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    icon: <PlayCircle className="w-3.5 h-3.5" />,
    showActions: true,
  },
  client_approved: {
    label: "Approved",
    color: "bg-green-500/10 text-green-400 border-green-500/20",
    icon: <BadgeCheck className="w-3.5 h-3.5" />,
    showActions: false,
  },
  posted: {
    label: "Live",
    color: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    icon: <Star className="w-3.5 h-3.5" />,
    showActions: false,
  },
};

// ─── WhatsApp helpers ────────────────────────────────────────────────────────

function whatsappApprove(phone: string, item: ContentItem) {
  const msg = encodeURIComponent(
    `Hi Awab! I'm approving ${item.status === "idea_pending" ? "the idea" : "the video"} for #${item.number}: "${item.title}". Great work! ✅`
  );
  window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${msg}`, "_blank");
}

function whatsappRevision(phone: string, item: ContentItem, note: string) {
  const msg = encodeURIComponent(
    `Hi Awab! I'd like to request a revision on #${item.number}: "${item.title}".\n\nMy feedback: ${note}`
  );
  window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${msg}`, "_blank");
}

// ─── Components ─────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className ?? ""}`} />;
}

function StatusBadge({ status }: { status: ContentStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${cfg.color}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function RevisionModal({
  item,
  agencyPhone,
  onClose,
}: {
  item: ContentItem;
  agencyPhone: string;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const submit = () => {
    if (!note.trim()) return;
    whatsappRevision(agencyPhone, item, note.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-[#111] border border-[#2a2a2a] rounded-2xl p-6 space-y-4 fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-white font-semibold">Request a Revision</h3>
            <p className="text-[#666] text-sm mt-0.5">#{item.number} — {item.title}</p>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>
          <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-2">Your feedback</label>
          <textarea
            ref={textareaRef}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Describe what you'd like changed or improved..."
            rows={4}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#444] focus:border-[#444] outline-none resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={submit}
            disabled={!note.trim()}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-green-500/40 disabled:opacity-40 text-white font-medium py-2.5 rounded-xl text-sm transition-all"
          >
            <MessageCircle className="w-4 h-4 text-green-400" />
            Send via WhatsApp
          </button>
          <button onClick={onClose} className="px-4 py-2.5 text-[#666] hover:text-white text-sm transition-colors">Cancel</button>
        </div>
        <p className="text-[#444] text-xs text-center">This will open WhatsApp with your feedback pre-filled</p>
      </div>
    </div>
  );
}

function ContentCard({ item, agencyPhone }: { item: ContentItem; agencyPhone: string }) {
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [expanded, setExpanded] = useState(item.status === "idea_pending" || item.status === "ready_for_review");
  const cfg = STATUS_CONFIG[item.status];
  const isActionable = cfg.showActions;

  return (
    <>
      <div className={`bg-[#111] border rounded-2xl transition-all duration-200 ${isActionable ? "border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.05)]" : "border-[#1e1e1e]"}`}>
        {/* Card header */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full text-left p-4 flex items-start gap-3"
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${isActionable ? "bg-green-500/10 text-green-400" : "bg-[#1a1a1a] text-[#666]"}`}>
            {item.number}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="min-w-0">
                <p className="text-white text-sm font-medium leading-tight">{item.title}</p>
                <span className="text-[#555] text-xs">{item.type}</span>
              </div>
              <div className="flex-shrink-0">
                <StatusBadge status={item.status} />
              </div>
            </div>
          </div>
          <div className="text-[#444] flex-shrink-0 mt-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {/* Expanded body */}
        {expanded && (
          <div className="px-4 pb-4 space-y-4 border-t border-[#1a1a1a] pt-4">
            {/* Idea description */}
            {item.ideaDescription && (item.status === "idea_pending" || item.status === "idea_approved" || item.status === "idea_revision" || item.status === "in_production") && (
              <div>
                <p className="text-[#555] text-xs uppercase tracking-wide font-medium mb-2">Concept</p>
                <p className="text-[#aaa] text-sm leading-relaxed">{item.ideaDescription}</p>
              </div>
            )}

            {/* Client revision note */}
            {item.status === "idea_revision" && item.clientNote && (
              <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3">
                <p className="text-red-400 text-xs font-medium mb-1">Your revision request</p>
                <p className="text-[#ccc] text-sm">{item.clientNote}</p>
              </div>
            )}

            {/* Video ready for review */}
            {item.status === "ready_for_review" && item.videoUrl && (
              <div>
                <p className="text-[#555] text-xs uppercase tracking-wide font-medium mb-2">Video</p>
                <a
                  href={item.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-purple-500/5 border border-purple-500/15 rounded-xl px-4 py-3 text-purple-400 hover:text-purple-300 text-sm transition-colors"
                >
                  <PlayCircle className="w-4 h-4 flex-shrink-0" />
                  Watch the video
                  <ExternalLink className="w-3.5 h-3.5 ml-auto flex-shrink-0" />
                </a>
              </div>
            )}

            {/* Posted link */}
            {item.status === "posted" && item.postedUrl && (
              <a
                href={item.postedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-teal-500/5 border border-teal-500/15 rounded-xl px-4 py-3 text-teal-400 hover:text-teal-300 text-sm transition-colors"
              >
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                View live post
                <ExternalLink className="w-3.5 h-3.5 ml-auto flex-shrink-0" />
              </a>
            )}

            {/* Action buttons */}
            {isActionable && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => whatsappApprove(agencyPhone, item)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/20 hover:bg-green-500/15 text-green-400 font-medium py-2.5 rounded-xl text-sm transition-all"
                >
                  <Check className="w-4 h-4" />
                  {item.status === "idea_pending" ? "Approve Idea" : "Approve Video"}
                </button>
                <button
                  onClick={() => setRevisionOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#333] text-[#888] hover:text-white font-medium py-2.5 rounded-xl text-sm transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Request Revision
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {revisionOpen && (
        <RevisionModal item={item} agencyPhone={agencyPhone} onClose={() => setRevisionOpen(false)} />
      )}
    </>
  );
}

function AnalyticsSection({ analytics }: { analytics: AnalyticsWeek[] }) {
  const sorted = [...analytics].sort((a, b) => b.weekDate.localeCompare(a.weekDate));
  const latest = sorted[0];

  if (analytics.length === 0) {
    return (
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-12 text-center">
        <TrendingUp className="w-10 h-10 text-[#2a2a2a] mx-auto mb-3" />
        <p className="text-[#555] text-sm">Analytics will appear here once we start tracking your weekly performance.</p>
      </div>
    );
  }

  function Stat({ icon, label, value, sub, up }: { icon: React.ReactNode; label: string; value: string; sub?: string; up?: boolean }) {
    return (
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5">
        <div className="flex items-center gap-2 text-[#666] text-xs uppercase tracking-wide font-medium mb-3">
          {icon}
          {label}
        </div>
        <p className="text-white text-2xl font-bold">{value}</p>
        {sub && (
          <p className={`text-sm font-medium mt-1 ${up === true ? "text-green-400" : up === false ? "text-red-400" : "text-[#666]"}`}>
            {sub}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Latest week highlight */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-white font-semibold">Latest Week</p>
          <span className="text-[#555] text-sm">{formatWeek(latest.weekDate)}</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat
            icon={<Users className="w-3.5 h-3.5" />}
            label="Instagram Followers"
            value={latest.instagram.followers.toLocaleString()}
            sub={latest.instagram.followersChange > 0 ? `+${latest.instagram.followersChange} this week` : `${latest.instagram.followersChange} this week`}
            up={latest.instagram.followersChange > 0}
          />
          <Stat
            icon={<Eye className="w-3.5 h-3.5" />}
            label="Total Views"
            value={latest.instagram.views >= 1000 ? `${(latest.instagram.views / 1000).toFixed(1)}K` : latest.instagram.views.toString()}
            sub="Instagram"
          />
          <Stat
            icon={<Activity className="w-3.5 h-3.5" />}
            label="Engagement Rate"
            value={`${latest.instagram.engagementRate}%`}
            sub={latest.instagram.engagementRate >= 3 ? "Strong" : "Building"}
            up={latest.instagram.engagementRate >= 3}
          />
          <Stat
            icon={<TrendingUp className="w-3.5 h-3.5" />}
            label="Reach"
            value={latest.instagram.reach >= 1000 ? `${(latest.instagram.reach / 1000).toFixed(1)}K` : latest.instagram.reach.toString()}
            sub="Unique accounts"
          />
        </div>
        {latest.notes && (
          <div className="mt-3 bg-[#111] border border-[#1e1e1e] rounded-xl px-4 py-3">
            <p className="text-[#777] text-sm italic">&quot;{latest.notes}&quot;</p>
          </div>
        )}
        {latest.instagram.topPostUrl && (
          <a
            href={latest.instagram.topPostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 bg-[#111] border border-[#1e1e1e] hover:border-[#2a2a2a] rounded-xl px-4 py-3 text-[#888] hover:text-white text-sm transition-colors"
          >
            <Star className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            View top performing post this week
            <ExternalLink className="w-3.5 h-3.5 ml-auto" />
          </a>
        )}
      </div>

      {/* History table */}
      {sorted.length > 1 && (
        <div>
          <p className="text-[#555] text-xs uppercase tracking-wide font-medium mb-3">Weekly History</p>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="text-left text-[#555] text-xs font-medium px-4 py-3">Week</th>
                  <th className="text-right text-[#555] text-xs font-medium px-4 py-3">Followers</th>
                  <th className="text-right text-[#555] text-xs font-medium px-4 py-3 hidden sm:table-cell">Views</th>
                  <th className="text-right text-[#555] text-xs font-medium px-4 py-3">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((week, i) => (
                  <tr key={week.id} className={i < sorted.length - 1 ? "border-b border-[#141414]" : ""}>
                    <td className="px-4 py-3 text-[#888]">{formatWeek(week.weekDate)}</td>
                    <td className="px-4 py-3 text-right text-white font-medium">
                      {week.instagram.followers.toLocaleString()}
                      {week.instagram.followersChange !== 0 && (
                        <span className={`ml-1.5 text-xs ${week.instagram.followersChange > 0 ? "text-green-400" : "text-red-400"}`}>
                          {week.instagram.followersChange > 0 ? "+" : ""}{week.instagram.followersChange}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-[#888] hidden sm:table-cell">
                      {week.instagram.views >= 1000 ? `${(week.instagram.views / 1000).toFixed(1)}K` : week.instagram.views}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${week.instagram.engagementRate >= 3 ? "text-green-400" : "text-[#888]"}`}>
                        {week.instagram.engagementRate}%
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

function InvoicesSection({ invoices }: { invoices: PortalInvoice[] }) {
  const sorted = [...invoices].sort((a, b) => b.date.localeCompare(a.date));

  if (invoices.length === 0) {
    return (
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-12 text-center">
        <FileText className="w-10 h-10 text-[#2a2a2a] mx-auto mb-3" />
        <p className="text-[#555] text-sm">No invoices yet.</p>
      </div>
    );
  }

  const statusBadge = (status: PortalInvoice["status"]) => {
    if (status === "paid") return <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium">Paid</span>;
    if (status === "pending") return <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">Pending</span>;
    return <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">Overdue</span>;
  };

  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.totalAED, 0);

  return (
    <div className="space-y-4">
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
        {sorted.map((inv, i) => (
          <div key={inv.id} className={`flex items-center gap-4 px-5 py-4 ${i < sorted.length - 1 ? "border-b border-[#141414]" : ""}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-white text-sm font-medium">{inv.month}</p>
                <span className="text-[#444] text-xs font-mono">{inv.number}</span>
              </div>
              <p className="text-[#555] text-xs mt-0.5">
                Issued {formatDate(inv.date)}
                {inv.paidDate && ` · Paid ${formatDate(inv.paidDate)}`}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-white text-sm font-bold">{aed(inv.totalAED)}</p>
              <p className="text-[#555] text-xs">incl. 5% VAT</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {statusBadge(inv.status)}
              {inv.pdfUrl && (
                <a
                  href={inv.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-[#555] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                  title="Download PDF"
                >
                  <FileText className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-[#555] text-sm">{invoices.filter(i => i.status === "paid").length} of {invoices.length} invoices paid</p>
        <p className="text-[#888] text-sm font-medium">{aed(totalPaid)} total paid</p>
      </div>
    </div>
  );
}

function PackageSection({ data }: { data: PortalData }) {
  const active = monthsActive(data.package.startDate);

  return (
    <div className="space-y-4">
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-white font-semibold">{data.package.name}</h3>
            <p className="text-[#555] text-sm mt-1">Started {formatDate(data.package.startDate)}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-green-400 text-xl font-bold">{aed(data.package.retainerAED)}</p>
            <p className="text-[#555] text-xs">per month</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <div className="flex items-center gap-2 text-[#555] text-xs mb-1">
              <CalendarDays className="w-3.5 h-3.5" />
              Months Active
            </div>
            <p className="text-white text-2xl font-bold">{active}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <div className="flex items-center gap-2 text-[#555] text-xs mb-1">
              <Package className="w-3.5 h-3.5" />
              Videos / Month
            </div>
            <p className="text-white text-2xl font-bold">{data.monthlyVideoQuota}</p>
          </div>
        </div>

        <div>
          <p className="text-[#555] text-xs uppercase tracking-wide font-medium mb-3">What&apos;s Included</p>
          <ul className="space-y-2">
            {data.package.services.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-[#aaa]">
                <CheckCircle2 className="w-4 h-4 text-green-500/60 flex-shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {data.package.primaryContactWhatsApp && (
        <a
          href={`https://wa.me/${data.package.primaryContactWhatsApp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-[#111] border border-[#1e1e1e] hover:border-green-500/20 rounded-2xl px-5 py-4 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">Contact your account manager</p>
            <p className="text-[#555] text-xs">{data.package.primaryContactName} · WhatsApp</p>
          </div>
          <ExternalLink className="w-4 h-4 text-[#444] group-hover:text-[#666] ml-auto transition-colors" />
        </a>
      )}
    </div>
  );
}

// ─── Main portal page ────────────────────────────────────────────────────────

type Tab = "content" | "analytics" | "invoices" | "package";

export default function ClientPortalPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug : Array.isArray(params.slug) ? params.slug[0] : "";

  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState<Tab>("content");

  // ── Auth gate ────────────────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/portal/login");
        return;
      }
      const userSlug = slugForEmail(user.email ?? "");
      if (!userSlug) {
        // Logged in but not a client — maybe it's Awab/Abdul, redirect to OS
        router.replace("/");
        return;
      }
      if (userSlug !== slug) {
        // Right client, wrong portal URL — redirect to their own
        router.replace(`/portal/${userSlug}`);
        return;
      }
      setAuthChecked(true);
    });
  }, [slug, router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/portal/login");
  };

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    if (!slug || !authChecked) return;
    fetch(`/api/portal/${slug}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(d => { if (d) setData(d as PortalData); })
      .finally(() => setLoading(false));
  }, [slug, authChecked]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        <div className="h-16 border-b border-[#1e1e1e] bg-[#111]" />
        <div className="max-w-4xl mx-auto w-full px-4 py-8 space-y-4">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#111] border border-[#1e1e1e] flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-[#333]" />
          </div>
          <h1 className="text-white text-xl font-bold mb-2">Portal not found</h1>
          <p className="text-[#555] text-sm">Check your link or contact your account manager.</p>
        </div>
      </div>
    );
  }

  const allMonths = Array.from(new Set(data.contentItems.map(i => i.month))).sort().reverse();
  if (allMonths.length > 0 && !allMonths.includes(selectedMonth)) {
    // default to most recent month that has content
  }
  const currentMonthItems = data.contentItems.filter(i => i.month === selectedMonth);
  const posted = currentMonthItems.filter(i => i.status === "posted" || i.status === "client_approved").length;
  const inProd = currentMonthItems.filter(i => i.status === "in_production").length;
  const awaitingApproval = currentMonthItems.filter(i => i.status === "idea_pending" || i.status === "ready_for_review").length;
  const progress = Math.round((posted / data.monthlyVideoQuota) * 100);

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "content", label: "Content", icon: <PlayCircle className="w-4 h-4" /> },
    { id: "analytics", label: "Analytics", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "invoices", label: "Invoices", icon: <FileText className="w-4 h-4" /> },
    { id: "package", label: "Package", icon: <Package className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-[#1e1e1e] bg-[#111]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo-cactus.png" alt="Cactus Lab" className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
            <div>
              <p className="text-white text-sm font-semibold leading-tight">Cactus Lab</p>
              <p className="text-[#555] text-xs leading-tight">Client Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {data.logoUrl ? (
              <img src={data.logoUrl} alt={data.clientName} className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-400/20 to-green-600/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-green-400">{data.clientName.charAt(0)}</span>
              </div>
            )}
            <span className="text-white text-sm font-medium hidden sm:block">{data.clientName}</span>
            <button
              onClick={handleLogout}
              className="ml-2 p-1.5 rounded-lg text-[#444] hover:text-red-400 hover:bg-red-500/5 transition-all"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6 fade-in">
        {/* Hero — this month overview */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 space-y-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[#555] text-xs uppercase tracking-wide font-medium mb-1">{formatMonth(selectedMonth)}</p>
              <h1 className="text-white text-2xl font-bold leading-tight">
                {posted} <span className="text-[#555] font-normal text-lg">of</span> {data.monthlyVideoQuota}
                <span className="text-[#555] font-normal text-lg"> videos delivered</span>
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              {awaitingApproval > 0 && (
                <button
                  onClick={() => setTab("content")}
                  className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-3 py-1.5 rounded-full font-medium"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {awaitingApproval} need{awaitingApproval === 1 ? "s" : ""} your approval
                </button>
              )}
              {inProd > 0 && (
                <span className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-3 py-1.5 rounded-full font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {inProd} in production
                </span>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[#555] text-xs">Delivery progress</p>
              <p className="text-[#888] text-xs font-medium">{progress}%</p>
            </div>
            <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Live", value: currentMonthItems.filter(i => i.status === "posted").length, color: "text-teal-400" },
              { label: "Approved", value: currentMonthItems.filter(i => i.status === "client_approved" || i.status === "idea_approved").length, color: "text-green-400" },
              { label: "Pending", value: currentMonthItems.filter(i => i.status === "in_production" || i.status === "idea_pending" || i.status === "ready_for_review").length, color: "text-[#888]" },
            ].map(stat => (
              <div key={stat.label} className="bg-[#1a1a1a] rounded-xl p-3 text-center">
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[#555] text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 bg-[#111] border border-[#1e1e1e] rounded-xl p-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-[#1a1a1a] text-white border border-[#2a2a2a]"
                  : "text-[#666] hover:text-[#aaa]"
              }`}
            >
              {t.icon}
              <span className="hidden sm:block">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "content" && (
          <div className="space-y-4">
            {/* Month selector */}
            {allMonths.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allMonths.map(m => (
                  <button
                    key={m}
                    onClick={() => setSelectedMonth(m)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      m === selectedMonth
                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : "bg-[#111] border-[#1e1e1e] text-[#666] hover:text-[#aaa]"
                    }`}
                  >
                    {formatMonth(m)}
                  </button>
                ))}
              </div>
            )}

            {/* Action-required first */}
            {awaitingApproval > 0 && (
              <div>
                <p className="text-[#555] text-xs uppercase tracking-wide font-medium mb-3 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  Needs Your Approval
                </p>
                <div className="space-y-2">
                  {currentMonthItems
                    .filter(i => i.status === "idea_pending" || i.status === "ready_for_review")
                    .map(item => <ContentCard key={item.id} item={item} agencyPhone={data.agencyWhatsApp} />)}
                </div>
              </div>
            )}

            {/* Remaining items */}
            {currentMonthItems.filter(i => i.status !== "idea_pending" && i.status !== "ready_for_review").length > 0 && (
              <div>
                {awaitingApproval > 0 && (
                  <p className="text-[#555] text-xs uppercase tracking-wide font-medium mb-3">All Content</p>
                )}
                <div className="space-y-2">
                  {currentMonthItems
                    .filter(i => i.status !== "idea_pending" && i.status !== "ready_for_review")
                    .map(item => <ContentCard key={item.id} item={item} agencyPhone={data.agencyWhatsApp} />)}
                </div>
              </div>
            )}

            {currentMonthItems.length === 0 && (
              <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-12 text-center">
                <PlayCircle className="w-10 h-10 text-[#2a2a2a] mx-auto mb-3" />
                <p className="text-[#555] text-sm">Content ideas for {formatMonth(selectedMonth)} will appear here once added.</p>
              </div>
            )}
          </div>
        )}

        {tab === "analytics" && <AnalyticsSection analytics={data.analytics} />}
        {tab === "invoices" && <InvoicesSection invoices={data.invoices} />}
        {tab === "package" && <PackageSection data={data} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#141414] mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo-cactus.png" alt="Cactus Lab" className="w-5 h-5 rounded object-cover opacity-50" />
            <p className="text-[#444] text-xs">Powered by Cactus Lab</p>
          </div>
          {data.package.primaryContactWhatsApp && (
            <a
              href={`https://wa.me/${data.package.primaryContactWhatsApp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#444] hover:text-[#666] text-xs transition-colors"
            >
              Questions? Message us on WhatsApp
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
