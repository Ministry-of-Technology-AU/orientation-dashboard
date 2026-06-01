import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const GATEWAY = process.env.UNIAI_GATEWAY_URL!;

function gwHeaders(email: string) {
  return {
    "X-Access-Key": process.env.UNIAI_ACCESS_KEY!,
    "X-Secret-Key": process.env.UNIAI_SECRET_KEY!,
    "X-User-Email": email,
    "Content-Type": "application/json",
  };
}

async function gw(path: string, email: string, init?: RequestInit) {
  const res = await fetch(`${GATEWAY}${path}`, {
    ...init,
    headers: { ...gwHeaders(email), ...init?.headers },
  });
  const body = await res.json();
  return { ok: res.ok, status: res.status, body };
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const email = session.user.email;

  const { message, conversationId } = (await req.json()) as {
    message: string;
    conversationId?: number;
  };

  if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

  let convId: number = conversationId ?? 0;

  if (!convId) {
    const conv = await gw("/conversations", email, {
      method: "POST",
      body: JSON.stringify({ title: message.slice(0, 80) }),
    });
    if (!conv.ok)
      return NextResponse.json({ error: "Failed to create conversation" }, { status: 502 });
    convId = (conv.body as { id: number }).id;
  }

  const result = await gw("/query", email, {
    method: "POST",
    body: JSON.stringify({ query: message, conversation_id: convId }),
  });

  if (!result.ok) return NextResponse.json({ error: "Query failed" }, { status: 502 });

  const body = result.body as { response: string };
  return NextResponse.json({
    reply: body.response,
    conversationId: convId,
    title: message.slice(0, 80),
  });
}
