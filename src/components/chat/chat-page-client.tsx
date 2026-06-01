"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChatInterface } from "@/components/chat/chat-interface";
import { FaqSection } from "@/components/chat/faq-section";
import { Plus, MessageSquare } from "lucide-react";

type Tab = "chat" | "faq";

interface Conversation {
  id: number;
  title: string;
  created_at: string;
}

interface Props {
  userImage: string | null;
  userName: string | null;
}

function groupConversations(convs: Conversation[]) {
  const now = new Date();
  const groups: { label: string; items: Conversation[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "This week", items: [] },
    { label: "Earlier", items: [] },
  ];
  for (const c of convs) {
    const d = new Date(c.created_at);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) groups[0].items.push(c);
    else if (diffDays === 1) groups[1].items.push(c);
    else if (diffDays < 7) groups[2].items.push(c);
    else groups[3].items.push(c);
  }
  return groups.filter((g) => g.items.length > 0);
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatPageClient({ userImage, userName }: Props) {
  const [tab, setTab] = useState<Tab>("chat");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [loadingConvs, setLoadingConvs] = useState(true);

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((data: Conversation[]) => {
        if (!Array.isArray(data)) return;
        setConversations(
          [...data].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        );
      })
      .catch(() => {})
      .finally(() => setLoadingConvs(false));
  }, []);

  function handleNewChat() {
    setActiveConvId(null);
  }

  function handleConversationCreated(id: number, title: string) {
    setConversations((prev) => [
      { id, title, created_at: new Date().toISOString() },
      ...prev,
    ]);
    setActiveConvId(id);
  }

  const groups = groupConversations(conversations);

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center justify-center pt-5 pb-3 shrink-0">
        <div className="flex bg-primary-blue/5 rounded-full p-1 gap-0.5">
          {(["chat", "faq"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-5 py-1.5 rounded-full text-sm font-medium transition-all",
                tab === t
                  ? "bg-white text-primary-blue shadow-sm"
                  : "text-primary-blue/40 hover:text-primary-blue/60"
              )}
            >
              {t === "chat" ? "Ask Chat" : "FAQ"}
            </button>
          ))}
        </div>
      </div>
      <div className="h-px bg-primary-blue/6 shrink-0" />

      {tab === "chat" ? (
        loadingConvs ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary-blue/20 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            {/* Chat area */}
            <ChatInterface
              key={activeConvId ?? "new"}
              conversationId={activeConvId}
              onConversationCreated={handleConversationCreated}
              userImage={userImage}
              userName={userName}
            />

            {/* History sidebar — right */}
            <div className="w-56 border-l border-primary-blue/8 flex flex-col shrink-0 bg-white/40">
              {/* Header */}
              <div className="px-4 pt-4 pb-3 border-b border-primary-blue/8 flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-primary-blue/40">
                  History
                </span>
                <button
                  onClick={handleNewChat}
                  title="New chat"
                  className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center transition-colors",
                    activeConvId === null
                      ? "bg-primary-blue text-white"
                      : "bg-primary-blue/8 text-primary-blue/50 hover:bg-primary-blue/15 hover:text-primary-blue"
                  )}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Conversation list */}
              <div className="flex-1 overflow-y-auto py-2">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 px-4 text-center">
                    <MessageSquare className="w-6 h-6 text-primary-blue/15" />
                    <p className="text-[11px] text-primary-blue/30 leading-snug">
                      No conversations yet
                    </p>
                  </div>
                ) : (
                  groups.map((group) => (
                    <div key={group.label} className="mb-3">
                      <p className="text-[9px] font-bold tracking-[0.12em] uppercase text-primary-blue/25 px-4 mb-1">
                        {group.label}
                      </p>
                      {group.items.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => setActiveConvId(conv.id)}
                          className={cn(
                            "w-full text-left px-4 py-2 transition-all border-l-2",
                            activeConvId === conv.id
                              ? "border-primary-red bg-red-tint/40"
                              : "border-transparent hover:border-primary-blue/10 hover:bg-blue-tint/40"
                          )}
                        >
                          <p
                            className={cn(
                              "text-[11px] font-medium truncate leading-snug",
                              activeConvId === conv.id
                                ? "text-primary-blue"
                                : "text-primary-blue/60"
                            )}
                          >
                            {conv.title}
                          </p>
                          <p className="text-[9px] text-primary-blue/30 mt-0.5">
                            {formatTime(conv.created_at)}
                          </p>
                        </button>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="flex-1 overflow-y-auto py-4">
          <FaqSection />
        </div>
      )}
    </main>
  );
}
