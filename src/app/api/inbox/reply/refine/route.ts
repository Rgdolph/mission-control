import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are drafting email replies on behalf of Ryan Dolph, Branch Manager at Key Retirement Solutions. Write professional but warm replies. Sign as Ryan. Keep replies concise unless the context requires detail. Do not include a subject line — just the body of the reply.`;

export async function POST(req: NextRequest) {
  try {
    const { currentDraft, instruction } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
    }

    const userPrompt = `Here is the current draft of an email reply:

---
${currentDraft}
---

Please revise this draft based on this instruction: ${instruction}

Return only the revised email body, nothing else.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Anthropic API error:", err);
      return NextResponse.json({ error: "Failed to refine reply" }, { status: 500 });
    }

    const data = await res.json();
    const draft = data.content?.[0]?.text || "";

    return NextResponse.json({ draft });
  } catch (e: unknown) {
    console.error("Refine error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
