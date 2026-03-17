"use client";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { RefreshCw, CheckCircle2, Circle, X, Clock, Eye, User, Tag, Calendar } from "lucide-react";

type Task = {
  id: string;
  title: string;
  focus: boolean;
  waiting: boolean;
  toFile: boolean;
  owner: string | null;
  dueDate: string | null;
  context: string | null;
};

type ParsedBlock = {
  type: string;
  text: string;
  checked?: boolean;
};

type TaskDetail = {
  id: string;
  title: string;
  focus: boolean;
  waiting: boolean;
  owner: string | null;
  dueDate: string | null;
  context: string | null;
  blocks: ParsedBlock[];
};

type Tab = "focus" | "waiting" | "ryan" | "julie" | "molly" | "master";

const TABS: { key: Tab; label: string }[] = [
  { key: "focus", label: "Focus" },
  { key: "waiting", label: "Waiting" },
  { key: "ryan", label: "Ryan To-Do List" },
  { key: "julie", label: "Julie To-Do List" },
  { key: "molly", label: "Molly's To-Do List" },
  { key: "master", label: "Master To-Do List" },
];

function dueBadge(dueDate: string | null) {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  const diffDays = Math.floor(
    (due.getTime() - today.getTime()) / 86400000
  );

  let colorClass = "bg-bg-tertiary text-text-tertiary";
  if (diffDays < 0) colorClass = "bg-red-500/20 text-red-400";
  else if (diffDays === 0) colorClass = "bg-amber-500/20 text-amber-400";

  const label = due.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
        colorClass
      )}
    >
      {label}
    </span>
  );
}

function filterTasks(tasks: Task[], tab: Tab): Task[] {
  switch (tab) {
    case "focus":
      return tasks.filter((t) => t.focus);
    case "waiting":
      return tasks.filter((t) => t.waiting);
    case "ryan": {
      const exclude = ["marissa velasco", "julie mcginnis", "brandon dailey", "molly clark"];
      return tasks.filter(
        (t) =>
          !t.waiting &&
          !t.toFile &&
          !exclude.some((name) => t.owner?.toLowerCase().includes(name))
      );
    }
    case "julie":
      return tasks.filter(
        (t) => t.owner !== null && t.owner.toLowerCase().includes("julie")
      );
    case "molly":
      return tasks.filter(
        (t) => t.owner !== null && t.owner.toLowerCase().includes("molly")
      );
    case "master":
      return tasks;
  }
}

function BlockRenderer({ block }: { block: ParsedBlock }) {
  switch (block.type) {
    case "heading_1":
      return <h2 className="text-lg font-bold text-text-primary mt-4 mb-1">{block.text}</h2>;
    case "heading_2":
      return <h3 className="text-base font-semibold text-text-primary mt-3 mb-1">{block.text}</h3>;
    case "heading_3":
      return <h4 className="text-sm font-semibold text-text-primary mt-2 mb-1">{block.text}</h4>;
    case "paragraph":
      if (!block.text) return <div className="h-3" />;
      return <p className="text-sm text-text-secondary leading-relaxed">{block.text}</p>;
    case "bulleted_list_item":
      return (
        <div className="flex gap-2 text-sm text-text-secondary">
          <span className="text-text-tertiary mt-0.5">•</span>
          <span>{block.text}</span>
        </div>
      );
    case "numbered_list_item":
      return (
        <div className="flex gap-2 text-sm text-text-secondary">
          <span className="text-text-tertiary mt-0.5">–</span>
          <span>{block.text}</span>
        </div>
      );
    case "to_do":
      return (
        <div className="flex items-start gap-2 text-sm">
          <span className={cn("mt-0.5", block.checked ? "text-accent-green" : "text-text-tertiary")}>
            {block.checked ? "☑" : "☐"}
          </span>
          <span className={cn(block.checked ? "text-text-tertiary line-through" : "text-text-secondary")}>
            {block.text}
          </span>
        </div>
      );
    case "quote":
      return (
        <div className="border-l-2 border-accent-blue/50 pl-3 text-sm text-text-secondary italic">
          {block.text}
        </div>
      );
    case "callout":
      return (
        <div className="rounded-lg bg-bg-tertiary border border-border-subtle px-3 py-2 text-sm text-text-secondary">
          {block.text}
        </div>
      );
    case "code":
      return (
        <pre className="rounded-lg bg-bg-primary border border-border-subtle px-3 py-2 text-xs text-text-secondary font-mono overflow-x-auto">
          {block.text}
        </pre>
      );
    case "divider":
      return <hr className="border-border-subtle my-2" />;
    case "toggle":
      return (
        <div className="text-sm text-text-secondary">
          <span className="text-text-tertiary mr-1">▸</span>
          {block.text}
        </div>
      );
    default:
      return block.text ? <p className="text-sm text-text-secondary">{block.text}</p> : null;
  }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("focus");
  const [completing, setCompleting] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<TaskDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setTasks(data.tasks || []);
      }
    } catch {
      setError("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Fetch task detail when selected
  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    fetch(`/api/tasks/${selectedId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setDetail(null);
        } else {
          setDetail(data);
        }
      })
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  const markDone = async (id: string) => {
    setCompleting((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        if (selectedId === id) {
          setSelectedId(null);
        }
      }
    } catch {
      // silently fail
    } finally {
      setCompleting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const filtered = filterTasks(tasks, tab);

  const tabCounts: Record<Tab, number> = {
    focus: filterTasks(tasks, "focus").length,
    waiting: filterTasks(tasks, "waiting").length,
    ryan: filterTasks(tasks, "ryan").length,
    julie: filterTasks(tasks, "julie").length,
    molly: filterTasks(tasks, "molly").length,
    master: filterTasks(tasks, "master").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Action Zone</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Tasks from Notion — filtered by owner and status
          </p>
        </div>
        <button
          onClick={fetchTasks}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-hover transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", loading && "animate-spin")}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border-subtle overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "relative px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
              tab === t.key
                ? "text-accent-blue"
                : "text-text-tertiary hover:text-text-secondary"
            )}
          >
            {t.label}
            {tabCounts[t.key] > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-accent-blue/20 text-accent-blue px-1.5 min-w-[18px] text-[10px] font-semibold">
                {tabCounts[t.key]}
              </span>
            )}
            {tab === t.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Split panel: task list + detail */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Task list */}
        <div className={cn(
          "rounded-xl border border-border-subtle bg-bg-secondary overflow-hidden",
          selectedId ? "lg:col-span-2" : "lg:col-span-5"
        )}>
          <div className="border-b border-border-subtle px-4 py-3 flex items-center gap-2">
            <span className="text-sm font-medium">Tasks</span>
            <span className="ml-auto text-xs text-text-tertiary">{filtered.length}</span>
          </div>
          <div className="divide-y divide-border-subtle max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-sm text-text-tertiary">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Loading tasks…
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-sm text-text-tertiary">
                No tasks in this view
              </div>
            ) : (
              filtered.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setSelectedId(selectedId === task.id ? null : task.id)}
                  className={cn(
                    "w-full text-left flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-hover group",
                    selectedId === task.id && "bg-bg-active",
                    completing.has(task.id) && "opacity-50"
                  )}
                >
                  {/* Checkbox */}
                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      markDone(task.id);
                    }}
                    className="text-text-tertiary hover:text-accent-green transition-colors shrink-0"
                  >
                    {completing.has(task.id) ? (
                      <CheckCircle2 className="h-5 w-5 text-accent-green" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </span>

                  {/* Title */}
                  <span className="text-sm flex-1 min-w-0 truncate">
                    {task.title}
                  </span>

                  {/* Status badges inline */}
                  {task.focus && (
                    <span className="shrink-0 rounded-full bg-yellow-500/20 text-yellow-400 px-2 py-0.5 text-[10px] font-medium">
                      Focus
                    </span>
                  )}
                  {task.waiting && (
                    <span className="shrink-0 rounded-full bg-orange-500/20 text-orange-400 px-2 py-0.5 text-[10px] font-medium">
                      Waiting
                    </span>
                  )}

                  {/* Context pill */}
                  {task.context && !selectedId && (
                    <span className="shrink-0 rounded-full bg-bg-tertiary px-2.5 py-0.5 text-[10px] text-text-secondary font-medium">
                      {task.context}
                    </span>
                  )}

                  {/* Due date */}
                  <span className="shrink-0">{dueBadge(task.dueDate)}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selectedId && (
          <div className="lg:col-span-3 rounded-xl border border-border-subtle bg-bg-secondary flex flex-col max-h-[700px]">
            {detailLoading ? (
              <div className="flex items-center justify-center py-16 text-sm text-text-tertiary flex-1">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Loading task…
              </div>
            ) : detail ? (
              <>
                {/* Header */}
                <div className="border-b border-border-subtle px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold text-text-primary leading-snug flex-1">
                      {detail.title}
                    </h2>
                    <button
                      onClick={() => setSelectedId(null)}
                      className="shrink-0 rounded-lg p-1 text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Metadata row */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {detail.focus && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 text-yellow-400 px-2.5 py-0.5 text-xs font-medium">
                        <Eye className="h-3 w-3" />
                        Focus
                      </span>
                    )}
                    {detail.waiting && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/20 text-orange-400 px-2.5 py-0.5 text-xs font-medium">
                        <Clock className="h-3 w-3" />
                        Waiting
                      </span>
                    )}
                    {detail.owner && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-bg-tertiary text-text-secondary px-2.5 py-0.5 text-xs font-medium">
                        <User className="h-3 w-3" />
                        {detail.owner}
                      </span>
                    )}
                    {detail.dueDate && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-bg-tertiary text-text-secondary px-2.5 py-0.5 text-xs font-medium">
                        <Calendar className="h-3 w-3" />
                        {new Date(detail.dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    )}
                    {detail.context && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent-blue/10 text-accent-blue px-2.5 py-0.5 text-xs font-medium">
                        <Tag className="h-3 w-3" />
                        {detail.context}
                      </span>
                    )}
                  </div>
                </div>

                {/* Block content */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1.5">
                  {detail.blocks.length === 0 ? (
                    <p className="text-sm text-text-tertiary italic">No page content</p>
                  ) : (
                    detail.blocks.map((block, i) => (
                      <BlockRenderer key={i} block={block} />
                    ))
                  )}
                </div>

                {/* Mark Done footer */}
                <div className="border-t border-border-subtle px-5 py-3">
                  <button
                    onClick={() => markDone(detail.id)}
                    disabled={completing.has(detail.id)}
                    className="flex items-center gap-2 rounded-lg bg-accent-green/20 text-accent-green px-4 py-2 text-sm font-medium hover:bg-accent-green/30 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {completing.has(detail.id) ? "Marking done…" : "Mark Done"}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-16 text-sm text-text-tertiary flex-1">
                Failed to load task details
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
