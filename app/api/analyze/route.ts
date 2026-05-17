import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL, SYSTEM_PROMPTS } from "@/lib/anthropic";
import { scrapeUrls } from "@/lib/scraper";
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

export const maxDuration = 90;

export async function POST(req: NextRequest) {
  try {
    const { urls } = await req.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "No URLs provided" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const webSearchTool = {
      type: "web_search_20250305",
      name: "web_search",
    } as unknown as Anthropic.Messages.Tool;

    // Scrape all URLs
    const scrapedContent = await scrapeUrls(urls.slice(0, 5));

    // Analyze with Claude
    const results = await Promise.all(
      scrapedContent.map(async (scraped) => {
        const prompt = `Analyze this social media content and extract every tactical insight:

URL: ${scraped.url}
Platform: ${scraped.platform}
Page Title: ${scraped.title}
Description: ${scraped.description}
Page Content: ${scraped.text.substring(0, 1500)}

${scraped.error ? `Note: Could not fully scrape this URL (${scraped.error}). Analyze based on the URL and any available info.` : ""}

Perform a deep analysis and return a JSON object with this EXACT structure:
{
  "url": "${scraped.url}",
  "platform": "${scraped.platform}",
  "contentType": "What type of content this is",
  "whatWorks": "Detailed analysis of why this content performs well",
  "hookBreakdown": "The exact hook technique used in the first 3 seconds",
  "structure": "How the content is structured from start to finish",
  "viralFactors": ["Factor 1", "Factor 2", "Factor 3", "Factor 4"],
  "uaeAdaptation": "Specific instructions on how to recreate this for UAE audience",
  "contentIdeas": [
    {
      "title": "Idea title",
      "hook": "Specific hook for this idea",
      "description": "Full content idea description",
      "format": "Reel/TikTok/Short",
      "niche": "Which Cactus Lab niche this suits best"
    },
    { "title": "", "hook": "", "description": "", "format": "", "niche": "" },
    { "title": "", "hook": "", "description": "", "format": "", "niche": "" }
  ],
  "estimatedPerformance": "Estimated view range and why",
  "keyTakeaway": "The single most important insight to steal from this content"
}`;

        try {
          const response = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 4000,
            system: SYSTEM_PROMPTS.urlAnalyzer,
            tools: [webSearchTool],
            messages: [{ role: "user", content: prompt }],
          });

          let responseText = "";
          for (const block of response.content) {
            if (block.type === "text") {
              responseText += block.text;
            }
          }

          const parsed = extractJSON(responseText);
          if (!parsed) throw new Error("No JSON in response");

          return parsed;
        } catch {
          return {
            url: scraped.url,
            platform: scraped.platform,
            error: "Failed to analyze this URL",
            contentType: "Unknown",
            whatWorks: "Analysis failed",
            hookBreakdown: "N/A",
            structure: "N/A",
            viralFactors: [],
            uaeAdaptation: "N/A",
            contentIdeas: [],
            estimatedPerformance: "N/A",
            keyTakeaway: "N/A",
          };
        }
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze URLs" },
      { status: 500 }
    );
  }
}
