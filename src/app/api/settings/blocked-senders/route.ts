import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "blocked-senders.json");

async function getBlocked(): Promise<string[]> {
  try {
    const raw = await readFile(FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveBlocked(list: string[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(FILE, JSON.stringify(list, null, 2));
}

export async function GET() {
  return NextResponse.json({ blocked: await getBlocked() });
}

export async function POST(req: NextRequest) {
  const { action, sender } = await req.json();
  const list = await getBlocked();
  const normalized = sender?.toLowerCase()?.trim();

  if (!normalized) {
    return NextResponse.json({ error: "No sender provided" }, { status: 400 });
  }

  if (action === "block") {
    if (!list.includes(normalized)) {
      list.push(normalized);
      await saveBlocked(list);
    }
  } else if (action === "unblock") {
    const filtered = list.filter(s => s !== normalized);
    await saveBlocked(filtered);
    return NextResponse.json({ blocked: filtered });
  }

  return NextResponse.json({ blocked: list });
}
