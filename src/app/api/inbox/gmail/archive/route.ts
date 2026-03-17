import { NextResponse } from "next/server";

async function getAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!.trim(),
      client_secret: process.env.GOOGLE_CLIENT_SECRET!.trim(),
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!.trim(),
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to refresh Google token");
  return data.access_token;
}

export async function POST(req: Request) {
  try {
    const { messageId } = await req.json();
    if (!messageId) {
      return NextResponse.json({ error: "messageId required" }, { status: 400 });
    }

    const token = await getAccessToken();

    // Archive = remove INBOX label
    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          removeLabelIds: ["INBOX"],
        }),
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gmail API error ${res.status}: ${err}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Gmail archive error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
