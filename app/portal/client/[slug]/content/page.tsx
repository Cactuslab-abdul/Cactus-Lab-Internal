"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  PlayCircle, CheckCircle2, AlertCircle, Clock, Star, RotateCcw,
  Check, X, ExternalLink, BadgeCheck,
  Loader2, Copy, Send, MessageSquare
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

const STATUS_CFG: Record<VideoStatus, { label: string; color: string; icon: React.ReactNode; actionable: boolean }> = {
  idea_pending:     { label: "Awaiting Approval", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: <AlertCircle className="w-3.5 h-3.5" />, actionable: true },
  idea_revision:    { label: "Revision Requested", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: <RotateCcw className="w-3.5 h-3.5" />, actionable: false },
  idea_approved:    { label: "Idea Approved", color: "bg-green-500/10 text-green-400 border-green-500/20", icon: <CheckCircle2 className="w-3.5 h-3.5" />, actionable: false },
  in_production:    { label: "In Production", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: <Clock className="w-3.5 h-3.5" />, actionable: false },
  ready_for_review: { label: "Ready for Review", color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: <PlayCircle className="w-3.5 h-3.5" />, actionable: true },
  client_approved:  { label: "Approved", color: "bg-green-500/10 text-green-400 border-green-500/20", icon: <BadgeCheck className="w-3.5 h-3.5" />, actionable: false },
  posted:           { label: "Live", color: "bg-teal-500/10 text-teal-400 border-teal-500/20", icon: <Star className="w-3.5 h-3.5" />, actionable: false },
};

function drivePreview(url: string): string|null {
  const m = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  return m ? `https://drive.google.com/file/d/${m[1]}/preview` : null;
}

function fmtTs(s: number|null): string {
  if (s == null) return "";
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function parseTs(str: string): number|null {
  const parts = str.split(":").map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return parts[0] * 60 + parts[1];
  if (parts.length === 1 && !isNaN(parts[0])) return parts[0];
  return null;
}

function VideoDrawer({ video, onClose, onUpdated }: {
  video: Video; onClose: () => void; onUpdated: (v: Video) => void;
}) {
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [approving, setApproving] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revNote, setRevNote] = useState("");
  const [error, setError] = useState<string|null>(null);
  const [copied, setCopied] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const cfg = STATUS_CFG[video.status];
  const preview = video.stream_url ? drivePreview(video.stream_url) : null;

  useEffect(() => {
    fetch(`/api/portal/v2/videos/${video.id}/comments`)
      .then(r => r.ok ? r.json() : [])
      .then(setComments);
  }, [video.id]);

  const submitComment = async () => {
    if (!commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    const res = await fetch(`/api/portal/v2/videos/${video.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment_text: commentText.trim(), timestamp_seconds: parseTs(timestamp) }),
    });
    if (res.ok) {
      const c = await res.json();
      setComments(prev => [...prev, c]);
      setCommentText(""); setTimestamp("");
    }
    setSubmittingComment(false);
  };

  const handleApprove = async () => {
    setApproving(true); setError(null);
    const res = await fetch(`/api/portal/v2/videos/${video.id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    if (res.ok) { const { video: v } = await res.json(); onUpdated(v); onClose(); }
    else { const e = await res.json(); setError(e.error); }
    setApproving(false);
  };

  const handleRevise = async () => {
    if (!revNote.trim()) return;
    setApproving(true); setError(null);
    const res = await fetch(`/api/portal/v2/videos/${video.id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "revise", note: revNote }),
    });
    if (res.ok) { const { video: v } = await res.json(); onUpdated(v); onClose(); }
    else { const e = await res.json(); setError(e.error); }
    setApproving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/60 backdrop-blur-sm" />
      <div
        ref={drawerRef}
        className="w-full max-w-xl bg-[#0f0f0f] border-l border-[#1e1e1e] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-[#1a1a1a]">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[#555] text-xs">#{video.number}</span>
              <span className="text-[#555] text-xs">{video.type}</span>
            </div>
            <h2 className="text-white font-semibold text-base leading-tight">{video.title}</h2>
            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium mt-2 ${cfg.color}`}>
              {cfg.icon}{cfg.label}
            </span>
          </div>
          <button onClick={onClose} className="text-[#444] hover:text-white transition-colors flex-shrink-0 mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Video player */}
          {video.stream_url && (
            <div className="p-5 border-b border-[#1a1a1a]">
              {preview ? (
                <div className="rounded-xl overflow-hidden bg-black border border-[#2a2a2a] max-w-xs mx-auto">
                  <iframe src={preview} className="w-full aspect-[9/16]" allow="autoplay; fullscreen" allowFullScreen />
                </div>
              ) : (
                <a href={video.stream_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-purple-500/5 border border-purple-500/15 rounded-xl px-4 py-3 text-purple-400 hover:text-purple-300 text-sm transition-colors">
                  <PlayCircle className="w-4 h-4" />Watch video<ExternalLink className="w-3.5 h-3.5 ml-auto" />
                </a>
              )}
              {video.stream_url && (
                <a href={video.stream_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#555] hover:text-white text-xs mt-2 transition-colors">
                  <ExternalLink className="w-3 h-3" />Open in new tab
                </a>
              )}
            </div>
          )}

          {/* Caption */}
          {video.caption && (
            <div className="p-5 border-b border-[#1a1a1a]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[#555] text-xs uppercase tracking-wide font-medium">Caption</p>
                <button onClick={async () => {
                  await navigator.clipboard.writeText(video.caption!);
                  setCopied(true); setTimeout(() => setCopied(false), 1500);
                }} className="flex items-center gap-1 text-[#555] hover:text-white text-xs transition-colors">
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-[#ccc] text-sm whitespace-pre-wrap leading-relaxed">
                {video.caption}
              </div>
            </div>
          )}

          {/* Client's revision note */}
          {video.status === "idea_revision" && video.client_note && (
            <div className="p-5 border-b border-[#1a1a1a]">
              <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4">
                <p className="text-red-400 text-xs font-medium mb-1">Your revision request</p>
                <p className="text-[#ccc] text-sm">{video.client_note}</p>
              </div>
            </div>
          )}

          {/* Posted link */}
          {video.status === "posted" && video.posted_url && (
            <div className="p-5 border-b border-[#1a1a1a]">
              <a href={video.posted_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-teal-500/5 border border-teal-500/15 rounded-xl px-4 py-3 text-teal-400 hover:text-teal-300 text-sm transition-colors">
                <ExternalLink className="w-4 h-4" />View live post<ExternalLink className="w-3.5 h-3.5 ml-auto" />
              </a>
            </div>
          )}

          {/* Comments */}
          <div className="p-5">
            <p className="text-[#555] text-xs uppercase tracking-wide font-medium mb-3 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" />Comments ({comments.length})
            </p>

            {comments.length > 0 && (
              <div className="space-y-3 mb-4">
                {comments.map(c => (
                  <div key={c.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[#888] text-xs font-medium">{(c.user_email || "Client").split("@")[0]}</span>
                      {c.timestamp_seconds != null && (
                        <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono">
                          {fmtTs(c.timestamp_seconds)}
                        </span>
                      )}
                      <span className="text-[#444] text-xs ml-auto">{new Date(c.created_at).toLocaleDateString("en-AE", { day: "numeric", month: "short" })}</span>
                    </div>
                    <p className="text-[#ccc] text-sm leading-relaxed">{c.comment_text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  value={timestamp}
                  onChange={e => setTimestamp(e.target.value)}
                  placeholder="0:23"
                  className="w-20 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#444] focus:border-[#444] outline-none font-mono"
                />
                <input
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(); } }}
                  placeholder="Add a comment…"
                  className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#444] focus:border-[#444] outline-none"
                />
                <button
                  onClick={submitComment}
                  disabled={!commentText.trim() || submittingComment}
                  className="p-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-[#555] hover:text-white disabled:opacity-40 transition-colors"
                >
                  {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[#444] text-xs">Optional: type timestamp like 0:23 to pin a comment to that moment</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {cfg.actionable && (
          <div className="p-5 border-t border-[#1a1a1a] space-y-2">
            {error && <p className="text-red-400 text-xs">{error}</p>}
            {!revisionOpen ? (
              <div className="flex gap-2">
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/25 hover:bg-green-500/15 disabled:opacity-50 text-green-400 font-semibold py-3 rounded-xl text-sm transition-all"
                >
                  {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {video.status === "idea_pending" ? "Approve Idea" : "Approve Video"}
                </button>
                <button
                  onClick={() => setRevisionOpen(true)}
                  disabled={approving}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#333] disabled:opacity-50 text-[#888] hover:text-white font-medium py-3 rounded-xl text-sm transition-all"
                >
                  <RotateCcw className="w-4 h-4" />Request Revision
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={revNote}
                  onChange={e => setRevNote(e.target.value)}
                  placeholder="Describe what you'd like changed…"
                  rows={3}
                  autoFocus
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#444] focus:border-[#444] outline-none resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleRevise}
                    disabled={!revNote.trim() || approving}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/25 hover:border-red-500/40 disabled:opacity-40 text-red-400 font-medium py-2.5 rounded-xl text-sm transition-all"
                  >
                    {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                    Send Revision
                  </button>
                  <button onClick={() => setRevisionOpen(false)} className="px-4 text-[#555] hover:text-white text-sm transition-colors">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContentPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : Array.isArray(params.slug) ? params.slug[0] : "";
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [drawerVideo, setDrawerVideo] = useState<Video|null>(null);

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
    if (drawerVideo?.id === updated.id) setDrawerVideo(updated);
  };

  const allMonths = Array.from(new Set(videos.map(v => v.month).filter(Boolean))).sort().reverse();
  const effectiveMonth = selectedMonth && allMonths.includes(selectedMonth) ? selectedMonth : (allMonths[0] ?? "");
  const monthVideos = videos.filter(v => v.month === effectiveMonth);
  const pending = monthVideos.filter(v => STATUS_CFG[v.status].actionable);
  const rest = monthVideos.filter(v => !STATUS_CFG[v.status].actionable);

  function fmtMonth(ym: string) {
    if (!ym) return "";
    const [y, m] = ym.split("-");
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-AE", { month: "long", year: "numeric" });
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-[#333] animate-spin" /></div>;

  return (
    <div className="space-y-5 fade-in">
      <div>
        <h1 className="text-white text-2xl font-bold">Content</h1>
        <p className="text-[#555] text-sm mt-1">Review and approve your videos.</p>
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
              }`}
            >{fmtMonth(m)}</button>
          ))}
        </div>
      )}

      {/* Pending approval */}
      {pending.length > 0 && (
        <div>
          <p className="text-[#555] text-xs uppercase tracking-wide font-medium mb-3 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />Needs Your Approval
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pending.map(v => <VideoCard key={v.id} video={v} onOpen={() => setDrawerVideo(v)} />)}
          </div>
        </div>
      )}

      {/* All other videos */}
      {rest.length > 0 && (
        <div>
          {pending.length > 0 && <p className="text-[#555] text-xs uppercase tracking-wide font-medium mb-3">All Content</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rest.map(v => <VideoCard key={v.id} video={v} onOpen={() => setDrawerVideo(v)} />)}
          </div>
        </div>
      )}

      {monthVideos.length === 0 && (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-16 text-center">
          <PlayCircle className="w-10 h-10 text-[#2a2a2a] mx-auto mb-3" />
          <p className="text-[#555] text-sm">No videos for this month yet.</p>
        </div>
      )}

      {drawerVideo && (
        <VideoDrawer video={drawerVideo} onClose={() => setDrawerVideo(null)} onUpdated={updateVideo} />
      )}
    </div>
  );
}

function VideoCard({ video, onOpen }: { video: Video; onOpen: () => void }) {
  const cfg = STATUS_CFG[video.status];
  return (
    <button
      onClick={onOpen}
      className={`w-full text-left bg-[#111] border rounded-2xl p-4 hover:border-[#2a2a2a] transition-all group ${
        cfg.actionable ? "border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.04)]" : "border-[#1e1e1e]"
      }`}
    >
      {/* Thumbnail placeholder */}
      <div className="w-full aspect-video bg-[#1a1a1a] rounded-xl mb-3 overflow-hidden flex items-center justify-center">
        {video.thumbnail_url ? (
          <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <PlayCircle className="w-8 h-8 text-[#333] group-hover:text-[#444] transition-colors" />
        )}
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-white text-sm font-medium truncate">{video.title}</p>
          <p className="text-[#555] text-xs mt-0.5">{video.type}</p>
        </div>
        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${cfg.color}`}>
          {cfg.icon}{cfg.label}
        </span>
      </div>
    </button>
  );
}
