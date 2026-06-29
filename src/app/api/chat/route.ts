import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { markChatUsed, parseDashboardProgress } from "@/lib/dashboard-progress";

const GATEWAY = process.env.UNIAI_GATEWAY_URL!;

type UserProgressDelegate = {
  findUnique(args: {
    where: { email: string };
    select: { dashboardProgress: true };
  }): Promise<{ dashboardProgress: unknown } | null>;
  update(args: {
    where: { email: string };
    data: { dashboardProgress: Prisma.InputJsonValue };
  }): Promise<unknown>;
};

function gwHeaders(email: string) {
  return {
    "X-Access-Key": process.env.UNIAI_ACCESS_KEY!,
    "X-Secret-Key": process.env.UNIAI_SECRET_KEY!,
    "X-User-Email": email,
    "Content-Type": "application/json",
  };
}

async function gw(path: string, email: string, init?: RequestInit) {
  const url = `${GATEWAY}${path}`;
  const method = init?.method ?? "GET";

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { ...gwHeaders(email), ...init?.headers },
    });
  } catch (err) {
    console.error(`[gateway] ${method} ${path} — network error:`, err);
    throw err;
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    console.error(
      `[gateway] ${method} ${path} — HTTP ${res.status}:`,
      JSON.stringify(body)
    );
  } else {
    console.log(`[gateway] ${method} ${path} — OK ${res.status}`);
  }

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
    if (!conv.ok) {
      return NextResponse.json({ error: "Failed to create conversation" }, { status: 502 });
    }
    convId = (conv.body as { id: number }).id;
  }

  const result = await gw("/query", email, {
    method: "POST",
    body: JSON.stringify({ query: message, conversation_id: convId }),
  });

  if (!result.ok) {
    const detail = (result.body as { detail?: string })?.detail ?? "unknown";
    // Surface quota/rate-limit errors with a friendlier message
    const isQuota = result.status === 429 || detail.includes("RESOURCE_EXHAUSTED") || detail.includes("quota");
    return NextResponse.json(
      { error: isQuota ? "AI service is temporarily unavailable. Please try again later." : "Query failed" },
      { status: 502 }
    );
  }

  const body = result.body as { response: string };

  try {
    const userProgress = prisma.user as unknown as UserProgressDelegate;
    const user = await userProgress.findUnique({
      where: { email },
      select: { dashboardProgress: true },
    });
    if (user) {
      await userProgress.update({
        where: { email },
        data: {
          dashboardProgress: markChatUsed(
            parseDashboardProgress(user.dashboardProgress),
            new Date().toISOString()
          ) as unknown as Prisma.InputJsonValue,
        },
      });
    }
  } catch (error) {
    console.error("[/api/chat] Failed to mark chat usage:", error);
  }

  return NextResponse.json({
    reply: body.response,
    conversationId: convId,
    title: message.slice(0, 80),
  });
}
