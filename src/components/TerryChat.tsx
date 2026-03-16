"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "terry"; text: string };

export default function TerryChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      // Include the current page path for context
      const page = typeof window !== "undefined" ? window.location.pathname : "/";
      const res = await fetch("/api/terry-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg, page }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "terry", text: data.reply || "Couldn't get a response." }]);
    } catch {
      setMessages(prev => [...prev, { role: "terry", text: "Error connecting. Check your API key." }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-200",
          open
            ? "bg-bg-tertiary border border-border-subtle text-text-secondary hover:text-text-primary"
            : "bg-accent-blue text-white hover:bg-accent-blue/80"
        )}
      >
        {open ? <X className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-5 z-50 flex w-96 flex-col rounded-2xl border border-border-subtle bg-bg-secondary shadow-2xl overflow-hidden"
          style={{ height: "480px" }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3 bg-bg-tertiary">
            <Zap className="h-4 w-4 text-accent-blue" />
            <span className="text-sm font-semibold">Terry</span>
            <span className="text-[10px] text-text-tertiary">⚡ your AI co-pilot</span>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                <Zap className="h-8 w-8 text-accent-blue/40" />
                <div>
                  <p className="text-sm font-medium text-text-secondary">Hey, what&apos;s up?</p>
                  <p className="text-xs text-text-tertiary mt-1">Ask me anything about Mission Control,<br/>your tasks, inbox, or business.</p>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {["What's on my plate today?", "Summarize my inbox", "Help me draft an email"].map(q => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); }}
                      className="rounded-full border border-border-subtle bg-bg-tertiary px-3 py-1 text-[11px] text-text-tertiary hover:text-text-primary hover:border-accent-blue/30 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed",
                  m.role === "user"
                    ? "bg-accent-blue text-white rounded-br-md"
                    : "bg-bg-tertiary text-text-primary border border-border-subtle rounded-bl-md"
                )}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-bg-tertiary border border-border-subtle rounded-2xl rounded-bl-md px-3.5 py-2">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border-subtle px-3 py-2.5">
            <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-tertiary px-3 py-2 focus-within:border-accent-blue transition-colors">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send()}
                placeholder="Ask Terry anything…"
                className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none"
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-blue text-white hover:bg-accent-blue/80 disabled:opacity-30 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
