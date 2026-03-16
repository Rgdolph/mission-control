"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, KanbanSquare, Inbox, Calendar, BarChart3,
  FolderKanban, Workflow, Terminal, Brain, FileText, Users, Settings,
  ChevronLeft, ChevronRight, Zap,
} from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inbox", label: "Inbox", icon: Inbox, badge: 3 },
  { href: "/tasks", label: "Action Zone", icon: KanbanSquare },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/kra", label: "KRA Dashboard", icon: BarChart3 },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/code-agent", label: "Code Agent", icon: Terminal },
  { href: "/memories", label: "Memories", icon: Brain },
  { href: "/docs", label: "Docs", icon: FileText },
  { href: "/team", label: "Team", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border-subtle bg-bg-secondary transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-border-subtle px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-blue/10">
          <Zap className="h-4 w-4 text-accent-blue" />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight">Mission Control</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-bg-active text-text-primary"
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-blue/15 text-[10px] font-medium text-accent-blue">
                      {badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex h-10 items-center justify-center border-t border-border-subtle text-text-tertiary hover:text-text-secondary transition-colors"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
