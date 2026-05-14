"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Wand2,
  Copy,
  Check,
  Save,
  Loader2,
  Hash,
  Clock,
  Camera,
  Zap,
  FileText,
  MessageSquare,
  Star,
} from "lucide-react";

const niches = [
  "Pets Delight (Pet Products)",
  "Perfume & Watches",
  "Cars & Automotive",
  "Recruitment & HR",
  "Food & Spices",
  "Cactus Lab Brand",
];

const goals = [
  "Grow Followers",
  "Boost Engagement",
  "Generate Leads",
  "Brand Awareness",
];

const formats = ["Instagram Reel", "TikTok", "YouTube Short"];
const durations = ["15 seconds", "30 seconds", "60 seconds"];
const tones = ["Trendy & Fun", "Professional", "Educational", "Emotional"];
const contentTypes = [
  { id: "educational", label: "Educational", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/40" },
  { id: "comedic", label: "Comedic", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/40" },
  { id: "brand_story", label: "Brand Story", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/40" },
  { id: "testimonial", label: "Testimonial", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/40" },
];

interface ContentPack {
  hook: string;
  script: string;
  caption: string;
  hashtags: string[];
  thumbnailIdea: string;
  bestTimeToPost: string;
  whyItWorks: string;
}

function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#2a2a2a] hover:bg-[#333] border border-[#333] text-[#888] hover:text-white transition-all ${className}`}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function GeneratePageInner() {
  const searchParams = useSearchParams();
  const [niche, setNiche] = useState(niches[0]);
  const [goal, setGoal] = useState(goals[0]);
  const [format, setFormat] = useState(formats[0]);
  const [duration, setDuration] = useState(durations[1]);
  const [tone, setTone] = useState(tones[0]);
  const [contentType, setContentType] = useState(contentTypes[0].id);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<ContentPack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const loadingMessages = [
    "Writing your script...",
    "Crafting the perfect hook...",
    "Building your caption...",
    "Selecting viral hashtags...",
    "Adding UAE market insights...",
    "Finalizing your content pack...",
  ];

  useEffect(() => {
    const topicParam = searchParams.get("topic");
    const nicheParam = searchParams.get("niche");
    const formatParam = searchParams.get("format");

    if (topicParam) setTopic(topicParam);
    if (nicheParam) {
      const matchedNiche = niches.find((n) =>
        n.toLowerCase().includes(nicheParam.toLowerCase().split(" ")[0])
      );
      if (matchedNiche) setNiche(matchedNiche);
    }
    if (formatParam) {
      const matchedFormat = formats.find((f) =>
        f.toLowerCase().includes(formatParam.toLowerCase().split(" ")[0])
      );
      if (matchedFormat) setFormat(matchedFormat);
    }
  }, [searchParams]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setContent(null);
    setSaved(false);

    let msgIndex = 0;
    setLoadingMessage(loadingMessages[0]);
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[msgIndex]);
    }, 2500);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, goal, format, duration, tone, topic, contentType }),
      });

      clearInterval(msgInterval);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate content");
      }

      const result = await res.json();
      setContent(result);

      const stats = JSON.parse(localStorage.getItem("cactus-stats") || "{}");
      stats.contentGenerated = (stats.contentGenerated || 0) + 1;
      localStorage.setItem("cactus-stats", JSON.stringify(stats));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate content");
    } finally {
      clearInterval(msgInterval);
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!content) return;
    try {
      const saved_packs = JSON.parse(localStorage.getItem("cactus-saved-packs") || "[]");
      saved_packs.unshift({
        id: Date.now(),
        savedAt: new Date().toISOString(),
        niche,
        goal,
        format,
        duration,
        tone,
        contentType,
        topic,
        ...content,
      });
      // Keep max 50 saved packs
      localStorage.setItem("cactus-saved-packs", JSON.stringify(saved_packs.slice(0, 50)));
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-2">
          <Wand2 className="w-4 h-4" />
          Content Generator
        </div>
        <h1 className="text-white text-2xl font-bold">Generate Your Content Pack</h1>
        <p className="text-[#666] mt-1">
          AI-powered scripts, captions, hashtags, and strategy — all in one click.
        </p>
      </div>

      {/* Form */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* Niche */}
          <div>
            <label className="block text-[#888] text-xs font-medium mb-2 uppercase tracking-wide">
              Client / Niche
            </label>
            <select
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm focus:border-green-500/50 transition-colors appearance-none cursor-pointer"
            >
              {niches.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* Goal */}
          <div>
            <label className="block text-[#888] text-xs font-medium mb-2 uppercase tracking-wide">
              Content Goal
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm focus:border-green-500/50 transition-colors appearance-none cursor-pointer"
            >
              {goals.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Format */}
          <div>
            <label className="block text-[#888] text-xs font-medium mb-2 uppercase tracking-wide">
              Platform Format
            </label>
            <div className="flex gap-2">
              {formats.map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`flex-1 py-3 px-2 rounded-xl border text-xs font-medium transition-all ${
                    format === f
                      ? "bg-green-500/10 border-green-500/40 text-green-400"
                      : "bg-[#1a1a1a] border-[#2a2a2a] text-[#666] hover:text-white hover:border-[#333]"
                  }`}
                >
                  {f.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-[#888] text-xs font-medium mb-2 uppercase tracking-wide">
              Duration
            </label>
            <div className="flex gap-2">
              {durations.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-3 px-2 rounded-xl border text-xs font-medium transition-all ${
                    duration === d
                      ? "bg-green-500/10 border-green-500/40 text-green-400"
                      : "bg-[#1a1a1a] border-[#2a2a2a] text-[#666] hover:text-white hover:border-[#333]"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Type */}
        <div className="mb-5">
          <label className="block text-[#888] text-xs font-medium mb-2 uppercase tracking-wide">
            Content Type
          </label>
          <div className="flex flex-wrap gap-2">
            {contentTypes.map((ct) => (
              <button
                key={ct.id}
                onClick={() => setContentType(ct.id)}
                className={`py-2 px-4 rounded-xl border text-sm font-medium transition-all ${
                  contentType === ct.id
                    ? `${ct.bg} ${ct.color}`
                    : "bg-[#1a1a1a] border-[#2a2a2a] text-[#666] hover:text-white hover:border-[#333]"
                }`}
              >
                {ct.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div className="mb-5">
          <label className="block text-[#888] text-xs font-medium mb-2 uppercase tracking-wide">
            Tone
          </label>
          <div className="flex flex-wrap gap-2">
            {tones.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`py-2 px-4 rounded-xl border text-sm font-medium transition-all ${
                  tone === t
                    ? "bg-green-500/10 border-green-500/40 text-green-400"
                    : "bg-[#1a1a1a] border-[#2a2a2a] text-[#666] hover:text-white hover:border-[#333]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Topic (optional) */}
        <div className="mb-6">
          <label className="block text-[#888] text-xs font-medium mb-2 uppercase tracking-wide">
            Topic / Idea <span className="text-[#555] normal-case">(optional — AI will choose if blank)</span>
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Why UAE pet owners are switching to premium dog food... or leave blank for AI to choose"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#444] resize-none focus:border-green-500/50 transition-colors"
            rows={2}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-4 rounded-xl transition-all duration-150 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {loadingMessage}
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Generate Content Pack
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {content && (
        <div className="space-y-5 fade-in">
          {/* Action bar */}
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Your Content Pack</h2>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                  saved
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : "bg-[#1a1a1a] border-[#2a2a2a] text-white hover:border-[#333]"
                }`}
              >
                {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? "Saved!" : "Save"}
              </button>
            </div>
          </div>

          {/* Hook */}
          <div className="bg-[#111] border border-green-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                  <Zap className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Hook (First 3 Seconds)</h3>
                  <p className="text-[#666] text-xs">The scroll-stopper</p>
                </div>
              </div>
              <CopyButton text={content.hook} />
            </div>
            <div className="bg-green-500/5 border border-green-500/15 rounded-xl p-4">
              <p className="text-green-300 font-medium text-lg leading-relaxed">&ldquo;{content.hook}&rdquo;</p>
            </div>
          </div>

          {/* Script */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Script (Shot-by-Shot)</h3>
                  <p className="text-[#666] text-xs">{duration} · {format}</p>
                </div>
              </div>
              <CopyButton text={content.script} />
            </div>
            <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4">
              <pre className="text-[#ccc] text-sm leading-relaxed whitespace-pre-wrap font-sans">{content.script}</pre>
            </div>
          </div>

          {/* Caption */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Caption</h3>
                  <p className="text-[#666] text-xs">With emojis and call-to-action</p>
                </div>
              </div>
              <CopyButton text={content.caption} />
            </div>
            <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4">
              <p className="text-[#ccc] text-sm leading-relaxed whitespace-pre-wrap">{content.caption}</p>
            </div>
          </div>

          {/* Hashtags */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2">
                  <Hash className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Hashtags</h3>
                  <p className="text-[#666] text-xs">{content.hashtags?.length || 0} tags · Mix of large, medium & niche</p>
                </div>
              </div>
              <CopyButton text={content.hashtags?.join(" ") || ""} />
            </div>
            <div className="flex flex-wrap gap-2">
              {content.hashtags?.map((tag, i) => (
                <span
                  key={i}
                  className="bg-orange-500/10 border border-orange-500/20 text-orange-300 px-3 py-1.5 rounded-lg text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Thumbnail + Best time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-2">
                    <Camera className="w-4 h-4 text-pink-400" />
                  </div>
                  <h3 className="text-white font-semibold">Thumbnail Idea</h3>
                </div>
                <CopyButton text={content.thumbnailIdea} />
              </div>
              <p className="text-[#ccc] text-sm leading-relaxed">{content.thumbnailIdea}</p>
            </div>

            <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-2">
                    <Clock className="w-4 h-4 text-teal-400" />
                  </div>
                  <h3 className="text-white font-semibold">Best Time to Post</h3>
                </div>
              </div>
              <p className="text-teal-300 font-semibold text-lg mb-2">{content.bestTimeToPost?.split("·")[0] || content.bestTimeToPost}</p>
              {content.bestTimeToPost?.includes("·") && (
                <p className="text-[#666] text-sm">{content.bestTimeToPost.split("·").slice(1).join("·").trim()}</p>
              )}
            </div>
          </div>

          {/* Why it works */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                </div>
                <h3 className="text-white font-semibold">Why This Will Work</h3>
              </div>
              <CopyButton text={content.whyItWorks} />
            </div>
            <p className="text-[#aaa] text-sm leading-relaxed">{content.whyItWorks}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-400" />
      </div>
    }>
      <GeneratePageInner />
    </Suspense>
  );
}
