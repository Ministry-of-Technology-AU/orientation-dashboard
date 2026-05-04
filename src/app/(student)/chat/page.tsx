"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChatInterface } from "@/components/chat/chat-interface";
import { FaqSection } from "@/components/chat/faq-section";

type Tab = "chat" | "faq";

export default function ChatPage() {
  const [tab, setTab] = useState<Tab>("chat");

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center justify-center gap-1 pt-5 pb-2 shrink-0">
        <button
          onClick={() => setTab("chat")}
          className={cn(
            "px-5 py-1.5 rounded-full text-sm font-medium transition-colors",
            tab === "chat"
              ? "bg-[#f9e8e9] text-gray-800"
              : "text-gray-400 hover:text-gray-600"
          )}
        >
          Ask Chat
        </button>
        <button
          onClick={() => setTab("faq")}
          className={cn(
            "px-5 py-1.5 rounded-full text-sm font-medium transition-colors",
            tab === "faq"
              ? "bg-[#f9e8e9] text-gray-800"
              : "text-gray-400 hover:text-gray-600"
          )}
        >
          FAQ
        </button>
      </div>

      {/* Content */}
      {tab === "chat" ? (
        <ChatInterface />
      ) : (
        <div className="flex-1 overflow-y-auto py-4">
          <FaqSection />
        </div>
      )}
    </main>
  );
}
