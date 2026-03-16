import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const TASKS_FILE = path.join(DATA_DIR, "code-agent-tasks.json");

type TaskRecord = {
  id: string;
  prompt: string;
  status: string;
  startTime: string;
  pid: number | null;
  logFile: string;
};

function readTasks(): TaskRecord[] {
  if (!fs.existsSync(TASKS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(TASKS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tasks = readTasks();
    const task = tasks.find((t) => t.id === params.id);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (!fs.existsSync(task.logFile)) {
      return NextResponse.json({ log: "" });
    }

    const content = fs.readFileSync(task.logFile, "utf-8");

    const url = new URL(request.url);
    const tail = url.searchParams.get("tail");

    if (tail) {
      const n = parseInt(tail, 10);
      if (!isNaN(n) && n > 0) {
        const lines = content.split("\n");
        return NextResponse.json({ log: lines.slice(-n).join("\n") });
      }
    }

    return NextResponse.json({ log: content });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
