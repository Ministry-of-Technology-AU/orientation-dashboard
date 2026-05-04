"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { WordleConfig } from "@/mock-data/modules";

type TileState = "correct" | "present" | "absent" | "empty" | "active";

interface Tile { letter: string; state: TileState }

const KEYBOARD_ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["ENTER","Z","X","C","V","B","N","M","⌫"],
];

const tileStyles: Record<TileState, string> = {
  correct: "bg-emerald-500 border-emerald-500 text-white",
  present: "bg-amber-400 border-amber-400 text-white",
  absent:  "bg-gray-400 border-gray-400 text-white",
  empty:   "border-gray-300 bg-white text-gray-900",
  active:  "border-gray-500 bg-white text-gray-900",
};

function evaluateGuess(guess: string, word: string): TileState[] {
  const result: TileState[] = Array(word.length).fill("absent");
  const wordArr = word.split("");
  const guessArr = guess.split("");

  guessArr.forEach((l, i) => {
    if (l === wordArr[i]) {
      result[i] = "correct";
      wordArr[i] = "#";
      guessArr[i] = "*";
    }
  });
  guessArr.forEach((l, i) => {
    if (l === "*") return;
    const j = wordArr.indexOf(l);
    if (j !== -1) { result[i] = "present"; wordArr[j] = "#"; }
  });
  return result;
}

interface Props {
  config: WordleConfig;
  pointsValue: number;
  moduleSlug: string;
}

export function WordleGame({ config, pointsValue, moduleSlug }: Props) {
  const word = config.word.toUpperCase();
  const wordLen = word.length;

  const emptyGrid = (): Tile[][] =>
    Array.from({ length: config.maxAttempts }, () =>
      Array.from({ length: wordLen }, () => ({ letter: "", state: "empty" as TileState }))
    );

  const [grid, setGrid] = useState<Tile[][]>(emptyGrid);
  const [currentRow, setCurrentRow] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [usedKeys, setUsedKeys] = useState<Record<string, TileState>>({});
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [shake, setShake] = useState(false);

  const submitGuess = useCallback(() => {
    if (currentInput.length !== wordLen) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const states = evaluateGuess(currentInput, word);
    const newGrid = grid.map((row, ri) =>
      ri === currentRow
        ? currentInput.split("").map((letter, ci) => ({ letter, state: states[ci] }))
        : row
    );
    setGrid(newGrid);

    const newUsed = { ...usedKeys };
    currentInput.split("").forEach((l, i) => {
      const prev = newUsed[l];
      const next = states[i];
      if (!prev || next === "correct" || (next === "present" && prev === "absent"))
        newUsed[l] = next;
    });
    setUsedKeys(newUsed);

    const isWin = states.every((s) => s === "correct");
    if (isWin) { setWon(true); setGameOver(true); }
    else if (currentRow + 1 >= config.maxAttempts) { setGameOver(true); }
    else { setCurrentRow((r) => r + 1); }
    setCurrentInput("");
  }, [currentInput, currentRow, grid, usedKeys, word, wordLen, config.maxAttempts]);

  const handleKey = useCallback((key: string) => {
    if (gameOver) return;
    if (key === "ENTER") { submitGuess(); return; }
    if (key === "⌫" || key === "BACKSPACE") {
      setCurrentInput((s) => s.slice(0, -1));
      return;
    }
    if (/^[A-Z]$/.test(key) && currentInput.length < wordLen) {
      setCurrentInput((s) => s + key);
    }
  }, [gameOver, submitGuess, currentInput.length, wordLen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => handleKey(e.key.toUpperCase());
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleKey]);

  const displayGrid = grid.map((row, ri) => {
    if (ri === currentRow && !gameOver) {
      return row.map((cell, ci) => ({
        letter: currentInput[ci] ?? "",
        state: (currentInput[ci] ? "active" : "empty") as TileState,
      }));
    }
    return row;
  });

  const keyColor = (k: string): string => {
    const s = usedKeys[k];
    if (s === "correct") return "bg-emerald-500 text-white border-emerald-500";
    if (s === "present") return "bg-amber-400 text-white border-amber-400";
    if (s === "absent")  return "bg-gray-400 text-white border-gray-300";
    return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <p className="text-xs text-gray-500 italic">Hint: {config.hint}</p>

      {/* Grid */}
      <div className="flex flex-col gap-1.5">
        {displayGrid.map((row, ri) => (
          <div
            key={ri}
            className={cn(
              "flex gap-1.5",
              ri === currentRow && shake && "animate-[shake_0.4s_ease-in-out]"
            )}
          >
            {row.map((tile, ci) => (
              <div
                key={ci}
                className={cn(
                  "w-12 h-12 border-2 rounded-lg flex items-center justify-center text-base font-bold uppercase select-none transition-colors",
                  tileStyles[tile.state]
                )}
              >
                {tile.letter}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Result */}
      {gameOver && (
        <div className={cn(
          "rounded-2xl px-6 py-4 text-center",
          won ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
        )}>
          <p className="font-bold text-lg">{won ? "You got it!" : `The word was ${word}`}</p>
          <p className="text-sm mt-0.5">
            {won ? `You earned ${pointsValue} points!` : "Better luck next time."}
          </p>
          <a
            href={`/modules/${moduleSlug}`}
            className="inline-block mt-3 bg-[#0A3864] text-white rounded-xl px-5 py-2 text-sm font-medium hover:bg-[#1a5fa0] transition-colors"
          >
            Back to Module
          </a>
        </div>
      )}

      {/* On-screen keyboard */}
      <div className="flex flex-col items-center gap-1.5">
        {KEYBOARD_ROWS.map((row, i) => (
          <div key={i} className="flex gap-1">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleKey(key)}
                className={cn(
                  "h-10 rounded-lg border text-xs font-semibold transition-colors",
                  key.length > 1 ? "px-2 min-w-[3rem]" : "w-8",
                  keyColor(key)
                )}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
