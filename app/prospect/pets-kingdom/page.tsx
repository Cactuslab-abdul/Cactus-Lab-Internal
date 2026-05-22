/* eslint-disable react/no-unescaped-entities */
import { AtSign, Hash, Globe, Star, AlertTriangle, TrendingUp, Trophy, Award, Heart, Users, Target, Zap, CheckCircle2, ArrowRight, Video, MessageSquare, BarChart3 } from "lucide-react";

export const metadata = {
  title: "Pets Kingdom × Cactus Lab — Growth Audit",
  description: "A 90-day growth plan for Pets Kingdom UAE",
};

const audit = {
  ig: { handle: "@petskingdomllc", followers: 219, posts: 189, following: 9 },
  fb: { handle: "petshopuae", note: "Branding mismatch — handle is 'petshopuae' not 'petskingdom'" },
  website: { url: "petskingdom.com", issues: ["Broken images (dummy.png placeholders)", "No pricing transparency", "Inactive YouTube link", "Two different IG handles linked"] },
  reviews: { hidubai: 0, groupon: "4.7★", googleVisibility: "Low" },
};

const mohan = {
  years: 30,
  bestDogTitles: 7,
  origin: "Kottayam Kennel Club, Kerala",
  intl: ["France", "Thailand"],
  age: 15,
  story: "His father gifted him two puppies at 15. He never stopped.",
};

const competitor = {
  name: "Zoomies Dubai",
  handle: "@zoomies_dubai",
  followers: 4559,
  posts: 620,
  award: "Best Doggy Daycare in Dubai 2025",
  age: "Younger business",
};

const pillars = [
  { icon: Trophy, title: "The Trainer Story", desc: "Mohan's 30-year journey, 7 titles, France/Thailand training. People follow legends, not facilities." },
  { icon: Heart, title: "Boarding Diaries", desc: "Daily life of dogs at the facility. Owners are addicted to seeing their pets — make it part of the brand." },
  { icon: Video, title: "Training Transformations", desc: "Before/after dog behavior reels. Highest-saved content type in the pet niche." },
  { icon: Award, title: "Championship Footage", desc: "Past 'Best Dog in UAE' winners, training methodology, repeatable wins. Authority content." },
  { icon: Users, title: "Owner Testimonials", desc: "5+ year clients on camera. Trust is the only thing that matters in pet boarding." },
];

const ninetyDay = [
  { metric: "Instagram followers", from: 219, to: "2,500+", delta: "+11×" },
  { metric: "Avg reel views", from: "~400", to: "15,000+", delta: "+37×" },
  { metric: "Monthly inbound enquiries", from: "Unknown / low", to: "30+", delta: "Measurable" },
  { metric: "Brand recall in Al Quoz pet circle", from: "Limited", to: "Top-3 named", delta: "Dominant" },
];

const offer = {
  package: "Full Social Media Management",
  retainer: 5500,
  deliverables: [
    "15 short-form videos per month (Reels + TikTok)",
    "Full Instagram + Facebook management",
    "Monthly facility shoot day — no on-camera requirement",
    "Content strategy + posting schedule (Later/Buffer)",
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
              <p className="text-[10px] uppercase tracking-widest text-[#666] font-medium">Growth Audit · Prepared for</p>
              <h1 className="text-base font-bold">Pets Kingdom UAE — Chandra Mohan</h1>
            </div>
          </div>
          <p className="text-xs text-[#666] hidden sm:block">By Cactus Lab · {new Date().toLocaleDateString("en-AE", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
      </div>

      {/* HERO — the headline */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <p className="text-green-400 text-sm font-semibold tracking-wide mb-4">THE GAP</p>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] mb-6">
          30 years of experience.<br />
          <span className="text-amber-400">7×</span> Best Dog in UAE.<br />
          <span className="text-red-400">219</span> Instagram followers.
        </h2>
        <p className="text-[#999] text-lg max-w-3xl leading-relaxed">
          Mohan, you have the most credentialed dog training story in the UAE. The platforms where your future customers live don't know it. This document is what we'd fix.
        </p>
      </section>

      {/* Current state */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-[#666]" />
          <h3 className="text-xs uppercase tracking-widest text-[#666] font-semibold">Where Pets Kingdom is today</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={AtSign} label="Instagram" value={audit.ig.followers.toString()} sub={`${audit.ig.posts} posts · ${(audit.ig.followers / audit.ig.posts).toFixed(2)} followers per post`} status="critical" />
          <StatCard icon={Hash} label="Facebook" value="Misaligned" sub={`Handle is /${audit.fb.handle} — doesn't match brand`} status="critical" />
          <StatCard icon={Globe} label="Website" value="Broken" sub="Placeholder images, no pricing, 2 IG handles linked" status="warning" />
          <StatCard icon={Star} label="Reviews" value="Scattered" sub="Strong Groupon rating, zero HiDubai reviews, low Google visibility" status="warning" />
        </div>

        {/* Website issues */}
        <div className="mt-4 bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-[#666] font-semibold mb-3 flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Specific issues found on petskingdom.com</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {audit.website.issues.map((issue) => (
              <li key={issue} className="text-sm text-[#bbb] flex items-start gap-2">
                <span className="text-red-400 flex-shrink-0 mt-1.5">•</span>{issue}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The Story Gap */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="text-xs uppercase tracking-widest text-[#666] font-semibold">The story you're not telling</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/0 border border-amber-500/20 rounded-2xl p-8">
            <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-4">What people should know about Mohan</p>
            <ul className="space-y-3 text-[#ddd]">
              <li className="flex items-start gap-3"><span className="text-amber-400 font-bold text-2xl leading-none">{mohan.years}</span><span className="text-sm leading-relaxed">years training dogs. Started at age {mohan.age} when his father gifted him two puppies.</span></li>
              <li className="flex items-start gap-3"><span className="text-amber-400 font-bold text-2xl leading-none">{mohan.bestDogTitles}×</span><span className="text-sm leading-relaxed">"Best Dog in UAE" titles won by dogs he personally trained.</span></li>
              <li className="flex items-start gap-3"><span className="text-amber-400 font-bold text-base leading-none mt-1.5">★</span><span className="text-sm leading-relaxed">Official trainer at {mohan.origin}. "Most celebrated dog trainer in India" before moving to Dubai.</span></li>
              <li className="flex items-start gap-3"><span className="text-amber-400 font-bold text-base leading-none mt-1.5">★</span><span className="text-sm leading-relaxed">International training in {mohan.intl.join(" and ")}. Still attending global seminars.</span></li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-red-500/10 to-red-500/0 border border-red-500/20 rounded-2xl p-8">
            <p className="text-xs uppercase tracking-widest text-red-400 font-semibold mb-4">What Instagram knows about Mohan</p>
            <div className="space-y-4">
              <p className="text-7xl font-bold text-red-400 leading-none">219</p>
              <p className="text-[#aaa] text-sm">followers, after <span className="text-white font-semibold">189 posts</span>.</p>
              <div className="pt-3 border-t border-red-500/10">
                <p className="text-sm text-[#aaa] leading-relaxed">
                  That's <span className="text-white font-semibold">1.16 followers earned per post</span>. The story exists. It's just not reaching the camera.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competitor comparison */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-5 h-5 text-[#666]" />
          <h3 className="text-xs uppercase tracking-widest text-[#666] font-semibold">For reference — a younger competitor in the same city</h3>
        </div>

        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-3 gap-px bg-[#1a1a1a]">
            <div className="bg-[#0f0f0f] p-6">
              <p className="text-xs uppercase tracking-widest text-[#666] font-semibold mb-4">Metric</p>
              <div className="space-y-5">
                <p className="text-[#aaa] text-sm">Instagram followers</p>
                <p className="text-[#aaa] text-sm">Total posts</p>
                <p className="text-[#aaa] text-sm">Followers per post</p>
                <p className="text-[#aaa] text-sm">Awards / recognition</p>
                <p className="text-[#aaa] text-sm">Years of expertise</p>
              </div>
            </div>
            <div className="bg-[#0f0f0f] p-6">
              <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-4">Pets Kingdom</p>
              <div className="space-y-5">
                <p className="text-white text-base font-semibold">{audit.ig.followers.toLocaleString()}</p>
                <p className="text-white text-base font-semibold">{audit.ig.posts}</p>
                <p className="text-white text-base font-semibold">{(audit.ig.followers / audit.ig.posts).toFixed(2)}</p>
                <p className="text-white text-base font-semibold">7× Best Dog in UAE</p>
                <p className="text-white text-base font-semibold">30 years (Mohan)</p>
              </div>
            </div>
            <div className="bg-[#0f0f0f] p-6">
              <p className="text-xs uppercase tracking-widest text-red-400 font-semibold mb-4">{competitor.name}</p>
              <div className="space-y-5">
                <p className="text-white text-base font-semibold">{competitor.followers.toLocaleString()} <span className="text-red-400 text-xs">(21× more)</span></p>
                <p className="text-white text-base font-semibold">{competitor.posts}</p>
                <p className="text-white text-base font-semibold">{(competitor.followers / competitor.posts).toFixed(2)} <span className="text-red-400 text-xs">(6× more)</span></p>
                <p className="text-white text-base font-semibold">"{competitor.award}"</p>
                <p className="text-white text-base font-semibold">{competitor.age}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-500/5 border-t border-red-500/10 px-6 py-4">
            <p className="text-sm text-[#bbb]"><span className="text-white font-semibold">The takeaway:</span> Pets Kingdom has more substance and less reach. That's not a marketing problem — it's a distribution problem we know how to fix.</p>
          </div>
        </div>
      </section>

      {/* Content pillars */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-5 h-5 text-green-400" />
          <h3 className="text-xs uppercase tracking-widest text-[#666] font-semibold">What we'd build — 5 content pillars</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pillars.map((p) => (
            <div key={p.title} className="bg-[#0f0f0f] border border-[#1a1a1a] hover:border-green-500/30 transition-colors rounded-2xl p-6">
              <p.icon className="w-5 h-5 text-green-400 mb-3" />
              <h4 className="text-white font-semibold mb-2">{p.title}</h4>
              <p className="text-[#999] text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
          <div className="bg-gradient-to-br from-green-500/15 to-green-500/5 border border-green-500/20 rounded-2xl p-6 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-widest text-green-400 font-semibold mb-2">Output</p>
            <p className="text-3xl font-bold text-white leading-tight">15 videos<br />/ month</p>
            <p className="text-[#aaa] text-sm mt-2">Plus full IG + FB management</p>
          </div>
        </div>
      </section>

      {/* 90-day projection */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <h3 className="text-xs uppercase tracking-widest text-[#666] font-semibold">What 90 days looks like</h3>
        </div>

        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl overflow-hidden divide-y divide-[#1a1a1a]">
          {ninetyDay.map((row) => (
            <div key={row.metric} className="grid grid-cols-1 sm:grid-cols-4 gap-4 px-6 py-5 items-center">
              <p className="text-[#aaa] text-sm sm:col-span-1">{row.metric}</p>
              <p className="text-[#888] text-base font-medium">{row.from}</p>
              <div className="flex items-center gap-3 sm:col-span-1">
                <ArrowRight className="w-4 h-4 text-green-400 flex-shrink-0" />
                <p className="text-white text-base font-semibold">{row.to}</p>
              </div>
              <span className="inline-block w-fit text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-semibold">{row.delta}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#555] mt-3 px-1">Projections based on observed growth curves from comparable pet-niche accounts running consistent short-form video.</p>
      </section>

      {/* Pets Delight proof */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle2 className="w-5 h-5 text-blue-400" />
          <h3 className="text-xs uppercase tracking-widest text-[#666] font-semibold">Our current pet-industry client — the proof</h3>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/0 border border-blue-500/20 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <img src="/logo-pets-delight.jpg" alt="Pets Delight" className="w-14 h-14 rounded-xl border border-blue-400/30" />
            <div>
              <h4 className="text-white text-xl font-bold">Pets Delight</h4>
              <p className="text-[#aaa] text-sm">Paying AED 5,500/month since March 2026 · Same niche, different category</p>
            </div>
          </div>
          <p className="text-[#ccc] text-sm leading-relaxed mb-6">Pet retail brand in Dubai. We deliver 15 short-form videos per month, run their full social, and report on performance. The system we'd apply to Pets Kingdom is the same one running here — adapted to your story and your facility.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#0a0a0a]/60 border border-blue-400/10 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-[#666] font-semibold mb-1">Format</p>
              <p className="text-white text-sm font-semibold">15 reels / month</p>
            </div>
            <div className="bg-[#0a0a0a]/60 border border-blue-400/10 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-[#666] font-semibold mb-1">Tenure</p>
              <p className="text-white text-sm font-semibold">3+ consecutive months, on-time</p>
            </div>
            <div className="bg-[#0a0a0a]/60 border border-blue-400/10 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-[#666] font-semibold mb-1">Retention</p>
              <p className="text-white text-sm font-semibold">Renewing — zero churn</p>
            </div>
          </div>
          <p className="text-xs text-[#555] mt-4">Performance screenshots and sample reels will be screen-shared live during the meeting.</p>
        </div>
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
          <h3 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">If this resonates,<br />we start with a facility shoot day.</h3>
          <p className="text-[#aaa] max-w-2xl mx-auto leading-relaxed mb-8">We block one half-day at Pets Kingdom, capture enough footage to fuel 4–6 weeks of content, and start publishing within 7 days. You don't need to be on camera unless you want to be.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-sm">
            <a href="https://wa.me/971563459955" target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-3 rounded-xl transition-colors">WhatsApp Abdulrahman</a>
            <p className="text-[#666]">or reply to my email by end of week</p>
          </div>
        </div>
        <p className="text-center text-[#444] text-xs mt-8">Prepared by Cactus Lab FZ LLC · Dubai · cactuslab.ae</p>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, status }: { icon: any; label: string; value: string; sub: string; status: "critical" | "warning" | "good" }) {
  const colors = {
    critical: { ring: "border-red-500/20", text: "text-red-400", bg: "bg-red-500/5" },
    warning: { ring: "border-amber-500/20", text: "text-amber-400", bg: "bg-amber-500/5" },
    good: { ring: "border-green-500/20", text: "text-green-400", bg: "bg-green-500/5" },
  }[status];
  return (
    <div className={`${colors.bg} border ${colors.ring} rounded-2xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <Icon className={`w-4 h-4 ${colors.text}`} />
        <span className={`text-[10px] uppercase tracking-widest ${colors.text} font-semibold`}>{label}</span>
      </div>
      <p className="text-3xl font-bold text-white mb-2">{value}</p>
      <p className="text-xs text-[#888] leading-relaxed">{sub}</p>
    </div>
  );
}
