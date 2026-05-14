"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, X, RotateCcw } from "lucide-react";

interface CheckItem {
  t: string;
  p: "high" | "med" | "low";
}

interface SubSection {
  sub: string;
  items: CheckItem[];
}

interface Section {
  id: string;
  label: string;
  items: SubSection[];
}

const SECTIONS: Section[] = [
  {
    id: "sales", label: "Sales system", items: [
      { sub: "Lead generation", items: [
        { t: "Set up Cactus Lab Instagram — 12+ posts before any outreach begins", p: "high" },
        { t: "Write a one-line bio: \"We make short videos for UAE businesses. You stay off camera.\"", p: "high" },
        { t: "Add a highlight reel to IG profile: best Pets Delight results and BTS clips", p: "high" },
        { t: "Build saved list of prospecting hashtags per niche (#dubaigarage, #dubaiperfume, etc.)", p: "high" },
        { t: "Set up Google Maps saved searches for each niche in Dubai and Sharjah", p: "med" },
        { t: "Set up WhatsApp Business with Cactus Lab name, profile photo, and business description", p: "high" },
        { t: "Define daily lead target: find 40–50, message 30, minimum", p: "high" },
        { t: "Create a weekly walk-in area rotation: Al Quoz Mon, Deira Tue, Sharjah Industrial Thu", p: "med" },
      ]},
      { sub: "Outreach system", items: [
        { t: "Write 3 DM openers — one per niche cluster (perfume/watch, car, recruitment)", p: "high" },
        { t: "Write a WhatsApp cold opener template for walk-in follow-ups", p: "high" },
        { t: "Block 9am–10:30am every morning as outreach-only time", p: "high" },
        { t: "Log every lead in the pipeline tracker immediately after messaging", p: "high" },
        { t: "Never DM from a hollow account — verify profile looks credible before each session", p: "med" },
      ]},
      { sub: "Follow-up cadence", items: [
        { t: "Write and save a Day 3 follow-up message", p: "high" },
        { t: "Write and save a Day 7 final touch message", p: "high" },
        { t: "After 2 no-replies, move lead to a \"30-day warm-up\" list", p: "med" },
        { t: "Every Friday: review all \"Replied\" leads and push every open conversation forward", p: "high" },
      ]},
      { sub: "Closing", items: [
        { t: "Build a simple WhatsApp pitch structure: problem → solution → proof → offer → 48hr close", p: "high" },
        { t: "Create a Google Drive \"proof folder\" with Pets Delight content, metrics screenshot, account growth", p: "high" },
        { t: "Anchor at AED 5,500 — do not open at 4,500. Discount is your closing lever, not your opening price.", p: "high" },
        { t: "Prepare 3 objection responses: \"too expensive\", \"let me think about it\", \"we already do it in-house\"", p: "high" },
        { t: "Set a 48-hour decision deadline on every verbal agreement", p: "high" },
        { t: "Close via WhatsApp voice note or call — not a text thread", p: "med" },
      ]},
      { sub: "Referrals", items: [
        { t: "Ask Pets Delight for 3 warm introductions this month", p: "high" },
        { t: "Create a simple referral incentive: 1 free month for each referred client who signs", p: "med" },
        { t: "After every closed deal: ask the new client within 2 weeks if they know anyone", p: "med" },
      ]},
    ],
  },
  {
    id: "ops", label: "Operations", items: [
      { sub: "Monthly client workflow", items: [
        { t: "Set a fixed content planning call at the start of each month — 20 min max", p: "high" },
        { t: "Use a fixed monthly content calendar template (Google Sheets)", p: "high" },
        { t: "Script all 15 videos in week 1 of each month", p: "high" },
        { t: "Batch all filming into 1–2 dedicated shoot days per client per month", p: "high" },
        { t: "Send raw footage to editor within 24hrs of shoot day", p: "high" },
        { t: "Editor turnaround: 48hrs per video — defined in editor agreement", p: "high" },
        { t: "Review and approve all edits within 24hrs of receiving them", p: "high" },
        { t: "Schedule all 15 posts using Later or Buffer — never post manually", p: "high" },
        { t: "Story reposts done daily — max 15 mins per client per day", p: "med" },
        { t: "Monthly performance report sent to client by day 3 of the following month", p: "high" },
      ]},
      { sub: "Quality control", items: [
        { t: "Create a pre-publish video checklist: hook in first 2 seconds, captions accurate, CTA clear, correct aspect ratio", p: "high" },
        { t: "Build caption templates for each content type: educational, comedic, brand story, testimonial", p: "med" },
        { t: "Define revision limit: 1 round of revisions per video — written into every contract", p: "high" },
        { t: "Never post anything without a review pass — even story reposts", p: "med" },
      ]},
      { sub: "File management", items: [
        { t: "Google Drive folder structure: /Clients/[Name]/[Month]/Raw — Edited — Posted — Reports", p: "high" },
        { t: "File naming convention: ClientName_VideoTitle_MonthYear_v1.mp4", p: "med" },
        { t: "Editor access via shared Drive folder only — no WhatsApp file transfers", p: "high" },
        { t: "Monthly archive: move previous month's folder to /Archive after reporting", p: "low" },
      ]},
    ],
  },
  {
    id: "onboarding", label: "Onboarding & retention", items: [
      { sub: "Client onboarding", items: [
        { t: "Send a welcome WhatsApp message the same day the contract is signed", p: "high" },
        { t: "Send onboarding form (Google Form): brand colours, tone of voice, competitors, goals, IG credentials", p: "high" },
        { t: "Book onboarding call within 48hrs of signing: 30 min, cover scope, revision policy, communication norms", p: "high" },
        { t: "Create a dedicated WhatsApp chat per client — never mix clients in one group", p: "high" },
        { t: "Create their Google Drive folder on day 1", p: "high" },
        { t: "Send first content plan within 5 business days of signing", p: "high" },
        { t: "Set client expectations clearly: posts go live on schedule — approvals must come within 24hrs", p: "high" },
      ]},
      { sub: "Retention system", items: [
        { t: "Send a short performance update every 2 weeks — views, followers gained, top post", p: "high" },
        { t: "Monthly check-in call: 20 min — results, upcoming month plan, any feedback", p: "high" },
        { t: "Ask for written feedback after month 2 — use this as a testimonial if positive", p: "med" },
        { t: "Proactively suggest 2 new content ideas each month before the client asks", p: "med" },
        { t: "Start renewal conversation at month 2 (for 3-month contracts)", p: "high" },
        { t: "After month 3: offer a loyalty incentive for 6-month commitment (AED 500 off monthly)", p: "low" },
      ]},
    ],
  },
  {
    id: "admin", label: "Admin & finance", items: [
      { sub: "Legal", items: [
        { t: "Get a standard service contract template — bilingual EN/AR preferred for UAE", p: "high" },
        { t: "Contract must include: scope, 15 videos/month, 1 revision round, 30-day cancellation, payment terms", p: "high" },
        { t: "Send contracts as PDF via WhatsApp — request signed copy back before work begins", p: "high" },
        { t: "Store all signed contracts in Drive: /Admin/Contracts/[Client Name]", p: "high" },
        { t: "Never start work without a signed contract and first invoice paid", p: "high" },
      ]},
      { sub: "Invoicing", items: [
        { t: "Set up Wave (free) or Zoho Invoice for professional, trackable invoices", p: "high" },
        { t: "Invoice sent on the 1st of each month", p: "high" },
        { t: "Payment due by the 5th of each month", p: "high" },
        { t: "Late payment clause in contract: follow-up on day 6, pause on day 15", p: "med" },
        { t: "Log every payment in the finance tracker on receipt", p: "high" },
        { t: "Track monthly revenue vs target (AED 5,500 × number of clients)", p: "high" },
      ]},
      { sub: "Banking & costs", items: [
        { t: "Open a dedicated business bank account (Wio Business or Emirates NBD business)", p: "high" },
        { t: "All client payments received into business account only", p: "high" },
        { t: "All operating costs (editor, tools, travel) paid from business account", p: "med" },
        { t: "Keep monthly cost log — keep operating costs under AED 3,000 until 5 clients", p: "med" },
      ]},
    ],
  },
  {
    id: "tools", label: "Tools & platforms", items: [
      { sub: "Communication", items: [
        { t: "WhatsApp Business app installed with Cactus Lab name, logo, and description", p: "high" },
        { t: "Set business hours in WhatsApp Business profile (9am–7pm, Mon–Sat)", p: "med" },
        { t: "Set an away message for outside hours", p: "med" },
        { t: "Dedicated WhatsApp chat per client — labelled with client name", p: "high" },
        { t: "Use WhatsApp Business \"Labels\" to tag leads by stage (New, Replied, Proposal, Client)", p: "med" },
      ]},
      { sub: "Content & scheduling", items: [
        { t: "Scheduling tool live: Later or Buffer — used for all 15 posts per client", p: "high" },
        { t: "Canva Pro for static posts and caption graphics (AED 150/month)", p: "med" },
        { t: "Editor uses CapCut or Premiere Pro — confirm their setup is professional-grade", p: "high" },
        { t: "Google Drive as the only file transfer system — no personal file-sharing apps", p: "high" },
      ]},
      { sub: "Tracking & management", items: [
        { t: "Pipeline tracker updated every morning before outreach session", p: "high" },
        { t: "Finance tracker updated every time an invoice is sent or payment received", p: "high" },
        { t: "Google Calendar: all shoot days, client calls, and deadlines blocked in advance", p: "high" },
        { t: "Notion or Google Sheets as master operations hub — all SOPs, templates, and resources", p: "med" },
      ]},
    ],
  },
  {
    id: "marketing", label: "Own marketing", items: [
      { sub: "Cactus Lab Instagram", items: [
        { t: "Post 3x per week minimum on Cactus Lab IG — always short-form video", p: "high" },
        { t: "Content pillars: BTS of shoots, client results, content tips, niche-specific hooks", p: "high" },
        { t: "Never post \"we offer social media management\" — show the work, show results, show the process", p: "high" },
        { t: "Use your own IG as a live case study: document growth from 0 to 1,000 to 10,000", p: "med" },
        { t: "Target to 1,000 followers before leading with growth as a pitch point", p: "med" },
      ]},
      { sub: "Outbound content marketing", items: [
        { t: "Run one niche-targeted DM campaign per week — same niche, 30 businesses in one day", p: "high" },
        { t: "Create one \"results post\" per closed client (before/after content quality, follower growth)", p: "high" },
        { t: "Post one \"behind the shoot\" reel per week", p: "med" },
        { t: "Collect one video testimonial from Pets Delight this month and post it", p: "high" },
      ]},
      { sub: "Positioning", items: [
        { t: "Pick one positioning line and use it everywhere: \"Content that actually works — without you lifting a finger\"", p: "med" },
        { t: "Make \"no client on set needed\" a feature in every pitch and every IG bio", p: "high" },
        { t: "Every piece of Cactus Lab content should demonstrate — not describe — what you do", p: "high" },
      ]},
    ],
  },
  {
    id: "team", label: "Team & hiring", items: [
      { sub: "Current setup (0–3 clients)", items: [
        { t: "Define editor SLA in writing: 48hr turnaround, 1 revision round included", p: "high" },
        { t: "Pay editor per video delivered — not monthly salary", p: "high" },
        { t: "Document your shoot workflow: gear checklist, shot list template, minimum shots per video type", p: "med" },
        { t: "No full-time hires until you have 5 paying clients", p: "high" },
      ]},
      { sub: "Scaling triggers", items: [
        { t: "At 4 clients: hire a part-time content coordinator for scheduling and story reposts (AED 2,000–3,000/month)", p: "med" },
        { t: "At 6 clients: bring in a second shooter on per-project revenue share (not salary)", p: "med" },
        { t: "At 8 clients: operations coordinator to manage client communication and reporting", p: "low" },
        { t: "At 10 clients: review full team structure — agency stage, not freelancer stage", p: "low" },
      ]},
      { sub: "Hiring principles", items: [
        { t: "Never hire someone to fix a problem — hire someone to scale a solution that already works", p: "med" },
        { t: "Trial every hire with a paid test project before committing to a retainer", p: "high" },
        { t: "Keep all non-founder roles variable cost until revenue is consistent for 3+ months", p: "high" },
      ]},
    ],
  },
];

const DEFAULT_CLIENTS = ["Agency (global)", "Pets Delight"];

function storageKey(clientName: string, sectionId: string, sub: string, i: number) {
  const safe = clientName.replace(/[^a-z0-9]/gi, "_");
  const safeSub = sub.replace(/[^a-z0-9]/gi, "_");
  return `cactus-check_${safe}_${sectionId}_${safeSub}_${i}`;
}

export default function ChecklistPage() {
  const [clients, setClients] = useState<string[]>(DEFAULT_CLIENTS);
  const [activeClient, setActiveClient] = useState(DEFAULT_CLIENTS[0]);
  const [currentSec, setCurrentSec] = useState(0);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  // Load from localStorage
  useEffect(() => {
    const savedClients = localStorage.getItem("cactus-checklist-clients");
    if (savedClients) {
      try {
        const c = JSON.parse(savedClients);
        setClients(c);
        setActiveClient(c[0]);
      } catch {}
    }
    // Load all checked states
    const state: Record<string, boolean> = {};
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith("cactus-check_")) state[k] = true;
    });
    setChecked(state);
  }, []);

  const toggle = useCallback((clientName: string, sectionId: string, sub: string, i: number) => {
    const key = storageKey(clientName, sectionId, sub, i);
    setChecked(prev => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
        localStorage.removeItem(key);
      } else {
        next[key] = true;
        localStorage.setItem(key, "1");
      }
      return next;
    });
  }, []);

  const isChecked = (clientName: string, sectionId: string, sub: string, i: number) =>
    !!checked[storageKey(clientName, sectionId, sub, i)];

  const totalItems = SECTIONS.reduce((a, s) => a + s.items.reduce((b, g) => b + g.items.length, 0), 0);

  const checkedCount = (clientName: string) =>
    SECTIONS.reduce((a, s) => a + s.items.reduce((b, g) => b + g.items.filter((_, i) => isChecked(clientName, s.id, g.sub, i)).length, 0), 0);

  const secCheckedCount = (clientName: string, sid: string) => {
    const s = SECTIONS.find(x => x.id === sid);
    if (!s) return 0;
    return s.items.reduce((a, g) => a + g.items.filter((_, i) => isChecked(clientName, s.id, g.sub, i)).length, 0);
  };

  const secTotalCount = (sid: string) => {
    const s = SECTIONS.find(x => x.id === sid);
    return s ? s.items.reduce((a, g) => a + g.items.length, 0) : 0;
  };

  const addClient = () => {
    const name = prompt("New client name:");
    if (!name || !name.trim()) return;
    const clean = name.trim();
    if (clients.includes(clean)) { alert("Client already exists."); return; }
    const updated = [...clients, clean];
    setClients(updated);
    localStorage.setItem("cactus-checklist-clients", JSON.stringify(updated));
    setActiveClient(clean);
  };

  const deleteClient = (name: string) => {
    if (!confirm(`Remove "${name}" from the checklist?`)) return;
    SECTIONS.forEach(s => s.items.forEach(g => g.items.forEach((_, i) => {
      const key = storageKey(name, s.id, g.sub, i);
      localStorage.removeItem(key);
    })));
    const updated = clients.filter(c => c !== name);
    setClients(updated);
    localStorage.setItem("cactus-checklist-clients", JSON.stringify(updated));
    if (activeClient === name) setActiveClient(updated[0]);
    setChecked(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { if (k.includes(name.replace(/[^a-z0-9]/gi, "_"))) delete next[k]; });
      return next;
    });
  };

  const resetSection = (sid: string) => {
    if (!confirm(`Reset all items in this section for "${activeClient}"?`)) return;
    const s = SECTIONS.find(x => x.id === sid);
    if (!s) return;
    setChecked(prev => {
      const next = { ...prev };
      s.items.forEach(g => g.items.forEach((_, i) => {
        const key = storageKey(activeClient, s.id, g.sub, i);
        delete next[key];
        localStorage.removeItem(key);
      }));
      return next;
    });
  };

  const doneCurrent = checkedCount(activeClient);
  const currentSection = SECTIONS[currentSec];
  const secDone = secCheckedCount(activeClient, currentSection.id);
  const secTotal = secTotalCount(currentSection.id);

  const priorityColors: Record<string, string> = {
    high: "bg-red-900/30 text-red-400",
    med: "bg-yellow-900/30 text-yellow-400",
    low: "bg-green-900/30 text-green-400",
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">Ops Checklist</h1>
        <p className="text-[#666] mt-1">Complete agency operations checklist — track per client</p>
      </div>

      {/* Overall progress */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-white font-medium">{doneCurrent} / {totalItems} completed</span>
            <span className="text-[#555] text-sm ml-2">— {activeClient}</span>
          </div>
          <span className="text-[#555] text-sm">{Math.round((doneCurrent / totalItems) * 100)}%</span>
        </div>
        <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${(doneCurrent / totalItems) * 100}%` }}
          />
        </div>
      </div>

      {/* Client tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {clients.map(c => (
          <button
            key={c}
            onClick={() => setActiveClient(c)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              c === activeClient
                ? "bg-green-500 text-black border-green-500"
                : "bg-transparent text-[#888] border-[#2a2a2a] hover:border-[#444] hover:text-white"
            }`}
          >
            {c}
            {c !== clients[0] && (
              <span
                onClick={e => { e.stopPropagation(); deleteClient(c); }}
                className="ml-1 opacity-50 hover:opacity-100 hover:text-red-400 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </span>
            )}
          </button>
        ))}
        <button
          onClick={addClient}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-[#555] border border-dashed border-[#2a2a2a] hover:border-green-500/50 hover:text-green-400 transition-all"
        >
          <Plus className="w-3 h-3" />
          Add client
        </button>
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s, i) => {
          const done = secCheckedCount(activeClient, s.id);
          const tot = secTotalCount(s.id);
          return (
            <button
              key={s.id}
              onClick={() => setCurrentSec(i)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                i === currentSec
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-[#888] border-[#2a2a2a] hover:border-[#444] hover:text-white"
              }`}
            >
              {s.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                i === currentSec ? "bg-black/20 text-black" : "bg-[#1e1e1e] text-[#555]"
              }`}>
                {done}/{tot}
              </span>
            </button>
          );
        })}
      </div>

      {/* Section content */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#1e1e1e]">
          <h3 className="text-white font-semibold text-lg">{currentSection.label}</h3>
          <span className="text-[#555] text-sm">{secDone} of {secTotal} done · {activeClient}</span>
        </div>

        <div className="space-y-6">
          {currentSection.items.map(group => (
            <div key={group.sub}>
              <p className="text-[#444] text-[10px] uppercase tracking-wider font-semibold mb-3">{group.sub}</p>
              <div className="space-y-1">
                {group.items.map((item, i) => {
                  const done = isChecked(activeClient, currentSection.id, group.sub, i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggle(activeClient, currentSection.id, group.sub, i)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-150 ${
                        done
                          ? "bg-green-500/5 border border-green-500/15"
                          : "bg-[#1a1a1a] border border-transparent hover:border-[#2a2a2a]"
                      }`}
                    >
                      <div className={`w-4 h-4 mt-0.5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                        done ? "bg-green-500 border-green-500" : "border-[#333]"
                      }`}>
                        {done && (
                          <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 12 12">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm flex-1 leading-relaxed ${done ? "text-[#555] line-through" : "text-white"}`}>
                        {item.t}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${priorityColors[item.p]}`}>
                        {item.p}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-[#1e1e1e] flex justify-end">
          <button
            onClick={() => resetSection(currentSection.id)}
            className="flex items-center gap-2 text-xs text-red-400 border border-red-400/30 hover:border-red-400/60 px-3 py-2 rounded-lg transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset this section for {activeClient}
          </button>
        </div>
      </div>
    </div>
  );
}
