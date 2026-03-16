import { NextResponse } from "next/server";

const PROXY_URL = "http://127.0.0.1:3456/v1/chat/completions";

export async function POST(req: Request) {
  const { question, page } = await req.json();

  const systemPrompt = `You are Terry ⚡, Ryan Dolph's AI co-pilot embedded in Mission Control.
You're direct, resourceful, and action-oriented. No fluff.

Ryan is currently on the "${page}" page of Mission Control.

You can help with:
- Summarizing inbox messages, tasks, or calendar
- Drafting emails or replies
- Answering questions about his business (KRS, Medicare, insurance)
- Suggesting next steps or priorities
- Explaining anything in the dashboard

Keep responses concise. Use short paragraphs. Be genuinely helpful.`;

  try {
    const res = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
        max_tokens: 600,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ reply: `Proxy error (${res.status}): ${errText.slice(0, 200)}` });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "No response.";
    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ reply: `Connection error: ${msg}` });
  }
}
