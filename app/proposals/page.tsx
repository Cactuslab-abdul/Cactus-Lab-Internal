"use client";

import { useState, useEffect } from "react";
import { Printer, ArrowLeft } from "lucide-react";

const CHALLENGES: Record<string, string> = {
  perfume: "Most perfume and watch businesses in Dubai have products that deserve to be seen — but no consistent Reels strategy to match. Without short-form video, you're invisible to the 18–35 buyers who discover brands entirely on Instagram. The brands growing fastest in this space aren't the ones with the biggest budgets. They're the ones showing up every week with content that stops the scroll.",
  car: "Car buyers in the UAE research online before they ever walk into a showroom. Your competitors are posting Reels daily — walk-arounds, detailing clips, before-and-afters. Without consistent video content, you're losing leads before they ever call. Every day without Reels is a day someone chooses a competitor they found on Instagram first.",
  recruitment: "The best candidates and the best clients find recruiters on LinkedIn and Instagram before they look anywhere else. If your feed isn't active, you don't exist to the talent and companies that matter. Recruiters who post consistent content generate inbound enquiries every week. Those who don't spend every month cold-calling.",
  food: "Food businesses live and die on visual content. A 30-second Reel of your product can reach 10,000 buyers in Dubai for zero ad spend — but only if you're posting consistently. Most food businesses in the UAE are sitting on a goldmine of content they're not creating. That's the gap we fill.",
  pet: "Pet owners in the UAE are among the most engaged consumers on Instagram. A pet business with a consistent Reels strategy can grow from hundreds to tens of thousands of followers in under six months — and convert that audience directly into customers. The window is open right now. Most pet businesses here aren't doing it yet.",
  restaurant: "In Dubai, dining decisions start on Instagram. If your restaurant isn't showing up in Reels — food reveals, behind-the-scenes, atmosphere clips — you're invisible to the people actively looking for their next spot. The restaurants filling up every weekend are the ones posting every week.",
  realestate: "Dubai real estate is one of the most competitive markets in the world. Agents posting consistent video content — property tours, neighbourhood guides, market updates — generate significantly more inbound leads than those who don't. Your listings deserve to be seen. Your personal brand deserves to be built.",
  retail: "Retail in the UAE has moved to short-form video. Your products need to be seen in motion, in context, in use. Static posts don't convert the way they used to. Reels do. The brands growing fastest on Instagram right now are the ones who figured this out — and started posting consistently.",
  other: "In today's UAE market, a consistent social media presence is one of the highest-ROI investments a business can make. Your competitors are posting video content regularly. Without a Reels strategy, you're invisible to customers who are actively looking for exactly what you offer.",
};

function fmt(d: Date) { return d.toISOString().split("T")[0]; }

function fmtDisplay(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function aed(n: number) {
  return "AED " + Number(n).toLocaleString("en-AE", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getNextProposalNum(last: string | null): string | null {
  if (!last) return null;
  const match = last.match(/^(.*?)(\d+)$/);
  if (match) {
    const num = parseInt(match[2], 10) + 1;
    const padded = String(num).padStart(match[2].length, "0");
    return match[1] + padded;
  }
  return null;
}

interface ProposalData {
  number: string;
  date: string;
  valid: string;
  clientName: string;
  clientContact: string;
  clientRole: string;
  clientLocation: string;
  industry: string;
  challenge: string;
  platforms: string[];
  postFreq: string;
  followers: string;
  pkg: "standard" | "custom";
  customVideos: number;
  customRate: number;
  specialTerms: string;
}

export default function ProposalsPage() {
  const today = new Date();
  const validDate = new Date(today);
  validDate.setDate(validDate.getDate() + 14);

  const [view, setView] = useState<"editor" | "proposal">("editor");
  const [form, setForm] = useState<ProposalData>({
    number: "",
    date: fmt(today),
    valid: fmt(validDate),
    clientName: "",
    clientContact: "",
    clientRole: "",
    clientLocation: "",
    industry: "perfume",
    challenge: CHALLENGES.perfume,
    platforms: ["Instagram"],
    postFreq: "none",
    followers: "",
    pkg: "standard",
    customVideos: 10,
    customRate: 4000,
    specialTerms: "",
  });

  useEffect(() => {
    const last = localStorage.getItem("cactus-last-proposal-num");
    const next = getNextProposalNum(last);
    if (next) setForm(f => ({ ...f, number: next }));
  }, []);

  const togglePlatform = (p: string) => {
    setForm(f => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter(x => x !== p) : [...f.platforms, p],
    }));
  };

  const updateIndustry = (industry: string) => {
    setForm(f => ({ ...f, industry, challenge: CHALLENGES[industry] || CHALLENGES.other }));
  };

  const getPkg = () => {
    if (form.pkg === "standard") return { videos: 15, rate: 5500 };
    return { videos: form.customVideos, rate: form.customRate };
  };

  const generate = () => {
    if (!form.clientName || !form.clientContact) {
      alert("Please fill in Business Name and Contact Name.");
      return;
    }
    localStorage.setItem("cactus-last-proposal-num", form.number);
    setView("proposal");
    window.scrollTo(0, 0);
  };

  if (view === "proposal") {
    const pkg = getPkg();
    const upfront = pkg.rate / 2;
    const platformStr = form.platforms.length ? form.platforms.join(", ") : "Instagram";

    const deliverables = [
      `${pkg.videos} short-form videos per month`,
      "Full scripting in your brand's voice",
      "Professional filming at your location",
      "Editing with captions, music & effects",
      `Scheduling across ${platformStr}`,
      "Bi-weekly performance updates",
      "Monthly analytics report (by day 3)",
      "Monthly 20-minute strategy call",
      "1 revision round per video",
      "You never need to appear on camera",
    ];

    return (
      <>
        <div className="no-print mb-6 flex gap-3">
          <button
            onClick={() => setView("editor")}
            className="flex items-center gap-2 text-sm text-[#888] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-4 py-2 rounded-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Edit Proposal
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-sm bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </button>
        </div>

        <div id="print-proposal" style={{ maxWidth: 800, margin: "0 auto", padding: "60px", background: "#fff", color: "#111", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", minHeight: "100vh" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 44, paddingBottom: 28, borderBottom: "2.5px solid #1D9E75" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#1D9E75", letterSpacing: -0.5 }}>CACTUS LAB</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>Short-form video &amp; social media agency</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 10, lineHeight: 1.8 }}>
                Cactus Lab FZ LLC · RAKEZ, UAE<br />
                hello@cactuslab.ae · cactuslab.ae
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.5 }}>PROPOSAL</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Short-form video package for {form.clientName}</div>
              <table style={{ marginTop: 10, marginLeft: "auto", fontSize: 12, borderCollapse: "collapse" }}>
                <tbody>
                  <tr><td style={{ padding: "2px 0 2px 20px", fontWeight: 600 }}>Proposal No.</td><td style={{ padding: "2px 0 2px 20px", color: "#6b7280" }}>{form.number || "—"}</td></tr>
                  <tr><td style={{ padding: "2px 0 2px 20px", fontWeight: 600 }}>Date</td><td style={{ padding: "2px 0 2px 20px", color: "#6b7280" }}>{form.date ? fmtDisplay(form.date) : "—"}</td></tr>
                  <tr><td style={{ padding: "2px 0 2px 20px", fontWeight: 600 }}>Valid Until</td><td style={{ padding: "2px 0 2px 20px", color: "#6b7280" }}>{form.valid ? fmtDisplay(form.valid) : "—"}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* To/From */}
          <div style={{ background: "#f9fafb", borderRadius: 10, padding: "20px 24px", marginBottom: 36, display: "flex", justifyContent: "space-between", gap: 32 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Prepared For</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{form.clientName}</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>{form.clientContact}{form.clientRole ? ` · ${form.clientRole}` : ""}</div>
              {form.clientLocation && <div style={{ fontSize: 13, color: "#6b7280" }}>{form.clientLocation}</div>}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>From</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Awab Sirelkhatim</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>Cactus Lab</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>hello@cactuslab.ae</div>
            </div>
          </div>

          {/* Challenge */}
          <div style={{ marginBottom: 30 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #E1F5EE" }}>The Challenge</div>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: "#374151" }}>{form.challenge}</p>
          </div>

          {/* Deliverables */}
          <div style={{ marginBottom: 30 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #E1F5EE" }}>What We Deliver</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 32px" }}>
              {deliverables.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, lineHeight: 1.5 }}>
                  <span style={{ color: "#1D9E75", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* Investment */}
          <div style={{ marginBottom: 30 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #E1F5EE" }}>The Investment</div>
            <table style={{ width: "100%", borderCollapse: "collapse", borderRadius: 8, overflow: "hidden" }}>
              <tbody>
                <tr style={{ background: "#E1F5EE" }}>
                  <td style={{ padding: "11px 14px", fontSize: 14, fontWeight: 600, width: "42%", color: "#374151" }}>Monthly retainer</td>
                  <td style={{ padding: "11px 14px", fontSize: 17, fontWeight: 800, color: "#1D9E75", textAlign: "right" }}>{aed(pkg.rate)} / month</td>
                </tr>
                <tr><td style={{ padding: "11px 14px", fontSize: 13, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>Payment — before work begins (50%)</td><td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 500, textAlign: "right", borderBottom: "1px solid #e5e7eb" }}>{aed(upfront)}</td></tr>
                <tr><td style={{ padding: "11px 14px", fontSize: 13, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>Payment — on month completion (50%)</td><td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 500, textAlign: "right", borderBottom: "1px solid #e5e7eb" }}>{aed(upfront)}</td></tr>
                <tr><td style={{ padding: "11px 14px", fontSize: 13, color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>Contract</td><td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 500, textAlign: "right", borderBottom: "1px solid #e5e7eb" }}>Month-to-month · 30 days notice to cancel</td></tr>
                {form.specialTerms && (
                  <tr><td style={{ padding: "11px 14px", fontSize: 13, color: "#6b7280" }}>Special Terms</td><td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 500, textAlign: "right" }}>{form.specialTerms}</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* How it works */}
          <div style={{ marginBottom: 30 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #E1F5EE" }}>How It Works</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              {[
                { num: "01", title: "Strategy Call", body: `20-minute planning call. We agree content angles, script all ${pkg.videos} videos, and lock in a filming date.` },
                { num: "02", title: "Filming Day", body: "3–4 hour batch shoot at your location. You don't need to appear on camera. We script, direct, and film everything." },
                { num: "03", title: "Edit, Post & Report", body: "We edit, caption, and schedule everything. You approve within 24 hours. Monthly report delivered by day 3." },
              ].map(s => (
                <div key={s.num} style={{ background: "#f9fafb", borderRadius: 8, padding: "14px 16px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Step {s.num}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>{s.body}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Next steps */}
          <div style={{ marginBottom: 30 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #E1F5EE" }}>Next Steps</div>
            {[
              <>Reply <strong>&ldquo;Confirmed&rdquo;</strong> via WhatsApp to accept this proposal</>,
              <>Receive your service agreement via email within 24 hours</>,
              <>First invoice raised for <strong>{aed(upfront)}</strong> — 50% upfront before work begins</>,
              <>Strategy call booked — work begins within 48 hours of payment</>,
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 13, padding: "9px 0", borderBottom: i < 3 ? "1px solid #e5e7eb" : "none", lineHeight: 1.6 }}>
                <div style={{ background: "#1D9E75", color: "#fff", fontSize: 11, fontWeight: 700, width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                <div>{step}</div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ marginTop: 44, paddingTop: 18, borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#6b7280" }}>
            <span>Cactus Lab FZ LLC · RAKEZ, UAE · cactuslab.ae</span>
            {form.valid && <span style={{ fontSize: 12, color: "#1D9E75", fontWeight: 600 }}>Valid until {fmtDisplay(form.valid)}</span>}
          </div>
        </div>

        <style>{`
          @page { size: A4; margin: 0; }
          @media print {
            html, body { width: 210mm; margin: 0; padding: 0; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body * { visibility: hidden !important; }
            #print-proposal, #print-proposal * { visibility: visible !important; }
            #print-proposal {
              position: absolute !important;
              left: 0 !important; top: 0 !important;
              width: 210mm !important;
              padding: 18mm 20mm !important;
              margin: 0 !important;
              max-width: none !important;
              box-sizing: border-box !important;
              background: white !important;
              min-height: auto !important;
            }
            .no-print { display: none !important; }
          }
        `}</style>
      </>
    );
  }

  const pkg = getPkg();

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-white text-2xl font-bold">Proposal Generator</h1>
        <p className="text-[#666] mt-1">Fill in the details, then generate and print to PDF</p>
      </div>

      <div className="max-w-3xl space-y-5">
        {/* Proposal details */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
          <h2 className="text-[#555] text-xs uppercase tracking-wider font-semibold mb-4">Proposal Details</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Proposal Number", key: "number", placeholder: "e.g. CL-P003", type: "text" },
              { label: "Date", key: "date", placeholder: "", type: "date" },
              { label: "Valid Until", key: "valid", placeholder: "", type: "date" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[#555] text-xs block mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key as keyof typeof form] as string}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Prospect details */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
          <h2 className="text-[#555] text-xs uppercase tracking-wider font-semibold mb-4">Prospect Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#555] text-xs block mb-1.5">Business / Company Name</label>
              <input placeholder="e.g. Desert Bloom Perfumes" value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50" />
            </div>
            <div>
              <label className="text-[#555] text-xs block mb-1.5">Contact Name</label>
              <input placeholder="e.g. Ahmed Al Mansoori" value={form.clientContact} onChange={e => setForm(f => ({ ...f, clientContact: e.target.value }))} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50" />
            </div>
            <div>
              <label className="text-[#555] text-xs block mb-1.5">Role / Title (optional)</label>
              <input placeholder="e.g. Owner, Marketing Manager" value={form.clientRole} onChange={e => setForm(f => ({ ...f, clientRole: e.target.value }))} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50" />
            </div>
            <div>
              <label className="text-[#555] text-xs block mb-1.5">Location</label>
              <input placeholder="e.g. Al Quoz, Dubai" value={form.clientLocation} onChange={e => setForm(f => ({ ...f, clientLocation: e.target.value }))} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50" />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-[#555] text-xs block mb-1.5">Industry / Niche</label>
            <select
              value={form.industry}
              onChange={e => updateIndustry(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500/50"
            >
              <option value="perfume">Perfume &amp; Watches</option>
              <option value="car">Car Dealership / Garage</option>
              <option value="recruitment">Recruitment Agency</option>
              <option value="food">Spice / Food Business</option>
              <option value="pet">Pet Business</option>
              <option value="restaurant">Restaurant / Cafe</option>
              <option value="realestate">Real Estate</option>
              <option value="retail">Retail / E-commerce</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Challenge text */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
          <h2 className="text-[#555] text-xs uppercase tracking-wider font-semibold mb-4">The Challenge (auto-filled — edit freely)</h2>
          <textarea
            rows={5}
            value={form.challenge}
            onChange={e => setForm(f => ({ ...f, challenge: e.target.value }))}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500/50 resize-none leading-relaxed"
          />
        </div>

        {/* Social audit */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
          <h2 className="text-[#555] text-xs uppercase tracking-wider font-semibold mb-4">Social Media Audit</h2>
          <div>
            <label className="text-[#555] text-xs block mb-2">Active Platforms</label>
            <div className="flex flex-wrap gap-3">
              {["Instagram", "TikTok", "YouTube Shorts", "LinkedIn"].map(p => (
                <label key={p} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.platforms.includes(p)}
                    onChange={() => togglePlatform(p)}
                    className="accent-green-500"
                  />
                  <span className="text-sm text-white">{p}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-[#555] text-xs block mb-1.5">Current Posting Frequency</label>
              <select value={form.postFreq} onChange={e => setForm(f => ({ ...f, postFreq: e.target.value }))} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500/50">
                <option value="none">Not posting / inactive</option>
                <option value="rarely">Rarely (less than once/week)</option>
                <option value="weekly">1–2x per week</option>
                <option value="regular">3–4x per week</option>
                <option value="daily">Daily</option>
              </select>
            </div>
            <div>
              <label className="text-[#555] text-xs block mb-1.5">Current Instagram Followers</label>
              <input placeholder="e.g. 1,200" value={form.followers} onChange={e => setForm(f => ({ ...f, followers: e.target.value }))} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50" />
            </div>
          </div>
        </div>

        {/* Package */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
          <h2 className="text-[#555] text-xs uppercase tracking-wider font-semibold mb-4">Package</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "standard", title: "Standard Package", price: "AED 5,500 / month", desc: "15 videos · Full scheduling · Reports · Monthly call" },
              { key: "custom", title: "Custom Package", price: form.pkg === "custom" ? `AED ${form.customRate.toLocaleString()} / month` : "Custom rate", desc: "Adjust videos and rate below" },
            ].map(p => (
              <button
                key={p.key}
                onClick={() => setForm(f => ({ ...f, pkg: p.key as "standard" | "custom" }))}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  form.pkg === p.key
                    ? "border-green-500 bg-green-500/10"
                    : "border-[#2a2a2a] hover:border-[#444]"
                }`}
              >
                <div className="text-white font-semibold text-sm">{p.title}</div>
                <div className="text-green-400 text-lg font-bold mt-1">{p.price}</div>
                <div className="text-[#666] text-xs mt-1">{p.desc}</div>
              </button>
            ))}
          </div>
          {form.pkg === "custom" && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-[#555] text-xs block mb-1.5">Videos / Month</label>
                <input type="number" value={form.customVideos} onChange={e => setForm(f => ({ ...f, customVideos: parseInt(e.target.value) || 10 }))} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500/50" />
              </div>
              <div>
                <label className="text-[#555] text-xs block mb-1.5">Monthly Rate (AED)</label>
                <input type="number" value={form.customRate} onChange={e => setForm(f => ({ ...f, customRate: parseFloat(e.target.value) || 4000 }))} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500/50" />
              </div>
            </div>
          )}
          <div className="mt-4">
            <label className="text-[#555] text-xs block mb-1.5">Special Terms / Introductory Offer (optional)</label>
            <input
              placeholder="e.g. First month at AED 4,500 as introductory rate"
              value={form.specialTerms}
              onChange={e => setForm(f => ({ ...f, specialTerms: e.target.value }))}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50"
            />
          </div>
        </div>

        <button
          onClick={generate}
          className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-xl text-base flex items-center justify-center gap-2 transition-colors"
        >
          <Printer className="w-5 h-5" />
          Generate Proposal &amp; Print to PDF
        </button>
      </div>
    </div>
  );
}
