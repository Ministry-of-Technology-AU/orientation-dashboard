"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { reportGameCompletion } from "@/lib/games-client";
import type { ConnectionsConfig } from "@/mock-data/modules";

type Color = "yellow" | "green" | "blue" | "purple";

const colorStyles: Record<Color, { bg: string; text: string }> = {
  yellow: { bg: "bg-[#f9df6d]",  text: "text-yellow-900" },
  green:  { bg: "bg-[#6aaa64]",  text: "text-white" },
  blue:   { bg: "bg-[#60a5fa]",  text: "text-white" },
  purple: { bg: "bg-[#c084fc]",  text: "text-white" },
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

interface Props {
  config: ConnectionsConfig;
  pointsValue: number;
  moduleId: string;
}

export function ConnectionsGame({ config, pointsValue, moduleId }: Props) {
  const flat = config.groups.flatMap((g) => g.items);

  const [selected, setSelected] = useState<string[]>([]);
  const [solved, setSolved] = useState<ConnectionsConfig["groups"]>([]);
  const [remaining, setRemaining] = useState<string[]>(flat);
  const [submissions, setSubmissions] = useState<string[][]>([]);

  // Shuffle only on the client after hydration to avoid server/client mismatch
  useEffect(() => {
    const timer = window.setTimeout(() => setRemaining(shuffle(flat)), 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [mistakes, setMistakes] = useState(0);
  const [shake, setShake] = useState(false);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const maxMistakes = 4;

  // Persist completion + points once the game ends (solving it earns points).
  const reportedRef = useRef(false);
  useEffect(() => {
    if ((!won && !lost) || reportedRef.current) return;
    reportedRef.current = true;
    reportGameCompletion({
      moduleId,
      type: "connections",
      submissions,
    });
  }, [won, lost, submissions, moduleId]);

  function toggle(item: string) {
    if (won || lost) return;
    setSelected((prev) =>
      prev.includes(item)
        ? prev.filter((x) => x !== item)
        : prev.length < 4
        ? [...prev, item]
        : prev
    );
  }

  function submit() {
    if (selected.length !== 4) return;
    setSubmissions((prev) => [...prev, selected]);
    const match = config.groups.find(
      (g) => selected.every((s) => g.items.includes(s)) && g.items.every((s) => selected.includes(s))
    );
    if (match) {
      const newSolved = [...solved, match];
      const newRemaining = remaining.filter((x) => !selected.includes(x));
      setSolved(newSolved);
      setRemaining(newRemaining);
      setSelected([]);
      if (newSolved.length === config.groups.length) setWon(true);
    } else {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setSelected([]);
      if (newMistakes >= maxMistakes) setLost(true);
    }
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto">
      {/* Mistakes */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Mistakes remaining:</span>
        {Array.from({ length: maxMistakes }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-3 h-3 rounded-full",
              i < maxMistakes - mistakes ? "bg-[#0A3864]" : "bg-gray-200"
            )}
          />
        ))}
      </div>

      {/* Solved groups */}
      {solved.map((group) => (
        <div
          key={group.label}
          className={cn(
            "w-full rounded-2xl p-3 text-center",
            colorStyles[group.color as Color].bg,
            colorStyles[group.color as Color].text
          )}
        >
          <p className="text-xs font-bold uppercase tracking-wide mb-1">{group.label}</p>
          <p className="text-sm font-medium">{group.items.join(", ")}</p>
        </div>
      ))}

      {/* Remaining tiles */}
      {!won && !lost && (
        <div className={cn("grid grid-cols-4 gap-2 w-full", shake && "animate-[shake_0.4s_ease-in-out]")}>
          {remaining.map((item) => (
            <button
              key={item}
              onClick={() => toggle(item)}
              className={cn(
                "h-14 rounded-xl text-xs font-semibold text-center border-2 transition-all select-none",
                selected.includes(item)
                  ? "bg-[#0A3864] text-white border-[#0A3864]"
                  : "bg-white text-gray-800 border-gray-200 hover:border-[#0A3864]/40 hover:bg-blue-50/30"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {/* Submit */}
      {!won && !lost && (
        <button
          onClick={submit}
          disabled={selected.length !== 4}
          className="bg-[#A61017] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl px-8 py-2.5 text-sm font-medium hover:bg-[#d44049] transition-colors"
        >
          Submit ({selected.length}/4 selected)
        </button>
      )}

      {/* Result */}
      {(won || lost) && (
        <div className={cn(
          "rounded-2xl px-6 py-4 text-center w-full",
          won ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
        )}>
          <p className="font-bold text-lg">{won ? "Solved!" : "Better luck next time"}</p>
          <p className="text-sm mt-0.5">
            {won ? `You earned ${pointsValue} points!` : `The answers are revealed above.`}
          </p>
          {lost && (
            <div className="mt-3 flex flex-col gap-1.5">
              {config.groups
                .filter((g) => !solved.find((s) => s.label === g.label))
                .map((group) => (
                  <div
                    key={group.label}
                    className={cn(
                      "rounded-xl p-2 text-center text-xs",
                      colorStyles[group.color as Color].bg,
                      colorStyles[group.color as Color].text
                    )}
                  >
                    <span className="font-bold">{group.label}:</span> {group.items.join(", ")}
                  </div>
                ))}
            </div>
          )}
          <Link
            href="/modules"
            className="inline-block mt-4 bg-[#0A3864] text-white rounded-xl px-5 py-2 text-sm font-medium hover:bg-[#1a5fa0] transition-colors"
          >
            Back to Modules
          </Link>
        </div>
      )}
    </div>
  );
}
