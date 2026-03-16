import { NextRequest, NextResponse } from "next/server";

const NOTION_TOKEN = "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";
const NOTION_VERSION = "2022-06-28";

interface NotionRichText {
  plain_text: string;
}

interface NotionBlock {
  id: string;
  type: string;
  paragraph?: { rich_text: NotionRichText[] };
  heading_1?: { rich_text: NotionRichText[] };
  heading_2?: { rich_text: NotionRichText[] };
  heading_3?: { rich_text: NotionRichText[] };
  bulleted_list_item?: { rich_text: NotionRichText[] };
  numbered_list_item?: { rich_text: NotionRichText[] };
  to_do?: { rich_text: NotionRichText[]; checked: boolean };
  toggle?: { rich_text: NotionRichText[] };
  quote?: { rich_text: NotionRichText[] };
  callout?: { rich_text: NotionRichText[] };
  divider?: object;
  code?: { rich_text: NotionRichText[]; language?: string };
}

interface ParsedBlock {
  type: string;
  text: string;
  checked?: boolean;
}

function extractText(richText: NotionRichText[] | undefined): string {
  return richText?.map((t) => t.plain_text).join("") || "";
}

function parseBlock(block: NotionBlock): ParsedBlock | null {
  switch (block.type) {
    case "paragraph":
      return { type: "paragraph", text: extractText(block.paragraph?.rich_text) };
    case "heading_1":
      return { type: "heading_1", text: extractText(block.heading_1?.rich_text) };
    case "heading_2":
      return { type: "heading_2", text: extractText(block.heading_2?.rich_text) };
    case "heading_3":
      return { type: "heading_3", text: extractText(block.heading_3?.rich_text) };
    case "bulleted_list_item":
      return { type: "bulleted_list_item", text: extractText(block.bulleted_list_item?.rich_text) };
    case "numbered_list_item":
      return { type: "numbered_list_item", text: extractText(block.numbered_list_item?.rich_text) };
    case "to_do":
      return { type: "to_do", text: extractText(block.to_do?.rich_text), checked: block.to_do?.checked ?? false };
    case "toggle":
      return { type: "toggle", text: extractText(block.toggle?.rich_text) };
    case "quote":
      return { type: "quote", text: extractText(block.quote?.rich_text) };
    case "callout":
      return { type: "callout", text: extractText(block.callout?.rich_text) };
    case "divider":
      return { type: "divider", text: "" };
    case "code":
      return { type: "code", text: extractText(block.code?.rich_text) };
    default:
      return null;
  }
}

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
}

function extractTaskMeta(properties: Record<string, NotionProperty>) {
  const p = properties;

  const titleProp = Object.values(p).find((v) => v.type === "title");
  const title = titleProp?.title?.map((t) => t.plain_text).join("") || "Untitled";

  const focus = p["Focus"]?.checkbox ?? false;
  const waiting = p["Waiting"]?.checkbox ?? false;

  const ownerProp = p["Owner"] || p["Assigned To"] || p["Person"];
  const owner = ownerProp?.people?.[0]?.name ?? null;

  const dueProp = p["Due"] || p["Due Date"];
  const dueDate = dueProp?.date?.start ?? null;

  const contextProp = p["Context"] || p["Area"];
  const context = contextProp?.select?.name ?? null;

  return { title, focus, waiting, owner, dueDate, context };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Fetch page properties and block children in parallel
    const [pageRes, blocksRes] = await Promise.all([
      fetch(`https://api.notion.com/v1/pages/${id}`, {
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": NOTION_VERSION,
        },
        cache: "no-store",
      }),
      fetch(`https://api.notion.com/v1/blocks/${id}/children?page_size=100`, {
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": NOTION_VERSION,
        },
        cache: "no-store",
      }),
    ]);

    if (!pageRes.ok) {
      const err = await pageRes.text();
      return NextResponse.json(
        { error: `Notion page fetch error: ${pageRes.status}`, detail: err },
        { status: 502 }
      );
    }

    if (!blocksRes.ok) {
      const err = await blocksRes.text();
      return NextResponse.json(
        { error: `Notion blocks fetch error: ${blocksRes.status}`, detail: err },
        { status: 502 }
      );
    }

    const pageData = await pageRes.json();
    const blocksData = await blocksRes.json();

    const meta = extractTaskMeta(pageData.properties);
    const blocks: ParsedBlock[] = (blocksData.results || [])
      .map((b: NotionBlock) => parseBlock(b))
      .filter((b: ParsedBlock | null): b is ParsedBlock => b !== null);

    return NextResponse.json({ id, ...meta, blocks });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const res = await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          Done: { checkbox: true },
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `Notion API error: ${res.status}`, detail: err },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
