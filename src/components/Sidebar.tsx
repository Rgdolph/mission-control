"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ClientLayout";
import {
  LayoutDashboard, KanbanSquare, Inbox, Calendar, BarChart3,
  FolderKanban, Workflow, Terminal, Brain, FileText, Users, Settings,
  ChevronLeft, ChevronRight, Zap, X,
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
  const { open: mobileOpen, setOpen: setMobileOpen } = useSidebar();
  const pathname = usePathname();

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={cn(
          // Desktop: normal flow
          "hidden md:flex h-screen flex-col border-r border-border-subtle bg-bg-secondary transition-all duration-200",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} pathname={pathname} onNavClick={() => {}} />
      </aside>

      {/* Mobile: fixed overlay */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border-subtle bg-bg-secondary transition-transform duration-200 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent collapsed={false} setCollapsed={() => {}} pathname={pathname} onNavClick={closeMobile} showClose onClose={closeMobile} />
      </aside>
    </>
  );
}

function SidebarContent({
  collapsed, setCollapsed, pathname, onNavClick, showClose, onClose,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  pathname: string;
  onNavClick: () => void;
  showClose?: boolean;
  onClose?: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-border-subtle px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-blue/10">
          <Zap className="h-4 w-4 text-accent-blue" />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight flex-1">Mission Control</span>
        )}
        {showClose && (
          <button onClick={onClose} className="p-1 text-text-tertiary hover:text-text-primary">
            <X className="h-5 w-5" />
          </button>
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
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 md:py-2 text-sm transition-colors min-h-[44px] md:min-h-0",
                active
                  ? "bg-bg-active text-text-primary"
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{label}</span>
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

      {/* Collapse toggle - desktop only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex h-10 items-center justify-center border-t border-border-subtle text-text-tertiary hover:text-text-secondary transition-colors"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </>
  );
}
