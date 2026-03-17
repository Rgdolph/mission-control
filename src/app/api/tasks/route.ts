import { NextResponse } from "next/server";

const NOTION_TOKEN = process.env.NOTION_TOKEN!;
const DATABASE_ID = "632ee05a-adef-47cf-b0cf-4283114cd67e";
const NOTION_VERSION = "2022-06-28";

interface NotionPerson {
  name?: string;
}

interface NotionProperty {
  type: string;
  checkbox?: boolean;
  title?: { plain_text: string }[];
  date?: { start: string } | null;
  select?: { name: string } | null;
  people?: NotionPerson[];
  url?: string;
}

interface NotionPage {
  id: string;
  url: string;
  properties: Record<string, NotionProperty>;
}

interface NotionResponse {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
}

function extractTask(page: NotionPage) {
  const p = page.properties;

  const titleProp = Object.values(p).find((v) => v.type === "title");
  const title =
    titleProp?.title?.map((t) => t.plain_text).join("") || "Untitled";

  const focus = p["Focus"]?.checkbox ?? false;
  const waiting = p["Waiting"]?.checkbox ?? false;

  const ownerProp = p["Owner"] || p["Assigned To"] || p["Person"];
  const owner = ownerProp?.people?.[0]?.name ?? null;

  const dueProp = p["Due"] || p["Due Date"];
  const dueDate = dueProp?.date?.start ?? null;

  const contextProp = p["Context"] || p["Area"];
  const context = contextProp?.select?.name ?? null;

  return {
    id: page.id,
    title,
    focus,
    waiting,
    owner,
    dueDate,
    context,
    url: page.url,
  };
}

export async function GET() {
  try {
    const allTasks: ReturnType<typeof extractTask>[] = [];
    let cursor: string | undefined = undefined;

    do {
      const body: Record<string, unknown> = {
        filter: {
          and: [
            { property: "Done", checkbox: { equals: false } },
            { property: "Archive", checkbox: { equals: false } },
          ],
        },
        page_size: 100,
      };
      if (cursor) body.start_cursor = cursor;

      const res = await fetch(
        `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${NOTION_TOKEN}`,
            "Notion-Version": NOTION_VERSION,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          cache: "no-store",
        }
      );

      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json(
          { error: `Notion API error: ${res.status}`, detail: err },
          { status: 502 }
        );
      }

      const data: NotionResponse = await res.json();
      allTasks.push(...data.results.map(extractTask));
      cursor = data.has_more ? (data.next_cursor ?? undefined) : undefined;
    } while (cursor);

    return NextResponse.json({ tasks: allTasks });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
