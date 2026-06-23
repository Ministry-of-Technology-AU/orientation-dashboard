import type { GameType } from "@/mock-data/modules";

type GameAttempt =
  | { type: "quiz"; answers: string[] }
  | { type: "wordle"; guesses: string[] }
  | { type: "connections"; submissions: string[][] };

/**
 * Reports a finished game attempt to the server so completion + points persist.
 * The server re-scores from these attempts; client score/points are display-only.
 * Fire-and-forget: a failed report must never break the game UI.
 */
export async function reportGameCompletion(input: GameAttempt & {
  moduleId: string;
  type: GameType;
}): Promise<void> {
  try {
    await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      keepalive: true,
    });
  } catch {
    // non-fatal
  }
}
