"use client";
import { useState } from "react";
import { calendarEvents } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const colorMap: Record<string, string> = {
  blue: "bg-accent-blue/20 text-accent-blue border-accent-blue/30",
  purple: "bg-accent-purple/20 text-accent-purple border-accent-purple/30",
  green: "bg-accent-green/20 text-accent-green border-accent-green/30",
  amber: "bg-accent-amber/20 text-accent-amber border-accent-amber/30",
  red: "bg-accent-red/20 text-accent-red border-accent-red/30",
  cyan: "bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30",
};

export default function CalendarPage() {
  const [view, setView] = useState<"week" | "month">("week");

  // Week of March 16, 2026 (Mon-Sun)
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2026, 2, 16 + i);
    return { date: d, str: d.toISOString().split("T")[0], day: d.getDate(), label: days[d.getDay()] };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="mt-1 text-sm text-text-secondary">March 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-border-subtle bg-bg-tertiary p-2 text-text-secondary hover:text-text-primary"><ChevronLeft className="h-4 w-4" /></button>
          <span className="text-sm font-medium px-3">Week of Mar 16</span>
          <button className="rounded-lg border border-border-subtle bg-bg-tertiary p-2 text-text-secondary hover:text-text-primary"><ChevronRight className="h-4 w-4" /></button>
          <div className="ml-4 flex rounded-lg border border-border-subtle overflow-hidden">
            <button onClick={() => setView("week")} className={cn("px-3 py-1.5 text-xs", view === "week" ? "bg-bg-active text-text-primary" : "text-text-secondary")}>Week</button>
            <button onClick={() => setView("month")} className={cn("px-3 py-1.5 text-xs", view === "month" ? "bg-bg-active text-text-primary" : "text-text-secondary")}>Month</button>
          </div>
        </div>
      </div>

      {/* Week View */}
      <div className="grid grid-cols-7 gap-3">
        {weekDates.map(wd => {
          const events = calendarEvents.filter(e => e.date === wd.str);
          const isToday = wd.str === "2026-03-16";
          return (
            <div key={wd.str} className="rounded-xl border border-border-subtle bg-bg-secondary min-h-[200px]">
              <div className={cn("border-b border-border-subtle px-3 py-2 text-center", isToday && "bg-accent-blue/5")}>
                <div className="text-[10px] uppercase tracking-wider text-text-tertiary">{wd.label}</div>
                <div className={cn("text-lg font-semibold", isToday ? "text-accent-blue" : "text-text-primary")}>{wd.day}</div>
              </div>
              <div className="space-y-1.5 p-2">
                {events.map(e => (
                  <div key={e.id} className={cn("rounded-md border px-2 py-1.5 text-[11px] leading-tight", colorMap[e.color] || "bg-bg-tertiary text-text-secondary")}>
                    <div className="font-medium truncate">{e.title}</div>
                    <div className="opacity-70 mt-0.5">{e.time}</div>
                  </div>
                ))}
                {events.length === 0 && (
                  <div className="py-4 text-center text-[10px] text-text-tertiary">—</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
