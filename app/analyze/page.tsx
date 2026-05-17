"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Link2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Target,
  Layers,
  Globe,
  Lightbulb,
  TrendingUp,
  Key,
  BarChart2,
} from "lucide-react";

interface ContentIdea {
  title: string;
  hook: string;
  description: string;
  format: string;
  niche: string;
}

interface AnalysisResult {
  url: string;
  platform: string;
  contentType: string;
  whatWorks: string;
  hookBreakdown: string;
  structure: string;
  viralFactors: string[];
  uaeAdaptation: string;
  contentIdeas: ContentIdea[];
  estimatedPerformance: string;
  keyTakeaway: string;
  error?: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#2a2a2a] hover:bg-[#333] border border-[#333] text-[#888] hover:text-white transition-all"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function AnalysisCard({ result, index }: { result: AnalysisResult; index: number }) {
  const [expanded, setExpanded] = useState(true);
  const router = useRouter();

  const platformColors: Record<string, string> = {
    Instagram: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    TikTok: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    YouTube: "text-red-400 bg-red-500/10 border-red-500/20",
    "Twitter/X": "text-blue-400 bg-blue-500/10 border-blue-500/20",
    Web: "text-gray-400 bg-gray-500/10 border-gray-500/20",
  };

  const platformColor = platformColors[result.platform] || platformColors.Web;

  const goToGenerate = (idea: ContentIdea) => {
    const params = new URLSearchParams({
      topic: `${idea.title}: ${idea.hook}`,
      niche: idea.niche || "",
      format: idea.format || "",
    });
    router.push(`/generate?${params.toString()}`);
  };

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-[#161616] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-400 text-sm font-bold">{index + 1}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${platformColor}`}>
                {result.platform}
              </span>
              {result.contentType && (
                <span className="text-xs text-[#666] border border-[#2a2a2a] px-2 py-0.5 rounded-md">
                  {result.contentType}
                </span>
              )}
            </div>
            <p className="text-[#888] text-sm truncate">{result.url}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-[#555] flex-shrink-0 ml-3" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#555] flex-shrink-0 ml-3" />
        )}
      </button>

      {/* Content */}
      {expanded && (
        <div className="border-t border-[#1e1e1e] p-5 space-y-5">
          {result.error && (
            <div className="bg-red-900/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
              {result.error}
            </div>
          )}

          {/* Key takeaway - prominent */}
          {result.keyTakeaway && (
            <div className="bg-green-500/5 border border-green-500/15 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-semibold">Key Takeaway</span>
              </div>
              <p className="text-white font-medium text-sm leading-relaxed">{result.keyTakeaway}</p>
            </div>
          )}

          {/* Grid of insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* What works */}
            {result.whatWorks && (
              <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-white text-sm font-medium">What&apos;s Working</span>
                  </div>
                  <CopyButton text={result.whatWorks} />
                </div>
                <p className="text-[#888] text-sm leading-relaxed">{result.whatWorks}</p>
              </div>
            )}

            {/* Hook breakdown */}
            {result.hookBreakdown && (
              <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-white text-sm font-medium">Hook Breakdown</span>
                  </div>
                  <CopyButton text={result.hookBreakdown} />
                </div>
                <p className="text-[#888] text-sm leading-relaxed">{result.hookBreakdown}</p>
              </div>
            )}

            {/* Structure */}
            {result.structure && (
              <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-sm font-medium">Content Structure</span>
                  </div>
                  <CopyButton text={result.structure} />
                </div>
                <p className="text-[#888] text-sm leading-relaxed">{result.structure}</p>
              </div>
            )}

            {/* UAE Adaptation */}
            {result.uaeAdaptation && (
              <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-400" />
                    <span className="text-white text-sm font-medium">UAE Adaptation</span>
                  </div>
                  <CopyButton text={result.uaeAdaptation} />
                </div>
                <p className="text-[#888] text-sm leading-relaxed">{result.uaeAdaptation}</p>
              </div>
            )}
          </div>

          {/* Estimated Performance */}
          {result.estimatedPerformance && result.estimatedPerformance !== "N/A" && (
            <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-teal-400" />
                  <span className="text-white text-sm font-medium">Estimated Performance</span>
                </div>
                <CopyButton text={result.estimatedPerformance} />
              </div>
              <p className="text-teal-300 text-sm font-medium leading-relaxed">{result.estimatedPerformance}</p>
            </div>
          )}

          {/* Viral factors */}
          {result.viralFactors && result.viralFactors.length > 0 && (
            <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-orange-400" />
                <span className="text-white text-sm font-medium">Viral Factors</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.viralFactors.map((factor, i) => (
                  <span
                    key={i}
                    className="bg-orange-500/10 border border-orange-500/20 text-orange-300 px-3 py-1.5 rounded-lg text-xs"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Content ideas */}
          {result.contentIdeas && result.contentIdeas.length > 0 && (
            <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4 text-green-400" />
                <span className="text-white text-sm font-medium">Content Ideas Inspired by This</span>
              </div>
              <div className="space-y-3">
                {result.contentIdeas.map((idea, i) => (
                  <div
                    key={i}
                    className="bg-[#222] border border-[#2a2a2a] hover:border-green-500/25 rounded-xl p-4 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-green-400 text-xs font-semibold">Idea {i + 1}</span>
                          {idea.format && (
                            <span className="text-[#555] text-xs border border-[#333] px-1.5 py-0.5 rounded">
                              {idea.format}
                            </span>
                          )}
                          {idea.niche && (
                            <span className="text-blue-400 text-xs border border-blue-500/20 bg-blue-500/5 px-1.5 py-0.5 rounded">
                              {idea.niche}
                            </span>
                          )}
                        </div>
                        <p className="text-white font-medium text-sm mb-1">{idea.title}</p>
                        <p className="text-green-300/80 text-xs italic mb-2">&ldquo;{idea.hook}&rdquo;</p>
                        <p className="text-[#666] text-xs leading-relaxed">{idea.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => goToGenerate(idea)}
                      className="mt-3 flex items-center gap-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    >
                      <ArrowRight className="w-3 h-3" />
                      Generate Script
                    </button>
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

export default function AnalyzePage() {
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");

  const loadingMessages = [
    "Fetching content from URLs...",
    "Analyzing content structure...",
    "Identifying viral factors...",
    "Studying hook techniques...",
    "Finding UAE adaptation angles...",
    "Generating content ideas...",
  ];

  const handleAnalyze = async () => {
    const urls = urlInput
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u.length > 0 && u.startsWith("http"));

    if (urls.length === 0) {
      setError("Please enter at least one valid URL (starting with http)");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    let msgIndex = 0;
    setLoadingMessage(loadingMessages[0]);
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[msgIndex]);
    }, 3000);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });

      clearInterval(msgInterval);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to analyze URLs");
      }

      const data = await res.json();
      setResults(data.results || []);

      const stats = JSON.parse(localStorage.getItem("cactus-stats") || "{}");
      stats.linksAnalyzed = (stats.linksAnalyzed || 0) + urls.length;
      localStorage.setItem("cactus-stats", JSON.stringify(stats));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze");
    } finally {
      clearInterval(msgInterval);
      setLoading(false);
    }
  };

  const exampleUrls = [
    "https://www.instagram.com/p/example/",
    "https://www.tiktok.com/@user/video/123456",
    "https://youtube.com/shorts/example",
  ];

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-2">
          <Link2 className="w-4 h-4" />
          URL Analyzer
        </div>
        <h1 className="text-white text-2xl font-bold">Viral Content Analyzer</h1>
        <p className="text-[#666] mt-1">
          Paste any social media URL and AI will reverse-engineer exactly why it works — and how to recreate it for UAE.
        </p>
      </div>

      {/* Input */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
        <div className="mb-4">
          <label className="block text-[#888] text-xs font-medium mb-2 uppercase tracking-wide">
            URLs to Analyze <span className="text-[#555] normal-case">(1-5 URLs, one per line)</span>
          </label>
          <textarea
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={`Paste URLs here, one per line:\n${exampleUrls.join("\n")}`}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#444] resize-none focus:border-blue-500/50 transition-colors font-mono"
            rows={5}
          />
        </div>

        {/* Platform detection hint */}
        <div className="flex flex-wrap gap-2 mb-5">
          {["Instagram", "TikTok", "YouTube", "Twitter/X", "Any URL"].map((p) => (
            <span
              key={p}
              className="text-xs text-[#555] border border-[#2a2a2a] px-2 py-1 rounded-md"
            >
              {p} supported
            </span>
          ))}
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !urlInput.trim()}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all duration-150 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {loadingMessage}
            </>
          ) : (
            <>
              <Link2 className="w-5 h-5" />
              Analyze Content
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
      {results.length > 0 && (
        <div className="space-y-5 fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Analysis Results</h2>
            <span className="text-[#666] text-sm">{results.length} URL{results.length !== 1 ? "s" : ""} analyzed</span>
          </div>
          {results.map((result, i) => (
            <AnalysisCard key={i} result={result} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
