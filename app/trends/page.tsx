"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Search,
  Hash,
  Music,
  Video,
  Eye,
  Lightbulb,
  Copy,
  Check,
  ArrowRight,
  Loader2,
} from "lucide-react";

const niches = [
  "All UAE Niches",
  "Pets & Pet Products",
  "Perfume & Watches",
  "Cars & Automotive",
  "Recruitment & HR",
  "Food & Spices",
  "Cactus Lab / Agency",
];

const platforms = ["Instagram Reels", "TikTok", "YouTube Shorts"];

interface TrendData {
  hashtags: string[];
  trendingAudio: { name: string; artist: string; trend: string }[];
  trendingFormats: { format: string; description: string; example: string }[];
  competitorInsights: { insight: string; example: string }[];
  contentIdeas: {
    title: string;
    hook: string;
    description: string;
    format: string;
    estimatedViews: string;
    whyItWorks: string;
  }[];
}

export default function TrendsPage() {
  const router = useRouter();
  const [niche, setNiche] = useState("All UAE Niches");
  const [platform, setPlatform] = useState("Instagram Reels");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrendData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");

  const loadingMessages = [
    "Scouting trends in Dubai...",
    "Analyzing UAE viral content...",
    "Scanning Instagram Reels...",
    "Checking TikTok For You page...",
    "Reviewing competitor accounts...",
    "Compiling trend report...",
  ];

  const handleScout = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    let msgIndex = 0;
    setLoadingMessage(loadingMessages[0]);
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[msgIndex]);
    }, 2000);

    try {
      const res = await fetch("/api/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, platform }),
      });

      clearInterval(msgInterval);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to scout trends");
      }

      const result = await res.json();
      setData(result);

      // Update stats
      const stats = JSON.parse(localStorage.getItem("cactus-stats") || "{}");
      stats.trendsAnalyzed = (stats.trendsAnalyzed || 0) + 1;
      localStorage.setItem("cactus-stats", JSON.stringify(stats));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scout trends");
    } finally {
      clearInterval(msgInterval);
      setLoading(false);
    }
  };

  const copyHashtag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  const copyAllHashtags = () => {
    if (!data) return;
    navigator.clipboard.writeText(data.hashtags.join(" "));
    setCopiedTag("all");
    setTimeout(() => setCopiedTag(null), 1500);
  };

  const goToGenerate = (idea: TrendData["contentIdeas"][0]) => {
    const params = new URLSearchParams({
      topic: `${idea.title}: ${idea.hook}`,
      niche: niche,
      format: platform,
    });
    router.push(`/generate?${params.toString()}`);
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-2">
          <TrendingUp className="w-4 h-4" />
          Trend Scout
        </div>
        <h1 className="text-white text-2xl font-bold">UAE Trend Intelligence</h1>
        <p className="text-[#666] mt-1">
          Discover what&apos;s trending right now in the UAE — hashtags, audio, formats, and viral content ideas.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-[#888] text-xs font-medium mb-2 uppercase tracking-wide">
              Niche
            </label>
            <select
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm focus:border-green-500/50 transition-colors appearance-none cursor-pointer"
            >
              {niches.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[#888] text-xs font-medium mb-2 uppercase tracking-wide">
              Platform
            </label>
            <div className="flex gap-2">
              {platforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`flex-1 py-3 px-3 rounded-xl border text-xs font-medium transition-all ${
                    platform === p
                      ? "bg-green-500/10 border-green-500/40 text-green-400"
                      : "bg-[#1a1a1a] border-[#2a2a2a] text-[#666] hover:text-white hover:border-[#333]"
                  }`}
                >
                  {p.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleScout}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-3.5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {loadingMessage}
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Scout UAE Trends Now
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
      {data && (
        <div className="space-y-6 fade-in">
          {/* Trending hashtags */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2">
                  <Hash className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-white font-semibold">Trending Hashtags</h2>
                  <p className="text-[#666] text-xs">{data.hashtags?.length || 0} tags · {niche} · {platform}</p>
                </div>
              </div>
              <button
                onClick={copyAllHashtags}
                className="flex items-center gap-1.5 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-white text-xs px-3 py-2 rounded-lg transition-colors"
              >
                {copiedTag === "all" ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedTag === "all" ? "Copied!" : "Copy All"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.hashtags?.map((tag) => (
                <button
                  key={tag}
                  onClick={() => copyHashtag(tag)}
                  className="flex items-center gap-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 px-3 py-1.5 rounded-lg text-sm transition-all group"
                >
                  {copiedTag === tag ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Trending audio */}
          {data.trendingAudio && data.trendingAudio.length > 0 && (
            <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-2">
                  <Music className="w-4 h-4 text-pink-400" />
                </div>
                <div>
                  <h2 className="text-white font-semibold">Trending Audio</h2>
                  <p className="text-[#666] text-xs">Sounds trending on {platform} this week</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.trendingAudio.map((audio, i) => (
                  <div key={i} className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                        <Music className="w-4 h-4 text-pink-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{audio.name}</p>
                        <p className="text-[#666] text-xs">{audio.artist}</p>
                        <p className="text-[#888] text-xs mt-1.5 leading-relaxed">{audio.trend}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending formats */}
          {data.trendingFormats && data.trendingFormats.length > 0 && (
            <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
                  <Video className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-white font-semibold">Viral Content Formats</h2>
                  <p className="text-[#666] text-xs">Formats going viral right now</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.trendingFormats.map((format, i) => (
                  <div key={i} className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-md font-medium">
                        {format.format}
                      </span>
                    </div>
                    <p className="text-[#888] text-xs leading-relaxed mb-2">{format.description}</p>
                    <p className="text-[#666] text-xs italic">&ldquo;{format.example}&rdquo;</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Competitor insights */}
          {data.competitorInsights && data.competitorInsights.length > 0 && (
            <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2">
                  <Eye className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-white font-semibold">Competitor Intelligence</h2>
                  <p className="text-[#666] text-xs">What similar accounts are doing</p>
                </div>
              </div>
              <div className="space-y-3">
                {data.competitorInsights.map((insight, i) => (
                  <div key={i} className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4">
                    <p className="text-white text-sm font-medium mb-1">{insight.insight}</p>
                    <p className="text-[#666] text-xs">{insight.example}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content ideas */}
          {data.contentIdeas && data.contentIdeas.length > 0 && (
            <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                  <Lightbulb className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h2 className="text-white font-semibold">Content Ideas Based on Trends</h2>
                  <p className="text-[#666] text-xs">AI-generated ideas optimized for current trends</p>
                </div>
              </div>
              <div className="space-y-4">
                {data.contentIdeas.map((idea, i) => (
                  <div
                    key={i}
                    className="bg-[#1a1a1a] border border-[#252525] hover:border-green-500/30 rounded-2xl p-5 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-green-400 text-xs font-bold bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-md">
                            Idea #{i + 1}
                          </span>
                          <span className="text-[#555] text-xs">{idea.format}</span>
                          {idea.estimatedViews && (
                            <span className="text-blue-400 text-xs bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                              ~{idea.estimatedViews}
                            </span>
                          )}
                        </div>
                        <h3 className="text-white font-semibold mb-2">{idea.title}</h3>
                        <div className="bg-[#222] border-l-2 border-green-500/50 rounded-r-lg pl-3 py-2 mb-3">
                          <p className="text-green-300 text-sm font-medium">Hook: &ldquo;{idea.hook}&rdquo;</p>
                        </div>
                        <p className="text-[#888] text-sm leading-relaxed mb-3">{idea.description}</p>
                        {idea.whyItWorks && (
                          <p className="text-[#666] text-xs leading-relaxed border-t border-[#252525] pt-3">
                            <span className="text-[#888] font-medium">Why it works: </span>
                            {idea.whyItWorks}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-[#252525]">
                      <button
                        onClick={() => goToGenerate(idea)}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        Generate Full Script
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
