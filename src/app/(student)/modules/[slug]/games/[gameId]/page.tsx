"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getGameById } from "@/mock-data/modules";
import { QuizGame } from "@/components/games/quiz-game";
import { WordleGame } from "@/components/games/wordle-game";
import { ConnectionsGame } from "@/components/games/connections-game";
import type { QuizConfig, WordleConfig, ConnectionsConfig } from "@/mock-data/modules";

export default function GamePage({
  params,
}: {
  params: Promise<{ slug: string; gameId: string }>;
}) {
  const { slug, gameId } = use(params);
  const result = getGameById(gameId);
  if (!result) notFound();

  const { game, module } = result;

  return (
    <main className="flex-1 overflow-y-auto px-6 py-6">
      {/* Back */}
      <Link
        href={`/modules/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-blue transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {module.title}
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
            config={game.config as QuizConfig}
            pointsValue={game.pointsValue}
            moduleSlug={slug}
          />
        )}
        {game.type === "wordle" && (
          <WordleGame
            config={game.config as WordleConfig}
            pointsValue={game.pointsValue}
            moduleSlug={slug}
          />
        )}
        {game.type === "connections" && (
          <ConnectionsGame
            config={game.config as ConnectionsConfig}
            pointsValue={game.pointsValue}
            moduleSlug={slug}
          />
        )}
      </div>
    </main>
  );
}
