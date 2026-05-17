import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL, SYSTEM_PROMPTS } from "@/lib/anthropic";
import Anthropic from "@anthropic-ai/sdk";

function extractJSON(text: string): Record<string, unknown> | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidates = fenced ? [fenced[1], text] : [text];
  for (const src of candidates) {
    const objects: string[] = [];
    let depth = 0, start = -1;
    for (let i = 0; i < src.length; i++) {
      if (src[i] === "{") { if (depth++ === 0) start = i; }
      else if (src[i] === "}" && depth > 0) {
        if (--depth === 0 && start !== -1) { objects.push(src.slice(start, i + 1)); start = -1; }
      }
    }
    for (const obj of objects.sort((a, b) => b.length - a.length)) {
      try { return JSON.parse(obj) as Record<string, unknown>; } catch { /* try next */ }
    }
  }
  return null;
}

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { niche, platform } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const prompt = `Search the web and find the ABSOLUTE LATEST trending content for the following:

Platform: ${platform}
Niche: ${niche}
Market: UAE / Dubai
Date: May 2026

Please search for and return:
1. Top 15 trending hashtags for this niche in UAE/Dubai right now
2. Trending audio/sounds on ${platform} this week
3. Top 5 content formats going viral in this niche
4. What top competing accounts in this space are doing
5. 5 specific content ideas based on current trends

Return your response as a valid JSON object with this exact structure:
{
  "hashtags": ["#tag1", "#tag2", ...],
  "trendingAudio": [
    { "name": "Sound Name", "artist": "Artist", "trend": "Why it's trending" }
  ],
  "trendingFormats": [
    { "format": "Format name", "description": "Description", "example": "Specific example" }
  ],
  "competitorInsights": [
    { "insight": "What competitors are doing", "example": "Specific example" }
  ],
  "contentIdeas": [
    {
      "title": "Content idea title",
      "hook": "The opening hook",
      "description": "Full idea description",
      "format": "Reel/TikTok/Short",
      "estimatedViews": "Estimate like 10K-50K",
      "whyItWorks": "Why this will go viral"
    }
  ]
}`;

    // web_search_20250305 is a built-in Anthropic server tool — no input_schema needed
    const webSearchTool = {
      type: "web_search_20250305",
      name: "web_search",
    } as unknown as Anthropic.Messages.Tool;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM_PROMPTS.trendScout,
      tools: [webSearchTool],
      messages: [{ role: "user", content: prompt }],
    });

    let responseText = "";
    for (const block of response.content) {
      if (block.type === "text") {
        responseText += block.text;
      }
    }

    const data = extractJSON(responseText);
    if (!data) throw new Error("No JSON found in response");
    return NextResponse.json(data);
  } catch (error) {
    console.error("Trends API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to scout trends" },
      { status: 500 }
    );
  }
}
