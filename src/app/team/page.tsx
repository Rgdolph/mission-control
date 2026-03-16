import { team } from "@/lib/mock-data";
import { Card } from "@/components/Card";

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team</h1>
        <p className="mt-1 text-sm text-text-secondary">KRS Insurance — Building financial security for every family</p>
      </div>

      {/* Mission */}
      <Card className="border-accent-blue/20 bg-accent-blue/5">
        <div className="text-center">
          <p className="text-lg font-semibold text-accent-blue">Our Mission</p>
          <p className="mt-2 text-sm text-text-secondary max-w-2xl mx-auto leading-relaxed">
            To protect families and businesses through exceptional insurance solutions, powered by technology, driven by integrity, and delivered by a team that cares.
          </p>
        </div>
      </Card>

      {/* Org */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {team.map(m => (
          <div key={m.name} className="rounded-xl border border-border-subtle bg-bg-secondary p-4 hover:border-border-default transition-colors">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${
                m.role === "Branch Manager" ? "bg-accent-blue/20 text-accent-blue" :
                m.role === "Senior Agent" ? "bg-accent-purple/20 text-accent-purple" :
                m.role === "Marketing" ? "bg-accent-green/20 text-accent-green" :
                m.role === "Jr. Agent" ? "bg-accent-amber/20 text-accent-amber" :
                "bg-bg-tertiary text-text-secondary"
              }`}>
                {m.avatar}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{m.name}</p>
                <p className="text-xs text-text-secondary">{m.role}</p>
                <p className="text-[10px] text-text-tertiary truncate">{m.email}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
