import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const TASKS_FILE = path.join(DATA_DIR, "code-agent-tasks.json");

type TaskRecord = {
  id: string;
  prompt: string;
  status: "running" | "completed" | "failed" | "killed";
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

function writeTasks(tasks: TaskRecord[]) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tasks = readTasks();
    const idx = tasks.findIndex((t) => t.id === params.id);

    if (idx === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const task = tasks[idx];

    if (task.pid && task.status === "running") {
      try {
        process.kill(task.pid);
      } catch {
        // Process may already be gone
      }
    }

    tasks[idx].status = "killed";
    tasks[idx].pid = null;
    writeTasks(tasks);

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
