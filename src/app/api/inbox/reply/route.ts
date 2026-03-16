import { NextRequest, NextResponse } from "next/server";

const PROXY_URL = "http://127.0.0.1:3456/v1/chat/completions";

const SYSTEM_PROMPT = `You are drafting email replies on behalf of Ryan Dolph, Branch Manager at Key Retirement Solutions. Write professional but warm replies. Sign as Ryan. Keep replies concise unless the context requires detail. Do not include a subject line — just the body of the reply.`;

export async function POST(req: NextRequest) {
  try {
    const { messageContent, subject, from, threadSnippet, instructions } = await req.json();

    const userPrompt = `Draft a reply to this email.

From: ${from}
Subject: ${subject}
Message:
${messageContent || threadSnippet || "(no content)"}
${instructions ? `\nAdditional instructions: ${instructions}` : ""}`;

    const res = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Proxy error:", err);
      return NextResponse.json({ error: "Failed to generate reply" }, { status: 500 });
    }

    const data = await res.json();
    const draft = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({ draft });
  } catch (e: unknown) {
    console.error("Reply generation error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
