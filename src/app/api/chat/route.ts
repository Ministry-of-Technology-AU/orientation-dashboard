import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const GATEWAY = process.env.UNIAI_GATEWAY_URL!;
const GW_HEADERS = {
  "X-Access-Key": process.env.UNIAI_ACCESS_KEY!,
  "X-Secret-Key": process.env.UNIAI_SECRET_KEY!,
  "Content-Type": "application/json",
};

async function gw(path: string, init?: RequestInit) {
  const res = await fetch(`${GATEWAY}${path}`, {
    ...init,
    headers: { ...GW_HEADERS, ...init?.headers },
  });
  const body = await res.json();
  return { ok: res.ok, status: res.status, body };
}

interface RecentMessage {
  role: "user" | "assistant";
  content: string;
}

function buildQuery(message: string, recentMessages: RecentMessage[]): string {
  if (!recentMessages.length) return message;

  const SNIPPET = 300;
  const contextLines = recentMessages
    .slice(-6) // last 3 exchanges (user + assistant pairs)
    .map((m) => {
      const label = m.role === "user" ? "Student" : "Assistant";
      const snippet =
        m.content.length > SNIPPET ? m.content.slice(0, SNIPPET) + "…" : m.content;
      return `${label}: ${snippet}`;
    })
    .join("\n");

  return `Recent conversation:\n${contextLines}\n\nCurrent question: ${message}`;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    message,
    conversationId,
    recentMessages = [],
  } = (await req.json()) as {
    message: string;
    conversationId?: number;
    recentMessages?: RecentMessage[];
  };

  if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

  let convId: number = conversationId ?? 0;

  if (!convId) {
    const conv = await gw("/conversations", {
      method: "POST",
      body: JSON.stringify({ title: message.slice(0, 80) }),
    });
    if (!conv.ok)
      return NextResponse.json({ error: "Failed to create conversation" }, { status: 502 });
    convId = (conv.body as { id: number }).id;
  }

  const query = buildQuery(message, recentMessages);

  const result = await gw("/query", {
    method: "POST",
    body: JSON.stringify({ query, conversation_id: convId }),
  });

  if (!result.ok) return NextResponse.json({ error: "Query failed" }, { status: 502 });

  const body = result.body as { response: string; citations?: unknown[] };
  return NextResponse.json({
    reply: body.response,
    conversationId: convId,
    title: message.slice(0, 80),
  });
}
