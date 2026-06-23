import type { MockModule, ModuleStatus } from "@/mock-data/modules";

/**
 * Per-module progress stored on `User.modulesStatus` (a JSON column).
 * Shape documented in prisma/schema.prisma:
 *   { [moduleId]: { isRead, isQuizDone, isWordleDone, isConnectionsDone } }
 * `readPercent` is an optional extension used to drive the reading-progress bar.
 */
export interface ModuleStatusEntry {
  /** The reader has opened the module — flips the status to "in_progress". */
  started?: boolean;
  isRead?: boolean;
  readPercent?: number;
  // Resume state (cross-device): accumulated active reading time, sections seen,
  // and whether the end was reached.
  readSeconds?: number;
  seenSections?: string[];
  reachedEnd?: boolean;
  isQuizDone?: boolean;
  isWordleDone?: boolean;
  isConnectionsDone?: boolean;
}

export type ModulesStatus = Record<string, ModuleStatusEntry>;

/** Coerce the loosely-typed JSON column into our shape. */
export function parseModulesStatus(raw: unknown): ModulesStatus {
  if (!raw || typeof raw !== "object") return {};
  return raw as ModulesStatus;
}

export function getEntry(status: ModulesStatus, moduleId: string): ModuleStatusEntry {
  return status[moduleId] ?? {};
}

/** Derive the card/badge status from the read flag and per-game completion flags. */
export function deriveStatus(module: MockModule, entry: ModuleStatusEntry): ModuleStatus {
  if (entry.isRead) {
    const types = new Set(module.games.map((g) => g.type));
    const allGamesDone = [...types].every((t) =>
      t === "quiz"
        ? entry.isQuizDone
        : t === "wordle"
        ? entry.isWordleDone
        : entry.isConnectionsDone
    );
    return types.size === 0 || allGamesDone ? "completed" : "in_progress";
  }

  if (entry.started || (entry.readPercent ?? 0) > 0) return "in_progress";
  return "not_started";
}
