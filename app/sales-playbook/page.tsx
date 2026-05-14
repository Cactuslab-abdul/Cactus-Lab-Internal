"use client";

import { useState } from "react";
import { Target, ChevronDown, ChevronUp } from "lucide-react";

interface AccordionSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

function Callout({
  children,
  variant = "green",
}: {
  children: React.ReactNode;
  variant?: "green" | "amber" | "red";
}) {
  const styles = {
    green: "bg-green-500/5 border-green-500/20 text-green-400",
    amber: "bg-amber-500/5 border-amber-500/20 text-amber-400",
    red: "bg-red-500/5 border-red-500/20 text-red-400",
  };
  return (
    <div className={`border rounded-xl p-3 ${styles[variant]}`}>
      <p className="text-sm font-medium">{children}</p>
    </div>
  );
}

function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
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

function AccordionItem({ section }: { section: AccordionSection }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 hover:bg-[#161616] transition-colors text-left"
      >
        <h2 className="text-white font-semibold text-base">{section.title}</h2>
        {open ? (
          <ChevronUp className="w-4 h-4 text-[#555] flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#555] flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="border-t border-[#1a1a1a] px-6 py-5 space-y-4">
          {section.content}
        </div>
      )}
    </div>
  );
}

const SECTIONS: AccordionSection[] = [
  {
    id: "pricing",
    title: "1. Pricing Rules",
    content: (
      <div className="space-y-4">
        <Callout variant="green">
          Anchor price: AED 5,500/month — never open below this.
        </Callout>
        <Callout variant="amber">
          Minimum price: AED 4,500 — closing concession only. Never use as an opener.
        </Callout>
        <ul className="space-y-2 text-[#ccc] text-sm">
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-0.5">•</span>
            <span>Discount is your closing lever, not your opening price.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-0.5">•</span>
            <span>Monthly revenue target = AED 5,500 × number of clients.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-0.5">•</span>
            <span>New clients: 50% upfront before work begins, 50% on completion.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-0.5">•</span>
            <span>Retainer clients: paid in advance — no work starts without payment received.</span>
          </li>
        </ul>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">AED 5,500</div>
            <div className="text-green-400 text-xs font-semibold uppercase tracking-wide">Anchor / Opening Price</div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">AED 4,500</div>
            <div className="text-amber-400 text-xs font-semibold uppercase tracking-wide">Floor / Close Only</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "leads",
    title: "2. Lead Generation",
    content: (
      <div className="space-y-4">
        <Callout variant="green">
          Daily targets: Find 40–50 leads, message 30 minimum.
        </Callout>
        <div>
          <p className="text-[#888] text-xs font-semibold uppercase tracking-wide mb-3">Instagram Setup (must be done before any outreach)</p>
          <ul className="space-y-2 text-[#ccc] text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span>
              <span>12+ posts live before first DM</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span>
              <span>Bio: <span className="text-white italic">&quot;We make short videos for UAE businesses. You stay off camera.&quot;</span></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span>
              <span>Highlight reel: Pets Delight results + BTS clips</span>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-[#888] text-xs font-semibold uppercase tracking-wide mb-3">Prospecting Channels</p>
          <Table
            headers={["Channel", "Details"]}
            rows={[
              ["Instagram hashtags", "#dubaigarage  #dubaiperfume  #dubairecruiter  #dubaiwatch  #dubaispices"],
              ["Google Maps", "Saved searches per niche in Dubai and Sharjah"],
              ["Walk-in rotation", "Al Quoz (Mon) · Deira (Tue) · Sharjah Industrial (Thu)"],
            ]}
          />
        </div>
        <div>
          <p className="text-[#888] text-xs font-semibold uppercase tracking-wide mb-3">WhatsApp Business Setup</p>
          <ul className="space-y-2 text-[#ccc] text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span>
              <span>Profile: Cactus Lab name, logo, business description</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span>
              <span>Business hours set (9am–7pm, Mon–Sat) with away message for outside hours</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span>
              <span>Label leads by stage: New / Replied / Proposal / Client</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "followup",
    title: "3. Follow-Up Cadence",
    content: (
      <div className="space-y-4">
        <Table
          headers={["Day / Trigger", "Action"]}
          rows={[
            ["Day 0", "Send initial DM/message"],
            ["Day 3", "Send Day 3 follow-up (see Scripts page)"],
            ["Day 7", "Send Day 7 final follow-up (see Scripts page)"],
            ["2 no-replies", "Move to \"30-day warm-up\" list — re-engage next month"],
            ["Every Friday", "Review all \"Replied\" leads and push every open conversation forward"],
          ]}
        />
        <Callout variant="amber">
          Log every lead in the pipeline tracker immediately after messaging.
        </Callout>
      </div>
    ),
  },
  {
    id: "closing",
    title: "4. Closing Playbook",
    content: (
      <div className="space-y-5">
        <div>
          <p className="text-[#888] text-xs font-semibold uppercase tracking-wide mb-3">WhatsApp Pitch Structure</p>
          <div className="flex items-center gap-2 flex-wrap">
            {["Problem", "Solution", "Proof", "Offer", "48hr Close"].map((step, i, arr) => (
              <div key={step} className="flex items-center gap-2">
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2 text-green-400 text-sm font-semibold">
                  {step}
                </div>
                {i < arr.length - 1 && <span className="text-[#444]">→</span>}
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[#888] text-xs font-semibold uppercase tracking-wide mb-3">3 Closing Rules</p>
          <div className="space-y-2">
            <Callout variant="green">Close via WhatsApp voice note or call — never a text thread.</Callout>
            <Callout variant="green">Set a 48-hour decision deadline on every verbal agreement.</Callout>
            <Callout variant="green">Anchor at AED 5,500 — discount only to close, not to start.</Callout>
          </div>
        </div>
        <div>
          <p className="text-[#888] text-xs font-semibold uppercase tracking-wide mb-3">Proof Folder (Google Drive)</p>
          <ul className="space-y-2 text-[#ccc] text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span>
              <span>Pets Delight content samples</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span>
              <span>Metrics screenshots</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span>
              <span>Account growth stats (200 → 2,000 followers, no paid ads)</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "referral",
    title: "5. Referral System",
    content: (
      <div className="space-y-4">
        <ul className="space-y-3 text-[#ccc] text-sm">
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-0.5">•</span>
            <span>Ask <span className="text-white font-medium">Pets Delight</span> for 3 warm introductions this month</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-0.5">•</span>
            <span>Referral incentive: <span className="text-white font-medium">1 free month</span> for each referred client who signs</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-0.5">•</span>
            <span>After every new closed deal: ask within 2 weeks if they know anyone who&apos;d benefit</span>
          </li>
        </ul>
        <Callout variant="amber">
          Pending from Pets Delight: 3 warm referrals + written testimonial + video testimonial. Follow up now.
        </Callout>
      </div>
    ),
  },
];

export default function SalesPlaybookPage() {
  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-2">
          <Target className="w-4 h-4" />
          Playbooks
        </div>
        <h1 className="text-white text-2xl font-bold">Sales Playbook</h1>
        <p className="text-[#666] mt-1">
          Pricing rules, lead generation, follow-up cadence, and closing system.
        </p>
      </div>

      {/* Key rules strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-4">
          <p className="text-red-400 text-xs font-semibold uppercase tracking-wide mb-1">Never Break</p>
          <ul className="space-y-1">
            {[
              "Never open a conversation below AED 5,500",
              "Never DM from a profile with fewer than 12 posts",
              "Never start work without a signed contract AND first payment",
            ].map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-[#ccc] text-sm">
                <span className="text-red-400 mt-0.5 flex-shrink-0">✕</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-green-500/5 border border-green-500/15 rounded-2xl p-4">
          <p className="text-green-400 text-xs font-semibold uppercase tracking-wide mb-1">Always Do</p>
          <ul className="space-y-1">
            {[
              "Block 9–10:30am daily for outreach only",
              "Close via WhatsApp voice note or call",
              "Set 48-hour decision deadline on every verbal agreement",
            ].map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-[#ccc] text-sm">
                <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Accordion sections */}
      <div className="space-y-4">
        {SECTIONS.map((section) => (
          <AccordionItem key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
