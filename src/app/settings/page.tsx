"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/Card";
import { X } from "lucide-react";

export default function SettingsPage() {
  const [blocked, setBlocked] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/settings/blocked-senders").then(r => r.json()).then(d => setBlocked(d.blocked || [])).catch(() => {});
  }, []);

  const unblock = async (sender: string) => {
    const res = await fetch("/api/settings/blocked-senders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unblock", sender }),
    });
    const data = await res.json();
    setBlocked(data.blocked || []);
  };

  const sections = [
    { title: "Integrations", items: [
      { label: "GoHighLevel CRM", status: "Connected", connected: true },
      { label: "Notion", status: "Connected", connected: true },
      { label: "Google Calendar", status: "Connected", connected: true },
      { label: "Gmail", status: "Connected", connected: true },
      { label: "Make.com", status: "Connected", connected: true },
      { label: "OpenClaw", status: "Connected", connected: true },
    ]},
    { title: "Preferences", items: [
      { label: "Theme", status: "Dark", connected: true },
      { label: "Time Zone", status: "America/Chicago (CDT)", connected: true },
      { label: "Notifications", status: "Enabled", connected: true },
      { label: "Morning Briefing", status: "7:00 AM", connected: true },
    ]},
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">Configure integrations and preferences</p>
      </div>

      {sections.map(s => (
        <Card key={s.title}>
          <CardHeader><CardTitle>{s.title}</CardTitle></CardHeader>
          <div className="space-y-2">
            {s.items.map(item => (
              <div key={item.label} className="flex items-center justify-between rounded-lg bg-bg-tertiary px-4 py-3">
                <span className="text-sm">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary">{item.status}</span>
                  <div className={`h-2 w-2 rounded-full ${item.connected ? "bg-accent-green" : "bg-accent-red"}`} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <Card>
        <CardHeader><CardTitle>Blocked Senders</CardTitle></CardHeader>
        <div className="space-y-2">
          {blocked.length === 0 ? (
            <p className="px-4 py-3 text-sm text-text-tertiary">No blocked senders. Block senders from the Inbox to hide their emails.</p>
          ) : (
            blocked.map(sender => (
              <div key={sender} className="flex items-center justify-between rounded-lg bg-bg-tertiary px-4 py-3">
                <span className="text-sm">{sender}</span>
                <button
                  onClick={() => unblock(sender)}
                  className="flex items-center gap-1 rounded-md border border-border-subtle bg-bg-secondary px-2 py-1 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
                >
                  <X className="h-3 w-3" />
                  Unblock
                </button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
