"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Club } from "@/mock-data/clubs";
import { ClubCard } from "./club-card";

const PER_PAGE = 3;

export function ClubCarousel({
  clubs,
  selectedId,
  onSelect,
}: {
  clubs: Club[];
  selectedId: string | null;
  onSelect: (club: Club) => void;
}) {
  const [page, setPage] = useState(0);
  const maxPage = Math.max(0, Math.ceil(clubs.length / PER_PAGE) - 1);
  const visible = clubs.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  if (clubs.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-4 pl-10">Nothing here yet.</p>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Prev */}
      <button
        onClick={() => setPage((p) => Math.max(0, p - 1))}
        disabled={page === 0}
        className={cn(
          "shrink-0 w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center transition-colors",
          page === 0
            ? "text-gray-200 cursor-default"
            : "text-gray-500 hover:border-gray-400 hover:text-gray-700"
        )}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Cards */}
      <div className="flex-1 grid grid-cols-3 gap-4">
        {visible.map((club) => (
          <ClubCard
            key={club.id}
            club={club}
            selected={selectedId === club.id}
            onClick={() => onSelect(club)}
          />
        ))}
        {/* Fill empty slots so grid doesn't collapse */}
        {Array.from({ length: PER_PAGE - visible.length }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
      </div>

      {/* Next */}
      <button
        onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
        disabled={page === maxPage}
        className={cn(
          "shrink-0 w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center transition-colors",
          page === maxPage
            ? "text-gray-200 cursor-default"
            : "text-gray-500 hover:border-gray-400 hover:text-gray-700"
        )}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
