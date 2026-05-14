import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL, SYSTEM_PROMPTS } from "@/lib/anthropic";
import fs from "fs";
import path from "path";

export const maxDuration = 120;

export async function GET(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Check for cached playbook
    const playbookPath = path.join(process.cwd(), "data", "playbook.json");
    try {
      if (fs.existsSync(playbookPath)) {
        const cached = JSON.parse(fs.readFileSync(playbookPath, "utf-8"));
        if (cached && cached.days && cached.days.length > 0) {
          return NextResponse.json(cached);
        }
      }
    } catch {}

    const prompt = `Create a detailed, actionable 21-day Instagram growth playbook for Cactus Lab.

Context:
- Agency: Cactus Lab FZ LLC (Dubai, UAE RAKEZ free zone)
- Goal: Grow Instagram from 15 → 10,000 followers in 21 days (May 10-31, 2026)
- Niche: UAE social media agency for SMEs (pets, perfume, cars, recruitment, food)
- Price point: AED 5,500/month
- Current client: Pets Delight (pet products)
- Key offer: 15 short-form videos/month, clients never appear on camera
- Tagline: "Content that actually works — without you lifting a finger."
- Platform focus: Instagram Reels primarily
- Target audience: UAE business owners who need video content

Weekly targets:
- Week 1 (May 10-17): 0 → 500 followers
- Week 2 (May 18-24): 500 → 2,000 followers
- Week 3 (May 25-31): 2,000 → 10,000 followers

Return a JSON object with this EXACT structure:
{
  "overview": "2-3 paragraph overview of the strategy and why it will work",
  "weeklyMilestones": [
    { "week": 1, "target": 500, "dateRange": "May 10-17", "theme": "Foundation & Launch" },
    { "week": 2, "target": 2000, "dateRange": "May 18-24", "theme": "Momentum Building" },
    { "week": 3, "target": 10000, "dateRange": "May 25-31", "theme": "Viral Push" }
  ],
  "keyStrategies": [
    { "strategy": "Strategy name", "description": "How to execute it", "impact": "Expected impact" }
  ],
  "days": [
    {
      "day": 1,
      "date": "May 10",
      "targetFollowers": 491,
      "theme": "Day theme/focus",
      "contentToPost": {
        "type": "Reel",
        "title": "Content title",
        "hook": "The exact hook to use",
        "concept": "Full content concept",
        "caption": "Caption copy with emojis",
        "hashtags": "#tag1 #tag2 #tag3 (include 10-15 key tags)",
        "bestTimeToPost": "7 PM UAE time"
      },
      "engagementTasks": [
        "Task 1: specific engagement action",
        "Task 2: ...",
        "Task 3: ..."
      ],
      "growthTactics": [
        "Growth tactic 1",
        "Growth tactic 2"
      ],
      "outreachTask": "Specific DM/outreach task for today",
      "dailyTip": "One key insight or tip for today"
    }
  ],
  "hashtagStrategy": {
    "small": ["#tag1", "#tag2", ...] (10 tags under 100K posts),
    "medium": ["#tag1", ...] (10 tags 100K-1M posts),
    "large": ["#tag1", ...] (10 tags 1M+ posts),
    "branded": ["#CactusLab", "#CactusLabUAE", "#UAEContentAgency"]
  },
  "contentPillars": [
    { "pillar": "Pillar name", "description": "What content goes here", "percentage": 20 }
  ],
  "collaborationOpportunities": [
    { "type": "Collab type", "target": "Who to target", "approach": "How to approach them" }
  ]
}

Make every single day specific and actionable. The content ideas should be genuinely creative and optimized for viral growth in UAE. Day 21 (May 31) should be the most aggressive push for the final 8,000 followers needed.`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system: SYSTEM_PROMPTS.playbookGenerator,
      messages: [{ role: "user", content: prompt }],
    });

    let responseText = "";
    for (const block of response.content) {
      if (block.type === "text") {
        responseText += block.text;
      }
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const data = JSON.parse(jsonMatch[0]);

    // Cache the playbook
    try {
      fs.writeFileSync(playbookPath, JSON.stringify(data, null, 2));
    } catch (saveError) {
      console.error("Failed to cache playbook:", saveError);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Playbook API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate playbook" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  // Allow cache invalidation
  try {
    const playbookPath = path.join(process.cwd(), "data", "playbook.json");
    if (fs.existsSync(playbookPath)) {
      fs.unlinkSync(playbookPath);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to clear cache" }, { status: 500 });
  }
}
