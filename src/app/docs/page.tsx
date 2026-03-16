"use client";
import { useState } from "react";
import { docs } from "@/lib/mock-data";
import { Search } from "lucide-react";

const categories = ["All", ...Array.from(new Set(docs.map(d => d.category)))];

export default function DocsPage() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");

  const filtered = docs.filter(d =>
    (cat === "All" || d.category === cat) &&
    (search === "" || d.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Docs</h1>
        <p className="mt-1 text-sm text-text-secondary">Searchable document library</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2 flex-1">
          <Search className="h-4 w-4 text-text-tertiary" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search docs..."
            className="bg-transparent text-sm text-text-primary placeholder-text-tertiary outline-none w-full"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCat(c)} className={`rounded-full px-3 py-1 text-xs transition-colors ${cat === c ? "bg-accent-blue/15 text-accent-blue" : "bg-bg-tertiary text-text-secondary hover:text-text-primary"}`}>{c}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map(d => (
          <div key={d.id} className="rounded-xl border border-border-subtle bg-bg-secondary p-4 hover:border-border-default transition-colors cursor-pointer group">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{d.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold group-hover:text-accent-blue transition-colors">{d.title}</h3>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-text-tertiary">
                  <span className="rounded-full bg-bg-tertiary px-2 py-0.5">{d.category}</span>
                  <span>Updated {d.updated}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
