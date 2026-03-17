"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Mail, MessageSquare, CheckSquare, ChevronDown, Reply, Archive, EyeOff, RefreshCw, AlertCircle } from "lucide-react";
import ReplyPanel from "@/components/ReplyPanel";

type InboxItem = {
  id: string;
  type: "email" | "ghl";
  from: string;
  fromEmail?: string;
  subject: string;
  snippet: string;
  body?: string;
  time: string;
  read: boolean;
  direction?: string;
  phone?: string;
  contactId?: string;
  assignedTo?: string;
  messageType?: string;
  bodyHtml?: boolean;
};

type Tab = "all" | "email" | "ghl";
type Scope = "mine" | "all";

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return d.toLocaleDateString("en-US", { weekday: "short" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function InboxPage() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gmailAuthUrl, setGmailAuthUrl] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("all");
  const [scope, setScope] = useState<Scope>("all");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [blockedSenders, setBlockedSenders] = useState<string[]>([]);
  const [convoMessages, setConvoMessages] = useState<{id: string; body: string; direction: string; type: string; time: string}[]>([]);
  const [convoLoading, setConvoLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/settings/blocked-senders").then(r => r.json()).then(d => setBlockedSenders(d.blocked || [])).catch(() => {});
  }, []);

  // Auto-scroll messages to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [convoMessages, convoLoading]);

  // Fetch GHL conversation messages when a GHL item is selected
  useEffect(() => {
    const sel = items.find(i => i.id === selected);
    if (sel?.type === "ghl" && selected) {
      setConvoLoading(true);
      setConvoMessages([]);
      fetch(`/api/inbox/ghl/messages?conversationId=${selected}`)
        .then(r => r.json())
        .then(d => setConvoMessages(d.messages || []))
        .catch(() => {})
        .finally(() => setConvoLoading(false));
    } else {
      setConvoMessages([]);
    }
  }, [selected, items]);

  const blockSender = async (sender: string) => {
    const res = await fetch("/api/settings/blocked-senders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "block", sender }),
    });
    const data = await res.json();
    setBlockedSenders(data.blocked || []);
    setSelected(null);
  };

  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [todoCreatedIds, setTodoCreatedIds] = useState<Set<string>>(new Set());

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const archiveItem = (item: InboxItem) => {
    setArchivedIds(prev => new Set(prev).add(item.id));
    if (selected === item.id) setSelected(null);
    showToast(`Archived: ${item.from}`);
  };

  const createTodo = async (item: InboxItem) => {
    if (todoCreatedIds.has(item.id)) {
      showToast("Already added to Notion");
      return;
    }
    try {
      const res = await fetch("/api/inbox/todo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: item.from,
          fromEmail: item.fromEmail,
          subject: item.subject,
          snippet: item.snippet,
          type: item.type,
          messageId: item.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTodoCreatedIds(prev => new Set(prev).add(item.id));
        showToast("✅ Added to Notion");
      } else {
        showToast("❌ Failed: " + (data.error || "Unknown error"));
      }
    } catch {
      showToast("❌ Failed to create task");
    }
  };

  const fetchInbox = useCallback(async () => {
    setLoading(true);
    setError(null);
    const allItems: InboxItem[] = [];

    // Fetch GHL with scope filter
    try {
      const ghlRes = await fetch(`/api/inbox/ghl?assigned=${scope}`);
      const ghlData = await ghlRes.json();
      if (ghlData.messages) allItems.push(...ghlData.messages);
    } catch {
      console.error("Failed to fetch GHL messages");
    }

    // Fetch Gmail
    try {
      const gmailRes = await fetch("/api/inbox/gmail");
      const gmailData = await gmailRes.json();
      if (gmailData.authUrl) {
        setGmailAuthUrl(gmailData.authUrl);
      } else if (gmailData.messages) {
        allItems.push(...gmailData.messages);
      }
    } catch {
      console.error("Failed to fetch Gmail messages");
    }

    // Sort by time descending
    allItems.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    setItems(allItems);
    setLoading(false);
  }, [scope]);

  useEffect(() => { fetchInbox(); }, [fetchInbox]);

  const notBlocked = items.filter(i => {
    if (archivedIds.has(i.id)) return false;
    const sender = (i.fromEmail || i.from || "").toLowerCase();
    return !blockedSenders.includes(sender);
  });
  // "All" tab: show all emails + only MY Flight messages
  // "Email" tab: all emails
  // "Flight" tab: respects Mine/All scope toggle
  const RYAN_GHL_ID = "L2myudaZkCjtUV4VXZzj";
  const isMyGhl = (i: InboxItem) => !i.assignedTo || i.assignedTo === RYAN_GHL_ID;

  const filtered = tab === "all"
    ? notBlocked.filter(i => i.type === "email" || (i.type === "ghl" && isMyGhl(i)))
    : tab === "email"
    ? notBlocked.filter(i => i.type === "email")
    : scope === "mine"
    ? notBlocked.filter(i => i.type === "ghl" && isMyGhl(i))
    : notBlocked.filter(i => i.type === "ghl");
  const sel = items.find(i => i.id === selected);
  const unreadEmail = notBlocked.filter(i => i.type === "email" && !i.read).length;
  const unreadGhl = notBlocked.filter(i => i.type === "ghl" && !i.read).length;

  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  const selectItem = (id: string) => {
    setSelected(id);
    setMobileShowDetail(true);
  };

  const backToList = () => {
    setMobileShowDetail(false);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">Inbox</h1>
          <p className="mt-1 text-sm text-text-secondary hidden sm:block">Unified inbox — emails and Flight messages</p>
        </div>
        <button
          onClick={fetchInbox}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-hover transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {gmailAuthUrl && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
          <div className="text-sm">
            <span className="text-amber-200 font-medium">Gmail not connected.</span>{" "}
            <span className="text-text-secondary">Need to re-authorize with gmail.readonly scope. </span>
            <a href={gmailAuthUrl} target="_blank" rel="noopener" className="text-accent-blue hover:underline">
              Authorize Gmail →
            </a>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      )}

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Source tabs */}
        <div className="flex gap-1 rounded-lg bg-bg-tertiary p-1">
          {([
            { key: "all" as Tab, label: "All", count: notBlocked.filter(i => !i.read).length },
            { key: "email" as Tab, label: "Email", count: unreadEmail },
            { key: "ghl" as Tab, label: "Flight", count: unreadGhl },
          ]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                tab === t.key
                  ? "bg-bg-secondary text-text-primary shadow-sm"
                  : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              {t.label}
              {t.count > 0 && (
                <span className="ml-1 inline-flex items-center justify-center rounded-full bg-accent-blue/20 text-accent-blue px-1 min-w-[16px] text-[10px] font-semibold">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Scope toggle - only show for Flight tab */}
        {tab === "ghl" && (
          <div className="flex gap-1 rounded-lg bg-bg-tertiary p-1">
            {([
              { key: "mine" as Scope, label: "Mine" },
              { key: "all" as Scope, label: "All" },
            ]).map(s => (
              <button
                key={s.key}
                onClick={() => setScope(s.key)}
                className={cn(
                  "px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                  scope === s.key
                    ? "bg-bg-secondary text-text-primary shadow-sm"
                    : "text-text-tertiary hover:text-text-secondary"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* List - hidden on mobile when viewing detail */}
        <div className={cn(
          "lg:col-span-2 rounded-xl border border-border-subtle bg-bg-secondary overflow-hidden",
          mobileShowDetail && "hidden lg:block"
        )}>
          <div className="border-b border-border-subtle px-4 py-3 flex items-center gap-2">
            <span className="text-sm font-medium">
              {tab === "all" ? "All Messages" : tab === "email" ? "Emails" : "Flight / GHL"}
            </span>
            <span className="ml-auto text-xs text-text-tertiary">{filtered.length}</span>
          </div>
          <div className="divide-y divide-border-subtle max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-sm text-text-tertiary">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Loading messages…
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-sm text-text-tertiary">
                No messages
              </div>
            ) : (
              filtered.map(item => (
                <div
                  key={item.id}
                  onClick={() => selectItem(item.id)}
                  className={cn(
                    "group w-full text-left px-4 py-3 transition-colors hover:bg-bg-hover cursor-pointer relative",
                    selected === item.id && "bg-bg-active",
                    !item.read && "border-l-2 border-l-accent-blue"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {item.type === "email" ? (
                      <Mail className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
                    ) : (
                      <MessageSquare className="h-3.5 w-3.5 text-accent-purple shrink-0" />
                    )}
                    <span className={cn("text-sm truncate", !item.read && "font-semibold")}>{item.from}</span>
                    {!item.read && <span className="h-1.5 w-1.5 rounded-full bg-accent-blue shrink-0" />}
                    <span className="ml-auto text-[10px] text-text-tertiary shrink-0 group-hover:hidden">{formatTime(item.time)}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); archiveItem(item); }}
                      className="ml-auto hidden group-hover:flex items-center gap-1 rounded-md border border-border-subtle bg-bg-tertiary px-1.5 py-0.5 text-[10px] text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors shrink-0"
                      title="Archive"
                    >
                      <Archive className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary truncate">{item.subject}</p>
                  <p className="mt-0.5 text-[11px] text-text-tertiary truncate">{item.snippet}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detail */}
        <div className={cn(
          "lg:col-span-3 rounded-xl border border-border-subtle bg-bg-secondary",
          !mobileShowDetail && "hidden lg:block"
        )}>
          {sel ? (
            <div>
              <div className="border-b border-border-subtle px-4 md:px-5 py-4">
                {/* Mobile back button */}
                <button
                  onClick={backToList}
                  className="flex items-center gap-1 text-xs text-accent-blue mb-2 lg:hidden min-h-[44px]"
                >
                  ← Back to inbox
                </button>
                <div className="flex items-center gap-2">
                  {sel.type === "email" ? (
                    <Mail className="h-4 w-4 text-text-tertiary" />
                  ) : (
                    <MessageSquare className="h-4 w-4 text-accent-purple" />
                  )}
                  <span className="text-xs uppercase tracking-wider text-text-tertiary">
                    {sel.type === "email" ? "Email" : "Flight / GHL"}
                  </span>
                  {sel.direction && (
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                      sel.direction === "inbound"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-blue-500/20 text-blue-400"
                    )}>
                      {sel.direction === "inbound" ? "Inbound" : "Outbound"}
                    </span>
                  )}
                </div>
                <h2 className="mt-2 text-lg font-semibold">{sel.subject}</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  From: {sel.from}
                  {sel.fromEmail && sel.fromEmail !== sel.from && ` (${sel.fromEmail})`}
                  {sel.phone && ` · ${sel.phone}`}
                  {" · "}{formatTime(sel.time)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 border-b border-border-subtle px-5 py-2.5">
                <ActionBtn icon={CheckSquare} label={todoCreatedIds.has(sel.id) ? "✓ Added" : "To Do"} onClick={() => createTodo(sel)} active={todoCreatedIds.has(sel.id)} />
                <AssignDropdown onAssign={(person) => showToast(`Assigned to ${person}`)} />
                <ActionBtn icon={Reply} label="Reply" onClick={() => setReplyTo(replyTo === sel.id ? null : sel.id)} active={replyTo === sel.id} />
                <ActionBtn icon={Archive} label="Archive" onClick={() => archiveItem(sel)} />
                {sel.type === "email" && (
                  <ActionBtn icon={EyeOff} label="Block Sender" onClick={() => blockSender(sel.fromEmail || sel.from)} />
                )}
              </div>
              {replyTo === sel.id && (
                <ReplyPanel
                  messageId={sel.id}
                  messageContent={sel.snippet}
                  subject={sel.subject}
                  from={sel.from}
                  onClose={() => setReplyTo(null)}
                />
              )}
              <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
                {sel.type === "ghl" && convoMessages.length > 0 ? (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {convoMessages.slice().reverse().map((m, i) => (
                      <div key={m.id || i} className={cn("flex", m.direction === "outbound" ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed",
                          m.direction === "outbound"
                            ? "bg-accent-blue/20 text-text-primary rounded-br-md"
                            : "bg-bg-tertiary text-text-primary border border-border-subtle rounded-bl-md"
                        )}>
                          <p className="whitespace-pre-wrap">{m.body}</p>
                          <p className="mt-1 text-[10px] text-text-tertiary">
                            {m.direction === "inbound" ? "↙ Inbound" : "↗ Outbound"}
                            {m.time && ` · ${formatTime(m.time)}`}
                          </p>
                        </div>
                      </div>
                    ))}
                    {convoLoading && <p className="text-xs text-text-tertiary animate-pulse">Loading messages…</p>}
                    <div ref={messagesEndRef} />
                  </div>
                ) : convoLoading ? (
                  <p className="text-xs text-text-tertiary animate-pulse">Loading messages…</p>
                ) : (
                  sel.bodyHtml ? (
                    <div
                      className="text-sm text-text-secondary leading-relaxed email-body"
                      dangerouslySetInnerHTML={{ __html: sel.body || sel.snippet || "" }}
                    />
                  ) : (
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{sel.body || sel.snippet}</p>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-text-tertiary">
              Select a message to view
            </div>
          )}
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-border-subtle bg-bg-secondary px-4 py-2.5 text-sm text-text-primary shadow-xl animate-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  );
}

function AssignDropdown({ onAssign }: { onAssign?: (person: string) => void }) {
  const [open, setOpen] = useState(false);
  const people = ["Terry", "Julie", "Brandon"];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors",
          open
            ? "border-accent-blue/50 bg-accent-blue/10 text-accent-blue"
            : "border-border-subtle bg-bg-tertiary text-text-secondary hover:bg-bg-hover hover:text-text-primary"
        )}
      >
        <ChevronDown className="h-3.5 w-3.5" />
        Assign
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-36 rounded-lg border border-border-subtle bg-bg-secondary shadow-xl z-50 py-1">
          {people.map(p => (
            <button
              key={p}
              onClick={() => { setOpen(false); onAssign?.(p); }}
              className="w-full text-left px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionBtn({ icon: Icon, label, onClick, active }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick?: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors",
        active
          ? "border-accent-blue/50 bg-accent-blue/10 text-accent-blue"
          : "border-border-subtle bg-bg-tertiary text-text-secondary hover:bg-bg-hover hover:text-text-primary"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
