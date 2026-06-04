"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createPortal } from "react-dom";
import {
  Plus, X, PlayCircle, Check, Loader2, Trash2, Edit2, ExternalLink,
  RefreshCw, Eye, MessageSquare, Send, RotateCcw, Copy
} from "lucide-react";
import { useRefreshOnFocus } from "@/lib/portal/useRefresh";

type VideoStatus = "idea_pending"|"idea_approved"|"idea_revision"|"in_production"|"ready_for_review"|"client_approved"|"posted";
type VideoType = "Reel"|"Story"|"Post"|"TikTok"|"LinkedIn";

interface Video {
  id: string; title: string; type: VideoType; month: string; number: number;
  stream_url: string|null; thumbnail_url: string|null; caption: string|null;
  posted_url: string|null; status: VideoStatus; internal_notes: string|null;
  client_note: string|null; company_id: string;
}

interface Comment {
  id: string; video_id: string; user_email: string; comment_text: string;
  timestamp_seconds: number|null; created_at: string;
}

interface Company { id: string; slug: string; name: string; }

const STATUS_LABELS: Record<VideoStatus, string> = {
  idea_pending: "Awaiting Approval", idea_approved: "Idea Approved", idea_revision: "Revision Requested",
  in_production: "In Production", ready_for_review: "Ready for Review",
  client_approved: "Client Approved", posted: "Posted / Live",
};

const STATUS_COLORS: Record<VideoStatus, string> = {
  idea_pending: "text-amber-400", idea_revision: "text-red-400", idea_approved: "text-green-400",
  in_production: "text-blue-400", ready_for_review: "text-purple-400",
  client_approved: "text-green-400", posted: "text-teal-400",
};

const STATUS_BADGE: Record<VideoStatus, string> = {
  idea_pending: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  idea_revision: "text-red-400 bg-red-500/10 border-red-500/20",
  idea_approved: "text-green-400 bg-green-500/10 border-green-500/20",
  in_production: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  ready_for_review: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  client_approved: "text-green-400 bg-green-500/10 border-green-500/20",
  posted: "text-teal-400 bg-teal-500/10 border-teal-500/20",
};

const EMPTY_FORM = {
  title: "", type: "Reel" as VideoType, month: new Date().toISOString().slice(0,7),
  number: 1, stream_url: "", thumbnail_url: "", caption: "", posted_url: "",
  status: "idea_pending" as VideoStatus, internal_notes: "",
};

function fmtMonth(ym: string) {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m)-1, 1).toLocaleDateString("en-AE", { month: "long", year: "numeric" });
}

function fmtTs(s: number | null): string {
  if (s == null) return "";
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function parseTs(str: string): number | null {
  const parts = str.split(":").map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return parts[0] * 60 + parts[1];
  if (parts.length === 1 && !isNaN(parts[0]) && str.trim() !== "") return parts[0];
  return null;
}

function drivePreview(url: string): string | null {
  const m = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  return m ? `https://drive.google.com/file/d/${m[1]}/preview` : null;
}

// ── Revision Done Button ──────────────────────────────────────────────────────
function RevisionDoneButton({ video, onUpdated }: { video: Video; onUpdated: (v: Video) => void }) {
  const [loading, setLoading] = useState(false);

  const send = async (targetStatus: "idea_pending" | "ready_for_review") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/portal/v2/videos/${video.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: video.title, type: video.type, month: video.month,
          number: video.number, stream_url: video.stream_url ?? "",
          caption: video.caption ?? "", posted_url: video.posted_url ?? "",
          internal_notes: video.internal_notes ?? "", company_id: video.company_id,
          status: targetStatus, client_note: null,
        }),
      });
      if (res.ok) { const v = await res.json(); onUpdated(v); }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-[#555] text-xs font-semibold uppercase tracking-wide">Revision complete?</p>
      <div className="flex gap-2">
        <button
          onClick={() => send(video.stream_url ? "ready_for_review" : "idea_pending")}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-2.5 rounded-xl text-sm transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Revision Done — Send back to client
        </button>
      </div>
      <p className="text-[#333] text-xs">
        {video.stream_url
          ? "Will set status to Ready for Review so the client can approve the updated video."
          : "Will set status to Awaiting Approval so the client can re-review the idea."}
      </p>
    </div>
  );
}

// ── Admin Video Detail Modal ──────────────────────────────────────────────────
function VideoDetailModal({ video, onClose, onEdit }: {
  video: Video; onClose: () => void; onEdit: () => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const preview = video.stream_url ? drivePreview(video.stream_url) : null;

  useEffect(() => {
    fetch(`/api/portal/v2/videos/${video.id}/comments`)
      .then(r => r.ok ? r.json() : [])
      .then(setComments);
  }, [video.id]);

  const submitComment = async () => {
    if (!commentText.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/portal/v2/videos/${video.id}/comments`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment_text: commentText.trim(),
          timestamp_seconds: parseTs(timestamp),
          author: "Cactus Lab",
        }),
      });
      if (res.ok) {
        const c = await res.json();
        setComments(prev => [...prev, c]);
        setCommentText("");
        setTimestamp("");
      }
    } finally {
      setSending(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-2xl bg-[#111] border border-[#222] rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#1a1a1a] flex-shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_BADGE[video.status]}`}>
                {STATUS_LABELS[video.status]}
              </span>
              <span className="text-[#444] text-xs">{video.type} #{video.number}</span>
            </div>
            <h2 className="text-white font-bold text-lg leading-snug">{video.title}</h2>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={onEdit}
              className="flex items-center gap-1.5 text-xs text-[#666] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-3 py-1.5 rounded-lg transition-all">
              <Edit2 className="w-3.5 h-3.5" />Edit
            </button>
            <button onClick={onClose} className="text-[#444] hover:text-white transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Client revision — show note + "revision done" action */}
          {video.status === "idea_revision" && (
            <div className="p-6 border-b border-[#1a1a1a] space-y-4">
              {video.client_note && (
                <div className="bg-red-500/8 border border-red-500/25 rounded-xl p-4">
                  <p className="text-red-400 text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <RotateCcw className="w-3 h-3" />Client Revision Request
                  </p>
                  <p className="text-[#ddd] text-sm leading-relaxed">{video.client_note}</p>
                </div>
              )}
              <RevisionDoneButton video={video} onUpdated={updatedVideo => { onClose(); }} />
            </div>
          )}

          {/* Internal notes */}
          {video.internal_notes && (
            <div className="px-6 pt-5">
              <p className="text-[#555] text-xs uppercase tracking-wide font-semibold mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Internal Notes
              </p>
              <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl px-4 py-3 text-[#ccc] text-sm leading-relaxed whitespace-pre-wrap">
                {video.internal_notes}
              </div>
            </div>
          )}

          {/* Video player */}
          {video.stream_url && (
            <div className="px-6 pt-5">
              {preview ? (
                <div className="rounded-xl overflow-hidden bg-black border border-[#2a2a2a]">
                  <iframe src={preview} className="w-full aspect-video" allow="autoplay; fullscreen" allowFullScreen />
                </div>
              ) : (
                <a href={video.stream_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#444] rounded-xl px-5 py-4 text-white transition-colors group">
                  <PlayCircle className="w-5 h-5 text-green-400" />
                  <span className="flex-1 text-sm font-medium">Open Video</span>
                  <ExternalLink className="w-4 h-4 text-[#555] group-hover:text-white transition-colors" />
                </a>
              )}
            </div>
          )}

          {/* Caption */}
          {video.caption && (
            <div className="px-6 pt-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[#555] text-xs uppercase tracking-wide font-semibold">Caption</p>
                <button onClick={async () => { await navigator.clipboard.writeText(video.caption!); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                  className="flex items-center gap-1 text-[#555] hover:text-white text-xs transition-colors">
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-[#ccc] text-sm leading-relaxed whitespace-pre-wrap">
                {video.caption}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="px-6 pt-5 pb-6">
            <p className="text-[#555] text-xs uppercase tracking-wide font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" />Comments ({comments.length})
            </p>
            {comments.length > 0 && (
              <div className="space-y-2 mb-4">
                {comments.map(c => (
                  <div key={c.id} className={`border rounded-xl p-3 ${c.user_email === "Cactus Lab" ? "bg-green-500/5 border-green-500/15" : "bg-[#1a1a1a] border-[#222]"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold ${c.user_email === "Cactus Lab" ? "text-green-400" : "text-white"}`}>
                        {c.user_email === "Cactus Lab" ? "You (Cactus Lab)" : "Client"}
                      </span>
                      {c.timestamp_seconds != null && (
                        <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono">{fmtTs(c.timestamp_seconds)}</span>
                      )}
                      <span className="text-[#444] text-xs ml-auto">{new Date(c.created_at).toLocaleDateString("en-AE", { day: "numeric", month: "short" })}</span>
                    </div>
                    <p className="text-[#bbb] text-sm leading-relaxed">{c.comment_text}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input value={timestamp} onChange={e => setTimestamp(e.target.value)} placeholder="0:23"
                className="w-16 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#444] focus:border-[#444] outline-none font-mono flex-shrink-0" />
              <input value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void submitComment(); }}}
                placeholder="Add an internal comment…"
                className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#444] focus:border-[#444] outline-none" />
              <button onClick={() => void submitComment()} disabled={!commentText.trim() || sending}
                className="p-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-[#555] hover:text-white disabled:opacity-40 transition-colors flex-shrink-0">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[#333] text-xs mt-2">Optional: type a timestamp like 0:23 to pin your comment.</p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function VideosPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : Array.isArray(params.slug) ? params.slug[0] : "";

  const [company, setCompany] = useState<Company|null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string|null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0,7));
  const [detailVideo, setDetailVideo] = useState<Video|null>(null);

  const load = useCallback(async () => {
    if (!slug) return;
    setRefreshing(true);
    try {
      const [coRes, vRes] = await Promise.all([
        fetch(`/api/portal/v2/companies`),
        fetch(`/api/portal/v2/videos?slug=${slug}`),
      ]);
      const companies = coRes.ok ? await coRes.json() : [];
      const vids = vRes.ok ? await vRes.json() : [];
      const c = Array.isArray(companies) ? companies.find((x: Company) => x.slug === slug) : null;
      setCompany(c ?? null);
      setVideos(Array.isArray(vids) ? vids : []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [slug]);

  useEffect(() => { void load(); }, [load]);
  useRefreshOnFocus(load);

  const allMonths = Array.from(new Set(videos.map(v => v.month).filter(Boolean))).sort().reverse();
  const monthVideos = videos.filter(v => v.month === selectedMonth);

  useEffect(() => {
    if (allMonths.length > 0 && !allMonths.includes(selectedMonth)) {
      setSelectedMonth(allMonths[0]);
    }
  }, [allMonths, selectedMonth]);

  const openNew = () => {
    setForm({ ...EMPTY_FORM, month: selectedMonth || new Date().toISOString().slice(0,7), number: monthVideos.length + 1 });
    setEditing(null);
    setSaveError(null);
    setShowForm(true);
  };

  const openEdit = (v: Video) => {
    setForm({
      title: v.title, type: v.type, month: v.month, number: v.number,
      stream_url: v.stream_url ?? "", thumbnail_url: v.thumbnail_url ?? "",
      caption: v.caption ?? "", posted_url: v.posted_url ?? "",
      status: v.status, internal_notes: v.internal_notes ?? "",
    });
    setEditing(v.id);
    setSaveError(null);
    setDetailVideo(null);
    setShowForm(true);
  };

  const save = async () => {
    if (!form.title || !company) return;
    setSaving(true);
    setSaveError(null);

    const payload = { ...form, company_id: company.id };
    const res = editing
      ? await fetch(`/api/portal/v2/videos/${editing}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        })
      : await fetch("/api/portal/v2/videos", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        });

    if (res.ok) {
      const updated: Video = await res.json();
      setVideos(prev => editing
        ? prev.map(v => v.id === editing ? updated : v)
        : [updated, ...prev]);
      setSelectedMonth(updated.month);
      setShowForm(false);
      setEditing(null);
    } else {
      const err = await res.json().catch(() => ({}));
      setSaveError(err.error || `Server error (${res.status}).`);
    }
    setSaving(false);
  };

  const deleteVideo = async (id: string) => {
    if (!confirm("Delete this video?")) return;
    const res = await fetch(`/api/portal/v2/videos/${id}`, { method: "DELETE" });
    if (res.ok) setVideos(prev => prev.filter(v => v.id !== id));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-[#333] animate-spin" /></div>;

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-white text-2xl font-bold truncate">{company?.name ?? slug} — Videos</h1>
          <p className="text-[#555] text-sm mt-1">Manage content for this client.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {company && (
            <a href={`/portal/client/${company.slug}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[#888] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-3 py-2 rounded-lg transition-all">
              <Eye className="w-3.5 h-3.5" />View as Client
            </a>
          )}
          <button onClick={() => void load()} disabled={refreshing}
            className="flex items-center gap-1.5 text-xs text-[#888] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-3 py-2 rounded-lg transition-all disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button onClick={openNew}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <Plus className="w-4 h-4" />Add Video
          </button>
        </div>
      </div>

      {/* Video form */}
      {showForm && (
        <div className="bg-[#111] border border-green-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">{editing ? "Edit Video" : "New Video"}</h3>
            <button onClick={() => { setShowForm(false); setEditing(null); setSaveError(null); }} className="text-[#555] hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[#555] text-xs block mb-1.5">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Behind the scenes — store tour"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
            </div>
            <div>
              <label className="text-[#555] text-xs block mb-1.5">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as VideoType }))}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm focus:border-green-500/50 outline-none">
                {["Reel","Story","Post","TikTok","LinkedIn"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[#555] text-xs block mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as VideoStatus }))}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm focus:border-green-500/50 outline-none">
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[#555] text-xs block mb-1.5">Month</label>
              <input type="month" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm focus:border-green-500/50 outline-none" />
            </div>
            <div>
              <label className="text-[#555] text-xs block mb-1.5">Video # in month</label>
              <input type="number" value={form.number} onChange={e => setForm(f => ({ ...f, number: parseInt(e.target.value) || 1 }))}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm focus:border-green-500/50 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="text-[#555] text-xs block mb-1.5">Video URL (Google Drive or other)</label>
              <input value={form.stream_url} onChange={e => setForm(f => ({ ...f, stream_url: e.target.value }))}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="text-[#555] text-xs block mb-1.5">Caption (shown to client)</label>
              <textarea value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
                rows={3} placeholder="The caption for this post…"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none resize-none" />
            </div>
            <div className="col-span-2">
              <label className="text-[#555] text-xs block mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                Internal Notes (hidden from client)
              </label>
              <textarea value={form.internal_notes} onChange={e => setForm(f => ({ ...f, internal_notes: e.target.value }))}
                rows={2} placeholder="Production notes, editor instructions, etc…"
                className="w-full bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#555] focus:border-amber-500/40 outline-none resize-none" />
            </div>
            {form.status === "posted" && (
              <div className="col-span-2">
                <label className="text-[#555] text-xs block mb-1.5">Posted URL</label>
                <input value={form.posted_url} onChange={e => setForm(f => ({ ...f, posted_url: e.target.value }))}
                  placeholder="https://instagram.com/p/..."
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
              </div>
            )}
          </div>

          {saveError && (
            <p className="text-red-400 text-sm bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3 whitespace-pre-wrap">
              {saveError}
            </p>
          )}
          <div className="flex gap-3 pt-1">
            <button onClick={save} disabled={!form.title || saving}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {editing ? "Save Changes" : "Create Video"}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); setSaveError(null); }}
              className="px-4 py-2.5 text-[#666] hover:text-white text-sm transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Month tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => { const m = new Date().toISOString().slice(0,7); setSelectedMonth(m); openNew(); }}
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border bg-[#111] border-dashed border-[#2a2a2a] text-[#555] hover:text-white hover:border-[#444] transition-all">
          + New month
        </button>
        {allMonths.map(m => (
          <button key={m} onClick={() => setSelectedMonth(m)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              m === selectedMonth ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-[#111] border-[#1e1e1e] text-[#666] hover:text-white"
            }`}>{fmtMonth(m)}</button>
        ))}
      </div>

      {/* Video list */}
      {monthVideos.length === 0 ? (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-12 text-center">
          <PlayCircle className="w-8 h-8 text-[#2a2a2a] mx-auto mb-3" />
          <p className="text-[#555] text-sm">No videos for {fmtMonth(selectedMonth)}.</p>
          <button onClick={openNew} className="mt-3 text-green-400 hover:text-green-300 text-sm transition-colors">+ Add first video</button>
        </div>
      ) : (
        <div className="space-y-2">
          {monthVideos.map(v => (
            <div
              key={v.id}
              onClick={() => setDetailVideo(v)}
              className="bg-[#111] border border-[#1e1e1e] hover:border-[#2a2a2a] rounded-2xl p-4 flex items-center gap-4 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#555]">
                {v.number}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white text-sm font-medium group-hover:text-green-400 transition-colors">{v.title}</p>
                  <span className="text-[#555] text-xs">{v.type}</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className={`text-xs font-medium ${STATUS_COLORS[v.status]}`}>{STATUS_LABELS[v.status]}</span>
                  {v.internal_notes && (
                    <span className="text-[10px] bg-amber-500/10 border border-amber-500/15 text-amber-400/70 px-2 py-0.5 rounded font-medium">Internal notes</span>
                  )}
                  {v.client_note && (
                    <span className="text-[10px] bg-red-500/10 border border-red-500/15 text-red-400/80 px-2 py-0.5 rounded font-medium">Revision requested</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                {v.stream_url && (
                  <a href={v.stream_url} target="_blank" rel="noopener noreferrer"
                    className="p-2 text-[#444] hover:text-white transition-colors rounded-lg hover:bg-[#1a1a1a]">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button onClick={() => openEdit(v)} className="p-2 text-[#444] hover:text-white transition-colors rounded-lg hover:bg-[#1a1a1a]">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteVideo(v.id)} className="p-2 text-[#444] hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/5">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {detailVideo && (
        <VideoDetailModal
          video={detailVideo}
          onClose={() => setDetailVideo(null)}
          onEdit={() => openEdit(detailVideo)}
        />
      )}
    </div>
  );
}
