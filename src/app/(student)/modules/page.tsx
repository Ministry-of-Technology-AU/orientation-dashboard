import { mockModules } from "@/mock-data/modules";
import { ModulesPageClient } from "@/components/modules/modules-page-client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseModulesStatus, getEntry, deriveStatus } from "@/lib/module-progress";
import type { GameType } from "@/mock-data/modules";

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

  // Merge persisted read/progress state into each module so the cards and
  // modal reflect real unlock state from the DB.
  const modules = mockModules.map((m) => {
    const entry = getEntry(status, m.id);
    const gamesDone = {
      quiz: quizScoreMeetsCompletion(scores, m.id),
      wordle: !!entry.isWordleDone,
      connections: !!entry.isConnectionsDone,
    };
    const derivedEntry = { ...entry, isQuizDone: gamesDone.quiz };

    return {
      ...m,
      isRead: !!entry.isRead,
      readPercent: entry.isRead ? 100 : entry.readPercent ?? 0,
      status: deriveStatus(m, derivedEntry),
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
