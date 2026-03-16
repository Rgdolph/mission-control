"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Plus, RefreshCw, X, Square, Terminal, Clock } from "lucide-react";

type Task = {
  id: string;
  prompt: string;
  status: "running" | "completed" | "failed" | "killed";
  startTime: string;
  pid: number | null;
  logTail: string;
};

function elapsed(start: string): string {
  const ms = Date.now() - new Date(start).getTime();
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

const statusStyles: Record<Task["status"], string> = {
  running: "bg-accent-blue/20 text-accent-blue animate-pulse",
  completed: "bg-accent-green/20 text-accent-green",
  failed: "bg-accent-red/20 text-accent-red",
  killed: "bg-bg-tertiary text-text-tertiary",
};

export default function CodeAgentPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [workdir, setWorkdir] = useState("C:/Users/rgdol/.openclaw/workspace/mission-control");
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fullLog, setFullLog] = useState<string>("");
  const [logLoading, setLogLoading] = useState(false);
  const logRef = useRef<HTMLPreElement>(null);
  const [, setTick] = useState(0);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/code-agent/tasks");
      const data = await res.json();
      if (data.tasks) setTasks(data.tasks);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh every 3s
  useEffect(() => {
    fetchTasks();
    const iv = setInterval(fetchTasks, 3000);
    return () => clearInterval(iv);
  }, [fetchTasks]);

  // Tick every second for elapsed timers
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  // Fetch full log when expanded
  useEffect(() => {
    if (!expandedId) return;
    let cancelled = false;
    const fetchLog = async () => {
      setLogLoading(true);
      try {
        const res = await fetch(`/api/code-agent/tasks/${expandedId}/log`);
        const data = await res.json();
        if (!cancelled) setFullLog(data.log || "");
      } catch {
        // silent
      } finally {
        if (!cancelled) setLogLoading(false);
      }
    };
    fetchLog();
    const iv = setInterval(fetchLog, 3000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [expandedId]);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [fullLog]);

  const submitTask = async () => {
    if (!prompt.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/code-agent/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), workdir: workdir.trim() || undefined }),
      });
      setPrompt("");
      setShowModal(false);
      fetchTasks();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  const killTask = async (id: string) => {
    try {
      await fetch(`/api/code-agent/tasks/${id}`, { method: "DELETE" });
      fetchTasks();
    } catch {
      // silent
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Code Agent</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Spawn and monitor Claude Code tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTasks}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-hover transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-accent-blue px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-blue/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            New Task
          </button>
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {loading && tasks.length === 0 ? (
          <div className="flex items-center justify-center rounded-xl border border-border-subtle bg-bg-secondary py-16 text-sm text-text-tertiary">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Loading tasks…
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border-subtle bg-bg-secondary py-16 text-text-tertiary">
            <Terminal className="h-8 w-8 mb-3 opacity-40" />
            <p className="text-sm">No tasks yet</p>
            <p className="text-xs mt-1">Click &quot;New Task&quot; to spawn a Claude Code agent</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-xl border border-border-subtle bg-bg-secondary overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
                className="w-full text-left px-5 py-4 hover:bg-bg-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Terminal className="h-4 w-4 text-text-tertiary shrink-0" />
                  <span className="text-sm font-medium truncate flex-1">
                    {task.prompt.length > 120
                      ? task.prompt.slice(0, 120) + "…"
                      : task.prompt}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                      statusStyles[task.status]
                    )}
                  >
                    {task.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-[11px] text-text-tertiary">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(task.startTime).toLocaleString()}
                  </span>
                  {task.status === "running" && (
                    <span className="text-accent-blue font-medium">
                      ⏱ {elapsed(task.startTime)}
                    </span>
                  )}
                  {task.pid && task.status === "running" && (
                    <span>PID {task.pid}</span>
                  )}
                </div>
                {task.logTail && expandedId !== task.id && (
                  <p className="mt-2 text-[11px] text-text-tertiary font-mono truncate">
                    {task.logTail.split("\n").filter(Boolean).slice(-1)[0]}
                  </p>
                )}
              </button>

              {expandedId === task.id && (
                <div className="border-t border-border-subtle">
                  {task.status === "running" && (
                    <div className="flex justify-end px-5 py-2 border-b border-border-subtle">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          killTask(task.id);
                        }}
                        className="flex items-center gap-1.5 rounded-lg border border-accent-red/50 bg-accent-red/10 px-3 py-1.5 text-xs font-medium text-accent-red hover:bg-accent-red/20 transition-colors"
                      >
                        <Square className="h-3 w-3" />
                        Kill
                      </button>
                    </div>
                  )}
                  <pre
                    ref={logRef}
                    className="max-h-[500px] overflow-y-auto bg-bg-primary px-5 py-4 text-xs text-text-secondary font-mono leading-relaxed whitespace-pre-wrap"
                  >
                    {logLoading && !fullLog
                      ? "Loading log…"
                      : fullLog || "No output yet"}
                  </pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-border-subtle bg-bg-secondary shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
              <h2 className="text-sm font-semibold">New Code Agent Task</h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-text-tertiary hover:bg-bg-hover hover:text-text-secondary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 px-5 py-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                  Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the task for Claude Code…"
                  rows={5}
                  className="w-full rounded-lg border border-border-subtle bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue resize-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                  Working Directory{" "}
                  <span className="text-text-tertiary font-normal">(optional)</span>
                </label>
                <input
                  value={workdir}
                  onChange={(e) => setWorkdir(e.target.value)}
                  className="w-full rounded-lg border border-border-subtle bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border-subtle px-5 py-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-border-subtle bg-bg-tertiary px-4 py-1.5 text-xs text-text-secondary hover:bg-bg-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitTask}
                disabled={!prompt.trim() || submitting}
                className="flex items-center gap-1.5 rounded-lg bg-accent-blue px-4 py-1.5 text-xs font-medium text-white hover:bg-accent-blue/90 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Terminal className="h-3.5 w-3.5" />
                )}
                {submitting ? "Starting…" : "Start Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
