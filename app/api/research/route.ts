import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { businessName, instagram, website, niche, recipientEmail } = await req.json();

    if (!businessName) {
      return NextResponse.json({ error: "Business name is required" }, { status: 400 });
    }

    const systemPrompt = `You are Awab Sirelkhatim, founder of Cactus Lab — a UAE short-form video and social media agency based in Dubai. You're writing a personal outreach email to a UAE business owner.

Key facts about you:
- You run Cactus Lab FZ LLC (RAKEZ free zone)
- You have an active client: Pets Delight (a pet products business in Dubai) — they've been with you since March 2026 and are getting consistent results with 15 videos/month
- Your offer: 15 short-form Reels per month for AED 5,500 — full service (scripting, filming, editing, scheduling)
- The client never has to appear on camera — you handle everything
- You specialise in UAE businesses: perfume, watches, cars, recruitment, food, pets

Your email tone:
- Personal, conversational, direct — like Awab actually wrote it, not a marketing email
- Specific about THEIR business (reference what you observed about them)
- One specific reference to Pets Delight as proof (real client, real results in Dubai)
- Short — max 150 words for the email body
- No corporate fluff, no "I hope this email finds you well", no generic opener
- End with a specific low-commitment CTA (e.g. "worth a quick 10-minute call?")

You must return valid JSON only, no markdown fences.`;

    const userMessage = `Research this UAE business and generate personalised outreach:

Business: ${businessName}
${instagram ? `Instagram: ${instagram}` : ""}
${website ? `Website: ${website}` : ""}
${niche ? `Niche: ${niche}` : ""}
${recipientEmail ? `Decision maker email: ${recipientEmail}` : ""}

${instagram || website ? "Search for their social media presence and website to find specific details about their content strategy and gaps." : "Use what you know about this niche in the UAE to generate insights."}

Return JSON with this exact structure:
{
  "research": {
    "painPoints": ["3 specific pain points for this type of business in UAE"],
    "contentGaps": ["3 content gaps you observed or inferred"],
    "opportunities": ["3 specific opportunities for this business"],
    "opportunityScore": 7,
    "summary": "2-3 sentence summary of this business's current situation and why they're a good fit"
  },
  "email": {
    "subject": "compelling, specific subject line (not generic)",
    "body": "personalised email body — max 150 words, sounds like Awab wrote it personally, references Pets Delight as proof, specific CTA"
  },
  "dm": "WhatsApp DM version — even shorter (60-80 words), casual tone, same personalisation, same CTA but adapted for WhatsApp"
}`;

    const tools: Anthropic.Messages.Tool[] = [
      {
        name: "web_search",
        description: "Search the web for information about a business",
        input_schema: {
          type: "object" as const,
          properties: {
            query: {
              type: "string",
              description: "The search query",
            },
          },
          required: ["query"],
        },
      },
    ];

    // Use standard messages API — web_search as a declared tool
    // Claude will reason about it; if web_search is not actually callable server-side,
    // it will still generate high-quality research based on its knowledge
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      tools,
    });

    // Extract text content from response
    let text = "";
    for (const block of response.content) {
      if (block.type === "text") {
        text = block.text;
        break;
      }
    }

    // If Claude tried to use web_search, handle tool_use blocks and get a follow-up
    const toolUseBlocks = response.content.filter(b => b.type === "tool_use");
    if (toolUseBlocks.length > 0 && !text) {
      // Claude wants to search — simulate tool results and ask for final answer
      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = toolUseBlocks.map(b => {
        if (b.type === "tool_use") {
          return {
            type: "tool_result" as const,
            tool_use_id: b.id,
            content: `Search results for "${(b.input as { query: string }).query}": No live results available. Generate insights based on your knowledge of UAE businesses in this niche.`,
          };
        }
        return { type: "tool_result" as const, tool_use_id: "", content: "" };
      });

      const followUp = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          { role: "user", content: userMessage },
          { role: "assistant", content: response.content },
          { role: "user", content: toolResults },
        ],
        tools,
      });

      for (const block of followUp.content) {
        if (block.type === "text") {
          text = block.text;
          break;
        }
      }
    }

    if (!text) {
      throw new Error("No text response from Claude");
    }

    // Parse JSON — strip markdown fences if present
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("Research API error:", error);
    const msg = error instanceof Error ? error.message : "Research failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
