"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  error?: boolean;
}

interface Props {
  conversationId: number | null;
  onConversationCreated: (id: number, title: string) => void;
}

export function ChatInterface({ conversationId, onConversationCreated }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load history when switching to an existing conversation
  useEffect(() => {
    if (conversationId === null) {
      setMessages([]);
      return;
    }

    setLoading(true);
    fetch(`/api/conversations/${conversationId}`)
      .then((r) => r.json())
      .then((data) => {
        const msgs: Message[] = (data.messages ?? [])
          .sort((a: { id: number }, b: { id: number }) => a.id - b.id)
          .map((m: { id: number; role: "user" | "assistant"; content: string }) => ({
            id: String(m.id),
            role: m.role,
            content: m.content,
          }));
        setMessages(msgs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [conversationId]);

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

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");

      if (!conversationId) {
        onConversationCreated(data.conversationId, data.title ?? text.slice(0, 80));
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: err instanceof Error ? err.message : "Something went wrong. Please try again.",
          error: true,
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const isEmpty = messages.length === 0 && !thinking && !loading;

  return (
    <div className="flex flex-col h-full flex-1 overflow-hidden">
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-primary-blue/20 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      ) : isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
          <h2
            className="text-4xl font-bold text-primary-blue"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Hey! How can I help you?
          </h2>
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
        <>
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "max-w-[70%] bg-primary-blue text-white rounded-br-sm whitespace-pre-wrap"
                      : msg.error
                      ? "max-w-[85%] bg-red-tint text-primary-red border border-primary-red/20 rounded-bl-sm"
                      : "max-w-[85%] bg-white text-gray-800 shadow-sm border border-primary-blue/8 rounded-bl-sm"
                  )}
                >
                  {msg.role === "assistant" && !msg.error ? (
                    <MarkdownContent content={msg.content} />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {thinking && (
              <div className="flex justify-start">
                <div className="bg-white border border-primary-blue/8 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-primary-blue/30 animate-bounce"
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

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-base font-bold text-primary-blue mb-2 mt-3 first:mt-0" style={{ fontFamily: "var(--font-display)" }}>
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-sm font-bold text-primary-blue mb-1.5 mt-3 first:mt-0" style={{ fontFamily: "var(--font-display)" }}>
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold text-primary-blue mb-1 mt-2 first:mt-0">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="mb-2 last:mb-0 ml-4 space-y-0.5 list-disc">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-2 last:mb-0 ml-4 space-y-0.5 list-decimal">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed">{children}</li>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-gray-900">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        code: ({ children }) => (
          <code className="bg-blue-tint text-primary-blue rounded px-1 py-0.5 text-[12px] font-mono">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="bg-blue-tint rounded-xl p-3 mb-2 overflow-x-auto text-xs font-mono text-primary-blue">
            {children}
          </pre>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-primary-blue/20 pl-3 my-2 text-gray-600 italic">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-blue underline underline-offset-2 hover:text-primary-blue/70"
          >
            {children}
          </a>
        ),
        hr: () => <hr className="border-primary-blue/10 my-3" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

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
    <div
      className={cn(
        "relative bg-red-tint rounded-2xl flex items-end gap-2 px-4 py-3",
        className
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Message here"
        rows={1}
        className="flex-1 bg-transparent resize-none outline-none text-sm text-primary-blue placeholder:text-primary-blue/40 leading-relaxed max-h-32 overflow-y-auto"
      />
      <button
        onClick={onSend}
        disabled={!value.trim() || thinking}
        className="shrink-0 text-primary-blue/40 hover:text-primary-red disabled:opacity-30 transition-colors pb-0.5"
        aria-label="Send message"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
}
