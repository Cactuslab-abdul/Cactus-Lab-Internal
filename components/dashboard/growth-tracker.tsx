"use client";

import { useEffect, useState } from "react";
import { Target, Calendar, TrendingUp, Zap } from "lucide-react";

const START_DATE = new Date("2026-05-10");
const END_DATE = new Date("2026-05-31");
const START_FOLLOWERS = 15;
const GOAL_FOLLOWERS = 10000;

export default function GrowthTracker({ currentFollowers = 15 }: { currentFollowers?: number }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const today = new Date("2026-05-10");
  const totalDays = Math.ceil((END_DATE.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.max(0, Math.ceil((today.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, totalDays - daysElapsed);

  const totalGrowthNeeded = GOAL_FOLLOWERS - START_FOLLOWERS;
  const actualGrowth = currentFollowers - START_FOLLOWERS;
  const progressPercent = Math.min(100, (actualGrowth / totalGrowthNeeded) * 100);

  const dailyTargetToGoal = Math.ceil((GOAL_FOLLOWERS - currentFollowers) / Math.max(1, daysRemaining));
  const onTrackFollowers = Math.round(START_FOLLOWERS + (totalGrowthNeeded * daysElapsed) / totalDays);
  const behindBy = onTrackFollowers - currentFollowers;

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/3 via-transparent to-transparent pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-400 pulse-dot"></div>
            <span className="text-green-400 text-xs font-semibold uppercase tracking-wider">Growth Mission</span>
          </div>
          <h2 className="text-white text-xl font-bold">15 → 10,000 Followers</h2>
          <p className="text-[#666] text-sm mt-0.5">Instagram · Cactus Lab · May 10 – 31, 2026</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2 text-center">
          <div className="text-green-400 text-2xl font-bold">{daysRemaining}</div>
          <div className="text-green-400/60 text-xs">days left</div>
        </div>
      </div>

      {/* Progress section */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-3">
          <div>
            <span className="text-white text-3xl font-bold">{currentFollowers.toLocaleString()}</span>
            <span className="text-[#555] text-lg ml-2">/ 10,000</span>
          </div>
          <div className="text-right">
            <span className="text-green-400 text-lg font-semibold">{progressPercent.toFixed(2)}%</span>
            <div className="text-[#555] text-xs">complete</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-4 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#2a2a2a]">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-700 via-green-500 to-green-400 rounded-full transition-all duration-1500 ease-out"
            style={{
              width: animated ? `${Math.max(progressPercent, 0.5)}%` : "0%",
              transition: "width 1.5s ease-out",
            }}
          ></div>
          {/* Milestone markers */}
          <div className="absolute inset-0 flex items-center">
            {[10, 25, 50, 75].map((milestone) => (
              <div
                key={milestone}
                className="absolute top-0 bottom-0 w-px bg-[#333] opacity-50"
                style={{ left: `${milestone}%` }}
              ></div>
            ))}
          </div>
        </div>

        <div className="flex justify-between text-xs text-[#555] mt-1.5">
          <span>15</span>
          <span>500</span>
          <span>2,500</span>
          <span>5,000</span>
          <span>7,500</span>
          <span className="text-green-500/60">10K 🎯</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-3.5 h-3.5 text-green-400" />
            <span className="text-[#888] text-xs">Daily Target</span>
          </div>
          <div className="text-white font-bold text-lg">+{dailyTargetToGoal.toLocaleString()}</div>
          <div className="text-[#555] text-xs">followers/day</div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[#888] text-xs">Days Left</span>
          </div>
          <div className="text-white font-bold text-lg">{daysRemaining}</div>
          <div className="text-[#555] text-xs">of {totalDays} total</div>
        </div>

        <div className={`bg-[#1a1a1a] border rounded-xl p-3 ${behindBy > 0 ? "border-red-500/20" : "border-green-500/20"}`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className={`w-3.5 h-3.5 ${behindBy > 0 ? "text-red-400" : "text-green-400"}`} />
            <span className="text-[#888] text-xs">vs Target</span>
          </div>
          <div className={`font-bold text-lg ${behindBy > 0 ? "text-red-400" : "text-green-400"}`}>
            {behindBy > 0 ? `-${behindBy}` : `+${Math.abs(behindBy)}`}
          </div>
          <div className="text-[#555] text-xs">{behindBy > 0 ? "behind pace" : "ahead of pace"}</div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[#888] text-xs">Growth Needed</span>
          </div>
          <div className="text-white font-bold text-lg">{(GOAL_FOLLOWERS - currentFollowers).toLocaleString()}</div>
          <div className="text-[#555] text-xs">more followers</div>
        </div>
      </div>

      {/* Weekly milestones */}
      <div className="mt-4 pt-4 border-t border-[#1e1e1e]">
        <p className="text-[#666] text-xs font-medium mb-3">Weekly Milestones</p>
        <div className="flex gap-2">
          {[
            { week: "W1", target: "500", date: "May 17", achieved: currentFollowers >= 500 },
            { week: "W2", target: "2,000", date: "May 24", achieved: currentFollowers >= 2000 },
            { week: "W3", target: "10,000", date: "May 31", achieved: currentFollowers >= 10000 },
          ].map((m) => (
            <div
              key={m.week}
              className={`flex-1 rounded-lg p-2.5 text-center border ${
                m.achieved
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-[#1a1a1a] border-[#2a2a2a]"
              }`}
            >
              <div className={`text-xs font-semibold ${m.achieved ? "text-green-400" : "text-[#666]"}`}>
                {m.week}
              </div>
              <div className={`text-sm font-bold mt-0.5 ${m.achieved ? "text-white" : "text-[#888]"}`}>
                {m.target}
              </div>
              <div className="text-[#555] text-xs">{m.date}</div>
              {m.achieved && <div className="text-green-400 text-xs mt-0.5">✓</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
