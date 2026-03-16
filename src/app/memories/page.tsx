import { memories } from "@/lib/mock-data";
import { Brain } from "lucide-react";

export default function MemoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Memories</h1>
        <p className="mt-1 text-sm text-text-secondary">Daily logs and context — your second brain</p>
      </div>
      <div className="space-y-4">
        {memories.map(m => (
          <div key={m.date} className="rounded-xl border border-border-subtle bg-bg-secondary p-5">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-4 w-4 text-accent-purple" />
              <h3 className="text-sm font-semibold">{new Date(m.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</h3>
            </div>
            <ul className="space-y-2">
              {m.entries.map((e, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent-purple/40 shrink-0" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
