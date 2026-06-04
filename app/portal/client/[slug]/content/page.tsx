"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import {
  PlayCircle, CheckCircle2, AlertCircle, Clock, Star, RotateCcw,
  Check, X, ExternalLink, BadgeCheck, Loader2, Copy, Send, MessageSquare
} from "lucide-react";
import type { VideoComment } from "@/lib/portal/types";
import { useRefreshOnFocus } from "@/lib/portal/useRefresh";

type VideoStatus = "idea_pending"|"idea_approved"|"idea_revision"|"in_production"|"ready_for_review"|"client_approved"|"posted";

interface Video {
  id: string; company_id: string; title: string; type: string; month: string;
  number: number; stream_url: string|null; thumbnail_url: string|null;
  caption: string|null; posted_url: string|null; status: VideoStatus;
  client_note: string|null; created_at: string; updated_at: string;
}

const STATUS_CFG: Record<VideoStatus, { label: string; color: string; dot: string; actionable: boolean; undoable: boolean; revisable: boolean }> = {
  idea_pending:     { label: "Awaiting Approval",  color: "text-amber-400 bg-amber-500/10 border-amber-500/20",    dot: "bg-amber-400",  actionable: true,  undoable: false, revisable: false },
  idea_revision:    { label: "Revision Requested", color: "text-red-400 bg-red-500/10 border-red-500/20",          dot: "bg-red-400",    actionable: true,  undoable: false, revisable: false },
  idea_approved:    { label: "Idea Approved",      color: "text-green-400 bg-green-500/10 border-green-500/20",    dot: "bg-green-400",  actionable: false, undoable: true,  revisable: true  },
  in_production:    { label: "In Production",      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",       dot: "bg-blue-400",   actionable: false, undoable: false, revisable: false },
  ready_for_review: { label: "Ready for Review",   color: "text-purple-400 bg-purple-500/10 border-purple-500/20", dot: "bg-purple-400", actionable: true,  undoable: false, revisable: false },
  client_approved:  { label: "Approved ✓",         color: "text-green-400 bg-green-500/10 border-green-500/20",    dot: "bg-green-400",  actionable: false, undoable: true,  revisable: true  },
  posted:           { label: "Live",               color: "text-teal-400 bg-teal-500/10 border-teal-500/20",       dot: "bg-teal-400",   actionable: false, undoable: false, revisable: false },
};

function fmtMonth(ym: string) {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-AE", { month: "long", year: "numeric" });
}

function drivePreview(url: string): string | null {
  const m = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  return m ? `https://drive.google.com/file/d/${m[1]}/preview` : null;
}

function parseTs(str: string): number | null {
  const parts = str.split(":").map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return parts[0] * 60 + parts[1];
  if (parts.length === 1 && !isNaN(parts[0])) return parts[0];
  return null;
}

function fmtTs(s: number | null): string {
  if (s == null) return "";
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// ── Video Detail Modal ────────────────────────────────────────────────────────
function VideoModal({ video, onClose, onUpdated }: {
  video: Video; onClose: () => void; onUpdated: (v: Video) => void;
}) {
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [sending, setSending] = useState(false);
  const [approving, setApproving] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revNote, setRevNote] = useState("");
  const [copied, setCopied] = useState(false);

  const cfg = STATUS_CFG[video.status];
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
        body: JSON.stringify({ comment_text: commentText.trim(), timestamp_seconds: parseTs(timestamp) }),
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

  const callApproveAction = async (action: "approve" | "revise" | "undo", note?: string) => {
    setApproving(true);
    try {
      const res = await fetch(`/api/portal/v2/videos/${video.id}/approve`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note }),
      });
      if (res.ok) { const { video: v } = await res.json(); onUpdated(v); onClose(); }
    } finally {
      setApproving(false);
    }
  };

  const handleApprove = () => callApproveAction("approve");
  const handleUndo = () => callApproveAction("undo");
  const handleRevise = async () => {
    if (!revNote.trim()) return;
    await callApproveAction("revise", revNote);
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
              <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-medium ${cfg.color}`}>
                {cfg.label}
              </span>
              <span className="text-[#444] text-xs">{video.type} #{video.number}</span>
            </div>
            <h2 className="text-white font-bold text-lg leading-snug">{video.title}</h2>
          </div>
          <button onClick={onClose} className="text-[#444] hover:text-white transition-colors flex-shrink-0 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* ── Action area ── */}

          {/* Awaiting approval / ready for review: Approve + Request Revision */}
          {(video.status === "idea_pending" || video.status === "ready_for_review") && !revisionOpen && (
            <div className="p-6 border-b border-[#1a1a1a] flex gap-3">
              <button onClick={handleApprove} disabled={approving}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl text-sm transition-colors">
                {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {video.status === "idea_pending" ? "Approve Idea" : "Approve Video"}
              </button>
              <button onClick={() => setRevisionOpen(true)} disabled={approving}
                className="flex items-center justify-center gap-2 border border-[#2a2a2a] hover:border-[#444] text-[#888] hover:text-white font-medium py-3 px-5 rounded-xl text-sm transition-colors">
                <RotateCcw className="w-4 h-4" />Request Revision
              </button>
            </div>
          )}

          {/* Revision requested: show note + option to approve or change note */}
          {video.status === "idea_revision" && !revisionOpen && (
            <div className="p-6 border-b border-[#1a1a1a] space-y-3">
              {video.client_note && (
                <div className="bg-red-500/8 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-400 text-xs font-semibold uppercase tracking-wide mb-1">Your revision request</p>
                  <p className="text-[#ccc] text-sm leading-relaxed">{video.client_note}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={handleApprove} disabled={approving}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-2.5 rounded-xl text-sm transition-colors">
                  {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Actually, approve it
                </button>
                <button onClick={() => setRevisionOpen(true)} disabled={approving}
                  className="flex items-center gap-2 border border-[#2a2a2a] hover:border-[#444] text-[#888] hover:text-white px-4 py-2.5 rounded-xl text-sm transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" />Edit request
                </button>
              </div>
            </div>
          )}

          {/* Already approved: undo or request revision */}
          {(video.status === "idea_approved" || video.status === "client_approved") && !revisionOpen && (
            <div className="p-6 border-b border-[#1a1a1a]">
              <div className="flex items-center gap-2 mb-3">
                <BadgeCheck className="w-4 h-4 text-green-400" />
                <p className="text-green-400 text-sm font-semibold">
                  {video.status === "idea_approved" ? "You approved this idea." : "You approved this video."}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleUndo} disabled={approving}
                  className="flex items-center gap-2 border border-[#2a2a2a] hover:border-[#444] text-[#666] hover:text-white text-sm px-4 py-2 rounded-xl transition-colors">
                  {approving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  Undo approval
                </button>
                <button onClick={() => setRevisionOpen(true)} disabled={approving}
                  className="flex items-center gap-2 border border-[#2a2a2a] hover:border-red-500/40 text-[#666] hover:text-red-400 text-sm px-4 py-2 rounded-xl transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" />Request a revision
                </button>
              </div>
            </div>
          )}

          {/* Revision form (shared) */}
          {revisionOpen && (
            <div className="p-6 border-b border-[#1a1a1a] space-y-3">
              <p className="text-white text-sm font-semibold">What would you like changed?</p>
              <textarea value={revNote} onChange={e => setRevNote(e.target.value)}
                placeholder="Describe the change you need…" rows={3} autoFocus
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#444] focus:border-[#444] outline-none resize-none" />
              <div className="flex gap-2">
                <button onClick={handleRevise} disabled={!revNote.trim() || approving}
                  className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 hover:border-red-500/40 disabled:opacity-40 text-red-400 font-medium py-2.5 px-5 rounded-xl text-sm transition-all">
                  {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  Send Revision Request
                </button>
                <button onClick={() => setRevisionOpen(false)} className="px-4 text-[#555] hover:text-white text-sm transition-colors">Cancel</button>
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
                  <span className="flex-1 text-sm font-medium">Watch Video</span>
                  <ExternalLink className="w-4 h-4 text-[#555] group-hover:text-white transition-colors" />
                </a>
              )}
            </div>
          )}

          {/* Posted link */}
          {video.status === "posted" && video.posted_url && (
            <div className="px-6 pt-5">
              <a href={video.posted_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-teal-500/5 border border-teal-500/15 hover:border-teal-500/30 rounded-xl px-5 py-4 text-teal-400 transition-colors">
                <Star className="w-5 h-5" />
                <span className="flex-1 text-sm font-medium">View Live Post</span>
                <ExternalLink className="w-4 h-4" />
              </a>
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
                  <div key={c.id} className="bg-[#1a1a1a] border border-[#222] rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white text-xs font-semibold">{(c.user_email || "Client").split("@")[0]}</span>
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
                placeholder="Leave a comment…"
                className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#444] focus:border-[#444] outline-none" />
              <button onClick={() => void submitComment()} disabled={!commentText.trim() || sending}
                className="p-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-[#555] hover:text-white disabled:opacity-40 transition-colors flex-shrink-0">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[#333] text-xs mt-2">Optional: type a timestamp like 0:23 to pin your comment to that moment.</p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Video Row ─────────────────────────────────────────────────────────────────
function VideoRow({ video, onOpen, onApprove, onRevise }: {
  video: Video; onOpen: () => void; onApprove: () => Promise<void>; onRevise: () => void;
}) {
  const cfg = STATUS_CFG[video.status];
  const [approving, setApproving] = useState(false);

  const approve = async () => {
    setApproving(true);
    await onApprove();
    setApproving(false);
  };

  return (
    <div className={`flex items-center gap-4 px-5 py-4 border-b border-[#141414] last:border-0 hover:bg-[#141414] transition-colors`}>
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onOpen}>
        <p className="text-white text-sm font-medium truncate">{video.title}</p>
        <p className="text-[#555] text-xs mt-0.5">{video.type} · {fmtMonth(video.month)}</p>
      </div>
      <span className={`hidden sm:inline-flex text-xs px-2.5 py-1 rounded-full border font-medium flex-shrink-0 ${cfg.color}`}>
        {cfg.label}
      </span>
      {cfg.actionable && video.status !== "idea_revision" ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={approve} disabled={approving}
            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold px-3 py-1.5 rounded-lg text-xs transition-colors">
            {approving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            Approve
          </button>
          <button onClick={onRevise}
            className="p-1.5 text-[#444] hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/5">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : cfg.undoable ? (
        <button onClick={onOpen}
          className="text-xs text-[#444] hover:text-white border border-[#222] hover:border-[#444] px-3 py-1.5 rounded-lg transition-all flex-shrink-0">
          Change
        </button>
      ) : (
        <button onClick={onOpen} className="text-[#444] hover:text-white transition-colors flex-shrink-0 p-1.5">
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ContentPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : Array.isArray(params.slug) ? params.slug[0] : "";
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [modalVideo, setModalVideo] = useState<Video | null>(null);
  const [reviseTarget, setReviseTarget] = useState<Video | null>(null);
  const [revNote, setRevNote] = useState("");
  const [revSending, setRevSending] = useState(false);

  const load = useCallback(async () => {
    if (!slug) return;
    const r = await fetch(`/api/portal/v2/videos?slug=${slug}`);
    const data: Video[] = r.ok ? await r.json() : [];
    setVideos(data);
    setLoading(false);
  }, [slug]);

  useEffect(() => { void load(); }, [load]);
  useRefreshOnFocus(load);

  const updateVideo = (updated: Video) => {
    setVideos(prev => prev.map(v => v.id === updated.id ? updated : v));
    if (modalVideo?.id === updated.id) setModalVideo(updated);
  };

  const handleApprove = async (video: Video) => {
    const res = await fetch(`/api/portal/v2/videos/${video.id}/approve`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    if (res.ok) { const { video: v } = await res.json(); updateVideo(v); }
  };

  const handleRevise = async () => {
    if (!reviseTarget || !revNote.trim()) return;
    setRevSending(true);
    const res = await fetch(`/api/portal/v2/videos/${reviseTarget.id}/approve`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "revise", note: revNote }),
    });
    if (res.ok) { const { video: v } = await res.json(); updateVideo(v); }
    setReviseTarget(null); setRevNote(""); setRevSending(false);
  };

  const allMonths = Array.from(new Set(videos.map(v => v.month).filter(Boolean))).sort().reverse();
  const effectiveMonth = selectedMonth && allMonths.includes(selectedMonth) ? selectedMonth : (allMonths[0] ?? "");
  const monthVideos = videos.filter(v => v.month === effectiveMonth);
  const actionable = monthVideos.filter(v => STATUS_CFG[v.status].actionable);
  const rest = monthVideos.filter(v => !STATUS_CFG[v.status].actionable);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-[#333] animate-spin" /></div>;

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-white text-2xl font-bold">Content</h1>
        <p className="text-[#555] text-sm mt-1">Review and approve your videos for this month.</p>
      </div>

      {/* Month tabs */}
      {allMonths.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allMonths.map(m => (
            <button key={m} onClick={() => setSelectedMonth(m)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                m === effectiveMonth
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-[#111] border-[#1e1e1e] text-[#666] hover:text-white"
              }`}>{fmtMonth(m)}</button>
          ))}
        </div>
      )}

      {/* Needs action */}
      {actionable.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <p className="text-white text-sm font-semibold">Needs Your Approval</p>
            <span className="w-5 h-5 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center">{actionable.length}</span>
          </div>
          <div className="bg-[#111] border border-amber-500/20 rounded-2xl overflow-hidden">
            {actionable.map(v => (
              <VideoRow key={v.id} video={v}
                onOpen={() => setModalVideo(v)}
                onApprove={() => handleApprove(v)}
                onRevise={() => { setReviseTarget(v); setRevNote(""); }}
              />
            ))}
          </div>
        </div>
      )}

      {/* All other videos */}
      {rest.length > 0 && (
        <div>
          <p className="text-[#555] text-xs uppercase tracking-wide font-semibold mb-3">All Content — {fmtMonth(effectiveMonth)}</p>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
            {rest.map(v => (
              <VideoRow key={v.id} video={v}
                onOpen={() => setModalVideo(v)}
                onApprove={() => handleApprove(v)}
                onRevise={() => { setReviseTarget(v); setRevNote(""); }}
              />
            ))}
          </div>
        </div>
      )}

      {monthVideos.length === 0 && (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-16 text-center">
          <PlayCircle className="w-10 h-10 text-[#2a2a2a] mx-auto mb-3" />
          <p className="text-[#555] text-sm">No videos for this month yet.</p>
        </div>
      )}

      {/* Video detail modal */}
      {modalVideo && (
        <VideoModal video={modalVideo} onClose={() => setModalVideo(null)} onUpdated={updateVideo} />
      )}

      {/* Revision modal */}
      {reviseTarget && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setReviseTarget(null)} />
          <div className="relative z-10 w-full max-w-md bg-[#111] border border-[#222] rounded-2xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div>
              <p className="text-white font-bold text-base">Request a Revision</p>
              <p className="text-[#555] text-sm mt-0.5 truncate">{reviseTarget.title}</p>
            </div>
            <textarea value={revNote} onChange={e => setRevNote(e.target.value)}
              placeholder="Describe what you'd like changed…" rows={4} autoFocus
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#444] focus:border-[#444] outline-none resize-none" />
            <div className="flex gap-3">
              <button onClick={handleRevise} disabled={!revNote.trim() || revSending}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/25 hover:border-red-500/40 disabled:opacity-40 text-red-400 font-semibold py-3 rounded-xl text-sm transition-all">
                {revSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                Send Revision Request
              </button>
              <button onClick={() => setReviseTarget(null)} className="px-5 text-[#555] hover:text-white text-sm transition-colors">Cancel</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
