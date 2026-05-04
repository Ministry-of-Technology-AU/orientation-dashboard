import Link from "next/link";
import { Clock, BarChart2, Zap } from "lucide-react";
import type { MockGame, GameType, Difficulty } from "@/mock-data/modules";

/* ── Tile icons ─────────────────────────────────────────── */

function QuizIcon() {
  return (
    <div className="w-14 h-14 rounded-xl bg-red-50 border-2 border-[#A61017]/30 flex items-center justify-center shrink-0">
      <div className="w-7 h-7 rounded border-2 border-[#A61017] flex items-center justify-center">
        <svg viewBox="0 0 12 10" className="w-4 h-3 text-[#A61017]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1,5 4,8 11,1" />
        </svg>
      </div>
    </div>
  );
}

function WordleIcon() {
  const tiles = [
    "#6aaa64", "#c9b458", "#787c7e",
    "#6aaa64", "#c9b458", "#787c7e",
  ];
  return (
    <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-200 p-2 grid grid-cols-3 gap-1 shrink-0">
      {tiles.map((bg, i) => (
        <div key={i} className="rounded-sm" style={{ backgroundColor: bg }} />
      ))}
    </div>
  );
}

function ConnectionsIcon() {
  const colors = ["#f9df6d", "#6aaa64", "#60a5fa", "#c084fc"];
  return (
    <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-200 p-2 grid grid-cols-2 gap-1 shrink-0">
      {colors.map((bg, i) => (
        <div key={i} className="rounded-sm" style={{ backgroundColor: bg }} />
      ))}
    </div>
  );
}

const gameIcons: Record<GameType, React.FC> = {
  quiz: QuizIcon,
  wordle: WordleIcon,
  connections: ConnectionsIcon,
};

/* ── Meta helpers ───────────────────────────────────────── */

const difficultyLabel: Record<Difficulty, string> = {
  easy: "Easy",
  moderate: "Moderate",
  hard: "Hard",
};

/* ── Component ──────────────────────────────────────────── */

export function GamePanelCard({
  game,
  moduleSlug,
  locked = false,
}: {
  game: MockGame;
  moduleSlug: string;
  locked?: boolean;
}) {
  const Icon = gameIcons[game.type];

  return (
    <div className="bg-white rounded-2xl p-4 flex gap-4 items-start">
      <Icon />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 mb-1.5">{game.title}</p>
        <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {game.estimatedMins} Mins
          </span>
          <span className="flex items-center gap-1">
            <BarChart2 className="w-3 h-3" />
            {difficultyLabel[game.difficulty]}
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {game.pointsValue} Points
          </span>
        </div>
        {locked ? (
          <span className="inline-block text-xs bg-gray-100 text-gray-400 rounded-lg px-4 py-1.5 cursor-not-allowed">
            Locked — read 80%
          </span>
        ) : (
          <Link href={`/modules/${moduleSlug}/games/${game.id}`}>
            <button className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 py-1.5 transition-colors font-medium cursor-pointer">
              Begin
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
