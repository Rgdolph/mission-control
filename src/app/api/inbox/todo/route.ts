import { NextResponse } from "next/server";

const NOTION_TOKEN = process.env.NOTION_TOKEN!;
const NOTION_DB_ID = process.env.NOTION_TASK_DB_ID || "632ee05a-adef-47cf-b0cf-4283114cd67e";

export async function POST(req: Request) {
  try {
    const { from, subject, snippet, type, messageId, fromEmail } = await req.json();

    const title = type === "email"
      ? `Email: ${subject}`
      : `Flight: ${from} — ${snippet?.slice(0, 80) || "New message"}`;

    const res = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_DB_ID },
        properties: {
          "Action Item": {
            title: [{ text: { content: title } }],
          },
          ...(fromEmail ? {
            "Sender Email": { email: fromEmail.replace(/<|>/g, "").match(/[\w.-]+@[\w.-]+/)?.[0] || fromEmail },
          } : {}),
          ...(from ? {
            "Sender Name": {
              rich_text: [{ text: { content: from.slice(0, 200) } }],
            },
          } : {}),
        },
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [
                { text: { content: `From: ${from}${fromEmail ? ` (${fromEmail})` : ""}\n\n` } },
                { text: { content: (snippet || "").slice(0, 1800) } },
              ],
            },
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Notion API error ${res.status}: ${err}`);
    }

    const page = await res.json();
    return NextResponse.json({ success: true, pageId: page.id, url: page.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("To Do creation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
