"use client";

import { useState } from "react";
import {
  MessageSquare,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface Script {
  id: string;
  title: string;
  subtitle?: string;
  text: string;
  tip?: string;
  outreachParam?: string;
}

const DM_OPENERS: Script[] = [
  {
    id: "perfume",
    title: "DM Opener 1 — Perfume & Watch Niche",
    text: `Hey [Name] — just came across [Brand Name] on here and honestly the products look really premium. The packaging/display shots caught my eye.

Quick question — are you guys posting consistently on Reels? Because I've seen perfume brands in Dubai blow up purely from short-form video when it's done right (the unboxing + scent storytelling format is insane for this niche right now).

We're a video content agency in the UAE — we handle everything, scripts, filming, editing, posting — your team never needs to be on camera. We did it for a client in Dubai and grew their account from under 200 to over 2,000 followers without paid ads.

Would it make sense to have a quick chat? Happy to show you what we'd do specifically for [Brand Name].`,
    tip: `Personalisation tip: Reference a specific product, a recent post, or their store location (e.g. "saw your shop is in Deira — we work with businesses across Dubai/Sharjah").`,
    outreachParam: "perfume",
  },
  {
    id: "cars",
    title: "DM Opener 2 — Car Businesses (Garage / Dealer / Detailing)",
    text: `Hey [Name] — found [Garage/Brand Name] through [#dubaigarage / a mutual / Google] and the cars you're working with are genuinely impressive.

Random question — are you getting much traction from Instagram? Because car content in Dubai is weirdly underserved when it comes to short-form video. Most accounts just post static photos, but the garages that go hard on Reels (transformation videos, customer reactions, before/afters) are cleaning up right now.

We're a video content agency based in the UAE — we handle everything end-to-end, you just give us access to the cars and the space. No one from your team needs to be on camera unless they want to be.

We've done this for a Dubai brand already and can show you the numbers if you're curious. Worth a quick call?`,
    tip: `Personalisation tip: Name the car type they specialise in (supercars, 4x4s, detailing, used cars) and reference a specific post or a car you saw on their feed.`,
    outreachParam: "cars",
  },
  {
    id: "recruitment",
    title: "DM Opener 3 — Recruitment Agencies",
    text: `Hey [Name] — came across [Agency Name] while looking into Dubai recruitment — you guys seem to be placing in [sector, e.g. tech / logistics / construction] which is a busy space right now.

Do you use Instagram at all for attracting candidates or clients? Honest question — most recruitment agencies here have almost no social presence, which is actually a massive opportunity. The ones posting short-form video (client wins, job tips, behind-the-scenes) are building really loyal audiences fast.

We're a video agency in the UAE — we write the scripts, film, edit, and post everything. You don't need to do anything on camera. We've grown a Dubai brand from near-zero with this approach and I think it'd work really well for a recruitment agency with your kind of placements.

Would you be open to a 10-minute call to see if it's a fit?`,
    tip: `Personalisation tip: Mention the sector they recruit for and compliment something specific — their LinkedIn bio, a recent job post, or a placement they shared.`,
    outreachParam: "recruitment",
  },
];

const WHATSAPP_TEMPLATES: Script[] = [
  {
    id: "walkin",
    title: "Cold Opener — Walk-In Follow-Up",
    subtitle: "Save to WhatsApp Saved Messages. Send within 2 hours of the walk-in visit.",
    text: `Hi [Name], it's Awab from Cactus Lab — I stopped by [Business Name] earlier today. Really liked what you're doing with [specific thing you noticed — display, products, branding].

As I mentioned, we handle short-form video content for UAE businesses — scripts, filming, editing, and posting — so you never have to manage it yourself. We've already done this for a client in Dubai with strong results.

I'd love to show you what we could do specifically for [Business Name]. Are you free for a quick 10-minute call this week — maybe [suggest 2 days, e.g. Wednesday or Thursday afternoon]?`,
  },
  {
    id: "day3",
    title: "Day 3 Follow-Up",
    text: `Hey [Name], just wanted to check if you had a chance to see my message from a few days ago.

No pressure at all — just wanted to make sure it didn't get buried. If you're curious what video content could look like for [Business Name], I'm happy to put together a quick example or show you what we've done for a similar brand in Dubai.

Let me know either way — even a "not right now" is totally fine!`,
  },
  {
    id: "day7",
    title: "Day 7 Final Follow-Up",
    text: `Hey [Name] — last message from me, I promise.

I know things get busy. Just wanted to leave the door open — if short-form video is something [Business Name] wants to explore properly in the next few months, feel free to reach out and I'll pick it up from here.

In the meantime, I can send you a quick breakdown of what we did for a Dubai brand we work with — real numbers, no fluff. Just reply "yes" if you want it.

Either way, all the best!`,
  },
];

interface Objection {
  id: string;
  title: string;
  text: string;
  rule?: string;
}

const OBJECTIONS: Objection[] = [
  {
    id: "expensive",
    title: `Objection: "It's too expensive / AED 5,500 is a lot"`,
    text: `I hear you — it's not a small number. Let me put it in context though. If one video we make brings in even one customer who spends AED 1,000 with you, the month's content has paid for itself 5x over. Most of our clients don't think about it as a marketing cost — they think about it as a sales tool that runs 24/7.

That said, I want to make sure it's the right fit for you. What does a new customer typically spend with [Business Name] in a month? That'll help me show you what kind of return makes sense to expect.

And if budget is genuinely tight right now, I can structure the first month differently — we can start at AED 4,500 as a trial month so you can see the results before committing to the full package.`,
    rule: "Rule: Only offer AED 4,500 as a close, never as an opener. Anchor stays at AED 5,500.",
  },
  {
    id: "think",
    title: `Objection: "Let me think about it / I'll get back to you"`,
    text: `Of course, totally fair. Can I ask — is there something specific you're not sure about? Sometimes there's one thing holding people back and it's easy to clear up quickly.

(Wait for their answer — don't fill the silence.)

(If they say they just need time:) I completely understand. I'll be honest with you — I can only hold this specific slot for 48 hours because we take on one new client at a time per niche, and there are a couple of other [niche, e.g. car businesses] I'm talking to in Dubai right now. I'm not saying that to pressure you — I just want to be straight with you so you can make a decision with that in mind.

Can we say you'll let me know by [specific day, 2 days from now]?`,
  },
  {
    id: "inhouse",
    title: `Objection: "We already do it in-house"`,
    text: `That's great — honestly, a lot of our best clients said the same thing before they came on board. Can I ask — how many videos are you posting per month right now, and who's doing the editing?

(Listen — then respond to what they say.)

The main thing we bring that's hard to replicate in-house is consistency and volume. We deliver 15 edited videos every month, on a schedule, without the back-and-forth of managing an editor or the time it takes to script and plan everything. Most business owners who do it in-house are posting 3–4 times a month and spending hours on each one.

We're not replacing your ideas — we're giving you a full content operation without you having to run it. Would it help to see what we delivered for a Dubai brand we work with, just so you can compare?`,
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback for browsers that don't support clipboard API
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
        copied
          ? "bg-green-500/20 text-green-400 border border-green-500/30"
          : "bg-[#2a2a2a] hover:bg-[#333] text-[#888] hover:text-white border border-[#333]"
      }`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function ScriptCard({ script }: { script: Script }) {
  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-[#1a1a1a]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-white font-semibold text-sm">{script.title}</h3>
            {script.subtitle && (
              <p className="text-amber-400/80 text-xs mt-1">{script.subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <CopyButton text={script.text} />
            {script.outreachParam && (
              <Link
                href={`/outreach?script=${script.outreachParam}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 transition-all duration-150"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Use in Outreach
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="p-5">
        <pre className="text-[#ccc] text-sm leading-relaxed whitespace-pre-wrap font-sans">
          {script.text}
        </pre>
        {script.tip && (
          <div className="mt-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
            <p className="text-[#777] text-xs italic">{script.tip}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ObjectionCard({ objection }: { objection: Objection }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-4 p-5 hover:bg-[#161616] transition-colors text-left"
      >
        <span className="text-white font-medium text-sm">{objection.title}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {expanded && <CopyButton text={objection.text} />}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-[#555]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#555]" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="border-t border-[#1a1a1a] p-5">
          <pre className="text-[#ccc] text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {objection.text}
          </pre>
          {objection.rule && (
            <div className="mt-4 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
              <p className="text-amber-400 text-xs font-medium">{objection.rule}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ScriptsPage() {
  const [activeTab, setActiveTab] = useState<"dm" | "whatsapp" | "objections">("dm");

  const tabs = [
    { id: "dm" as const, label: "Instagram DM Openers", count: DM_OPENERS.length },
    { id: "whatsapp" as const, label: "WhatsApp Templates", count: WHATSAPP_TEMPLATES.length },
    { id: "objections" as const, label: "Objection Responses", count: OBJECTIONS.length },
  ];

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-2">
          <MessageSquare className="w-4 h-4" />
          Playbooks
        </div>
        <h1 className="text-white text-2xl font-bold">Outreach Scripts</h1>
        <p className="text-[#666] mt-1">
          All outreach scripts — copy with one click and use straight in DMs or WhatsApp.
        </p>
      </div>

      {/* Rules callout */}
      <div className="bg-green-500/5 border border-green-500/15 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
          <p className="text-[#aaa] text-sm">Block <span className="text-white font-medium">9–10:30am daily</span> for outreach only — no client work in this window</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
          <p className="text-[#aaa] text-sm">Never DM from a profile with <span className="text-white font-medium">fewer than 12 posts live</span></p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
          <p className="text-[#aaa] text-sm">Target: <span className="text-white font-medium">40–50 leads found, 30 messaged</span> daily</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === tab.id
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "text-[#666] hover:text-white hover:bg-[#1a1a1a]"
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-md ${
              activeTab === tab.id ? "bg-green-500/20 text-green-400" : "bg-[#2a2a2a] text-[#555]"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "dm" && (
        <div className="space-y-4">
          {DM_OPENERS.map((script) => (
            <ScriptCard key={script.id} script={script} />
          ))}
        </div>
      )}

      {activeTab === "whatsapp" && (
        <div className="space-y-4">
          {WHATSAPP_TEMPLATES.map((script) => (
            <ScriptCard key={script.id} script={script} />
          ))}
        </div>
      )}

      {activeTab === "objections" && (
        <div className="space-y-3">
          <p className="text-[#666] text-sm">
            Click to expand each objection response. Close via WhatsApp voice note or call — never a text thread.
          </p>
          {OBJECTIONS.map((objection) => (
            <ObjectionCard key={objection.id} objection={objection} />
          ))}
        </div>
      )}
    </div>
  );
}
