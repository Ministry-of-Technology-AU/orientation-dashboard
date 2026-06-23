import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  isDashboardFeature,
  markChatUsed,
  markExploreUsed,
  markFeatureVisit,
  parseDashboardProgress,
  setGuideCompletion,
} from "@/lib/dashboard-progress";

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

type ProgressRequest =
  | { action: "visitFeature"; feature: unknown }
  | { action: "completeGuide"; guideId: unknown }
  | { action: "uncompleteGuide"; guideId: unknown }
  | { action: "markChatUsed" }
  | { action: "markExploreUsed" };

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as ProgressRequest | null;
  if (!body || typeof body.action !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const userProgress = prisma.user as unknown as UserProgressDelegate;
    const user = await userProgress.findUnique({
      where: { email: session.user.email },
      select: { dashboardProgress: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const current = parseDashboardProgress(user.dashboardProgress);
    let next = current;

    if (body.action === "visitFeature") {
      if (!isDashboardFeature(body.feature)) {
        return NextResponse.json({ error: "Invalid feature" }, { status: 400 });
      }
      next = markFeatureVisit(current, body.feature, now);
    } else if (body.action === "completeGuide" || body.action === "uncompleteGuide") {
      if (typeof body.guideId !== "string" || body.guideId.length === 0) {
        return NextResponse.json({ error: "Invalid guideId" }, { status: 400 });
      }
      next = setGuideCompletion(current, body.guideId, body.action === "completeGuide");
    } else if (body.action === "markChatUsed") {
      next = markChatUsed(current, now);
    } else if (body.action === "markExploreUsed") {
      next = markExploreUsed(current, now);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await userProgress.update({
      where: { email: session.user.email },
      data: { dashboardProgress: next as unknown as Prisma.InputJsonValue },
    });

    return NextResponse.json({ ok: true, dashboardProgress: next });
  } catch (error) {
    console.error("[/api/dashboard/progress] Failed to update progress:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
