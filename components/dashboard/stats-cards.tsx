"use client";

import { Users, FileText, TrendingUp, Link, ArrowUpRight } from "lucide-react";

interface StatsCardsProps {
  stats: {
    followers: number;
    contentGenerated: number;
    trendsAnalyzed: number;
    linksAnalyzed: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Current Followers",
      value: stats.followers.toLocaleString(),
      subtext: "Goal: 10,000",
      icon: Users,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      change: "+0 today",
      changePositive: false,
    },
    {
      label: "Content Generated",
      value: stats.contentGenerated.toString(),
      subtext: "AI content packs",
      icon: FileText,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      change: "this session",
      changePositive: true,
    },
    {
      label: "Trends Scouted",
      value: stats.trendsAnalyzed.toString(),
      subtext: "UAE market trends",
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      change: "this session",
      changePositive: true,
    },
    {
      label: "Links Analyzed",
      value: stats.linksAnalyzed.toString(),
      subtext: "Viral content studied",
      icon: Link,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      change: "this session",
      changePositive: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`bg-[#111] border ${card.borderColor} rounded-2xl p-5 hover:border-opacity-50 transition-all duration-200 card-hover`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${card.bgColor} border ${card.borderColor} rounded-xl p-2.5`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#444]" />
            </div>
            <div className="text-white text-2xl font-bold mb-1">{card.value}</div>
            <div className="text-[#888] text-sm">{card.label}</div>
            <div className="text-[#555] text-xs mt-1">{card.subtext}</div>
          </div>
        );
      })}
    </div>
  );
}
