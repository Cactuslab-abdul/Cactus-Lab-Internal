import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL, SYSTEM_PROMPTS } from "@/lib/anthropic";
import fs from "fs";
import path from "path";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { niche, goal, format, duration, tone, topic, contentType } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const contentTypeLabels: Record<string, string> = {
      educational: "Educational (teach something valuable, position as expert)",
      comedic: "Comedic (funny, relatable, shareable — UAE humor)",
      brand_story: "Brand Story (origin story, mission, behind-the-scenes)",
      testimonial: "Testimonial (client result, social proof, transformation)",
    };

    const prompt = `Create a complete viral content pack for:

Niche/Client: ${niche}
Content Goal: ${goal}
Platform Format: ${format}
Video Duration: ${duration}
Tone: ${tone}
Content Type: ${contentTypeLabels[contentType] || contentType}
${topic ? `Specific Topic/Idea: ${topic}` : "Choose the most viral topic for this niche"}

Create a COMPLETE content pack. Return as valid JSON with this exact structure:
{
  "hook": "The exact first 3 seconds script — must be attention-grabbing and stop the scroll",
  "script": "Full shot-by-shot breakdown:\nShot 1 (0-3s): [Visual] [Script/Text on screen]\nShot 2 (3-8s): ...\n(continue for full ${duration})",
  "caption": "Full Instagram/TikTok caption with emojis, storytelling, and CTA. 150-300 words.",
  "hashtags": ["#hashtag1", "#hashtag2", ...] (exactly 30 hashtags — mix of large 1M+, medium 100K-1M, and niche <100K),
  "thumbnailIdea": "Detailed description of the perfect thumbnail/cover frame",
  "bestTimeToPost": "Specific time and day recommendation for UAE audience with reasoning",
  "whyItWorks": "1-2 paragraph analysis of why this content will perform well — psychology, trends, UAE market context"
}

Make this genuinely viral. Think about scroll-stopping hooks, trending formats, UAE-specific cultural context, and psychology of sharing.`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 5000,
      system: SYSTEM_PROMPTS.contentGenerator,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract text content
    let responseText = "";
    for (const block of response.content) {
      if (block.type === "text") {
        responseText += block.text;
      }
    }

    // Parse JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const data = JSON.parse(jsonMatch[0]);

    // Save to content.json
    try {
      const dataPath = path.join(process.cwd(), "data", "content.json");
      const existing = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
      existing.savedContent = existing.savedContent || [];
      existing.savedContent.push({
        id: Date.now(),
        createdAt: new Date().toISOString(),
        niche,
        goal,
        format,
        duration,
        tone,
        topic,
        contentType: contentType || "educational",
        ...data,
      });
      existing.stats = existing.stats || {};
      existing.stats.contentGenerated = (existing.stats.contentGenerated || 0) + 1;
      fs.writeFileSync(dataPath, JSON.stringify(existing, null, 2));
    } catch (saveError) {
      console.error("Failed to save content:", saveError);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate content" },
      { status: 500 }
    );
  }
}
