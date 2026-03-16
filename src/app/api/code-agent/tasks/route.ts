import { NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const LOGS_DIR = path.join(DATA_DIR, "code-agent-logs");
const TASKS_FILE = path.join(DATA_DIR, "code-agent-tasks.json");

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });
}

type TaskRecord = {
  id: string;
  prompt: string;
  status: "running" | "completed" | "failed" | "killed";
  startTime: string;
  pid: number | null;
  logFile: string;
};

function readTasks(): TaskRecord[] {
  ensureDirs();
  if (!fs.existsSync(TASKS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(TASKS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeTasks(tasks: TaskRecord[]) {
  ensureDirs();
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

function tailLines(filePath: string, n: number): string {
  try {
    if (!fs.existsSync(filePath)) return "";
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    return lines.slice(-n).join("\n");
  } catch {
    return "";
  }
}

export async function GET() {
  try {
    const tasks = readTasks();
    const result = tasks.map((t) => ({
      ...t,
      logTail: tailLines(t.logFile, 50),
    }));
    // Return newest first
    result.sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
    return NextResponse.json({ tasks: result });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, workdir } = body as {
      prompt: string;
      workdir?: string;
    };

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "prompt is required" },
        { status: 400 }
      );
    }

    ensureDirs();

    const id = crypto.randomUUID();
    const logFile = path.join(LOGS_DIR, `${id}.log`);
    const cwd = workdir || process.cwd();

    // Spawn claude process
    const child = spawn("claude", ["--dangerously-skip-permissions", "--print", prompt], {
      cwd,
      shell: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    const logStream = fs.createWriteStream(logFile, { flags: "a" });

    child.stdout?.on("data", (chunk: Buffer) => {
      logStream.write(chunk);
    });

    child.stderr?.on("data", (chunk: Buffer) => {
      logStream.write(chunk);
    });

    const task: TaskRecord = {
      id,
      prompt,
      status: "running",
      startTime: new Date().toISOString(),
      pid: child.pid ?? null,
      logFile,
    };

    const tasks = readTasks();
    tasks.push(task);
    writeTasks(tasks);

    child.on("close", (code) => {
      logStream.end();
      const current = readTasks();
      const idx = current.findIndex((t) => t.id === id);
      if (idx !== -1) {
        // Only update if still running (not killed)
        if (current[idx].status === "running") {
          current[idx].status = code === 0 ? "completed" : "failed";
        }
        current[idx].pid = null;
        writeTasks(current);
      }
    });

    child.on("error", () => {
      logStream.end();
      const current = readTasks();
      const idx = current.findIndex((t) => t.id === id);
      if (idx !== -1) {
        if (current[idx].status === "running") {
          current[idx].status = "failed";
        }
        current[idx].pid = null;
        writeTasks(current);
      }
    });

    // Unref so the process doesn't block Node from exiting
    child.unref();

    return NextResponse.json({ task: { id, status: "running" } }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
