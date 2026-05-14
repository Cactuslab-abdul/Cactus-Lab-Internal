"use client";

import { useState } from "react";
import { FileText, Copy, Check, Hash, Plus, Trash2 } from "lucide-react";

// --- Static caption template library ---

interface CaptionTemplate {
  id: string;
  type: "educational" | "comedic" | "brand_story" | "testimonial";
  niche: string;
  title: string;
  caption: string;
  hashtags: string[];
}

const CAPTION_TEMPLATES: CaptionTemplate[] = [
  // EDUCATIONAL
  {
    id: "edu-pets-1",
    type: "educational",
    niche: "Pets",
    title: "3 Foods Killing Your Dog",
    caption: `🚨 3 "healthy" foods that are secretly killing your dog...\n\nMost UAE pet owners don't know this.\n\nI've seen dogs rushed to the vet because of these:\n\n❌ Grapes & raisins — even ONE can cause kidney failure\n❌ Onions & garlic — destroys red blood cells over time\n❌ Xylitol (sugar-free gum/candy) — fatal within hours\n\nThe scary part? These are in foods we eat every day.\n\nSave this post. Share it with every pet owner you know.\n\nYour dog's life might depend on it. 🐾\n\n👇 Drop a ❤️ if you learned something new.`,
    hashtags: ["#UAEPets", "#DubaiPets", "#PetCareUAE", "#DogOwnerUAE", "#PetsDelight", "#DubaiDogs", "#PetHealthUAE", "#UAE", "#Dubai", "#PetTips"],
  },
  {
    id: "edu-cars-1",
    type: "educational",
    niche: "Cars",
    title: "Dubai Summer Car Care",
    caption: `🔥 Your car is silently dying in Dubai summer heat.\n\nHere's what most drivers ignore:\n\n1. Tyre pressure drops 1 PSI for every 10°F rise — check weekly\n2. Coolant flush every 2 years or your engine overheats on Sheikh Zayed\n3. AC filter clogged = you're breathing recirculated bacteria\n4. Battery life drops 60% in UAE heat — test it before it dies on you\n\nDubai summer is brutal. Your car needs more love than Autumn.\n\n👇 Which one are you guilty of ignoring?`,
    hashtags: ["#UAECars", "#DubaiCars", "#CarCareUAE", "#DubaiDriving", "#UAE", "#Dubai", "#CarTips", "#AutoUAE", "#DubaiLife"],
  },
  {
    id: "edu-food-1",
    type: "educational",
    niche: "Food",
    title: "UAE Spice Guide",
    caption: `🌶️ The UAE spice rack cheat sheet nobody gives you...\n\nIf you grew up here, you know the smell.\nIf you didn't — this is your crash course:\n\n🟡 Turmeric — anti-inflammatory, goes in everything\n🟤 Loomi (dried lime) — the secret to any Gulf dish\n🟠 Bezar spice mix — the UAE version of garam masala\n⚫ Cardamom — mandatory in karak chai. Non-negotiable.\n\nThe best part? Most of these cost under AED 5 at any souk.\n\nDubai food is underrated and I will die on this hill.\n\n💬 What's YOUR favourite UAE spice? Comment below 👇`,
    hashtags: ["#UAEFood", "#DubaiFood", "#GulfCooking", "#EmiratiFood", "#DubaiEats", "#UAEFoodie", "#Spices", "#MiddleEastFood", "#Dubai", "#UAE"],
  },
  {
    id: "edu-recruitment-1",
    type: "educational",
    niche: "Recruitment",
    title: "Dubai Job Market 2026",
    caption: `📊 The Dubai job market in 2026 — what they're NOT telling you:\n\nI've spoken to hiring managers across 12 UAE industries.\n\nHere's what actually gets you hired:\n\n✅ LinkedIn headline matters MORE than your CV\n✅ Referrals fill 70% of mid-senior roles before they're even posted\n✅ "Culture fit" = are you easy to work with under pressure\n✅ Video cover letters convert 3x better in UAE market\n\nWhat doesn't work:\n❌ Generic CV templates\n❌ Applying to 100 jobs with the same cover letter\n❌ Waiting for HR to call you back\n\nBe proactive. Dubai rewards the bold.\n\n💬 What's your biggest job hunting frustration? 👇`,
    hashtags: ["#UAEJobs", "#DubaiJobs", "#HiringUAE", "#JobsInDubai", "#RecruitmentUAE", "#CareerDubai", "#UAECareer", "#JobSearch", "#Dubai", "#UAE"],
  },

  // PERFUME
  {
    id: "edu-perfume-1",
    type: "educational",
    niche: "Perfume",
    title: "How to Layer UAE Fragrances",
    caption: `🌹 Nobody taught you this about UAE perfume — but they should have.\n\nLayering fragrance is an art. Here's the cheat sheet:\n\n1️⃣ Start with oud oil on pulse points (wrists, neck, inner elbows)\n2️⃣ Wait 2 minutes — let it settle into your skin\n3️⃣ Spray your main fragrance over the top\n4️⃣ One spray of musk on your chest to lock it in\n\nResult: Your scent lasts 10–14 hours in Dubai heat. Not 2.\n\nThe difference between smelling great and being remembered? Layering.\n\n💬 What's your go-to UAE perfume? Drop it below 👇`,
    hashtags: ["#UAEPerfume", "#DubaiPerfume", "#OudUAE", "#FragranceUAE", "#ArabicPerfume", "#LuxuryPerfumeUAE", "#PerfumeCommunity", "#OudLovers", "#UAE", "#Dubai", "#PerfumeTips", "#GulfPerfume", "#DubaiLuxury", "#ScentUAE", "#PerfumeDubai"],
  },
  {
    id: "com-perfume-1",
    type: "comedic",
    niche: "Perfume",
    title: "UAE Perfume Culture",
    caption: `UAE perfume culture hits different 😂\n\nEverywhere else: "I'll put on a little perfume before I go out"\n\nUAE: *applies 4 layers of oud, bakhoor the house, and sprays the car interior*\n\n"Just a subtle scent"\n\nBystanders 3 floors down: 👃😭\n\nWe don't do "subtle" here and honestly? Respect. 🌹\n\nTag someone whose perfume enters the room before they do 😂👇`,
    hashtags: ["#UAEPerfume", "#DubaiPerfume", "#OudUAE", "#GulfPerfume", "#DubaiLife", "#UAE", "#Dubai", "#PerfumeLovers", "#Relatable", "#DubaiHumor"],
  },

  // SPICES
  {
    id: "edu-spices-1",
    type: "educational",
    niche: "Spices",
    title: "5 UAE Spices You're Sleeping On",
    caption: `🌶️ 5 UAE spices that belong in every kitchen — and what to do with them:\n\n🟡 Loomi (Black Lime) — Adds a smoky citrus kick to rice, stews, and grilled fish. Dry or powdered.\n🟤 Bezar Mix — The Gulf's answer to garam masala. Use on lamb, chicken, or roasted veggies.\n🟠 Saffron — A pinch in rice or karak chai changes everything. Don't skip it.\n⚫ Habba Sawda (Black Seed) — On bread, in salads, or raw. Called "cure for everything except death" in Arab tradition.\n🔴 Dried Rose Petals — In desserts, teas, and even meat marinades. More versatile than you think.\n\nAll available at any Deira spice souk for under AED 30 total.\n\n💬 Which one did you NOT know about? 👇`,
    hashtags: ["#UAESpices", "#DubaiSpices", "#SpiceMarketDubai", "#GulfCooking", "#EmiratiFood", "#DubaiFood", "#UAE", "#Dubai", "#SpiceSouk", "#DeiraMarket", "#MiddleEastFood", "#ArabicCooking", "#UAEFoodie", "#HalalFood", "#DubaiEats"],
  },
  {
    id: "com-spices-1",
    type: "comedic",
    niche: "Spices",
    title: "Visiting Deira Spice Souk",
    caption: `Visiting the Deira Spice Souk for the first time 😂\n\nStep 1: "I'll just grab some turmeric"\n\nStep 2: *surrounded by 47 different spice merchants*\n\nStep 3: "Sir this one cures back pain, this one is for energy, this one—"\n\nStep 4: *exits with AED 200 of spices you can't name and a saffron package the size of your arm*\n\nStep 5: Use 2 of them. The rest sit in the cabinet for 4 years.\n\nDubai tourist speedrun: complete. 😭🌶️\n\nTag someone who's done exactly this 👇`,
    hashtags: ["#DubaiSpices", "#SpiceSouk", "#DeiraMarket", "#DubaiLife", "#DubaiTourist", "#UAELife", "#UAE", "#Dubai", "#Relatable", "#DubaiHumor", "#SpiceMarketDubai"],
  },

  // CAFE
  {
    id: "edu-cafe-1",
    type: "educational",
    niche: "Cafe",
    title: "Dubai Cafe Culture Guide",
    caption: `☕ Dubai's cafe scene in 2026 — what actually separates the good from the great:\n\n✅ Specialty coffee vs commodity beans — if they can't name the origin, it's commodity\n✅ Karak done right — fresh ginger, cardamom, and evaporated milk. Not powder.\n✅ The vibe matters — UAE cafe culture is about lingering, not rushing\n✅ Arabic coffee service — hawa (cardamom-infused), always served with dates\n✅ Instagram corner ≠ quality — the best cafes in Dubai have neither a neon sign nor a 45-minute wait\n\nThe cafes that win in Dubai: obsessed with detail, built for community, and consistent every single day.\n\n💬 What's your favourite Dubai cafe? Comment below and we'll check it out 👇`,
    hashtags: ["#DubaiCafe", "#UAECafe", "#DubaiCoffee", "#CoffeeUAE", "#SpecialtyCoffeeDubai", "#KarakTea", "#DubaiEats", "#CafeDubai", "#UAE", "#Dubai", "#CoffeeCulture", "#DubaiLifestyle", "#DubaiBreakfast", "#UAEFoodie", "#DubaiHipsterCafe"],
  },
  {
    id: "com-cafe-1",
    type: "comedic",
    niche: "Cafe",
    title: "Ordering Coffee in Dubai",
    caption: `Ordering coffee in Dubai in 2026 😂\n\nBarista: "What can I get you?"\n\nMe: "Just a flat white please"\n\nBarista: "We have the single origin Ethiopian V60, the cold brew nitro cascade, the—"\n\nMe: "...the flat white"\n\nBarista: "Our flat white uses a double ristretto pulled at 93°C with oat milk micro-foam"\n\nMe: "I just wanted to wake up"\n\nAlso me: *becomes a coffee snob within 3 months of living in Dubai* 😭☕\n\nTag someone who now judges coffee shops by their grinder brand 👇`,
    hashtags: ["#DubaiCafe", "#DubaiCoffee", "#CoffeeUAE", "#DubaiLife", "#Relatable", "#CafeDubai", "#DubaiHumor", "#UAE", "#Dubai", "#CoffeeCulture", "#DubaiProblems"],
  },

  // COMEDIC
  {
    id: "com-pets-1",
    type: "comedic",
    niche: "Pets",
    title: "Cat vs Dog Owner in UAE",
    caption: `POV: You're a cat owner in Dubai 😂\n\n6 AM: Cat sits on your face\nYou: "Good morning beautiful"\n\nPOV: You're a dog owner in Dubai\n\n6 AM: Dog does zoomies across the entire apartment\nYou: [screaming internally]\n\nBoth: "I would die for this creature"\n\nUAE pet parents are built different. 😭🐾\n\nTag a pet parent who needs to see this! 👇\n\n#UAE #Dubai #PetLife`,
    hashtags: ["#UAEPets", "#DubaiPets", "#PetParent", "#CatUAE", "#DogUAE", "#PetLife", "#DubaiLife", "#UAE", "#Dubai", "#FunnyPets"],
  },
  {
    id: "com-cars-1",
    type: "comedic",
    niche: "Cars",
    title: "Dubai Parking Behavior",
    caption: `Dubai parking be like... 😂\n\nLevel 1: Parked in a bay ✅\nLevel 2: Parked half on the pavement ⚠️\nLevel 3: Double-parked on a main road 🚨\nLevel 4: On the roundabout... for "5 minutes" 💀\nLevel 5: Left the car RUNNING in the mall entrance 😭\n\nBonus level: Parked so close to you that you have to enter from the passenger side.\n\nWe've all been victim AND perpetrator at some point. Don't lie. 😂\n\nTag someone who's guilty of Level 4 👇`,
    hashtags: ["#DubaiLife", "#UAELife", "#DubaiProblems", "#DubaiParking", "#Relatable", "#DubaiHumor", "#UAE", "#Dubai", "#CarUAE", "#DubaiMemes"],
  },
  {
    id: "com-food-1",
    type: "comedic",
    niche: "Food",
    title: "Ordering Food in Dubai",
    caption: `Ordering food in Dubai vs anywhere else 😂\n\n"How spicy do you want it?"\n\nDubai answer: "Extra spicy, habibi. Make it dangerous."\n\nActual result: *Calls for ambulance*\n\nAlso Dubai: Next day orders again. Same request. 🌶️💀\n\nWe do NOT learn our lesson and that's what makes us special.\n\nTag someone who always says "medium spicy" but means "mild" 😭👇`,
    hashtags: ["#DubaiFood", "#UAEFood", "#DubaiEats", "#DubaiLife", "#Relatable", "#FoodUAE", "#Dubai", "#UAE", "#DubaiHumor", "#Foodie"],
  },
  {
    id: "com-agency-1",
    type: "comedic",
    niche: "Agency",
    title: "Client Brief vs Reality",
    caption: `Client brief: "Just make something viral" 😂\n\nMe: *Creates full content strategy, hooks, scripts, posting schedule*\n\nClient: "Can we just do something like that one video I saw?"\n\nMe: *sends invoice*\n\nBut seriously — Cactus Lab handles the ENTIRE content process so you never have to say those words again.\n\n15 videos a month. You never appear on camera. AED 5,500/mo.\n\nSlide into our DMs if that sounds like you. 💚`,
    hashtags: ["#CactusLab", "#UAEAgency", "#ContentAgency", "#DubaiMarketing", "#SMEDubai", "#DubaiBusiness", "#ContentCreation", "#UAE", "#Dubai", "#AgencyLife"],
  },

  // BRAND STORY
  {
    id: "story-agency-1",
    type: "brand_story",
    niche: "Agency",
    title: "Why Cactus Lab Exists",
    caption: `I started Cactus Lab because I watched amazing UAE businesses fail online.\n\nNot because their product was bad.\nNot because their service was weak.\n\nBut because they had zero content strategy.\n\nI saw a restaurant with the best biryani in Dubai — 200 Instagram followers.\nA pet shop with the most loyal customers — posting once a month.\nA recruitment agency changing lives — invisible online.\n\nContent is the great equalizer in 2026. If you're not showing up, you don't exist.\n\nCactus Lab exists to change that.\n\n15 short-form videos per month. You never appear on camera. We handle everything.\n\nIf this resonates — DM us "GROW" and let's talk. 💚`,
    hashtags: ["#CactusLab", "#ContentAgency", "#UAEBusiness", "#DubaiMarketing", "#SMEDubai", "#ContentStrategy", "#InstagramUAE", "#Dubai", "#UAE", "#BusinessGrowth"],
  },
  {
    id: "story-pets-1",
    type: "brand_story",
    niche: "Pets",
    title: "Why We Started Pets Delight",
    caption: `We started Pets Delight after watching UAE pet owners struggle to find quality products.\n\nMost imported brands? Not made for this climate.\nLocal options? Limited and overpriced.\n\nWe thought: UAE pets deserve better.\n\nFast forward to today — thousands of happy pets across Dubai, Abu Dhabi, and Sharjah.\n\nEvery order ships same-day. Every product is UAE-climate tested.\n\nBecause your pet's comfort is our obsession.\n\n🐾 Shop now — link in bio.\n\n💬 Tell us: where did you first hear about us? 👇`,
    hashtags: ["#PetsDelight", "#UAEPets", "#DubaiPets", "#PetShopUAE", "#PetCareUAE", "#UAE", "#Dubai", "#PetLovers", "#DubaiDogs", "#DubaiCats"],
  },

  // TESTIMONIAL
  {
    id: "test-agency-1",
    type: "testimonial",
    niche: "Agency",
    title: "Client Result: 0 to 10K",
    caption: `"We went from 0 to 10,000 followers in 3 months. We got 4 new clients directly from Instagram."\n\n— Ahmed, F&B Business Owner, Dubai\n\nAhmed came to us with a great product and zero social media presence.\n\nWe created 15 Reels a month.\nHe never appeared on camera.\nWe handled the scripts, editing, captions, hashtags — everything.\n\n3 months later: 10K followers, 4 direct business inquiries, 1 viral video at 2M+ views.\n\nThis is what Cactus Lab does.\n\nDM us "RESULTS" and let's talk about what we can build for your business. 💚\n\n👇 Drop a 🔥 if you want results like this.`,
    hashtags: ["#CactusLab", "#ClientResults", "#ContentMarketing", "#UAEBusiness", "#DubaiMarketing", "#SocialMediaUAE", "#InstagramGrowth", "#UAE", "#Dubai", "#DigitalMarketing"],
  },
  {
    id: "test-pets-1",
    type: "testimonial",
    niche: "Pets",
    title: "Customer Review: Transformation",
    caption: `"My dog used to scratch all day. Switched to Pets Delight food and within 2 weeks — completely changed." ⭐⭐⭐⭐⭐\n\n— Sarah, Dubai Hills\n\nThis is why we do what we do.\n\nWe hear stories like Sarah's every week. Dogs that couldn't sleep. Cats that refused to eat. Pets just... surviving instead of thriving.\n\nThe difference? The right nutrition for the UAE climate.\n\nPets Delight is formulated for heat tolerance, hydration support, and UAE-specific dietary needs.\n\nYour pet deserves to thrive, not just survive.\n\n🛒 Shop now — link in bio.\n\n💬 Share your pet's transformation story below 👇`,
    hashtags: ["#PetsDelight", "#PetTestimonial", "#UAEPets", "#DubaiPets", "#PetNutrition", "#HappyPets", "#UAE", "#Dubai", "#PetCare", "#DogFood"],
  },
];

// --- Static hashtag sets per niche ---

const HASHTAG_SETS: Record<string, { label: string; tags: string[]; color: string }> = {
  pets: {
    label: "Pets & Pet Products",
    color: "text-orange-400",
    tags: ["#UAEPets", "#DubaiPets", "#PetsDelight", "#PetCareUAE", "#DubaiDogs", "#DubaiCats", "#PetLoversUAE", "#UAE", "#Dubai", "#PetLife", "#PetShopUAE", "#PetNutritionUAE", "#HappyPetsUAE", "#DogOwnerUAE", "#CatOwnerUAE", "#UAEAnimalLovers", "#PetAccessoriesUAE", "#VetDubai", "#PetFoodUAE", "#DubaiPetShop"],
  },
  perfume: {
    label: "Perfume & Watches",
    color: "text-yellow-400",
    tags: ["#UAEPerfume", "#DubaiPerfume", "#OudUAE", "#LuxuryPerfumeUAE", "#ArabicPerfume", "#WatchesUAE", "#DubaiWatches", "#LuxuryWatches", "#UAE", "#Dubai", "#PerfumeCommunity", "#OudLovers", "#DubaiLuxury", "#FragranceUAE", "#WatchCollector", "#SwissWatchUAE", "#DubaiStyle", "#GulfPerfume", "#PerfumeDubai", "#WatchesDubai"],
  },
  spices: {
    label: "Spices & Food",
    color: "text-orange-400",
    tags: ["#UAESpices", "#DubaiSpices", "#SpiceMarketDubai", "#DeiraMarket", "#SpiceSouk", "#GulfCooking", "#EmiratiFood", "#ArabicCooking", "#UAE", "#Dubai", "#DubaiFood", "#MiddleEastFood", "#HalalFood", "#UAEFoodie", "#DubaiEats", "#Loomi", "#Bezar", "#Saffron", "#ArabicSpices", "#DubaiMarket"],
  },
  cafe: {
    label: "Cafes & Coffee",
    color: "text-amber-400",
    tags: ["#DubaiCafe", "#UAECafe", "#DubaiCoffee", "#CoffeeUAE", "#SpecialtyCoffeeDubai", "#KarakTea", "#CafeDubai", "#UAE", "#Dubai", "#CoffeeCulture", "#DubaiLifestyle", "#DubaiBreakfast", "#UAEFoodie", "#DubaiHipsterCafe", "#CoffeeDubai", "#KarakUAE", "#DubaiCafeHopping", "#SpecialtyCoffee", "#ArabicCoffee", "#DubaiMorning"],
  },
  cars: {
    label: "Cars & Automotive",
    color: "text-blue-400",
    tags: ["#UAECars", "#DubaiCars", "#CarCareUAE", "#DubaiAutomotive", "#CarLoversUAE", "#DubaiDriving", "#UAEGarage", "#GarageUAE", "#ModifiedCarsUAE", "#DubaiCarScene", "#UAE", "#Dubai", "#CarDetailing", "#DetailingUAE", "#DubaiSpeedsters", "#LuxuryCarsDubai", "#UAE4x4", "#DubaiOffroad", "#AutoRepairUAE", "#CarWashDubai"],
  },
  recruitment: {
    label: "Recruitment & HR",
    color: "text-green-400",
    tags: ["#UAEJobs", "#DubaiJobs", "#HiringUAE", "#JobsInDubai", "#RecruitmentUAE", "#CareerDubai", "#UAECareer", "#JobSearchDubai", "#HRDubai", "#UAE", "#Dubai", "#WorkInDubai", "#TalentAcquisitionUAE", "#DubaiHiring", "#CareersInUAE", "#JobOpportunitiesUAE", "#LinkedInUAE", "#ProfessionalsDubai", "#UAERecruiters", "#HireInUAE"],
  },
  food: {
    label: "Food & Spices",
    color: "text-red-400",
    tags: ["#UAEFood", "#DubaiFood", "#DubaiEats", "#FoodieUAE", "#DubaiRestaurants", "#EmiratiFood", "#GulfFood", "#MiddleEastFood", "#UAE", "#Dubai", "#Foodstagram", "#DubaiFoodie", "#SpicesUAE", "#HalalFood", "#DubaiChef", "#UAEFoodie", "#DubaiCafe", "#StreetFoodDubai", "#DubaiCuisine", "#UAECooking"],
  },
  agency: {
    label: "Cactus Lab / Agency",
    color: "text-emerald-400",
    tags: ["#CactusLab", "#CactusLabUAE", "#UAEContentAgency", "#ContentMarketingUAE", "#DubaiMarketing", "#SocialMediaUAE", "#InstagramUAE", "#ReelsUAE", "#UAE", "#Dubai", "#ContentCreationUAE", "#ShortFormVideo", "#VideoMarketingUAE", "#SMEDubai", "#UAEBusiness", "#DubaiSME", "#ContentStrategy", "#InstagramGrowth", "#TikTokUAE", "#UAEAgency"],
  },
};

const TYPE_COLORS: Record<string, { badge: string; border: string; label: string }> = {
  educational: { badge: "bg-blue-500/15 text-blue-400 border-blue-500/25", border: "border-blue-500/20", label: "Educational" },
  comedic: { badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25", border: "border-yellow-500/20", label: "Comedic" },
  brand_story: { badge: "bg-purple-500/15 text-purple-400 border-purple-500/25", border: "border-purple-500/20", label: "Brand Story" },
  testimonial: { badge: "bg-orange-500/15 text-orange-400 border-orange-500/25", border: "border-orange-500/20", label: "Testimonial" },
};

function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#2a2a2a] hover:bg-[#333] border border-[#333] text-[#888] hover:text-white transition-all ${className}`}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function CaptionsPage() {
  const [activeType, setActiveType] = useState<string>("all");
  const [activeNiche, setActiveNiche] = useState<string>("all");
  const [hashtagNiche, setHashtagNiche] = useState<string>("agency");
  const [customCaptions, setCustomCaptions] = useState<CaptionTemplate[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("cactus-custom-captions") || "[]");
    } catch { return []; }
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCaption, setNewCaption] = useState({ title: "", caption: "", type: "educational" as CaptionTemplate["type"], niche: "Agency" });

  const allTemplates = [...CAPTION_TEMPLATES, ...customCaptions];
  const filtered = allTemplates.filter((t) => {
    const typeMatch = activeType === "all" || t.type === activeType;
    const nicheMatch = activeNiche === "all" || t.niche.toLowerCase().includes(activeNiche.toLowerCase());
    return typeMatch && nicheMatch;
  });

  const niches = Array.from(new Set(allTemplates.map((t) => t.niche)));

  const handleAddCustom = () => {
    if (!newCaption.title || !newCaption.caption) return;
    const newItem: CaptionTemplate = {
      id: `custom-${Date.now()}`,
      type: newCaption.type,
      niche: newCaption.niche,
      title: newCaption.title,
      caption: newCaption.caption,
      hashtags: [],
    };
    const updated = [...customCaptions, newItem];
    setCustomCaptions(updated);
    localStorage.setItem("cactus-custom-captions", JSON.stringify(updated));
    setNewCaption({ title: "", caption: "", type: "educational", niche: "Agency" });
    setShowAddForm(false);
  };

  const handleDeleteCustom = (id: string) => {
    const updated = customCaptions.filter((c) => c.id !== id);
    setCustomCaptions(updated);
    localStorage.setItem("cactus-custom-captions", JSON.stringify(updated));
  };

  const hashtagSet = HASHTAG_SETS[hashtagNiche];

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-2">
            <FileText className="w-4 h-4" />
            Caption Library
          </div>
          <h1 className="text-white text-2xl font-bold">Caption Template Library</h1>
          <p className="text-[#666] mt-1">
            Pre-written captions for every content type — copy, customise, and post.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Custom
        </button>
      </div>

      {/* Add custom form */}
      {showAddForm && (
        <div className="bg-[#111] border border-green-500/20 rounded-2xl p-6 fade-in">
          <h3 className="text-white font-semibold mb-4">Add Custom Caption Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[#888] text-xs font-medium mb-2 uppercase tracking-wide">Title</label>
              <input
                value={newCaption.title}
                onChange={(e) => setNewCaption((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Perfume unboxing hook"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#444] focus:border-green-500/50 transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#888] text-xs font-medium mb-2 uppercase tracking-wide">Type</label>
                <select
                  value={newCaption.type}
                  onChange={(e) => setNewCaption((p) => ({ ...p, type: e.target.value as CaptionTemplate["type"] }))}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-3 text-white text-sm appearance-none cursor-pointer"
                >
                  <option value="educational">Educational</option>
                  <option value="comedic">Comedic</option>
                  <option value="brand_story">Brand Story</option>
                  <option value="testimonial">Testimonial</option>
                </select>
              </div>
              <div>
                <label className="block text-[#888] text-xs font-medium mb-2 uppercase tracking-wide">Niche</label>
                <input
                  value={newCaption.niche}
                  onChange={(e) => setNewCaption((p) => ({ ...p, niche: e.target.value }))}
                  placeholder="e.g. Perfume"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-3 text-white text-sm placeholder-[#444]"
                />
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-[#888] text-xs font-medium mb-2 uppercase tracking-wide">Caption Text</label>
            <textarea
              value={newCaption.caption}
              onChange={(e) => setNewCaption((p) => ({ ...p, caption: e.target.value }))}
              placeholder="Paste or write your caption here..."
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#444] resize-none focus:border-green-500/50 transition-colors"
              rows={5}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAddCustom}
              className="bg-green-500 hover:bg-green-400 text-black font-semibold px-5 py-2 rounded-xl text-sm transition-colors"
            >
              Save Template
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-white font-medium px-5 py-2 rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5">
        <div className="flex flex-wrap gap-4">
          <div>
            <p className="text-[#666] text-xs font-medium uppercase tracking-wide mb-2">Content Type</p>
            <div className="flex flex-wrap gap-2">
              {["all", "educational", "comedic", "brand_story", "testimonial"].map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all capitalize ${
                    activeType === type
                      ? "bg-green-500/10 border-green-500/30 text-green-400"
                      : "bg-[#1a1a1a] border-[#2a2a2a] text-[#666] hover:text-white"
                  }`}
                >
                  {type === "all" ? "All Types" : type.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[#666] text-xs font-medium uppercase tracking-wide mb-2">Niche</p>
            <div className="flex flex-wrap gap-2">
              {["all", ...niches].map((niche) => (
                <button
                  key={niche}
                  onClick={() => setActiveNiche(niche)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    activeNiche === niche
                      ? "bg-green-500/10 border-green-500/30 text-green-400"
                      : "bg-[#1a1a1a] border-[#2a2a2a] text-[#666] hover:text-white"
                  }`}
                >
                  {niche === "all" ? "All Niches" : niche}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-[#555] text-xs mt-3">{filtered.length} template{filtered.length !== 1 ? "s" : ""} shown</p>
      </div>

      {/* Templates grid */}
      <div className="space-y-4">
        {filtered.map((template) => {
          const typeInfo = TYPE_COLORS[template.type];
          const isCustom = template.id.startsWith("custom-");
          return (
            <div key={template.id} className={`bg-[#111] border ${typeInfo.border} rounded-2xl p-6`}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${typeInfo.badge}`}>
                    {typeInfo.label}
                  </span>
                  <span className="text-xs text-[#555] border border-[#2a2a2a] px-2 py-0.5 rounded-md">
                    {template.niche}
                  </span>
                  {isCustom && (
                    <span className="text-xs text-[#555] border border-[#2a2a2a] px-2 py-0.5 rounded-md">
                      Custom
                    </span>
                  )}
                  <span className="text-white font-semibold text-sm">{template.title}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <CopyButton text={template.caption} />
                  {isCustom && (
                    <button
                      onClick={() => handleDeleteCustom(template.id)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-900/20 hover:bg-red-900/30 border border-red-500/20 text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4 mb-4">
                <p className="text-[#ccc] text-sm leading-relaxed whitespace-pre-wrap">{template.caption}</p>
              </div>
              {template.hashtags.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[#555] text-xs font-medium uppercase tracking-wide">Suggested Hashtags</p>
                    <CopyButton text={template.hashtags.join(" ")} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {template.hashtags.map((tag) => (
                      <span key={tag} className="bg-[#1a1a1a] border border-[#2a2a2a] text-[#888] px-2.5 py-1 rounded-lg text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hashtag Bank */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2">
              <Hash className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Hashtag Sets by Niche</h2>
              <p className="text-[#666] text-xs">Pre-researched UAE hashtag sets — copy and paste</p>
            </div>
          </div>
        </div>

        {/* Niche selector */}
        <div className="flex flex-wrap gap-2 mb-5">
          {Object.entries(HASHTAG_SETS).map(([key, set]) => (
            <button
              key={key}
              onClick={() => setHashtagNiche(key)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                hashtagNiche === key
                  ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                  : "bg-[#1a1a1a] border-[#2a2a2a] text-[#666] hover:text-white"
              }`}
            >
              {set.label}
            </button>
          ))}
        </div>

        {hashtagSet && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-sm font-semibold ${hashtagSet.color}`}>{hashtagSet.label}</p>
              <CopyButton text={hashtagSet.tags.join(" ")} />
            </div>
            <div className="flex flex-wrap gap-2">
              {hashtagSet.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => navigator.clipboard.writeText(tag)}
                  className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 px-3 py-1.5 rounded-lg text-sm transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
