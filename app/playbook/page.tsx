"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Loader2,
  CheckCircle2,
  Circle,
  Calendar,
  Target,
  Hash,
  Columns,
  Users,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ArrowRight,
  Zap,
  TrendingUp,
} from "lucide-react";

interface PlaybookDay {
  day: number;
  date: string;
  targetFollowers: number;
  theme: string;
  contentToPost: {
    type: string;
    title: string;
    hook: string;
    concept: string;
    caption: string;
    hashtags: string;
    bestTimeToPost: string;
  };
  engagementTasks: string[];
  growthTactics: string[];
  outreachTask: string;
  dailyTip: string;
}

interface Playbook {
  overview: string;
  weeklyMilestones: { week: number; target: number; dateRange: string; theme: string }[];
  keyStrategies: { strategy: string; description: string; impact: string }[];
  days: PlaybookDay[];
  hashtagStrategy: {
    small: string[];
    medium: string[];
    large: string[];
    branded: string[];
  };
  contentPillars: { pillar: string; description: string; percentage: number }[];
  collaborationOpportunities: { type: string; target: string; approach: string }[];
}

function DayCard({
  dayData,
  isToday,
  completed,
  onToggleComplete,
}: {
  dayData: PlaybookDay;
  isToday: boolean;
  completed: boolean;
  onToggleComplete: () => void;
}) {
  const [expanded, setExpanded] = useState(isToday);
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  const router = useRouter();

  const toggleTask = (i: number) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const weekNumber = Math.ceil(dayData.day / 7);
  const weekColors = [
    "border-blue-500/25",
    "border-purple-500/25",
    "border-green-500/25",
  ];

  return (
    <div
      className={`bg-[#111] border rounded-2xl overflow-hidden transition-all duration-200 ${
        isToday ? "border-green-500/40" : completed ? "border-[#252525] opacity-70" : weekColors[weekNumber - 1] || "border-[#1e1e1e]"
      }`}
    >
      {/* Day header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-5 hover:bg-[#161616] transition-colors text-left"
      >
        {/* Complete toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete();
          }}
          className="flex-shrink-0"
        >
          {completed ? (
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          ) : (
            <Circle className="w-5 h-5 text-[#444]" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                isToday
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-[#1a1a1a] text-[#888] border border-[#2a2a2a]"
              }`}
            >
              Day {dayData.day} · {dayData.date}
            </span>
            {isToday && (
              <span className="text-green-400 text-xs font-medium">← TODAY</span>
            )}
            <span className="text-[#555] text-xs">Target: {dayData.targetFollowers?.toLocaleString()} followers</span>
          </div>
          <p className="text-white font-medium text-sm mt-1 truncate">{dayData.theme}</p>
          {dayData.contentToPost && (
            <p className="text-[#555] text-xs truncate mt-0.5">{dayData.contentToPost.title}</p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-[#555]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#555]" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && dayData.contentToPost && (
        <div className="border-t border-[#1e1e1e] p-5 space-y-5">
          {/* Content to post */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-400" />
              Content to Post
            </h4>
            <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-md font-medium">
                  {dayData.contentToPost.type}
                </span>
                {dayData.contentToPost.bestTimeToPost && (
                  <span className="text-[#555] text-xs">{dayData.contentToPost.bestTimeToPost}</span>
                )}
              </div>
              <p className="text-white font-medium">{dayData.contentToPost.title}</p>
              <div className="bg-green-500/5 border-l-2 border-green-500/40 pl-3 py-2 rounded-r">
                <p className="text-green-300 text-sm font-medium">&ldquo;{dayData.contentToPost.hook}&rdquo;</p>
              </div>
              <p className="text-[#888] text-sm leading-relaxed">{dayData.contentToPost.concept}</p>
              {dayData.contentToPost.hashtags && (
                <p className="text-purple-400/70 text-xs leading-relaxed">{dayData.contentToPost.hashtags}</p>
              )}
            </div>
            <button
              onClick={() =>
                router.push(
                  `/generate?topic=${encodeURIComponent(dayData.contentToPost.title + ": " + dayData.contentToPost.hook)}`
                )
              }
              className="mt-3 flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 px-4 py-2 rounded-xl text-xs font-medium transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              Generate Full Script for This
            </button>
          </div>

          {/* Tasks grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Engagement tasks */}
            {dayData.engagementTasks && dayData.engagementTasks.length > 0 && (
              <div>
                <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  Engagement Tasks
                </h4>
                <div className="space-y-2">
                  {dayData.engagementTasks.map((task, i) => (
                    <button
                      key={i}
                      onClick={() => toggleTask(i)}
                      className={`w-full flex items-start gap-2 p-2.5 rounded-lg border text-left transition-all ${
                        completedTasks.has(i)
                          ? "bg-blue-500/5 border-blue-500/20 opacity-60"
                          : "bg-[#1a1a1a] border-[#252525] hover:border-[#333]"
                      }`}
                    >
                      {completedTasks.has(i) ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-[#444] flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-xs leading-relaxed ${completedTasks.has(i) ? "text-[#555] line-through" : "text-[#888]"}`}>
                        {task}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Growth tactics */}
            {dayData.growthTactics && dayData.growthTactics.length > 0 && (
              <div>
                <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-orange-400" />
                  Growth Tactics
                </h4>
                <div className="space-y-2">
                  {dayData.growthTactics.map((tactic, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2.5 rounded-lg bg-[#1a1a1a] border border-[#252525]"
                    >
                      <span className="text-orange-400 text-xs mt-0.5 flex-shrink-0">→</span>
                      <span className="text-[#888] text-xs leading-relaxed">{tactic}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Outreach + tip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dayData.outreachTask && (
              <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 text-xs font-medium">Outreach Task</span>
                </div>
                <p className="text-[#ccc] text-sm">{dayData.outreachTask}</p>
              </div>
            )}
            {dayData.dailyTip && (
              <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-xs font-medium">Daily Tip</span>
                </div>
                <p className="text-[#ccc] text-sm">{dayData.dailyTip}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlaybookPage() {
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<"days" | "strategy" | "hashtags">("days");

  useEffect(() => {
    loadPlaybook();
    const saved = localStorage.getItem("completed-playbook-days");
    if (saved) {
      try {
        setCompletedDays(new Set<number>(JSON.parse(saved)));
      } catch {}
    }
  }, []);

  const loadPlaybook = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/playbook");
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to load playbook");
      }
      const data = await res.json();
      setPlaybook(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load playbook");
    } finally {
      setLoading(false);
    }
  };

  const regeneratePlaybook = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetch("/api/playbook", { method: "DELETE" });
      await loadPlaybook();
    } catch (err) {
      setError("Failed to regenerate");
      setLoading(false);
    }
  };

  const toggleDay = (day: number) => {
    setCompletedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      localStorage.setItem("completed-playbook-days", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const tabs = [
    { id: "days", label: "21-Day Plan", icon: Calendar },
    { id: "strategy", label: "Strategy", icon: TrendingUp },
    { id: "hashtags", label: "Hashtag Bank", icon: Hash },
  ];

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-orange-400 text-sm font-medium mb-2">
            <BookOpen className="w-4 h-4" />
            Growth Playbook
          </div>
          <h1 className="text-white text-2xl font-bold">21-Day Sprint to 10K</h1>
          <p className="text-[#666] mt-1">
            Your complete day-by-day plan to grow Cactus Lab from 15 → 10,000 followers by May 31.
          </p>
        </div>
        {playbook && (
          <button
            onClick={regeneratePlaybook}
            disabled={loading}
            className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-[#888] hover:text-white px-4 py-2 rounded-xl text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Regenerate
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-16 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-green-400 mx-auto mb-4" />
          <p className="text-white font-semibold text-lg mb-2">Generating Your 21-Day Playbook...</p>
          <p className="text-[#666] text-sm">
            AI is crafting your personalized day-by-day plan to grow 15 → 10K. This takes 30-60 seconds.
          </p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6 text-center">
          <p className="text-red-400 font-medium mb-2">{error}</p>
          <button
            onClick={loadPlaybook}
            className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Playbook content */}
      {playbook && !loading && (
        <>
          {/* Weekly milestones */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {playbook.weeklyMilestones?.map((milestone) => (
              <div
                key={milestone.week}
                className={`border rounded-2xl p-5 ${
                  milestone.week === 1
                    ? "bg-blue-500/5 border-blue-500/20"
                    : milestone.week === 2
                    ? "bg-purple-500/5 border-purple-500/20"
                    : "bg-green-500/5 border-green-500/20"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                      milestone.week === 1
                        ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                        : milestone.week === 2
                        ? "text-purple-400 bg-purple-500/10 border-purple-500/20"
                        : "text-green-400 bg-green-500/10 border-green-500/20"
                    }`}
                  >
                    Week {milestone.week}
                  </span>
                  <span className="text-[#555] text-xs">{milestone.dateRange}</span>
                </div>
                <div
                  className={`text-2xl font-bold mb-1 ${
                    milestone.week === 1
                      ? "text-blue-400"
                      : milestone.week === 2
                      ? "text-purple-400"
                      : "text-green-400"
                  }`}
                >
                  {milestone.target.toLocaleString()}
                </div>
                <div className="text-white text-sm font-medium">{milestone.theme}</div>
              </div>
            ))}
          </div>

          {/* Overview */}
          {playbook.overview && (
            <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-3">Strategy Overview</h2>
              <p className="text-[#888] text-sm leading-relaxed">{playbook.overview}</p>
            </div>
          )}

          {/* Progress bar */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-medium text-sm">Sprint Progress</span>
              <span className="text-green-400 text-sm font-semibold">
                {completedDays.size}/21 days completed
              </span>
            </div>
            <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-700 to-green-400 rounded-full transition-all duration-500"
                style={{ width: `${(completedDays.size / 21) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-[#111] border border-[#1e1e1e] rounded-xl p-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-[#1e1e1e] text-white border border-[#2a2a2a]"
                      : "text-[#666] hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Days tab */}
          {activeTab === "days" && (
            <div className="space-y-3">
              {playbook.days?.map((day) => (
                <DayCard
                  key={day.day}
                  dayData={day}
                  isToday={day.day === 1}
                  completed={completedDays.has(day.day)}
                  onToggleComplete={() => toggleDay(day.day)}
                />
              ))}
            </div>
          )}

          {/* Strategy tab */}
          {activeTab === "strategy" && (
            <div className="space-y-6">
              {/* Key strategies */}
              {playbook.keyStrategies && playbook.keyStrategies.length > 0 && (
                <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    Key Growth Strategies
                  </h3>
                  <div className="space-y-3">
                    {playbook.keyStrategies.map((s, i) => (
                      <div key={i} className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <span className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <div>
                            <p className="text-white font-medium text-sm mb-1">{s.strategy}</p>
                            <p className="text-[#777] text-sm leading-relaxed mb-2">{s.description}</p>
                            <p className="text-green-400/70 text-xs">{s.impact}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Content pillars */}
              {playbook.contentPillars && playbook.contentPillars.length > 0 && (
                <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Columns className="w-4 h-4 text-blue-400" />
                    Content Pillars
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {playbook.contentPillars.map((pillar, i) => (
                      <div key={i} className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium text-sm">{pillar.pillar}</span>
                          <span className="text-green-400 text-sm font-bold">{pillar.percentage}%</span>
                        </div>
                        <div className="h-1 bg-[#252525] rounded-full overflow-hidden mb-2">
                          <div
                            className="h-full bg-green-500/50 rounded-full"
                            style={{ width: `${pillar.percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-[#666] text-xs">{pillar.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collaboration opportunities */}
              {playbook.collaborationOpportunities && playbook.collaborationOpportunities.length > 0 && (
                <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    Collaboration Opportunities
                  </h3>
                  <div className="space-y-3">
                    {playbook.collaborationOpportunities.map((collab, i) => (
                      <div key={i} className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded-md">
                            {collab.type}
                          </span>
                        </div>
                        <p className="text-white text-sm font-medium mb-1">{collab.target}</p>
                        <p className="text-[#666] text-xs">{collab.approach}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hashtags tab */}
          {activeTab === "hashtags" && playbook.hashtagStrategy && (
            <div className="space-y-5">
              {[
                { key: "branded", label: "Branded Tags", color: "green", description: "Always use these — Cactus Lab identity" },
                { key: "small", label: "Small Niche Tags (<100K)", color: "blue", description: "High engagement rate, easier to rank" },
                { key: "medium", label: "Medium Tags (100K-1M)", color: "purple", description: "Balanced reach and competition" },
                { key: "large", label: "Large Tags (1M+)", color: "orange", description: "High reach, use sparingly" },
              ].map(({ key, label, color, description }) => {
                const tags = playbook.hashtagStrategy[key as keyof typeof playbook.hashtagStrategy];
                const colorMap: Record<string, string> = {
                  green: "bg-green-500/10 border-green-500/20 text-green-300",
                  blue: "bg-blue-500/10 border-blue-500/20 text-blue-300",
                  purple: "bg-purple-500/10 border-purple-500/20 text-purple-300",
                  orange: "bg-orange-500/10 border-orange-500/20 text-orange-300",
                };
                return (
                  <div key={key} className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-sm">{label}</h3>
                        <p className="text-[#666] text-xs mt-0.5">{description}</p>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(tags?.join(" ") || "")}
                        className="text-xs text-[#666] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Copy All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags?.map((tag: string) => (
                        <button
                          key={tag}
                          onClick={() => navigator.clipboard.writeText(tag)}
                          className={`px-3 py-1.5 rounded-lg border text-xs transition-all hover:opacity-80 ${colorMap[color]}`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
