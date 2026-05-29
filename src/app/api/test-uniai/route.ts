import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const GATEWAY = process.env.UNIAI_GATEWAY_URL!;
const ACCESS_KEY = process.env.UNIAI_ACCESS_KEY!;
const SECRET_KEY = process.env.UNIAI_SECRET_KEY!;

const HEADERS = {
  "X-Access-Key": ACCESS_KEY,
  "X-Secret-Key": SECRET_KEY,
  "Content-Type": "application/json",
};

async function gw(path: string, init?: RequestInit) {
  const res = await fetch(`${GATEWAY}${path}`, { ...init, headers: { ...HEADERS, ...init?.headers } });
  const body = await res.json();
  return { status: res.status, ok: res.ok, body };
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const log: Array<{ step: string; status: number; body: unknown }> = [];

  // Step 1 — Create a conversation
  const conv = await gw("/conversations", {
    method: "POST",
    body: JSON.stringify({ title: "Full flow test" }),
  });
  log.push({ step: "1. Create conversation", ...conv });
  if (!conv.ok) return NextResponse.json({ error: "Failed to create conversation", log });

  const conversationId: number = (conv.body as { id: number }).id;

  // Step 2 — First question
  // Note: passing conversation_id causes the gateway to auto-persist both the
  // user message and assistant response — no manual saves needed.
  const q1 = "What are the hostel rules at Ashoka?";
  const query1 = await gw("/query", {
    method: "POST",
    body: JSON.stringify({ query: q1, conversation_id: conversationId }),
  });
  log.push({ step: "2. Query 1 (RAG)", ...query1 });

  // Step 3 — Second question (follow-up, same conversation)
  const q2 = "What happens if I break one of those rules?";
  const query2 = await gw("/query", {
    method: "POST",
    body: JSON.stringify({ query: q2, conversation_id: conversationId }),
  });
  log.push({ step: "3. Query 2 (RAG follow-up)", ...query2 });

  // Step 4 — Fetch full conversation history
  const history = await gw(`/conversations/${conversationId}`);
  log.push({ step: "4. Fetch conversation history", ...history });

  return NextResponse.json({
    user: session.user.email,
    conversationId,
    log,
    // Pull out just the message thread for easy reading
    thread: (history.body as { messages?: unknown[] }).messages ?? [],
  });
}
