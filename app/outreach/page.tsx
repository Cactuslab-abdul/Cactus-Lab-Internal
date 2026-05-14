"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Mail,
  MessageSquare,
  Copy,
  RefreshCw,
  Send,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  AlertCircle,
  Star,
  GitBranch,
} from "lucide-react";

const NICHES = [
  "Perfume & Watches",
  "Car Dealership / Garage",
  "Recruitment Agency",
  "Spice / Food Business",
  "Pet Business",
  "Restaurant / Cafe",
  "Real Estate",
  "Retail / E-commerce",
  "Other",
];

interface Research {
  painPoints: string[];
  contentGaps: string[];
  opportunities: string[];
  opportunityScore: number;
  summary: string;
}

interface OutreachResult {
  research: Research;
  email: { subject: string; body: string };
  dm: string;
}

function OutreachContent() {
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    businessName: searchParams.get("business") || "",
    instagram: "",
    website: "",
    niche: searchParams.get("niche") || "",
    recipientEmail: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OutreachResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editableEmail, setEditableEmail] = useState({ subject: "", body: "" });
  const [editableDm, setEditableDm] = useState("");
  const [copied, setCopied] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [researchExpanded, setResearchExpanded] = useState(true);
  const [loggedToPipeline, setLoggedToPipeline] = useState(false);

  useEffect(() => {
    if (result) {
      setEditableEmail(result.email);
      setEditableDm(result.dm);
    }
  }, [result]);

  const research = async () => {
    if (!form.businessName.trim()) {
      setError("Please enter a business name.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setSendSuccess(false);
    setLoggedToPipeline(false);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Research failed");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const regenerate = async () => {
    await research();
  };

  const copyDm = () => {
    navigator.clipboard.writeText(editableDm);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendEmail = async () => {
    if (!form.recipientEmail) {
      setSendError("Please enter the recipient email address first.");
      return;
    }
    setSendLoading(true);
    setSendError(null);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: form.recipientEmail,
          subject: editableEmail.subject,
          body: editableEmail.body,
          businessName: form.businessName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send email");
      setSendSuccess(true);
    } catch (e: unknown) {
      setSendError(e instanceof Error ? e.message : "Failed to send email.");
    } finally {
      setSendLoading(false);
    }
  };

  const logToPipeline = () => {
    const raw = localStorage.getItem("cactus-leads");
    const leads = raw ? JSON.parse(raw) : [];
    const nextIdRaw = localStorage.getItem("cactus-leads-nextid");
    const nextId = nextIdRaw ? parseInt(nextIdRaw, 10) : (leads.length > 0 ? Math.max(...leads.map((l: { id: number }) => l.id)) + 1 : 1);

    const nicheShort = form.niche.split(" ")[0] || "Other";
    const newLead = {
      id: nextId,
      name: form.businessName,
      niche: nicheShort,
      platform: "Instagram DM",
      stage: "Messaged",
      note: `Outreach sent${form.recipientEmail ? ` to ${form.recipientEmail}` : ""}`,
      date: new Date().toISOString().slice(0, 10),
      followup: "",
    };

    leads.unshift(newLead);
    localStorage.setItem("cactus-leads", JSON.stringify(leads));
    localStorage.setItem("cactus-leads-nextid", String(nextId + 1));
    setLoggedToPipeline(true);
  };

  const scoreColor = (score: number) => {
    if (score >= 8) return "text-green-400";
    if (score >= 5) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">AI Outreach</h1>
        <p className="text-[#666] mt-1">Research a UAE business and generate a personalised email + WhatsApp DM</p>
      </div>

      {/* Input card */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Prospect Input</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[#555] text-xs block mb-1.5">Business Name <span className="text-red-400">*</span></label>
            <input
              placeholder="e.g. Desert Bloom Perfumes"
              value={form.businessName}
              onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50"
            />
          </div>
          <div>
            <label className="text-[#555] text-xs block mb-1.5">Instagram Handle (optional)</label>
            <input
              placeholder="@desertbloom.ae"
              value={form.instagram}
              onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50"
            />
          </div>
          <div>
            <label className="text-[#555] text-xs block mb-1.5">Website (optional)</label>
            <input
              placeholder="e.g. desertbloom.ae"
              value={form.website}
              onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50"
            />
          </div>
          <div>
            <label className="text-[#555] text-xs block mb-1.5">Niche</label>
            <select
              value={form.niche}
              onChange={e => setForm(f => ({ ...f, niche: e.target.value }))}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-green-500/50"
            >
              <option value="">Select niche</option>
              {NICHES.map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-[#555] text-xs block mb-1.5">Recipient Email (for sending)</label>
            <input
              type="email"
              placeholder="owner@desertbloom.ae"
              value={form.recipientEmail}
              onChange={e => setForm(f => ({ ...f, recipientEmail: e.target.value }))}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-900/10 border border-red-500/20 rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <button
          onClick={research}
          disabled={loading}
          className="mt-5 w-full sm:w-auto bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? "Researching..." : "Research & Generate"}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-400 mx-auto mb-3" />
          <p className="text-white font-medium">Researching {form.businessName}...</p>
          <p className="text-[#555] text-sm mt-1">Analysing their social presence and generating personalised outreach</p>
        </div>
      )}

      {result && (
        <>
          {/* Research results */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
            <button
              onClick={() => setResearchExpanded(!researchExpanded)}
              className="w-full flex items-center justify-between p-5 hover:bg-[#151515] transition-colors"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-white font-semibold">Research Results</span>
                <span className={`text-2xl font-bold ${scoreColor(result.research.opportunityScore)}`}>
                  {result.research.opportunityScore}/10
                </span>
                <span className="text-[#555] text-xs">opportunity score</span>
              </div>
              {researchExpanded ? <ChevronUp className="w-4 h-4 text-[#555]" /> : <ChevronDown className="w-4 h-4 text-[#555]" />}
            </button>

            {researchExpanded && (
              <div className="px-5 pb-5 space-y-5">
                <p className="text-[#aaa] text-sm leading-relaxed">{result.research.summary}</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#1a1a1a] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 text-xs font-semibold uppercase tracking-wider">Pain Points</span>
                    </div>
                    <ul className="space-y-2">
                      {result.research.painPoints.map((p, i) => (
                        <li key={i} className="text-sm text-[#bbb] flex items-start gap-2">
                          <span className="text-red-400 flex-shrink-0 mt-1">·</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Search className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">Content Gaps</span>
                    </div>
                    <ul className="space-y-2">
                      {result.research.contentGaps.map((g, i) => (
                        <li key={i} className="text-sm text-[#bbb] flex items-start gap-2">
                          <span className="text-yellow-400 flex-shrink-0 mt-1">·</span>
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-xs font-semibold uppercase tracking-wider">Opportunities</span>
                    </div>
                    <ul className="space-y-2">
                      {result.research.opportunities.map((o, i) => (
                        <li key={i} className="text-sm text-[#bbb] flex items-start gap-2">
                          <span className="text-green-400 flex-shrink-0 mt-1">·</span>
                          {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <h3 className="text-white font-semibold">Generated Email</h3>
              </div>
              <button
                onClick={regenerate}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-[#888] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
              >
                <RefreshCw className="w-3 h-3" />
                Regenerate
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[#555] text-xs block mb-1.5">Subject</label>
                <input
                  value={editableEmail.subject}
                  onChange={e => setEditableEmail(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="text-[#555] text-xs block mb-1.5">Body</label>
                <textarea
                  rows={12}
                  value={editableEmail.body}
                  onChange={e => setEditableEmail(prev => ({ ...prev, body: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 resize-none leading-relaxed"
                />
              </div>
            </div>

            {sendError && (
              <div className="mt-3 flex items-center gap-2 text-red-400 bg-red-900/10 border border-red-500/20 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{sendError}</span>
              </div>
            )}

            {sendSuccess ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-green-400 bg-green-900/10 border border-green-500/20 rounded-lg px-4 py-3">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Email sent successfully to {form.recipientEmail}</span>
                </div>
                {!loggedToPipeline ? (
                  <button
                    onClick={logToPipeline}
                    className="flex items-center gap-2 text-sm text-green-400 border border-green-500/30 hover:border-green-500/60 px-4 py-2 rounded-lg transition-all"
                  >
                    <GitBranch className="w-4 h-4" />
                    Log {form.businessName} to Pipeline as &ldquo;Messaged&rdquo;
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-[#666] text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    Added to pipeline
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={sendEmail}
                disabled={sendLoading || !form.recipientEmail}
                className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                {sendLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sendLoading ? "Sending..." : form.recipientEmail ? `Send to ${form.recipientEmail}` : "Enter email address above to send"}
              </button>
            )}
          </div>

          {/* DM */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green-400" />
                <h3 className="text-white font-semibold">WhatsApp DM</h3>
              </div>
              <button
                onClick={copyDm}
                className="flex items-center gap-1.5 text-xs text-[#888] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-3 py-1.5 rounded-lg transition-all"
              >
                {copied ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <textarea
              rows={8}
              value={editableDm}
              onChange={e => setEditableDm(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-green-500/50 resize-none leading-relaxed"
            />
            <p className="text-[#555] text-xs mt-2">Copy and paste directly into WhatsApp Business</p>
          </div>
        </>
      )}
    </div>
  );
}

export default function OutreachPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-green-400" />
      </div>
    }>
      <OutreachContent />
    </Suspense>
  );
}
