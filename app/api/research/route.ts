import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL, SYSTEM_PROMPTS } from "@/lib/anthropic";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { businessName, instagram, website, niche, recipientEmail } = await req.json();

    if (!businessName) {
      return NextResponse.json({ error: "Business name is required" }, { status: 400 });
    }

    const userMessage = `Research this UAE business and generate personalised outreach. You MUST return ONLY valid JSON, no other text before or after it.

Business: ${businessName}
${instagram ? `Instagram: ${instagram}` : ""}
${website ? `Website: ${website}` : ""}
${niche ? `Niche: ${niche}` : ""}
${recipientEmail ? `Decision maker email: ${recipientEmail}` : ""}

Use your knowledge of UAE businesses in this niche to generate specific, realistic insights.

Return ONLY this JSON structure, nothing else:
{
  "research": {
    "painPoints": ["specific pain point 1", "specific pain point 2", "specific pain point 3"],
    "contentGaps": ["content gap 1", "content gap 2", "content gap 3"],
    "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
    "opportunityScore": 7,
    "summary": "2-3 sentence summary of this business situation and why they are a good fit for Cactus Lab"
  },
  "email": {
    "subject": "compelling specific subject line",
    "body": "personalised email body max 150 words, sounds like Awab wrote it personally, references Pets Delight as proof, ends with specific low-commitment CTA"
  },
  "dm": "WhatsApp DM version 60-80 words, casual tone, specific CTA adapted for WhatsApp"
}`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: SYSTEM_PROMPTS.outreachResearcher,
      messages: [{ role: "user", content: userMessage }],
    });

    let text = "";
    for (const block of response.content) {
      if (block.type === "text") {
        text += block.text;
      }
    }

    if (!text) {
      throw new Error("No text response from Claude");
    }

    // Extract JSON from response — handle markdown fences and leading text
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Claude did not return valid JSON. Response started with: " + cleaned.substring(0, 100));
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("Research API error:", error);
    const msg = error instanceof Error ? error.message : "Research failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
