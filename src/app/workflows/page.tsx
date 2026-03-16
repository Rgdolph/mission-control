import { workflows } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Zap, AlertTriangle, FileEdit, Play } from "lucide-react";

const statusStyle: Record<string, { icon: React.ComponentType<{className?: string}>, color: string }> = {
  active: { icon: Play, color: "text-accent-green" },
  error: { icon: AlertTriangle, color: "text-accent-red" },
  draft: { icon: FileEdit, color: "text-text-tertiary" },
};

export default function WorkflowsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Workflows</h1>
        <p className="mt-1 text-sm text-text-secondary">Automations connecting your tools — Make, Notion, GHL, OpenClaw</p>
      </div>
      <div className="space-y-3">
        {workflows.map(w => {
          const s = statusStyle[w.status] || statusStyle.draft;
          const Icon = s.icon;
          return (
            <div key={w.id} className="flex items-center gap-4 rounded-xl border border-border-subtle bg-bg-secondary p-4 hover:border-border-default transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-purple/10">
                <Zap className="h-5 w-5 text-accent-purple" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{w.name}</h3>
                  <span className={cn("flex items-center gap-1 text-[10px] uppercase tracking-wider font-medium", s.color)}>
                    <Icon className="h-3 w-3" />{w.status}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-text-secondary">{w.desc}</p>
              </div>
              <div className="hidden sm:flex items-center gap-6 text-xs text-text-tertiary">
                <div><span className="text-text-secondary font-medium">Trigger:</span> {w.triggers}</div>
                <div><span className="text-text-secondary font-medium">Steps:</span> {w.actions}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
