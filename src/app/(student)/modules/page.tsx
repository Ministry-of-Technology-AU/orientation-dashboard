import { ModulesPageClient } from "@/components/modules/modules-page-client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseModulesStatus, getEntry, deriveStatus } from "@/lib/module-progress";
import type { GameType, Difficulty, MockGame, MockModule, ModuleStatus } from "@/mock-data/modules";

type ScoreEntry = { score?: number; points?: number; maxScore?: number };
type ModuleScores = Record<string, Partial<Record<GameType, ScoreEntry>>>;

function parseModuleScores(raw: unknown): ModuleScores {
  if (!raw || typeof raw !== "object") return {};
  return raw as ModuleScores;
}

function quizScoreMeetsCompletion(scores: ModuleScores, moduleId: string): boolean {
  const quiz = scores[moduleId]?.quiz;
  const score = typeof quiz?.score === "number" ? quiz.score : 0;
  const maxScore = typeof quiz?.maxScore === "number" ? quiz.maxScore : 0;
  return maxScore > 0 && score / maxScore >= 0.8;
}

function normalizeScore(entry: ScoreEntry | undefined) {
  if (!entry) return undefined;
  const score = typeof entry.score === "number" ? entry.score : 0;
  const points = typeof entry.points === "number" ? entry.points : 0;
  const maxScore = typeof entry.maxScore === "number" ? entry.maxScore : 0;
  return { score, points, maxScore };
}

export default async function ModulesPage() {
  const session = await auth();
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { modulesStatus: true, moduleScores: true },
      })
    : null;
  const status = parseModulesStatus(user?.modulesStatus);
  const scores = parseModuleScores(user?.moduleScores);

  // Fetch all modules and their games from the database
  const dbModules = await prisma.module.findMany({
    include: {
      games: true,
    },
    orderBy: {
      orderIndex: "asc",
    },
  });

  // Merge persisted read/progress state into each module so the cards and
  // modal reflect real unlock state from the DB.
  const modules = dbModules.map((m) => {
    const entry = getEntry(status, m.id);
    const gamesDone = {
      quiz: quizScoreMeetsCompletion(scores, m.id),
      wordle: !!entry.isWordleDone,
      connections: !!entry.isConnectionsDone,
    };
    const derivedEntry = { ...entry, isQuizDone: gamesDone.quiz };

    // Format module games
    const games = m.games
      .map((g) => ({
        id: g.id,
        title: g.title,
        type: g.type as GameType,
        difficulty: g.difficulty as Difficulty,
        pointsValue: g.pointsValue,
        estimatedMins: g.estimatedMins,
        config: g.config as unknown as MockGame["config"],
      }))
      .sort((a, b) => a.id.localeCompare(b.id)); // keep stable order

    const moduleData = {
      id: m.id,
      slug: m.slug,
      title: m.title,
      description: m.description,
      iconName: m.icon || "book-open",
      isMandatory: m.isMandatory,
      orderIndex: m.orderIndex,
      journeyMilestone: m.journeyMilestone,
      status: "not_started" as ModuleStatus, // derived below
      readPercent: entry.isRead ? 100 : entry.readPercent ?? 0,
      games,
    };

    return {
      ...moduleData,
      isRead: !!entry.isRead,
      readPercent: entry.isRead ? 100 : entry.readPercent ?? 0,
      status: deriveStatus(moduleData as MockModule, derivedEntry),
      gamesDone,
      gameScores: {
        quiz: normalizeScore(scores[m.id]?.quiz),
        wordle: normalizeScore(scores[m.id]?.wordle),
        connections: normalizeScore(scores[m.id]?.connections),
      },
    };
  });

  return <ModulesPageClient modules={modules} />;
}
