import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { question, context } = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ reply: "Anthropic API key not configured. Add ANTHROPIC_API_KEY to .env.local." });
  }

  const systemPrompt = `You are Terry ⚡, Ryan Dolph's AI assistant. You're embedded in Mission Control's inbox.
Ryan is asking about a message. Be concise, direct, and helpful.
Context about the message:
- From: ${context.from}
- Subject: ${context.subject}
- Type: ${context.type}
- Content: ${context.snippet}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: "user", content: question }],
      }),
    });
    const data = await res.json();
    const reply = data.content?.[0]?.text || "No response.";
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ reply: "Error calling Anthropic API." });
  }
}
