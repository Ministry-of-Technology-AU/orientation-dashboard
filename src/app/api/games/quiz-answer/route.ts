import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseModulesStatus } from "@/lib/module-progress";
import type { QuizConfig } from "@/mock-data/modules";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const moduleId = body?.moduleId;
  const questionIndex = body?.questionIndex;
  const answer = body?.answer;

  if (
    typeof moduleId !== "string" ||
    !Number.isInteger(questionIndex) ||
    questionIndex < 0 ||
    typeof answer !== "string"
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { modulesStatus: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const entry = parseModulesStatus(user.modulesStatus)[moduleId] ?? {};
    if (!entry.isRead) {
      return NextResponse.json({ error: "Module must be read before quiz answers can be validated" }, { status: 403 });
    }

    const game = await prisma.game.findUnique({
      where: { moduleId_type: { moduleId, type: "quiz" } },
      select: { config: true },
    });
    if (!game) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const questions = (game.config as unknown as QuizConfig)?.questions;
    const question = Array.isArray(questions) ? questions[questionIndex] : null;
    if (!question || !Array.isArray(question.options) || !question.options.includes(answer)) {
      return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
    }

    return NextResponse.json({ correct: answer === question.answer });
  } catch (error) {
    console.error("[/api/games/quiz-answer] Failed to validate answer:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
