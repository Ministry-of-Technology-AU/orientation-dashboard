import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { QuizGame } from "@/components/games/quiz-game";
import { WordleGame } from "@/components/games/wordle-game";
import { ConnectionsGame } from "@/components/games/connections-game";
import type { QuizConfig, WordleConfig, ConnectionsConfig, GameType, Difficulty, MockGame, ModuleStatus } from "@/mock-data/modules";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseModulesStatus, getEntry } from "@/lib/module-progress";

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string; gameId: string }>;
}) {
  const { slug, gameId } = await params;

  // Fetch game and parent module from DB
  const dbGame = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      module: {
        include: {
          games: true,
        },
      },
    },
  });
  if (!dbGame || dbGame.module.slug !== slug) notFound();

  const formattedModule = {
    id: dbGame.module.id,
    slug: dbGame.module.slug,
    title: dbGame.module.title,
    description: dbGame.module.description,
    iconName: dbGame.module.icon || "book-open",
    isMandatory: dbGame.module.isMandatory,
    orderIndex: dbGame.module.orderIndex,
    journeyMilestone: dbGame.module.journeyMilestone,
    status: "not_started" as ModuleStatus,
    readPercent: 0,
    games: dbGame.module.games
      .map((g) => ({
        id: g.id,
        title: g.title,
        type: g.type as GameType,
        difficulty: g.difficulty as Difficulty,
        pointsValue: g.pointsValue,
        estimatedMins: g.estimatedMins,
        config: g.config as unknown as MockGame["config"],
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  };

  const game = {
    id: dbGame.id,
    title: dbGame.title,
    type: dbGame.type as GameType,
    difficulty: dbGame.difficulty as Difficulty,
    pointsValue: dbGame.pointsValue,
    estimatedMins: dbGame.estimatedMins,
    config: dbGame.config as unknown as MockGame["config"],
  };

  // Server-side gate: activities stay locked until the module is marked read.
  const session = await auth();
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { modulesStatus: true },
      })
    : null;
  const entry = getEntry(parseModulesStatus(user?.modulesStatus), formattedModule.id);
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
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{formattedModule.title}</p>
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
            moduleId={formattedModule.id}
          />
        )}
        {game.type === "wordle" && (
          <WordleGame
            config={game.config as WordleConfig}
            pointsValue={game.pointsValue}
            moduleId={formattedModule.id}
          />
        )}
        {game.type === "connections" && (
          <ConnectionsGame
            config={game.config as ConnectionsConfig}
            pointsValue={game.pointsValue}
            moduleId={formattedModule.id}
          />
        )}
      </div>
    </main>
  );
}
