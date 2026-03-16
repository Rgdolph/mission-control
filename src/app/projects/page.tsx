import { projects } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

const colorMap: Record<string, { bg: string; text: string; bar: string }> = {
  blue: { bg: "bg-accent-blue/5", text: "text-accent-blue", bar: "bg-accent-blue" },
  purple: { bg: "bg-accent-purple/5", text: "text-accent-purple", bar: "bg-accent-purple" },
  green: { bg: "bg-accent-green/5", text: "text-accent-green", bar: "bg-accent-green" },
  amber: { bg: "bg-accent-amber/5", text: "text-accent-amber", bar: "bg-accent-amber" },
  cyan: { bg: "bg-accent-cyan/5", text: "text-accent-cyan", bar: "bg-accent-cyan" },
  red: { bg: "bg-accent-red/5", text: "text-accent-red", bar: "bg-accent-red" },
};

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <p className="mt-1 text-sm text-text-secondary">Track major initiatives and their progress</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map(p => {
          const c = colorMap[p.color] || colorMap.blue;
          return (
            <div key={p.id} className={cn("rounded-xl border border-border-subtle bg-bg-secondary p-5 hover:border-border-default transition-colors group cursor-pointer", c.bg)}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{p.desc}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-bg-primary">
                  <div className={cn("h-full rounded-full transition-all", c.bar)} style={{ width: `${p.progress}%` }} />
                </div>
                <span className={cn("text-sm font-mono font-semibold", c.text)}>{p.progress}%</span>
              </div>
              <div className="mt-3">
                <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium",
                  p.status === "urgent" ? "bg-accent-red/10 text-accent-red" : p.status === "active" ? "bg-accent-green/10 text-accent-green" : "bg-bg-tertiary text-text-tertiary"
                )}>{p.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
