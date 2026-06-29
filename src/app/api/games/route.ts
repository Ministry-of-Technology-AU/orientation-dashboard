import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseModulesStatus, type ModuleStatusEntry } from "@/lib/module-progress";
import type { ConnectionsConfig, QuizConfig, WordleConfig } from "@/mock-data/modules";

const DONE_KEY = {
  quiz: "isQuizDone",
  wordle: "isWordleDone",
  connections: "isConnectionsDone",
} as const;
type GameType = keyof typeof DONE_KEY;

type ScoreEntry = { score: number; points: number; maxScore: number };
type ModuleScores = Record<string, Partial<Record<GameType, ScoreEntry>>>;
type ScoredAttempt = { score: number; points: number; maxScore: number; completed: boolean };

const allGamesDone = (entry: ModuleStatusEntry, types: GameType[]): boolean =>
  types.length > 0 && types.every((t) => !!entry[DONE_KEY[t]]);

const isGameType = (value: unknown): value is GameType =>
  typeof value === "string" && value in DONE_KEY;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const canonicalGroupKey = (items: string[]): string =>
  items.map((item) => item.trim()).sort().join("\u0000");

function scoreQuiz(config: unknown, body: unknown, pointsValue: number): ScoredAttempt | null {
  const questions = (config as QuizConfig)?.questions;
  const answers = (body as { answers?: unknown })?.answers;
  if (!Array.isArray(questions) || !isStringArray(answers) || answers.length !== questions.length) {
    return null;
  }

  const score = questions.reduce(
    (count, question, index) => count + (answers[index] === question.answer ? 1 : 0),
    0
  );
  const completed = questions.length > 0 && score / questions.length >= 0.8;
  return {
    score,
    maxScore: questions.length,
    points: completed ? pointsValue : 0,
    completed,
  };
}

function scoreWordle(config: unknown, body: unknown, pointsValue: number): ScoredAttempt | null {
  const word = (config as WordleConfig)?.word;
  const maxAttempts = (config as WordleConfig)?.maxAttempts;
  const guesses = (body as { guesses?: unknown })?.guesses;
  if (
    typeof word !== "string" ||
    !Number.isInteger(maxAttempts) ||
    maxAttempts <= 0 ||
    !isStringArray(guesses) ||
    guesses.length === 0 ||
    guesses.length > maxAttempts
  ) {
    return null;
  }

  const answer = word.toUpperCase();
  const normalized = guesses.map((guess) => guess.trim().toUpperCase());
  const validGuesses = normalized.every(
    (guess) => guess.length === answer.length && /^[A-Z]+$/.test(guess)
  );
  if (!validGuesses) return null;

  const won = normalized.includes(answer);
  const terminal = won || normalized.length === maxAttempts;
  if (!terminal) return null;

  return {
    score: won ? 1 : 0,
    maxScore: 1,
    points: won ? pointsValue : 0,
    completed: true,
  };
}

function scoreConnections(config: unknown, body: unknown, pointsValue: number): ScoredAttempt | null {
  const groups = (config as ConnectionsConfig)?.groups;
  const submissions = (body as { submissions?: unknown })?.submissions;
  if (
    !Array.isArray(groups) ||
    groups.length === 0 ||
    !Array.isArray(submissions) ||
    submissions.length === 0
  ) {
    return null;
  }

  const groupByItems = new Map<string, string>();
  for (const group of groups) {
    if (!isStringArray(group.items) || group.items.length !== 4 || typeof group.label !== "string") {
      return null;
    }
    groupByItems.set(canonicalGroupKey(group.items), group.label);
  }

  const solved = new Set<string>();
  let mistakes = 0;
  const maxMistakes = 4;

  for (const submission of submissions) {
    if (!isStringArray(submission) || submission.length !== 4) return null;

    const label = groupByItems.get(canonicalGroupKey(submission));
    if (label && !solved.has(label)) {
      solved.add(label);
    } else {
      mistakes += 1;
    }

    if (solved.size === groups.length || mistakes >= maxMistakes) break;
  }

  const won = solved.size === groups.length;
  const terminal = won || mistakes >= maxMistakes;
  if (!terminal) return null;

  return {
    score: solved.size,
    maxScore: groups.length,
    points: won ? pointsValue : 0,
    completed: true,
  };
}

function scoreAttempt(
  type: GameType,
  config: unknown,
  body: unknown,
  pointsValue: number
): ScoredAttempt | null {
  if (type === "quiz") return scoreQuiz(config, body, pointsValue);
  if (type === "wordle") return scoreWordle(config, body, pointsValue);
  return scoreConnections(config, body, pointsValue);
}

/**
 * Records a finished game attempt. The server re-derives score and points from
 * submitted attempts and authoritative DB config before mutating progress.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const moduleId = body?.moduleId;
  const type = body?.type;
  if (typeof moduleId !== "string" || !isGameType(type)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { modulesStatus: true, moduleScores: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const status = parseModulesStatus(user.modulesStatus);
    const scores =
      user.moduleScores && typeof user.moduleScores === "object"
        ? (user.moduleScores as ModuleScores)
        : ({} as ModuleScores);

    const prevEntry = status[moduleId] ?? {};
    const isRead = !!prevEntry.isRead;
    if (!isRead) {
      return NextResponse.json({ error: "Module must be read before games can be completed" }, { status: 403 });
    }

    // The module's game types (from the DB) determine "all done".
    const games = await prisma.game.findMany({
      where: { moduleId },
      select: { type: true },
    });
    const moduleTypes = games.map((g) => g.type as GameType);
    const game = await prisma.game.findUnique({
      where: { moduleId_type: { moduleId, type } },
      select: { config: true, pointsValue: true },
    });
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const result = scoreAttempt(type, game.config, body, game.pointsValue);
    if (!result) {
      return NextResponse.json({ error: "Invalid or incomplete game attempt" }, { status: 400 });
    }

    const wasComplete = isRead && allGamesDone(prevEntry, moduleTypes);

    // Mark this game done only when the server-side completion rule is met.
    const nextEntry: ModuleStatusEntry = result.completed
      ? { ...prevEntry, [DONE_KEY[type]]: true }
      : { ...prevEntry };
    status[moduleId] = nextEntry;

    // Keep the best score/points.
    const prevScore = scores[moduleId]?.[type];
    scores[moduleId] = {
      ...(scores[moduleId] ?? {}),
      [type]: {
        score: Math.max(prevScore?.score ?? 0, result.score),
        points: Math.max(prevScore?.points ?? 0, result.points),
        maxScore: result.maxScore || prevScore?.maxScore || 0,
      },
    };

    const justCompleted = !wasComplete && isRead && allGamesDone(nextEntry, moduleTypes);

    await prisma.$transaction([
      prisma.user.update({
        where: { email: session.user.email },
        data: {
          modulesStatus: status as Prisma.InputJsonValue,
          moduleScores: scores as Prisma.InputJsonValue,
        },
      }),
      ...(justCompleted
        ? [
            prisma.module.update({
              where: { id: moduleId },
              data: { completionCount: { increment: 1 } },
            }),
          ]
        : []),
    ]);

    return NextResponse.json({
      ok: true,
      moduleStatus: status[moduleId],
      justCompleted,
      gameCompleted: result.completed,
      score: result.score,
      maxScore: result.maxScore,
      points: result.points,
    });
  } catch (error) {
    console.error("[/api/games] Failed to record game completion:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
