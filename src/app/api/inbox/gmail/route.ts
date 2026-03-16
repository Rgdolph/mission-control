import { NextResponse } from "next/server";

async function getAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to refresh Google token");
  return data.access_token;
}

interface GmailHeader {
  name: string;
  value: string;
}

interface GmailMessage {
  id: string;
  labelIds?: string[];
  snippet: string;
  internalDate: string;
  payload?: {
    headers?: GmailHeader[];
  };
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
      fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15&labelIds=INBOX`, { headers }),
      fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15&labelIds=${REFERENCE_LABEL}`, { headers }),
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

    // Fetch each message detail (batch of IDs)
    const messages = await Promise.all(
      list.messages.slice(0, 20).map(async (m: { id: string }) => {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
          { headers }
        );
        const msg: GmailMessage = await msgRes.json();

        const getHeader = (name: string) =>
          msg.payload?.headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || "";

        const fromRaw = getHeader("From");
        const fromMatch = fromRaw.match(/^"?([^"<]+)"?\s*<?/);
        const fromName = fromMatch ? fromMatch[1].trim() : fromRaw;

        return {
          id: msg.id,
          type: "email" as const,
          from: fromName,
          fromEmail: fromRaw,
          subject: getHeader("Subject") || "(no subject)",
          snippet: msg.snippet,
          time: new Date(parseInt(msg.internalDate)).toISOString(),
          read: !msg.labelIds?.includes("UNREAD"),
        };
      })
    );

    return NextResponse.json({ messages });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Gmail API error:", message);
    return NextResponse.json({ error: message, messages: [] }, { status: 500 });
  }
}
