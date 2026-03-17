import { Card, CardHeader, CardTitle } from "@/components/Card";
import { tasks, inboxItems, calendarEvents, kraAgents, projects } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import {
  CheckCircle2, Clock, AlertCircle, Inbox, Calendar, TrendingUp,
  ArrowUpRight, Zap, Target,
} from "lucide-react";

const stats = [
  { label: "Focus Items", value: "13", icon: Target, color: "text-accent-blue", bg: "bg-accent-blue/10" },
  { label: "Inbox Unread", value: inboxItems.filter(i => !i.read).length.toString(), icon: Inbox, color: "text-accent-purple", bg: "bg-accent-purple/10" },
  { label: "Today's Events", value: calendarEvents.filter(e => e.date === "2026-03-16").length.toString(), icon: Calendar, color: "text-accent-green", bg: "bg-accent-green/10" },
  { label: "Team Premium", value: formatCurrency(kraAgents.reduce((s, a) => s + a.premium, 0)), icon: TrendingUp, color: "text-accent-amber", bg: "bg-accent-amber/10" },
];

const priorityColor: Record<string, string> = {
  high: "text-accent-red",
  medium: "text-accent-amber",
  low: "text-accent-green",
};

export default function Dashboard() {
  const todayTasks = tasks.filter(t => t.due === "2026-03-16");
  const todayEvents = calendarEvents.filter(e => e.date === "2026-03-16");

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Good morning, Ryan</h1>
        <p className="mt-1 text-sm text-text-secondary">Monday, March 16, 2026 — Here&apos;s your command center.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="flex items-center gap-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-text-secondary">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Tasks</CardTitle>
            <span className="text-xs text-text-tertiary">{todayTasks.length} items</span>
          </CardHeader>
          <div className="space-y-2">
            {todayTasks.map(t => (
              <div key={t.id} className="flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2.5">
                <div className={`h-2 w-2 rounded-full ${t.priority === "high" ? "bg-accent-red" : t.priority === "medium" ? "bg-accent-amber" : "bg-accent-green"}`} />
                <span className="flex-1 text-sm">{t.title}</span>
                <span className="text-xs text-text-tertiary">{t.owner}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Schedule</CardTitle>
            <span className="text-xs text-text-tertiary">{todayEvents.length} events</span>
          </CardHeader>
          <div className="space-y-2">
            {todayEvents.map(e => {
              const colors: Record<string, string> = { blue: "border-accent-blue", purple: "border-accent-purple", green: "border-accent-green", amber: "border-accent-amber" };
              return (
                <div key={e.id} className={`flex items-center gap-3 rounded-lg border-l-2 ${colors[e.color] || "border-border-default"} bg-bg-tertiary px-3 py-2.5`}>
                  <span className="text-xs font-mono text-text-tertiary w-16 shrink-0">{e.time}</span>
                  <span className="flex-1 text-sm">{e.title}</span>
                  <span className="text-xs text-text-tertiary">{e.duration}m</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Active Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
            <span className="text-xs text-text-tertiary">{projects.length} projects</span>
          </CardHeader>
          <div className="space-y-3">
            {projects.slice(0, 4).map(p => (
              <div key={p.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{p.name}</span>
                  <span className="text-xs text-text-tertiary">{p.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-bg-tertiary">
                  <div
                    className={`h-full rounded-full ${
                      p.color === "blue" ? "bg-accent-blue" : p.color === "purple" ? "bg-accent-purple" : p.color === "green" ? "bg-accent-green" : p.color === "amber" ? "bg-accent-amber" : p.color === "cyan" ? "bg-accent-cyan" : "bg-accent-red"
                    }`}
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Agents */}
        <Card>
          <CardHeader>
            <CardTitle>Top Agents — KRA</CardTitle>
            <span className="text-xs text-text-tertiary">This month</span>
          </CardHeader>
          <div className="space-y-2">
            {kraAgents.slice(0, 5).map((a, i) => (
              <div key={a.name} className="flex items-center gap-3 rounded-lg bg-bg-tertiary px-3 py-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bg-primary text-[10px] font-bold text-text-tertiary">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm">{a.name}</span>
                <span className="text-xs text-text-secondary font-mono">{a.issued}/{a.submitted}</span>
                <span className="text-xs text-accent-green font-mono">{formatCurrency(a.premium)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
