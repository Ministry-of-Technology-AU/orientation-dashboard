"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const MOCK_RESPONSES: Record<string, string> = {
  default:
    "Thanks for your question! This is a placeholder response — the AI chat will be powered by Ashoka's internal chatbot once the API is connected. For now, try the FAQ tab for quick answers.",
};

function mockRespond(input: string): Promise<string> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(MOCK_RESPONSES.default), 1000 + Math.random() * 500)
  );
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  async function send() {
    const text = input.trim();
    if (!text || thinking) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    const response = await mockRespond(text);
    setThinking(false);
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "assistant", content: response },
    ]);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const isEmpty = messages.length === 0 && !thinking;

  return (
    <div className="flex flex-col h-full">
      {isEmpty ? (
        /* ── Empty state ── */
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
          <h2 className="text-4xl font-bold text-gray-900">Hey! How can I help you?</h2>
          <ChatInput
            value={input}
            onChange={setInput}
            onKeyDown={onKeyDown}
            onSend={send}
            thinking={thinking}
            textareaRef={textareaRef}
            className="w-full max-w-2xl"
          />
        </div>
      ) : (
        /* ── Active chat ── */
        <>
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-[#0A3864] text-white rounded-br-sm"
                      : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {thinking && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="px-6 pb-6 pt-2">
            <ChatInput
              value={input}
              onChange={setInput}
              onKeyDown={onKeyDown}
              onSend={send}
              thinking={thinking}
              textareaRef={textareaRef}
            />
          </div>
        </>
      )}
    </div>
  );
}

/* ── Shared input component ── */

function ChatInput({
  value,
  onChange,
  onKeyDown,
  onSend,
  thinking,
  textareaRef,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  thinking: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  className?: string;
}) {
  return (
    <div className={cn("relative bg-[#f9e8e9] rounded-2xl flex items-end gap-2 px-4 py-3", className)}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Message here"
        rows={1}
        className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-800 placeholder:text-gray-400 leading-relaxed max-h-32 overflow-y-auto"
      />
      <button
        onClick={onSend}
        disabled={!value.trim() || thinking}
        className="shrink-0 text-gray-400 hover:text-[#A61017] disabled:opacity-30 transition-colors pb-0.5"
        aria-label="Send message"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
}
