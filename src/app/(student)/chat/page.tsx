"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChatInterface } from "@/components/chat/chat-interface";
import { FaqSection } from "@/components/chat/faq-section";
import { Plus } from "lucide-react";

type Tab = "chat" | "faq";

interface Conversation {
  id: number;
  title: string;
  created_at: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ChatPage() {
  const [tab, setTab] = useState<Tab>("chat");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((data: Conversation[]) => {
        if (!Array.isArray(data)) return;
        // Most recent first
        const sorted = [...data].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setConversations(sorted);
        // Auto-select the most recent conversation
        if (sorted.length > 0) setActiveConvId(sorted[0].id);
      })
      .catch(() => {});
  }, []);

  function handleNewChat() {
    setActiveConvId(null);
  }

  function handleConversationCreated(id: number, title: string) {
    const newConv: Conversation = {
      id,
      title,
      created_at: new Date().toISOString(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(id);
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center justify-center gap-1 pt-5 pb-2 shrink-0">
        <button
          onClick={() => setTab("chat")}
          className={cn(
            "px-5 py-1.5 rounded-full text-sm font-medium transition-colors",
            tab === "chat"
              ? "bg-red-tint text-primary-blue"
              : "text-primary-blue/40 hover:text-primary-blue/70"
          )}
        >
          Ask Chat
        </button>
        <button
          onClick={() => setTab("faq")}
          className={cn(
            "px-5 py-1.5 rounded-full text-sm font-medium transition-colors",
            tab === "faq"
              ? "bg-red-tint text-primary-blue"
              : "text-primary-blue/40 hover:text-primary-blue/70"
          )}
        >
          FAQ
        </button>
      </div>

      {tab === "chat" ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Conversation sidebar */}
          <div className="w-48 border-r border-primary-blue/8 flex flex-col shrink-0">
            <div className="p-2.5 border-b border-primary-blue/8">
              <button
                onClick={handleNewChat}
                className={cn(
                  "w-full flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                  activeConvId === null
                    ? "bg-blue-tint text-primary-blue"
                    : "text-primary-blue/50 hover:bg-blue-tint/60 hover:text-primary-blue"
                )}
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                New chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 transition-colors",
                    activeConvId === conv.id
                      ? "bg-blue-tint"
                      : "hover:bg-blue-tint/40"
                  )}
                >
                  <p
                    className={cn(
                      "text-xs font-medium truncate leading-snug",
                      activeConvId === conv.id ? "text-primary-blue" : "text-primary-blue/70"
                    )}
                  >
                    {conv.title}
                  </p>
                  <p className="text-[10px] text-primary-blue/35 mt-0.5">
                    {formatDate(conv.created_at)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Chat area — key forces remount on conversation switch */}
          <ChatInterface
            key={activeConvId ?? "new"}
            conversationId={activeConvId}
            onConversationCreated={handleConversationCreated}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto py-4">
          <FaqSection />
        </div>
      )}
    </main>
  );
}
