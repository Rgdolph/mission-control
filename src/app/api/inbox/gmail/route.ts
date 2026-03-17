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

interface GmailHeader {
  name: string;
  value: string;
}

interface GmailPart {
  mimeType?: string;
  body?: { data?: string; size?: number };
  parts?: GmailPart[];
}

interface GmailMessage {
  id: string;
  labelIds?: string[];
  snippet: string;
  internalDate: string;
  payload?: {
    headers?: GmailHeader[];
    mimeType?: string;
    body?: { data?: string; size?: number };
    parts?: GmailPart[];
  };
}

function extractBody(payload?: GmailPart): string {
  if (!payload) return "";
  // Try to find text/plain first, then text/html
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return Buffer.from(payload.body.data, "base64url").toString("utf-8");
  }
  if (payload.parts) {
    // Recurse: prefer text/plain
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return Buffer.from(part.body.data, "base64url").toString("utf-8");
      }
    }
    // Fallback: text/html stripped
    for (const part of payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        const html = Buffer.from(part.body.data, "base64url").toString("utf-8");
        return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }
    }
    // Recurse deeper (multipart/mixed, multipart/related, etc.)
    for (const part of payload.parts) {
      const found = extractBody(part);
      if (found) return found;
    }
  }
  // Direct body on payload (simple messages)
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, "base64url").toString("utf-8");
  }
  return "";
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

const AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=http://localhost:3000/api/auth/google/callback&response_type=code&scope=https://www.googleapis.com/auth/gmail.readonly%20https://www.googleapis.com/auth/calendar.readonly%20https://www.googleapis.com/auth/tasks&access_type=offline&prompt=consent`;

export async function GET() {
  // If no refresh token, prompt auth
  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    return NextResponse.json({ authUrl: AUTH_URL, messages: [] });
  }

  try {
    const token = await getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };

    // Fetch from both INBOX and "1) Reference" label (Make moves emails there every 2hrs)
    const REFERENCE_LABEL = "Label_2"; // "1) Reference"
    const [inboxRes, refRes] = await Promise.all([
      fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&labelIds=INBOX`, { headers, cache: "no-store" }),
      fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&labelIds=${REFERENCE_LABEL}`, { headers, cache: "no-store" }),
    ]);
    // Use whichever succeeds; combine both
    const listRes = inboxRes;

    if (!listRes.ok && !refRes.ok) {
      const err = await listRes.json();
      if (err.error?.status === "PERMISSION_DENIED" || listRes.status === 403) {
        return NextResponse.json({
          error: "Gmail scope not authorized.",
          authUrl: AUTH_URL,
          messages: [],
        }, { status: 200 });
      }
      throw new Error(`Gmail API error: ${JSON.stringify(err)}`);
    }

    // Merge message IDs from inbox + reference label, deduplicate
    const inboxList = inboxRes.ok ? await inboxRes.json() : { messages: [] };
    const refList = refRes.ok ? await refRes.json() : { messages: [] };
    const allIds = new Map<string, boolean>();
    for (const m of [...(inboxList.messages || []), ...(refList.messages || [])]) {
      allIds.set(m.id, true);
    }
    const list = { messages: Array.from(allIds.keys()).map(id => ({ id })) };

    if (!list.messages?.length) {
      return NextResponse.json({ messages: [] });
    }

    // Fetch each message detail (batch of IDs) — fetch all, sort by date after
    const results = await Promise.all(
      list.messages.slice(0, 30).map(async (m: { id: string }) => {
        try {
          const msgRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`,
            { headers, cache: "no-store" }
          );
          if (!msgRes.ok) return null;
          const msg: GmailMessage = await msgRes.json();

          const getHeader = (name: string) =>
            msg.payload?.headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || "";

          const fromRaw = getHeader("From");
          const fromMatch = fromRaw.match(/^"?([^"<]+)"?\s*<?/);
          const fromName = fromMatch ? fromMatch[1].trim() : fromRaw;

          const body = extractBody(msg.payload) || decodeHtmlEntities(msg.snippet || "");

          return {
            id: msg.id,
            type: "email" as const,
            from: fromName,
            fromEmail: fromRaw,
            subject: decodeHtmlEntities(getHeader("Subject") || "(no subject)"),
            snippet: decodeHtmlEntities(msg.snippet || ""),
            body: body,
            time: msg.internalDate ? new Date(parseInt(msg.internalDate)).toISOString() : new Date().toISOString(),
            read: !msg.labelIds?.includes("UNREAD"),
          };
        } catch {
          return null;
        }
      })
    );
    const messages = results.filter((m): m is NonNullable<typeof m> => m !== null);

    // Sort by date, newest first
    messages.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return NextResponse.json({ messages: messages.slice(0, 20) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Gmail API error:", message);
    return NextResponse.json({ error: message, messages: [] }, { status: 500 });
  }
}
