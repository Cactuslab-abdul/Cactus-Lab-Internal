"use client";

import { useState } from "react";
import {
  CheckSquare,
  CheckCircle2,
  Circle,
  RotateCcw,
  AlertTriangle,
  Video,
  Type,
  MessageSquare,
  Share2,
  Clock,
  Smartphone,
  Hash,
  Eye,
} from "lucide-react";

interface CheckItem {
  id: string;
  label: string;
  description: string;
  critical: boolean;
}

interface CheckSection {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  items: CheckItem[];
}

const QC_CHECKLIST: CheckSection[] = [
  {
    id: "hook",
    title: "Hook & First 3 Seconds",
    icon: Video,
    color: "text-red-400",
    items: [
      { id: "hook-visual", label: "Strong visual hook in frame 1", description: "First frame is eye-catching — no black screen, no slow zoom", critical: true },
      { id: "hook-text", label: "Hook text appears within 1.5 seconds", description: "On-screen text or spoken words that stop the scroll", critical: true },
      { id: "hook-bold", label: "Hook is bold/controversial/surprising", description: "Makes viewer think 'I need to know more' — no weak intros", critical: true },
      { id: "hook-nosound", label: "Works without sound for first 3s", description: "85% of Instagram users watch on mute. Visual must tell the story.", critical: false },
    ],
  },
  {
    id: "technical",
    title: "Technical Quality",
    icon: Smartphone,
    color: "text-blue-400",
    items: [
      { id: "tech-ratio", label: "Aspect ratio is 9:16 vertical", description: "Full vertical format — no horizontal bars. 1080x1920px minimum.", critical: true },
      { id: "tech-hd", label: "Video is HD quality (1080p minimum)", description: "No pixelation, no compression artefacts, crisp and clean", critical: true },
      { id: "tech-audio", label: "Audio is clear, no background noise", description: "Voice is audible and clean. Music level is lower than voiceover.", critical: true },
      { id: "tech-lighting", label: "Lighting is adequate and even", description: "Subject is well-lit. No harsh shadows on face if person appears.", critical: false },
      { id: "tech-stable", label: "Footage is stable (no shaking)", description: "Tripod or gimbal used. Smooth transitions.", critical: false },
    ],
  },
  {
    id: "captions",
    title: "Captions & Text",
    icon: Type,
    color: "text-purple-400",
    items: [
      { id: "cap-accurate", label: "Subtitles/captions are accurate", description: "Every word matches what's spoken. No typos or auto-caption errors.", critical: true },
      { id: "cap-readable", label: "Text is readable on mobile (min 36pt)", description: "Font size large enough to read on a small screen without zooming", critical: true },
      { id: "cap-contrast", label: "Text has contrast against background", description: "White text on dark stroke, or bold outline — never invisible text", critical: true },
      { id: "cap-brand", label: "Brand name/handle is visible once", description: "@handle or logo appears at some point — but not obtrusive", critical: false },
    ],
  },
  {
    id: "content",
    title: "Content Structure",
    icon: Eye,
    color: "text-green-400",
    items: [
      { id: "cnt-value", label: "Clear value delivered (teach/entertain/inspire)", description: "Viewer gets something by watching. Not just promotional filler.", critical: true },
      { id: "cnt-pacing", label: "Pacing is fast — cut every 2-3 seconds", description: "No long boring holds. Keep it moving. Attention dies at 3 seconds.", critical: true },
      { id: "cnt-duration", label: "Duration matches platform sweet spot", description: "Reels: 15-30s gets max reach. 60s max. Never over 90 seconds.", critical: false },
      { id: "cnt-complete", label: "Story is complete — no abrupt ending", description: "Video has a beginning, middle, and end. Viewer feels satisfied.", critical: false },
    ],
  },
  {
    id: "cta",
    title: "Call to Action",
    icon: MessageSquare,
    color: "text-orange-400",
    items: [
      { id: "cta-clear", label: "CTA is clear and specific", description: "Tell them exactly what to do: 'Follow for more', 'DM us X', 'Link in bio'", critical: true },
      { id: "cta-comment", label: "Comment bait is present", description: "Question, poll, or controversial statement that invites responses", critical: false },
      { id: "cta-save", label: "Save/share trigger present", description: "Content is educational or funny enough to save or send to a friend", critical: false },
    ],
  },
  {
    id: "publishing",
    title: "Caption & Publishing",
    icon: Share2,
    color: "text-teal-400",
    items: [
      { id: "pub-caption", label: "Caption is complete (100+ words)", description: "First line is a strong hook. Includes relevant emojis and line breaks.", critical: true },
      { id: "pub-hashtags", label: "20-30 relevant hashtags added", description: "Mix of large (1M+), medium (100K-1M), and niche (<100K) hashtags", critical: true },
      { id: "pub-location", label: "Location tag added (Dubai/UAE)", description: "Adds local reach and discovery. Always tag Dubai or Abu Dhabi.", critical: false },
      { id: "pub-cover", label: "Cover/thumbnail is compelling", description: "Thumbnail frame shows the most interesting visual. Not a talking head.", critical: false },
      { id: "pub-time", label: "Posting at optimal UAE time", description: "Best: 8-10 PM UAE time (GST). Second best: 7-9 AM. Avoid 2-5 PM.", critical: false },
      { id: "pub-audio", label: "Trending audio attached (if applicable)", description: "Using trending audio multiplies reach 3-5x on Instagram", critical: false },
    ],
  },
];

type CheckState = Record<string, boolean>;

function getScore(checked: CheckState): { score: number; critical: number; total: number; criticalFailed: string[] } {
  let totalItems = 0;
  let checkedItems = 0;
  let criticalItems = 0;
  let criticalChecked = 0;
  const criticalFailed: string[] = [];

  QC_CHECKLIST.forEach((section) => {
    section.items.forEach((item) => {
      totalItems++;
      if (checked[item.id]) checkedItems++;
      if (item.critical) {
        criticalItems++;
        if (checked[item.id]) criticalChecked++;
        else criticalFailed.push(item.label);
      }
    });
  });

  return {
    score: Math.round((checkedItems / totalItems) * 100),
    critical: Math.round((criticalChecked / criticalItems) * 100),
    total: totalItems,
    criticalFailed,
  };
}

export default function QCPage() {
  const [checked, setChecked] = useState<CheckState>({});
  const [videoTitle, setVideoTitle] = useState("");

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const reset = () => {
    setChecked({});
    setVideoTitle("");
  };

  const { score, critical, criticalFailed } = getScore(checked);

  const scoreColor = score >= 80 ? "text-green-400" : score >= 60 ? "text-yellow-400" : "text-red-400";
  const scoreBorder = score >= 80 ? "border-green-500/30" : score >= 60 ? "border-yellow-500/30" : "border-red-500/30";
  const scoreBg = score >= 80 ? "bg-green-500/5" : score >= 60 ? "bg-yellow-500/5" : "bg-red-500/5";

  const totalChecked = Object.values(checked).filter(Boolean).length;
  const totalItems = QC_CHECKLIST.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-2">
            <CheckSquare className="w-4 h-4" />
            QC Checklist
          </div>
          <h1 className="text-white text-2xl font-bold">Pre-Publish QC Checklist</h1>
          <p className="text-[#666] mt-1">
            Run every video through this before publishing. Don&apos;t skip critical items.
          </p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-[#888] hover:text-white px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Video title input */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5">
        <label className="block text-[#888] text-xs font-medium mb-2 uppercase tracking-wide">Video Being Checked</label>
        <input
          value={videoTitle}
          onChange={(e) => setVideoTitle(e.target.value)}
          placeholder="e.g. Pets Delight — Dog food unboxing — May 15"
          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#444] focus:border-green-500/50 transition-colors"
        />
      </div>

      {/* Score card */}
      <div className={`${scoreBg} border ${scoreBorder} rounded-2xl p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#666] text-sm mb-1">Overall QC Score</p>
            <div className={`text-5xl font-bold ${scoreColor}`}>{score}<span className="text-2xl text-[#555]">%</span></div>
            <p className="text-[#555] text-xs mt-1">{totalChecked}/{totalItems} items checked</p>
          </div>
          <div className="text-right">
            <p className="text-[#666] text-sm mb-1">Critical Items</p>
            <div className={`text-3xl font-bold ${critical === 100 ? "text-green-400" : "text-red-400"}`}>{critical}%</div>
            <p className={`text-xs mt-1 ${critical === 100 ? "text-green-400/70" : "text-red-400/70"}`}>
              {critical === 100 ? "All critical checks passed" : `${criticalFailed.length} critical item${criticalFailed.length !== 1 ? "s" : ""} failed`}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Failed critical items */}
        {criticalFailed.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm font-medium">Critical items not yet checked:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {criticalFailed.map((label) => (
                <span key={label} className="bg-red-900/20 border border-red-500/20 text-red-400 text-xs px-2.5 py-1 rounded-lg">
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {score === 100 && (
          <div className="mt-4 pt-4 border-t border-green-500/20">
            <p className="text-green-400 font-semibold text-sm">All checks passed. This video is ready to publish.</p>
          </div>
        )}
      </div>

      {/* Checklist sections */}
      <div className="space-y-5">
        {QC_CHECKLIST.map((section) => {
          const Icon = section.icon;
          const sectionChecked = section.items.filter((item) => checked[item.id]).length;
          return (
            <div key={section.id} className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-2">
                    <Icon className={`w-4 h-4 ${section.color}`} />
                  </div>
                  <h2 className="text-white font-semibold">{section.title}</h2>
                </div>
                <span className="text-[#555] text-sm">{sectionChecked}/{section.items.length}</span>
              </div>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-150 ${
                      checked[item.id]
                        ? "bg-green-500/5 border-green-500/20"
                        : item.critical
                        ? "bg-[#1a1a1a] border-[#252525] hover:border-red-500/20"
                        : "bg-[#1a1a1a] border-[#252525] hover:border-[#333]"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {checked[item.id] ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <Circle className={`w-4 h-4 ${item.critical ? "text-red-400/50" : "text-[#444]"}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-medium ${checked[item.id] ? "text-[#555] line-through" : "text-white"}`}>
                          {item.label}
                        </span>
                        {item.critical && !checked[item.id] && (
                          <span className="text-xs bg-red-900/20 border border-red-500/20 text-red-400 px-1.5 py-0.5 rounded-md">
                            Critical
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 leading-relaxed ${checked[item.id] ? "text-[#444]" : "text-[#666]"}`}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick reference card */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-teal-400" />
          <h3 className="text-white font-semibold">UAE Posting Time Quick Reference</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { time: "8:00 – 10:00 PM GST", label: "Peak Time", detail: "Highest engagement — after dinner, before sleep", color: "border-green-500/25 bg-green-500/5 text-green-400" },
            { time: "7:00 – 9:00 AM GST", label: "Morning Slot", detail: "People commuting / morning scroll", color: "border-blue-500/25 bg-blue-500/5 text-blue-400" },
            { time: "12:00 – 1:00 PM GST", label: "Lunch Window", detail: "Moderate reach, worth using", color: "border-yellow-500/25 bg-yellow-500/5 text-yellow-400" },
          ].map((slot) => (
            <div key={slot.time} className={`border rounded-xl p-4 ${slot.color.split(" ").slice(0, 2).join(" ")}`}>
              <div className={`font-bold text-sm mb-1 ${slot.color.split(" ")[2]}`}>{slot.time}</div>
              <div className="text-white font-medium text-xs mb-1">{slot.label}</div>
              <div className="text-[#666] text-xs">{slot.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
