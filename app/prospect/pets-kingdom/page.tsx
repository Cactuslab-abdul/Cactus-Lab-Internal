/* eslint-disable react/no-unescaped-entities */
import { Globe, Trophy, Award, Heart, Users, Zap, CheckCircle2, ArrowRight, Video, MessageSquare, Camera, BarChart3, Calendar, ExternalLink, Sparkles } from "lucide-react";

export const metadata = {
  title: "Cactus Lab × Pets Kingdom",
  description: "What we do at Cactus Lab — and what we'd build with Pets Kingdom",
};

const services = [
  { icon: Video, title: "Short-form video", desc: "15 Reels and TikToks every month, shot at your facility, edited to UAE-market specs." },
  { icon: MessageSquare, title: "Social media management", desc: "We run your Instagram and Facebook end-to-end. Captions, posting, replies, hashtags." },
  { icon: Camera, title: "Regular facility shoots", desc: "We come to the facility multiple times a month, capturing different days, dogs and moments. Time with you and the team built in." },
  { icon: BarChart3, title: "Performance reporting", desc: "Monthly report on views, reach, follower growth, and what's working — with next-month plan." },
];

const process = [
  { step: "01", title: "Discovery", desc: "We sit down with you, learn your story, understand your customers, map out what we'll showcase first." },
  { step: "02", title: "Strategy", desc: "We build a 90-day content plan tailored to Pets Kingdom — pillars, formats, posting cadence." },
  { step: "03", title: "Ongoing shoots", desc: "Regular visits to the facility throughout the month — capturing dogs, training sessions, and time with you and the team." },
  { step: "04", title: "Publish & iterate", desc: "We post, monitor, and adjust based on what your audience responds to. Every month gets sharper." },
];

const pillars = [
  { icon: Trophy, title: "The Mohan Story", desc: "30 years of training, UAE-title-winning dogs, France and Thailand seminars. People follow legends, not facilities." },
  { icon: Heart, title: "Boarding Diaries", desc: "Daily life of dogs at the facility. Pet owners love seeing what their dogs are up to." },
  { icon: Video, title: "Training Transformations", desc: "Before / after dog behavior reels — one of the highest-saved content types in the pet niche." },
  { icon: Award, title: "Championship Content", desc: "Past UAE-title winners, your method, your repeatable wins. This is authority content." },
  { icon: Users, title: "Owner Testimonials", desc: "Your 5+ year clients on camera. Trust is the currency in pet boarding — this is how you bank it." },
];

const ninetyDay = [
  { metric: "Consistent posting", value: "15 reels every month, like clockwork", note: "Every week, every month — without you lifting a finger" },
  { metric: "Audience growth", value: "A real, engaged following", note: "Built steadily over the first quarter, compounding from there" },
  { metric: "Reach & visibility", value: "Content that actually gets seen", note: "Built to reach beyond current followers — into UAE pet owners discovering you for the first time" },
  { metric: "Clarity on what works", value: "Monthly reports, no guesswork", note: "You'll see what's landing, what's converting, and what we're adjusting next month" },
];

const offer = {
  package: "Full Social Media Management",
  retainer: 7000,
  deliverables: [
    "15 short-form videos per month (Reels + TikTok)",
    "Full Instagram + Facebook management",
    "Regular facility shoots — no on-camera requirement",
    "Content strategy + posting schedule (Later / Buffer)",
    "Monthly performance report with next-month plan",
    "Arabic + English subtitles on every video",
  ],
};

export default function PetsKingdomProspectPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-[#1a1a1a] bg-[#0f0f0f] sticky top-0 z-10 backdrop-blur-lg bg-opacity-90">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-cactus.png" alt="Cactus Lab" className="w-8 h-8 rounded-lg" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#666] font-medium">Prepared for</p>
              <h1 className="text-base font-bold">Mohan — Pets Kingdom</h1>
            </div>
          </div>
          <p className="text-xs text-[#666] hidden sm:block">By Cactus Lab · {new Date().toLocaleDateString("en-AE", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
      </div>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        <p className="text-green-400 text-sm font-semibold tracking-widest uppercase mb-4">Cactus Lab × Pets Kingdom</p>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] mb-6">
          We turn UAE businesses<br />
          into <span className="text-green-400">stories worth following.</span>
        </h2>
        <p className="text-[#aaa] text-lg max-w-3xl leading-relaxed">
          Mohan, this is a quick walkthrough of what we do, how we work, and what we'd build together for Pets Kingdom. Five minutes of reading, then we can talk it through on the call.
        </p>
      </section>

      {/* What we do */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-5 h-5 text-green-400" />
          <h3 className="text-xs uppercase tracking-widest text-[#666] font-semibold">What Cactus Lab does</h3>
        </div>

        <p className="text-2xl sm:text-3xl text-white font-semibold leading-snug max-w-4xl mb-10">
          We're a Dubai-based social media agency that produces short-form video and runs Instagram and Facebook for UAE businesses end-to-end.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((s) => (
            <div key={s.title} className="bg-[#0f0f0f] border border-[#1a1a1a] hover:border-green-500/30 transition-colors rounded-2xl p-6">
              <s.icon className="w-5 h-5 text-green-400 mb-3" />
              <h4 className="text-white font-semibold mb-2">{s.title}</h4>
              <p className="text-[#999] text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our process */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-5 h-5 text-[#666]" />
          <h3 className="text-xs uppercase tracking-widest text-[#666] font-semibold">How we work</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {process.map((p) => (
            <div key={p.step} className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-6">
              <p className="text-3xl font-bold text-green-400 mb-3">{p.step}</p>
              <h4 className="text-white font-semibold mb-2 text-lg">{p.title}</h4>
              <p className="text-[#999] text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* See our work — the centerpiece */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Video className="w-5 h-5 text-blue-400" />
          <h3 className="text-xs uppercase tracking-widest text-[#666] font-semibold">See our work</h3>
        </div>

        <a
          href="https://www.instagram.com/petsdelightdubai/"
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          <div className="bg-gradient-to-br from-blue-500/15 via-blue-500/5 to-transparent border border-blue-500/25 hover:border-blue-400/50 rounded-3xl p-8 sm:p-12 transition-all">
            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
              <img src="/logo-pets-delight.jpg" alt="Pets Delight" className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border border-blue-400/30 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest text-blue-400 font-semibold mb-3">Our current client · Same niche as you</p>
                <h4 className="text-3xl sm:text-4xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                  @petsdelightdubai
                </h4>
                <p className="text-[#bbb] text-base sm:text-lg leading-relaxed max-w-2xl mb-5">
                  Pets Delight is a pet retail brand in Dubai. We've been managing their Instagram and producing 15 reels a month for them since March. Click through and have a look — every post you see there is something we produced.
                </p>
                <div className="inline-flex items-center gap-2 text-blue-400 font-semibold text-sm group-hover:text-blue-300">
                  Open on Instagram <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </a>

        <p className="text-xs text-[#555] mt-3 px-1">Tip: open it on your phone during the meeting — the reels play better full-screen there than embedded.</p>
      </section>

      {/* What we'd build for Pets Kingdom */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-5 h-5 text-green-400" />
          <h3 className="text-xs uppercase tracking-widest text-[#666] font-semibold">What we'd build for Pets Kingdom</h3>
        </div>

        <p className="text-[#bbb] text-lg max-w-3xl leading-relaxed mb-8">
          Five content pillars we'd weave through the 15 monthly reels, designed around what we know about your business.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pillars.map((p) => (
            <div key={p.title} className="bg-[#0f0f0f] border border-[#1a1a1a] hover:border-green-500/30 transition-colors rounded-2xl p-6">
              <p.icon className="w-5 h-5 text-green-400 mb-3" />
              <h4 className="text-white font-semibold mb-2">{p.title}</h4>
              <p className="text-[#999] text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
          <div className="bg-gradient-to-br from-green-500/15 to-green-500/5 border border-green-500/20 rounded-2xl p-6 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-widest text-green-400 font-semibold mb-2">Total output</p>
            <p className="text-3xl font-bold text-white leading-tight">15 videos<br />/ month</p>
            <p className="text-[#aaa] text-sm mt-2">+ full IG + FB management</p>
          </div>
        </div>
      </section>

      {/* 90-day vision */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-green-400" />
          <h3 className="text-xs uppercase tracking-widest text-[#666] font-semibold">What 90 days looks like</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ninetyDay.map((row) => (
            <div key={row.metric} className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-6">
              <p className="text-xs uppercase tracking-widest text-[#666] font-semibold mb-3">{row.metric}</p>
              <p className="text-2xl font-bold text-white mb-2">{row.value}</p>
              <p className="text-[#888] text-sm leading-relaxed">{row.note}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#555] mt-3 px-1">Targets based on observed growth from comparable pet-niche accounts running consistent short-form video.</p>
      </section>

      {/* The offer */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-5 h-5 text-green-400" />
          <h3 className="text-xs uppercase tracking-widest text-[#666] font-semibold">The proposal</h3>
        </div>

        <div className="bg-[#0f0f0f] border border-green-500/20 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/0 p-8 border-b border-green-500/10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-green-400 font-semibold mb-2">{offer.package}</p>
                <p className="text-5xl font-bold text-white">AED {offer.retainer.toLocaleString()}<span className="text-xl text-[#888] font-normal">/month</span></p>
              </div>
              <p className="text-[#aaa] text-sm">Month-to-month · Cancel anytime after first 60 days</p>
            </div>
          </div>
          <div className="p-8">
            <p className="text-xs uppercase tracking-widest text-[#666] font-semibold mb-4">What's included</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {offer.deliverables.map((d) => (
                <li key={d} className="flex items-start gap-3 text-[#ddd] text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Next step */}
      <section className="max-w-7xl mx-auto px-6 py-10 pb-20">
        <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-8 sm:p-12 text-center">
          <p className="text-xs uppercase tracking-widest text-[#666] font-semibold mb-4">Next step</p>
          <h3 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">If this resonates,<br />we kick off with discovery.</h3>
          <p className="text-[#aaa] max-w-2xl mx-auto leading-relaxed mb-8">We get on a call, learn the operation, plan the first round of shoots, and start publishing within the first few weeks. You don't need to be on camera unless you want to be.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
            <a href="https://wa.me/971563459955" target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-3 rounded-xl transition-colors">WhatsApp Abdulrahman · +971 56 345 9955</a>
            <a href="https://wa.me/971522560115" target="_blank" rel="noopener noreferrer" className="bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-white font-semibold px-6 py-3 rounded-xl transition-colors">WhatsApp Awab · +971 52 256 0115</a>
          </div>
        </div>
        <p className="text-center text-[#444] text-xs mt-8">Prepared by Cactus Lab FZ LLC · Dubai · cactuslab.ae</p>
      </section>
    </div>
  );
}
