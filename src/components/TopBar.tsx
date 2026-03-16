"use client";
import { Search, Bell, Zap } from "lucide-react";

export function TopBar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border-subtle bg-bg-secondary px-6">
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-1.5 text-sm text-text-tertiary md:flex">
          <Search className="h-3.5 w-3.5" />
          <span>Search...</span>
          <kbd className="ml-8 rounded border border-border-default bg-bg-primary px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden text-xs text-text-tertiary sm:block">Mon, Mar 16 2026</span>
        <button className="relative text-text-secondary hover:text-text-primary transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent-red text-[8px] font-bold text-white">3</span>
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-blue/20 text-xs font-semibold text-accent-blue">
          RD
        </div>
      </div>
    </header>
  );
}
