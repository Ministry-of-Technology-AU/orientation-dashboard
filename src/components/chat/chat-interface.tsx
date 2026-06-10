"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, ThumbsUp, Ticket, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import { Loader } from "@/components/loader";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  error?: boolean;
}

type FeedbackState = "none" | "good" | "raised";

interface TicketModal {
  aiResponse: string;
  messageId: string;
}

interface Props {
  conversationId: number | null;
  onConversationCreated: (id: number, title: string) => void;
  userImage: string | null;
  userName: string | null;
}

export function ChatInterface({ conversationId, onConversationCreated, userImage, userName }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, FeedbackState>>({});
  const [ticketModal, setTicketModal] = useState<TicketModal | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (conversationId === null) {
      setMessages([]);
      setFeedback({});
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
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  async function send() {
    const text = input.trim();
    if (!text || thinking) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: text },
    ]);
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

  function markGood(msgId: string) {
    setFeedback((prev) => ({ ...prev, [msgId]: "good" }));
  }

  function openTicket(msg: Message) {
    setTicketModal({ aiResponse: msg.content, messageId: msg.id });
  }

  function onTicketRaised(msgId: string) {
    setFeedback((prev) => ({ ...prev, [msgId]: "raised" }));
    setTicketModal(null);
  }

  const isEmpty = messages.length === 0 && !thinking && !loading;

  return (
    <>
      <div className="flex flex-col h-full flex-1 overflow-hidden">
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader size={80} />
        </div>
      ) : isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 gap-5 md:gap-6">
          <div className="flex flex-col items-center gap-2.5 md:gap-3">
            <Image
              src="/bijlee_face.png"
              alt="Bijlee"
              width={72}
              height={72}
              className="drop-shadow-sm md:w-22 md:h-22"
            />
            <h2
              className="text-2xl md:text-3xl font-bold text-primary-blue text-center"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Hey! How can I help you?
            </h2>
            <p className="text-sm text-primary-blue/50 text-center">
              Ask me anything about Ashoka University
            </p>
          </div>
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
          <div className="flex-1 overflow-y-auto px-3 py-4 md:px-5 md:py-5 flex flex-col gap-4">
            {messages.map((msg) =>
              msg.role === "user" ? (
                /* User bubble — right, with avatar */
                <div key={msg.id} className="flex justify-end items-end gap-2">
                  <div className="max-w-[82%] md:max-w-[65%] bg-primary-blue text-white text-sm leading-relaxed px-4 py-2.5 rounded-2xl rounded-br-sm whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  <UserAvatar image={userImage} name={userName} />
                </div>
              ) : (
                /* Assistant bubble — left, with Bijlee avatar */
                <div key={msg.id} className="flex flex-col mb-1">
                  <div className="flex justify-start items-end gap-2">
                    <BijleeAvatar />
                    <div
                      className={cn(
                        "max-w-[88%] md:max-w-[75%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed",
                        msg.error
                          ? "bg-red-tint text-primary-red border border-primary-red/20"
                          : "bg-white text-gray-800 shadow-sm border border-primary-blue/8"
                      )}
                    >
                      {msg.error ? (
                        msg.content
                      ) : (
                        <MarkdownContent content={msg.content} />
                      )}
                    </div>
                  </div>
                  {!msg.error && (
                    <FeedbackRow
                      state={feedback[msg.id] ?? "none"}
                      onGood={() => markGood(msg.id)}
                      onRaiseTicket={() => openTicket(msg)}
                    />
                  )}
                </div>
              )
            )}

            {thinking && (
              <div className="flex justify-start items-end gap-2 mb-3">
                <BijleeAvatar />
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

          <div className="px-3 pb-4 pt-2 md:px-5 md:pb-5">
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

      {ticketModal && (
        <TicketModalDialog
          aiResponse={ticketModal.aiResponse}
          messageId={ticketModal.messageId}
          onClose={() => setTicketModal(null)}
          onSuccess={onTicketRaised}
        />
      )}
    </>
  );
}

function FeedbackRow({
  state,
  onGood,
  onRaiseTicket,
}: {
  state: FeedbackState;
  onGood: () => void;
  onRaiseTicket: () => void;
}) {
  if (state === "good") {
    return (
      <div className="ml-10 mt-1.5 flex items-center gap-1.5">
        <ThumbsUp className="w-3 h-3 text-primary-blue/40" />
        <span className="text-[11px] text-primary-blue/40">Glad that helped!</span>
      </div>
    );
  }

  if (state === "raised") {
    return (
      <div className="ml-10 mt-1.5 flex items-center gap-1.5">
        <Ticket className="w-3 h-3 text-primary-blue/40" />
        <span className="text-[11px] text-primary-blue/40">Ticket raised — we&apos;ll get back to you.</span>
      </div>
    );
  }

  return (
    <div className="ml-10 mt-1.5 flex items-center gap-2">
      <span className="text-[11px] text-primary-blue/35">Was this helpful?</span>
      <button
        onClick={onGood}
        className="text-[11px] text-primary-blue/50 hover:text-primary-blue transition-colors flex items-center gap-1"
      >
        <ThumbsUp className="w-3 h-3" />
        Yes
      </button>
      <span className="text-primary-blue/20 text-[10px]">·</span>
      <button
        onClick={onRaiseTicket}
        className="text-[11px] text-primary-red/60 hover:text-primary-red transition-colors flex items-center gap-1"
      >
        <Ticket className="w-3 h-3" />
        Raise a ticket
      </button>
    </div>
  );
}

function TicketModalDialog({
  aiResponse,
  messageId,
  onClose,
  onSuccess,
}: {
  aiResponse: string;
  messageId: string;
  onClose: () => void;
  onSuccess: (msgId: string) => void;
}) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!subject.trim() || !message.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, aiResponse }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      onSuccess(messageId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(10,56,100,0.18)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary-blue/8">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-red-tint flex items-center justify-center">
              <Ticket className="w-3.5 h-3.5 text-primary-red" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary-blue">Raise a Query</p>
              <p className="text-[10px] text-primary-blue/40">We&apos;ll get back to you via email</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-primary-blue/30 hover:text-primary-blue hover:bg-blue-tint transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-primary-blue/50 uppercase tracking-[0.1em]">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What's your question about?"
              className="w-full bg-primary-blue/3 border border-primary-blue/10 rounded-xl px-4 py-2.5 text-sm text-primary-blue placeholder:text-primary-blue/30 outline-none focus:border-primary-blue/25 focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-primary-blue/50 uppercase tracking-[0.1em]">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe what you need help with..."
              rows={4}
              className="w-full bg-primary-blue/3 border border-primary-blue/10 rounded-xl px-4 py-3 text-sm text-primary-blue placeholder:text-primary-blue/30 outline-none focus:border-primary-blue/25 focus:bg-white transition-all resize-none leading-relaxed"
            />
          </div>

          {error && (
            <p className="text-xs text-primary-red bg-red-tint rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-2.5 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-primary-blue/50 hover:text-primary-blue transition-colors rounded-xl hover:bg-blue-tint"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!subject.trim() || !message.trim() || submitting}
            className={cn(
              "px-5 py-2 text-sm font-medium rounded-xl transition-all flex items-center gap-2",
              subject.trim() && message.trim() && !submitting
                ? "bg-primary-red text-white hover:bg-primary-red/85 shadow-sm"
                : "bg-primary-blue/8 text-primary-blue/30 cursor-not-allowed"
            )}
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {submitting ? "Sending…" : "Send Ticket"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BijleeAvatar() {
  return (
    <Image src="/bijlee_face.png" alt="Bijlee" width={32} height={32} className="shrink-0 drop-shadow-sm" />
  );
}

function UserAvatar({ image, name }: { image: string | null; name: string | null }) {
  if (image) {
    return (
      <img
        src={image}
        alt={name ?? "You"}
        referrerPolicy="no-referrer"
        className="w-7 h-7 rounded-full border border-primary-blue/10 shadow-sm shrink-0 object-cover"
      />
    );
  }
  return (
    <div className="w-7 h-7 rounded-full bg-blue-tint border border-primary-blue/10 shadow-sm shrink-0 flex items-center justify-center">
      <User className="w-3.5 h-3.5 text-primary-blue/50" />
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
        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-gray-700">{children}</p>,
        ul: ({ children }) => <ul className="mb-2 last:mb-0 ml-4 space-y-1 list-disc">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 last:mb-0 ml-4 space-y-1 list-decimal">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed text-gray-700">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
        em: ({ children }) => <em className="italic text-gray-600">{children}</em>,
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
          <blockquote className="border-l-2 border-primary-blue/20 pl-3 my-2 text-gray-500 italic">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer"
            className="text-primary-blue underline underline-offset-2 hover:text-primary-blue/70">
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
  value, onChange, onKeyDown, onSend, thinking, textareaRef, className,
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
    <div className={cn("bg-white border border-primary-blue/10 rounded-2xl flex items-end gap-2 px-4 py-3 shadow-sm", className)}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask Bijlee..."
        rows={1}
        className="flex-1 bg-transparent resize-none outline-none text-sm text-primary-blue placeholder:text-primary-blue/35 leading-relaxed max-h-32 overflow-y-auto"
      />
      <button
        onClick={onSend}
        disabled={!value.trim() || thinking}
        className={cn(
          "shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all",
          value.trim() && !thinking
            ? "bg-primary-red text-white shadow-sm hover:bg-primary-red/85"
            : "bg-primary-blue/8 text-primary-blue/30"
        )}
        aria-label="Send message"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}
