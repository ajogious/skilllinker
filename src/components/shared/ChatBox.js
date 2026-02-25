"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function ChatBox({ jobId, jobStatus }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const pollingRef = useRef(null);
  const lastCountRef = useRef(0);

  const fetchMessages = useCallback(
    async (silent = false) => {
      try {
        const res = await fetch(`/api/messages?jobId=${jobId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setMessages(data.messages || []);

        // Auto scroll only when new messages arrive
        if (data.messages.length > lastCountRef.current) {
          lastCountRef.current = data.messages.length;
          setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      } catch (err) {
        if (!silent) setError("Failed to load messages");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [jobId],
  );

  // Initial load + polling every 5s
  useEffect(() => {
    fetchMessages();
    pollingRef.current = setInterval(() => fetchMessages(true), 5000);
    return () => clearInterval(pollingRef.current);
  }, [fetchMessages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const content = input.trim();
    setInput("");
    setSending(true);
    setError("");

    // Optimistic UI — add message immediately
    const optimistic = {
      id: `temp-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      sender: {
        id: session.user.id,
        name: session.user.name,
        role: session.user.role,
        avatar: null,
      },
    };
    setMessages((prev) => [...prev, optimistic]);
    lastCountRef.current += 1;
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Replace optimistic with real message
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? data.message : m)),
      );
    } catch (err) {
      setError(err.message || "Failed to send");
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      lastCountRef.current -= 1;
      setInput(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const isClosed = jobStatus === "CANCELLED" || jobStatus === "COMPLETED";
  const myId = session?.user?.id;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-white">Job Chat</h3>
        </div>
        <span className="text-xs text-slate-500">
          {messages.length} messages
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <svg
                className="animate-spin w-5 h-5 text-indigo-400 mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className="text-xs text-slate-500">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-slate-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-sm text-slate-500">No messages yet</p>
              <p className="text-xs text-slate-600 mt-1">
                Start the conversation below
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              const isMe = msg.sender.id === myId;
              const showAvatar =
                idx === 0 || messages[idx - 1]?.sender.id !== msg.sender.id;
              const isClient = msg.sender.role === "CLIENT";

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                      isClient
                        ? "bg-indigo-500/20 text-indigo-400"
                        : "bg-emerald-500/20 text-emerald-400"
                    } ${showAvatar ? "opacity-100" : "opacity-0"}`}
                  >
                    {msg.sender.name?.[0]?.toUpperCase()}
                  </div>

                  <div
                    className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}
                  >
                    {showAvatar && (
                      <span
                        className={`text-xs text-slate-500 px-1 ${isMe ? "text-right" : "text-left"}`}
                      >
                        {isMe ? "You" : msg.sender.name}
                      </span>
                    )}
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? "bg-indigo-500 text-white rounded-br-sm"
                          : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-sm"
                      } ${msg.id?.startsWith("temp-") ? "opacity-70" : ""}`}
                    >
                      {msg.content}
                    </div>
                    <span
                      className={`text-xs text-slate-600 px-1 ${isMe ? "text-right" : "text-left"}`}
                    >
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Input */}
      {isClosed ? (
        <div className="px-4 py-3 border-t border-slate-800 text-center flex-shrink-0">
          <p className="text-xs text-slate-500">
            Chat is closed — this job is {jobStatus.toLowerCase()}
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSend}
          className="px-4 py-3 border-t border-slate-800 flex gap-2 flex-shrink-0"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            maxLength={2000}
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="w-9 h-9 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 flex items-center justify-center transition-all flex-shrink-0"
          >
            {sending ? (
              <svg
                className="animate-spin w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
