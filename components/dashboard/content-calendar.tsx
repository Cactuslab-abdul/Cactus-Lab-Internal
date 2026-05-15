"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface DayNote {
  day: number;
  note: string;
  type: "reel" | "story" | "collab" | "engagement";
}

const defaultNotes: DayNote[] = [
  { day: 10, note: "Launch Reel: Cactus Lab Intro", type: "reel" },
  { day: 11, note: "Pets Delight: Dog food unboxing", type: "reel" },
  { day: 12, note: "Engagement sprint: comment on 50 posts", type: "engagement" },
  { day: 13, note: "Trending audio reel", type: "reel" },
  { day: 14, note: "Behind-the-scenes story series", type: "story" },
  { day: 15, note: "UAE pet market insights reel", type: "reel" },
  { day: 16, note: "Collab DMs: 10 pet accounts", type: "collab" },
  { day: 17, note: "Client results showcase reel", type: "reel" },
  { day: 18, note: "FAQ: What is Cactus Lab?", type: "reel" },
  { day: 19, note: "Hashtag deep-dive + story polls", type: "engagement" },
  { day: 20, note: "Pets Delight: Cat treats comparison", type: "reel" },
  { day: 21, note: "Agency life content", type: "reel" },
  { day: 22, note: "Reach out to 20 UAE businesses", type: "collab" },
  { day: 23, note: "Viral format recreation", type: "reel" },
  { day: 24, note: "2K followers milestone post", type: "reel" },
  { day: 25, note: "AED 5,500/mo value proposition reel", type: "reel" },
  { day: 26, note: "Engagement push: reply to all comments", type: "engagement" },
  { day: 27, note: "UAE SME pain points reel", type: "reel" },
  { day: 28, note: "Pets Delight success story", type: "reel" },
  { day: 29, note: "Collab with UAE pet influencer", type: "collab" },
  { day: 30, note: "Countdown to 10K reel", type: "reel" },
  { day: 31, note: "10K GOAL! Celebration reel", type: "reel" },
];

const typeColors: Record<DayNote["type"], string> = {
  reel: "bg-green-500/20 text-green-400 border-green-500/30",
  story: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  collab: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  engagement: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const typeLabels: Record<DayNote["type"], string> = {
  reel: "Reel",
  story: "Story",
  collab: "Collab",
  engagement: "Engage",
};

export default function ContentCalendar() {
  const [notes, setNotes] = useState<DayNote[]>(defaultNotes);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [editNote, setEditNote] = useState("");

  const year = 2026;
  const month = 4; // May (0-indexed)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const today = 10; // May 10, 2026

  const getDayNote = (day: number) => notes.find((n) => n.day === day);

  const handleDayClick = (day: number) => {
    const note = getDayNote(day);
    setSelectedDay(day);
    setEditNote(note?.note || "");
  };

  const handleSaveNote = () => {
    if (selectedDay === null) return;
    setNotes((prev) => {
      const existing = prev.find((n) => n.day === selectedDay);
      if (existing) {
        return prev.map((n) =>
          n.day === selectedDay ? { ...n, note: editNote } : n
        );
      }
      return [...prev, { day: selectedDay, note: editNote, type: "reel" }];
    });
    setSelectedDay(null);
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold text-base">Content Calendar</h3>
          <p className="text-[#666] text-sm">May 2026 — 21-Day Growth Sprint</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="flex items-center gap-2">
            {Object.entries(typeLabels).map(([type, label]) => (
              <div key={type} className={`flex items-center gap-1 px-2 py-1 rounded-md border text-xs ${typeColors[type as DayNote["type"]]}`}>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-[#555] text-xs py-1 font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month start */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-20 rounded-lg"></div>
          ))}

          {/* Month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const note = getDayNote(day);
            const isToday = day === today;
            const isPast = day < today;
            const isGoalDay = day === 31;
            const isInSprint = day >= 10;

            return (
              <button
                key={day}
                onClick={() => isInSprint && handleDayClick(day)}
                className={`h-20 rounded-xl p-2 text-left transition-all duration-150 border ${
                  isGoalDay
                    ? "bg-green-500/15 border-green-500/40 hover:border-green-500/60"
                    : isToday
                    ? "bg-green-500/10 border-green-500/30 hover:border-green-500/50"
                    : isPast || !isInSprint
                    ? "bg-[#0e0e0e] border-[#1a1a1a] opacity-40"
                    : "bg-[#1a1a1a] border-[#252525] hover:border-[#333] hover:bg-[#1e1e1e]"
                } ${isInSprint && !isPast ? "cursor-pointer" : "cursor-default"}`}
              >
                <div className={`text-xs font-bold mb-1 ${
                  isGoalDay ? "text-green-400" :
                  isToday ? "text-green-300" :
                  isPast || !isInSprint ? "text-[#444]" : "text-[#888]"
                }`}>
                  {day}
                  {isToday && <span className="ml-1 text-green-400">•</span>}
                  {isGoalDay && <span className="ml-1">🎯</span>}
                </div>
                {note && (
                  <div className={`text-xs px-1.5 py-0.5 rounded border text-left line-clamp-2 leading-tight ${typeColors[note.type]}`}>
                    {note.note}
                  </div>
                )}
                {!note && isInSprint && !isPast && (
                  <div className="flex items-center gap-0.5 text-[#444] text-xs opacity-0 group-hover:opacity-100">
                    <Plus className="w-2.5 h-2.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Edit modal */}
      {selectedDay !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedDay(null)}>
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white font-semibold mb-1">May {selectedDay}</h3>
            <p className="text-[#666] text-sm mb-4">Add content note for this day</p>
            <textarea
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              placeholder="What are you posting today?"
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 text-white text-sm placeholder-[#555] resize-none focus:border-green-500/50 transition-colors"
              rows={3}
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSaveNote}
                className="flex-1 bg-green-500 hover:bg-green-400 text-black font-semibold py-2 rounded-xl text-sm transition-colors"
              >
                Save Note
              </button>
              <button
                onClick={() => setSelectedDay(null)}
                className="flex-1 bg-[#2a2a2a] hover:bg-[#333] text-white font-medium py-2 rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
