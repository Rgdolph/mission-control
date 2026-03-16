"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X, RotateCcw, Copy, Send, Loader2, Check, ChevronUp, ChevronDown } from "lucide-react";

type ChatMsg = { role: "user" | "assistant"; text: string };

type ReplyPanelProps = {
  messageId: string;
  messageContent: string;
  subject: string;
  from: string;
  onClose: () => void;
};

export default function ReplyPanel({ messageId, messageContent, subject, from, onClose }: ReplyPanelProps) {
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [refining, setRefining] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMsg[]>([]);
  const [copied, setCopied] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const generateDraft = useCallback(async (instructions?: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/inbox/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, messageContent, subject, from, threadSnippet: messageContent, instructions }),
      });
      const data = await res.json();
      if (data.draft) setDraft(data.draft);
    } catch (e) {
      console.error("Failed to generate draft:", e);
    } finally {
      setLoading(false);
    }
  }, [messageId, messageContent, subject, from]);

  useEffect(() => { generateDraft(); }, [generateDraft]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleRefine = async () => {
    const instruction = chatInput.trim();
    if (!instruction || refining) return;

    setChatInput("");
    setChatHistory(prev => [...prev, { role: "user", text: instruction }]);
    setRefining(true);

    try {
      const res = await fetch("/api/inbox/reply/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentDraft: draft, instruction }),
      });
      const data = await res.json();
      if (data.draft) {
        setDraft(data.draft);
        setChatHistory(prev => [...prev, { role: "assistant", text: "Draft updated ✓" }]);
      }
    } catch {
      setChatHistory(prev => [...prev, { role: "assistant", text: "Failed to refine — try again." }]);
    } finally {
      setRefining(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-in slide-in-from-bottom-2 duration-300 border-t border-border-subtle bg-bg-secondary">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-accent-blue animate-pulse" />
          <span className="text-sm font-medium">Reply Draft</span>
          {loading && <span className="text-[10px] text-text-tertiary">Generating…</span>}
        </div>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-bg-hover transition-colors text-text-tertiary hover:text-text-primary">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Draft Editor */}
      <div className="px-5 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-sm text-text-tertiary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Terry is drafting a reply…
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            className="w-full min-h-[160px] max-h-[300px] bg-bg-primary border border-border-subtle rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-tertiary resize-y focus:outline-none focus:ring-1 focus:ring-accent-blue/50 font-mono leading-relaxed"
            placeholder="Draft will appear here…"
          />
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => generateDraft()}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-hover transition-colors disabled:opacity-50"
          >
            <RotateCcw className="h-3 w-3" />
            Regenerate
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-hover transition-colors"
          >
            {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <div className="flex-1" />
          <button
            disabled
            className="flex items-center gap-1.5 rounded-lg bg-accent-blue/20 text-accent-blue px-4 py-1.5 text-xs font-medium opacity-50 cursor-not-allowed"
            title="Send will be wired up soon"
          >
            <Send className="h-3 w-3" />
            Send
          </button>
        </div>
      </div>

      {/* Chat Section */}
      <div className="border-t border-border-subtle">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="w-full flex items-center justify-between px-5 py-2 text-xs text-text-tertiary hover:text-text-secondary transition-colors"
        >
          <span>Refine with Terry</span>
          {chatOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
        </button>

        {chatOpen && (
          <div className="px-5 pb-4">
            {/* Chat History */}
            {chatHistory.length > 0 && (
              <div className="max-h-[140px] overflow-y-auto mb-3 space-y-2">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[80%] rounded-lg px-3 py-1.5 text-xs",
                      msg.role === "user"
                        ? "bg-accent-blue/20 text-accent-blue"
                        : "bg-bg-tertiary text-text-secondary"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}

            {/* Chat Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleRefine()}
                placeholder='e.g. "make it more formal" or "mention the March meeting"'
                disabled={loading || refining}
                className="flex-1 bg-bg-primary border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent-blue/50 disabled:opacity-50"
              />
              <button
                onClick={handleRefine}
                disabled={!chatInput.trim() || loading || refining}
                className="flex items-center gap-1 rounded-lg bg-accent-blue/20 text-accent-blue px-3 py-2 text-xs font-medium hover:bg-accent-blue/30 transition-colors disabled:opacity-50"
              >
                {refining ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
