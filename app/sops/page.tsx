"use client";

import { useState } from "react";
import { ClipboardList, ChevronDown, ChevronUp, Check } from "lucide-react";

function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | React.ReactNode)[][];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#2a2a2a]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#2a2a2a] bg-[#1a1a1a]">
            {headers.map((h) => (
              <th key={h} className="text-left px-4 py-3 text-[#888] font-semibold text-xs uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[#1e1e1e] last:border-0 hover:bg-[#161616] transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-[#ccc] align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionCard({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 hover:bg-[#161616] transition-colors text-left"
      >
        <h2 className="text-white font-semibold text-base">{title}</h2>
        {open ? (
          <ChevronUp className="w-4 h-4 text-[#555] flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#555] flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="border-t border-[#1a1a1a] px-6 py-5 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

interface ChecklistItem {
  id: string;
  text: string;
  sub?: string;
}

function Checklist({ items }: { items: ChecklistItem[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => toggle(item.id)}
          className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-[#1a1a1a] transition-colors text-left group"
        >
          <div
            className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
              checked.has(item.id)
                ? "bg-green-500 border-green-500"
                : "border-[#333] group-hover:border-green-500/40"
            }`}
          >
            {checked.has(item.id) && <Check className="w-3 h-3 text-black" />}
          </div>
          <div>
            <p className={`text-sm transition-colors ${checked.has(item.id) ? "text-[#555] line-through" : "text-[#ccc]"}`}>
              {item.text}
            </p>
            {item.sub && (
              <p className="text-[#555] text-xs mt-0.5">{item.sub}</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

const ONBOARDING_STEPS: ChecklistItem[] = [
  {
    id: "welcome",
    text: "Send welcome WhatsApp the same day the contract is signed",
  },
  {
    id: "form",
    text: "Send onboarding form (Google Form): brand colours, tone of voice, competitors, goals, IG credentials",
  },
  {
    id: "call",
    text: "Book onboarding call within 48hrs — 30 min, cover scope, revision policy, comms norms",
  },
  {
    id: "chat",
    text: "Create dedicated WhatsApp chat (never mix clients)",
  },
  {
    id: "drive",
    text: "Create their Google Drive folder on day 1",
  },
  {
    id: "plan",
    text: "Send first content plan within 5 business days of signing",
  },
  {
    id: "expectation",
    text: "Set expectation: posts go live on schedule — approvals must come within 24hrs",
  },
];

interface QCItem {
  check: string;
  pass: string;
  fail: string;
}

const QC_ITEMS: QCItem[] = [
  {
    check: "Hook timing",
    pass: "A visual cut, text, or spoken hook appears within the first 2 seconds — no black screen, no logo intro, no music fade-in",
    fail: "Return to editor with timestamp note",
  },
  {
    check: "Captions accuracy",
    pass: "Play through at 1x speed and read every caption word — no misspellings, no wrong words, no missing lines",
    fail: "Return to editor with corrected caption file",
  },
  {
    check: "CTA present",
    pass: "Last 3 seconds contain at least one call to action (follow, comment, DM, visit link in bio) — must be visible on screen or spoken",
    fail: "Add CTA text overlay before publishing",
  },
  {
    check: "Aspect ratio",
    pass: "Video is 9:16 (1080×1920px) for Reels/TikTok/Shorts; no black bars on sides or top/bottom",
    fail: "Return to editor — wrong export settings",
  },
  {
    check: "Audio levels",
    pass: "No clipping, no sudden loud spikes, music doesn't drown out voiceover",
    fail: "Return to editor for audio mix fix",
  },
  {
    check: "Branding",
    pass: "Client's handle/logo watermark present if required by client brief",
    fail: "Add in Canva or CapCut before publishing",
  },
  {
    check: "Platform suitability",
    pass: "No competitor platform logos visible (e.g. TikTok watermark on a Reel)",
    fail: "Remove watermark — re-export clean",
  },
];

export default function SOPsPage() {
  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-2">
          <ClipboardList className="w-4 h-4" />
          Playbooks
        </div>
        <h1 className="text-white text-2xl font-bold">SOPs & Ops</h1>
        <p className="text-[#666] mt-1">
          Monthly workflow, onboarding checklist, QC standards, retention system, and file management.
        </p>
      </div>

      {/* Key ops rules */}
      <div className="bg-green-500/5 border border-green-500/15 rounded-2xl p-4">
        <p className="text-green-400 text-xs font-semibold uppercase tracking-wide mb-3">Non-Negotiable Ops Rules</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            "Never start work without a signed contract AND first payment received",
            "Every video gets exactly 1 revision round — written into every contract",
            "Deliverables accepted if client doesn't respond within 3 business days",
            "Editor access via Google Drive only — no WhatsApp file transfers",
            "Post via scheduling tool (Later/Buffer) — never post manually",
          ].map((rule) => (
            <div key={rule} className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5 flex-shrink-0 text-xs">✓</span>
              <p className="text-[#ccc] text-sm">{rule}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 1. Monthly Client Workflow */}
      <SectionCard title="1. Monthly Client Workflow">
        <Table
          headers={["When", "Task"]}
          rows={[
            ["Week 1", "Content planning call (20 min max) → Script all 15 videos"],
            ["Week 1–2", "Batch all filming into 1–2 shoot days per client"],
            ["Rolling", "Send raw footage to editor within 24hrs of shoot day"],
            ["Rolling", "Editor turnaround: 48hrs per video"],
            ["Rolling", "Review and approve all edits within 24hrs of receiving"],
            ["End of month", "Schedule all 15 posts via Later/Buffer — never post manually"],
            ["Day 3 (next month)", "Send monthly performance report to client"],
          ]}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
            <p className="text-[#888] text-xs font-semibold uppercase tracking-wide mb-1">Daily</p>
            <p className="text-[#ccc] text-sm">Story reposts — max 15 mins per client per day</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
            <p className="text-[#888] text-xs font-semibold uppercase tracking-wide mb-1">Bi-Weekly</p>
            <p className="text-[#ccc] text-sm">Short performance update (views, followers, top post)</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
            <p className="text-[#888] text-xs font-semibold uppercase tracking-wide mb-1">Monthly</p>
            <p className="text-[#ccc] text-sm">20-min check-in call (results + upcoming plan + feedback)</p>
          </div>
        </div>
      </SectionCard>

      {/* 2. Client Onboarding Checklist */}
      <SectionCard title="2. Client Onboarding Checklist">
        <p className="text-[#666] text-sm">
          Complete every step for every new client. Click to mark as done (visual reference only — not persisted).
        </p>
        <Checklist items={ONBOARDING_STEPS} />
      </SectionCard>

      {/* 3. Quality Control */}
      <SectionCard title="3. Quality Control — Pre-Publish Checklist">
        <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3 mb-2">
          <p className="text-red-400 text-sm font-medium">
            Every video, no exceptions. Do not publish if any item fails.
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-[#2a2a2a]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a] bg-[#1a1a1a]">
                <th className="text-left px-4 py-3 text-[#888] font-semibold text-xs uppercase tracking-wide w-32">Check</th>
                <th className="text-left px-4 py-3 text-[#888] font-semibold text-xs uppercase tracking-wide">Pass Criteria</th>
                <th className="text-left px-4 py-3 text-[#888] font-semibold text-xs uppercase tracking-wide w-52">Fail = Do This</th>
              </tr>
            </thead>
            <tbody>
              {QC_ITEMS.map((item) => (
                <tr key={item.check} className="border-b border-[#1e1e1e] last:border-0 hover:bg-[#161616] transition-colors">
                  <td className="px-4 py-3 text-white font-medium align-top">{item.check}</td>
                  <td className="px-4 py-3 text-[#ccc] align-top">{item.pass}</td>
                  <td className="px-4 py-3 text-amber-400 align-top text-xs">{item.fail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
          <p className="text-[#888] text-sm">
            <span className="text-white font-medium">Revision policy:</span> 1 round per video — written into every contract. Never give unlimited revisions.
          </p>
        </div>
      </SectionCard>

      {/* 4. Retention System */}
      <SectionCard title="4. Retention System">
        <Table
          headers={["Touchpoint", "Details"]}
          rows={[
            ["Bi-weekly update", "Short performance update: views, followers, top post"],
            ["Monthly check-in", "20-min call: results + upcoming plan + feedback"],
            ["Month 2", "Ask for written feedback — use as testimonial if positive"],
            ["Every month", "Proactively suggest 2 new content ideas before client asks"],
            ["Month 2 (3-month contract)", "Start renewal conversation"],
            ["Month 3", "Offer loyalty incentive for 6-month commitment: AED 500 off/month"],
          ]}
        />
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
          <p className="text-amber-400 text-sm font-medium">
            Finance: Invoice on the 1st. Payment due by the 5th. Follow up day 6. Suspend services day 15.
          </p>
        </div>
      </SectionCard>

      {/* 5. File Management */}
      <SectionCard title="5. File Management">
        <div>
          <p className="text-[#888] text-xs font-semibold uppercase tracking-wide mb-3">Google Drive Folder Structure</p>
          <div className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl p-4 font-mono text-sm text-[#ccc]">
            <div className="text-green-400">/Clients/[Client Name]/[Month]/</div>
            <div className="pl-4 text-[#777]">Raw/</div>
            <div className="pl-4 text-[#777]">Edited/</div>
            <div className="pl-4 text-[#777]">Posted/</div>
            <div className="pl-4 text-[#777]">Reports/</div>
          </div>
        </div>
        <div>
          <p className="text-[#888] text-xs font-semibold uppercase tracking-wide mb-2">File Naming Convention</p>
          <div className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl p-3 font-mono text-sm text-green-400">
            ClientName_VideoTitle_MonthYear_v1.mp4
          </div>
        </div>
        <div>
          <p className="text-[#888] text-xs font-semibold uppercase tracking-wide mb-3">Rules</p>
          <ul className="space-y-2">
            {[
              "Editor access via shared Drive folder only — no WhatsApp file transfers",
              "Monthly archive: move previous month's folder to /Archive after reporting",
              "Local files: ~/AwabHQ/Cactus Lab/Clients/[Client]/Content/",
            ].map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-[#ccc] text-sm">
                <span className="text-green-400 mt-0.5">•</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </SectionCard>
    </div>
  );
}
