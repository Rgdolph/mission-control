import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const conversationId = req.nextUrl.searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://services.leadconnectorhq.com/conversations/${conversationId}/messages?limit=15`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GHL_PIT_KEY}`,
          Version: "2021-07-28",
        },
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`GHL API error ${res.status}: ${err}`);
    }

    const data = await res.json();

    const rawMessages = data.messages?.messages || data.messages || [];
    const messages = rawMessages.map((m: Record<string, unknown>) => ({
      id: m.id,
      body: m.body || m.message || "",
      direction: m.direction,
      type: m.messageType || m.type,
      time: m.dateAdded || m.createdAt,
      contactName: m.contactName || m.from || "",
    }));

    return NextResponse.json({ messages });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GHL messages error:", message);
    return NextResponse.json({ error: message, messages: [] }, { status: 500 });
  }
}
