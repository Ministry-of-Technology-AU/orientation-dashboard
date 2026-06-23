import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseModulesStatus } from "@/lib/module-progress";

/**
 * Marks a module as read for the current user by merging `isRead: true`
 * into the `modulesStatus` JSON column. This is the unlock signal for the
 * module's activities/games.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { modulesStatus: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Optional readPercent from the body (defaults to 100 on explicit mark-as-read).
    let readPercent = 100;
    try {
      const body = await req.json();
      if (typeof body?.readPercent === "number") {
        readPercent = Math.min(100, Math.max(0, Math.round(body.readPercent)));
      }
    } catch {
      // no/invalid body — keep default
    }

    const status = parseModulesStatus(user.modulesStatus);
    status[id] = { ...(status[id] ?? {}), isRead: true, readPercent };

    await prisma.user.update({
      where: { email: session.user.email },
      data: { modulesStatus: status as Prisma.InputJsonValue },
    });

    return NextResponse.json({ ok: true, moduleStatus: status[id] });
  } catch (error) {
    console.error(`[/api/modules/${id}/read] Failed to mark module read:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * Records coarse in-progress state without completing the module:
 *  - `started: true` flips the badge to "in_progress"
 *  - `readPercent` is stored monotonically (never downgraded)
 * Used for periodic/lightweight progress syncs while reading.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { modulesStatus: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const status = parseModulesStatus(user.modulesStatus);
    const prev = status[id] ?? {};
    const next = { ...prev };

    if (body?.started) next.started = true;
    if (typeof body?.readPercent === "number") {
      const incoming = Math.min(100, Math.max(0, Math.round(body.readPercent)));
      next.readPercent = Math.max(prev.readPercent ?? 0, incoming);
    }
    // Active reading time only grows.
    if (typeof body?.readSeconds === "number") {
      next.readSeconds = Math.max(prev.readSeconds ?? 0, Math.max(0, Math.round(body.readSeconds)));
    }
    if (body?.reachedEnd === true) next.reachedEnd = true;
    // Union of sections seen across devices/sessions.
    if (Array.isArray(body?.seenSections)) {
      const merged = new Set<string>([
        ...(prev.seenSections ?? []),
        ...body.seenSections.filter((s: unknown): s is string => typeof s === "string"),
      ]);
      next.seenSections = [...merged];
    }

    status[id] = next;

    await prisma.user.update({
      where: { email: session.user.email },
      data: { modulesStatus: status as Prisma.InputJsonValue },
    });

    return NextResponse.json({ ok: true, moduleStatus: status[id] });
  } catch (error) {
    console.error(`[/api/modules/${id}/read] Failed to update progress:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
