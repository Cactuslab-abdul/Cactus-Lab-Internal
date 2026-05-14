"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import GrowthTracker from "@/components/dashboard/growth-tracker";
import StatsCards from "@/components/dashboard/stats-cards";
import ContentCalendar from "@/components/dashboard/content-calendar";
import {
  Wand2,
  TrendingUp,
  Link2,
  BookOpen,
  ArrowRight,
  Flame,
  Clock,
  CheckCircle2,
  Users,
  FileText,
  CheckSquare,
} from "lucide-react";

const quickActions = [
  {
    href: "/generate",
    label: "Generate Content",
    description: "Create a full AI content pack with script, caption & hashtags",
    icon: Wand2,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    hoverBorder: "hover:border-green-500/40",
  },
  {
    href: "/trends",
    label: "Scout Trends",
    description: "Find what's trending in the UAE right now",
    icon: TrendingUp,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    hoverBorder: "hover:border-purple-500/40",
  },
  {
    href: "/analyze",
    label: "Analyze Content",
    description: "Reverse-engineer viral content from any URL",
    icon: Link2,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    hoverBorder: "hover:border-blue-500/40",
  },
  {
    href: "/playbook",
    label: "Growth Playbook",
    description: "Your 21-day day-by-day plan to 10K followers",
    icon: BookOpen,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    hoverBorder: "hover:border-orange-500/40",
  },
  {
    href: "/clients",
    label: "Client Plans",
    description: "Track 15 videos/month per client — idea to posted",
    icon: Users,
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/20",
    hoverBorder: "hover:border-teal-500/40",
  },
  {
    href: "/captions",
    label: "Caption Library",
    description: "Pre-written captions + hashtag sets for every niche",
    icon: FileText,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
    hoverBorder: "hover:border-pink-500/40",
  },
  {
    href: "/qc",
    label: "QC Checklist",
    description: "Pre-publish checklist so nothing bad goes live",
    icon: CheckSquare,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    hoverBorder: "hover:border-yellow-500/40",
  },
];

const todayTasks = [
  { task: "Post Reel: Cactus Lab Introduction", type: "content", done: false },
  { task: "Use trending audio (check Reels tab)", type: "research", done: false },
  { task: "Reply to all comments within 1 hour of posting", type: "engagement", done: false },
  { task: "Follow 30 UAE pet & business accounts", type: "engagement", done: false },
  { task: "DM 5 potential clients about AED 5,500/mo offer", type: "outreach", done: false },
  { task: "Scout and save 3 trending hashtag sets", type: "research", done: false },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    followers: 15,
    contentGenerated: 0,
    trendsAnalyzed: 0,
    linksAnalyzed: 0,
  });
  const [tasks, setTasks] = useState(todayTasks);

  useEffect(() => {
    // Load stats from localStorage
    const savedStats = localStorage.getItem("cactus-stats");
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch {}
    }
  }, []);

  const toggleTask = (index: number) => {
    setTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, done: !t.done } : t))
    );
  };

  const completedTasks = tasks.filter((t) => t.done).length;

  const SPRINT_START = new Date("2026-05-10");
  const SPRINT_END = new Date("2026-05-31");
  const now = new Date();
  const sprintDay = Math.max(1, Math.min(21, Math.ceil((now.getTime() - SPRINT_START.getTime()) / (1000 * 60 * 60 * 24)) + 1));
  const daysLeft = Math.max(0, Math.ceil((SPRINT_END.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const todayLabel = now.toLocaleDateString("en-AE", { month: "long", day: "numeric", year: "numeric" });
  const greetingHour = now.getHours();
  const greeting = greetingHour < 12 ? "Good morning" : greetingHour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 fade-in">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">{greeting}, Awab 👋</h1>
          <p className="text-[#666] mt-1">
            {todayLabel} · {daysLeft} days to 10K · Let&apos;s make today count.
          </p>
        </div>
        <div className="bg-gradient-to-r from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl px-4 py-2.5">
          <div className="text-green-400 text-xs font-semibold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            Day {sprintDay} of 21
          </div>
          <div className="text-white text-sm font-bold mt-0.5">Sprint Active</div>
        </div>
      </div>

      {/* Growth tracker — hero element */}
      <GrowthTracker currentFollowers={stats.followers} />

      {/* Stats cards */}
      <StatsCards stats={stats} />

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's tasks */}
        <div className="lg:col-span-1 bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-semibold">Today&apos;s Tasks</h3>
              <p className="text-[#666] text-xs mt-0.5">May 10 growth sprint</p>
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-2.5 py-1 text-xs text-[#888]">
              {completedTasks}/{tasks.length}
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-[#666] mb-1.5">
              <span>Daily progress</span>
              <span>{Math.round((completedTasks / tasks.length) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${(completedTasks / tasks.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            {tasks.map((task, i) => (
              <button
                key={i}
                onClick={() => toggleTask(i)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-150 ${
                  task.done
                    ? "bg-green-500/5 border-green-500/20 opacity-60"
                    : "bg-[#1a1a1a] border-[#252525] hover:border-[#333]"
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    task.done ? "text-green-400" : "text-[#444]"
                  }`}
                />
                <div>
                  <p className={`text-sm ${task.done ? "text-[#666] line-through" : "text-white"}`}>
                    {task.task}
                  </p>
                  <span className={`text-xs capitalize ${
                    task.type === "content" ? "text-green-500/70" :
                    task.type === "engagement" ? "text-blue-500/70" :
                    task.type === "outreach" ? "text-purple-500/70" :
                    "text-orange-500/70"
                  }`}>
                    {task.type}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-white font-semibold mb-1">Quick Actions</h3>
            <p className="text-[#666] text-sm">Jump into your content workflow</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`block bg-[#111] border ${action.borderColor} ${action.hoverBorder} rounded-2xl p-5 transition-all duration-200 group card-hover`}
                >
                  <div className={`${action.bgColor} border ${action.borderColor} rounded-xl p-2.5 w-fit mb-4`}>
                    <Icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-white font-semibold text-sm">{action.label}</h4>
                      <p className="text-[#666] text-xs mt-1 leading-relaxed">{action.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#444] group-hover:text-white transition-colors flex-shrink-0 mt-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Daily focus card */}
          <div className="bg-gradient-to-br from-green-500/8 to-green-600/3 border border-green-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-semibold">Today&apos;s Focus</span>
            </div>
            <h4 className="text-white font-bold text-base mb-2">
              +{Math.ceil((10000 - stats.followers) / Math.max(1, daysLeft))} followers needed today to stay on pace
            </h4>
            <p className="text-[#888] text-sm leading-relaxed">
              You need to grow from {stats.followers} → 10,000 in {daysLeft} days. That means ~{Math.ceil((10000 - stats.followers) / Math.max(1, daysLeft))} new followers per day.
              Focus on: posting a Reel today, using viral audio, and engaging aggressively in the first hour after posting.
            </p>
            <div className="mt-4 flex gap-2">
              <Link
                href="/generate"
                className="bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <Wand2 className="w-3.5 h-3.5" />
                Generate Content Now
              </Link>
              <Link
                href="/playbook"
                className="bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
              >
                View Playbook
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content calendar */}
      <ContentCalendar />
    </div>
  );
}
