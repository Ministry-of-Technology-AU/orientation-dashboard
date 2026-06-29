import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getGameById } from "@/mock-data/modules";
import { QuizGame } from "@/components/games/quiz-game";
import { WordleGame } from "@/components/games/wordle-game";
import { ConnectionsGame } from "@/components/games/connections-game";
import type { QuizConfig, WordleConfig, ConnectionsConfig } from "@/mock-data/modules";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseModulesStatus, getEntry } from "@/lib/module-progress";

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string; gameId: string }>;
}) {
  const { slug, gameId } = await params;
  const result = getGameById(gameId);
  if (!result) notFound();

  const { game, module } = result;

  // Server-side gate: activities stay locked until the module is marked read.
  const session = await auth();
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { modulesStatus: true },
      })
    : null;
  const entry = getEntry(parseModulesStatus(user?.modulesStatus), module.id);
  if (!entry.isRead) {
    redirect(`/modules/${slug}/read`);
  }

  const quizConfig =
    game.type === "quiz"
      ? {
          questions: (game.config as QuizConfig).questions.map(({ q, options }) => ({
            q,
            options,
          })),
        }
      : null;

  return (
    <main className="flex-1 overflow-y-auto px-6 py-6">
      {/* Back */}
      <Link
        href="/modules"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-blue transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Modules
      </Link>

      {/* Header */}
      <div className="mb-8 text-center">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{module.title}</p>
        <h1 className="text-2xl font-bold text-gray-900">{game.title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {game.estimatedMins} min · {game.difficulty} · {game.pointsValue} pts
        </p>
      </div>

      {/* Game */}
      <div className="max-w-2xl mx-auto">
        {game.type === "quiz" && (
          <QuizGame
            config={quizConfig!}
            pointsValue={game.pointsValue}
            moduleId={module.id}
          />
        )}
        {game.type === "wordle" && (
          <WordleGame
            config={game.config as WordleConfig}
            pointsValue={game.pointsValue}
            moduleId={module.id}
          />
        )}
        {game.type === "connections" && (
          <ConnectionsGame
            config={game.config as ConnectionsConfig}
            pointsValue={game.pointsValue}
            moduleId={module.id}
          />
        )}
      </div>
    </main>
  );
}
