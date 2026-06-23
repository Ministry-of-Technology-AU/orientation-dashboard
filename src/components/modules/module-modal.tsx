"use client";

import Link from "next/link";
import { X, ArrowRight, Clock, BarChart2, Zap, Lock, BookOpen, Trophy, CheckCircle2 } from "lucide-react";
import type { MockModule, GameType, Difficulty } from "@/mock-data/modules";
import { ModuleStatusBadge } from "./module-status-badge";
import { ModuleIcon } from "./module-icon";

const difficultyLabel: Record<Difficulty, string> = {
  easy: "Easy",
  moderate: "Moderate",
  hard: "Hard",
};

const gameTypeLabel: Record<GameType, string> = {
  quiz: "Quiz",
  wordle: "Wordle",
  connections: "Connections",
};

const ctaLabel: Record<string, string> = {
  not_started: "Start Module",
  in_progress: "Continue Reading",
  completed: "Review Module",
};

function formatScore(score: { score: number; maxScore: number } | undefined): string | null {
  if (!score || score.maxScore <= 0) return null;
  const pct = Math.round((score.score / score.maxScore) * 100);
  return `${score.score}/${score.maxScore} (${pct}%)`;
}

export function ModuleModalContent({
  module,
  onClose,
}: {
  module: MockModule;
  onClose: () => void;
}) {
  const gamesLocked = !module.isRead;

  return (
    <div className="flex flex-col h-full w-full">
      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-5 flex items-start gap-4">
          <div className="shrink-0 mt-0.5">
            <ModuleIcon name={module.iconName} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap mb-1.5">
              <ModuleStatusBadge status={module.status} />
              {module.isMandatory && (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary-blue/8 text-primary-blue/60">
                  Mandatory
                </span>
              )}
              {module.journeyMilestone && (
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary-red/8 text-primary-red/70">
                  <Trophy className="w-3 h-3" />
                  {module.journeyMilestone}
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-primary-blue leading-snug">{module.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-primary-blue/30 hover:text-primary-blue hover:bg-primary-blue/6 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Read progress (if started) ── */}
        {module.readPercent > 0 && (
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-primary-blue/40 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Reading progress
              </span>
              <span className="text-[11px] font-semibold text-primary-blue/50 tabular-nums">
                {module.readPercent}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-primary-blue/8 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary-blue transition-all duration-500"
                style={{ width: `${module.readPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="h-px bg-primary-blue/8 mx-6" />

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {/* Description */}
          <p className="text-sm text-primary-blue/60 leading-relaxed">{module.description}</p>

          {/* Games */}
          {module.games.length > 0 && (
            <div>
              <p className="text-[11px] font-bold tracking-[0.15em] text-primary-blue/25 uppercase mb-3">
                Activities
              </p>
              <div className="flex flex-col gap-2">
                {module.games.map(game => {
                  const done = !!module.gamesDone?.[game.type];
                  const scoreLabel = formatScore(module.gameScores?.[game.type]);
                  const needsQuizScore = game.type === "quiz" && !done;
                  return (
                  <div
                    key={game.id}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                      gamesLocked
                        ? "border-primary-blue/8 bg-primary-blue/2 opacity-60"
                        : done
                        ? "border-emerald-200 bg-emerald-50/40"
                        : "border-primary-blue/10 bg-primary-blue/3 hover:bg-primary-blue/6"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-primary-blue leading-tight mb-1">
                        {game.title}
                        <span className="ml-2 text-[11px] font-medium text-primary-blue/35">
                          {gameTypeLabel[game.type]}
                        </span>
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-primary-blue/40">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />{game.estimatedMins} min
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart2 className="w-3 h-3" />{difficultyLabel[game.difficulty]}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />{game.pointsValue} pts
                        </span>
                      </div>
                      {scoreLabel && (
                        <p
                          className={`mt-1.5 text-[11px] font-medium ${
                            needsQuizScore ? "text-primary-red/70" : "text-primary-blue/45"
                          }`}
                        >
                          Best score: {scoreLabel}
                          {needsQuizScore ? " - score 80% to complete" : ""}
                        </p>
                      )}
                    </div>
                    {gamesLocked ? (
                      <div className="shrink-0 flex items-center gap-1 text-[11px] text-primary-blue/30">
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </div>
                    ) : (
                      <div className="shrink-0 flex items-center gap-2">
                        {done && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Done
                          </span>
                        )}
                        <Link
                          href={`/modules/${module.slug}/games/${game.id}`}
                          onClick={onClose}
                          className={`text-xs font-semibold rounded-lg px-3.5 py-1.5 transition-colors ${
                            done
                              ? "bg-primary-blue/8 text-primary-blue hover:bg-primary-blue/12"
                              : "bg-emerald-500 hover:bg-emerald-600 text-white"
                          }`}
                        >
                          {done ? "Replay" : "Play"}
                        </Link>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
              {gamesLocked && (
                <p className="text-[11px] text-primary-blue/30 mt-2 text-center">
                  Read the module and tap &ldquo;Mark as read&rdquo; to unlock these activities.
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 border-t border-primary-blue/8 px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="text-sm font-medium text-primary-blue/40 hover:text-primary-blue transition-colors"
          >
            Close
          </button>
          <Link
            href={`/modules/${module.slug}/read`}
            onClick={onClose}
            className="flex items-center gap-2 bg-primary-blue hover:bg-primary-blue/90 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            {ctaLabel[module.status]}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
    </div>
  );
}
