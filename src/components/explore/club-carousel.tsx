"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Club } from "@/mock-data/clubs";
import { ClubCard } from "./club-card";
import { motion, AnimatePresence } from "framer-motion";

const PER_PAGE = 3;

const slideVariants = {
  enter: (direction: number) => {
    return { x: direction > 0 ? 30 : -30, opacity: 0 };
  },
  center: { zIndex: 1, x: 0, opacity: 1 },
  exit: (direction: number) => {
    return { zIndex: 0, x: direction < 0 ? 30 : -30, opacity: 0 };
  }
};

export function ClubCarousel({
  clubs,
  selectedId,
  swipes,
  onSelect,
}: {
  clubs: Club[];
  selectedId: string | null;
  swipes?: Record<string, "liked" | "dismissed">;
  onSelect: (club: Club) => void;
}) {
  const [[page, direction], setPage] = useState([0, 0]);
  const maxPage = Math.max(0, Math.ceil(clubs.length / PER_PAGE) - 1);
  
  // If clubs are removed and we're out of bounds, step back
  useEffect(() => {
    if (page > maxPage) {
      setPage([Math.max(0, maxPage), -1]);
    }
  }, [clubs.length, maxPage, page]);

  const visible = clubs.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  if (clubs.length === 0) return null;

  const paginate = (newDirection: number) => {
    const newPage = page + newDirection;
    if (newPage >= 0 && newPage <= maxPage) {
      setPage([newPage, newDirection]);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Prev */}
      <button
        onClick={() => paginate(-1)}
        disabled={page === 0}
        className={cn(
          "shrink-0 w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center transition-all bg-white shadow-sm z-10",
          page === 0
            ? "opacity-40 cursor-default bg-gray-50"
            : "text-gray-600 hover:border-blue-400 hover:text-blue-700 hover:shadow-md hover:scale-105 active:scale-95"
        )}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Cards container */}
      <div className="flex-1 overflow-visible relative">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
            className="grid grid-cols-3 gap-4"
          >
            {visible.map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                selected={selectedId === club.id}
                swipeStatus={swipes ? swipes[club.id] : undefined}
                onClick={() => onSelect(club)}
              />
            ))}
            {/* Fill empty slots so grid doesn't collapse */}
            {Array.from({ length: PER_PAGE - visible.length }).map((_, i) => (
              <div key={`empty-${i}`} className="invisible" />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Next */}
      <button
        onClick={() => paginate(1)}
        disabled={page === maxPage}
        className={cn(
          "shrink-0 w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center transition-all bg-white shadow-sm z-10",
          page === maxPage
            ? "opacity-40 cursor-default bg-gray-50"
            : "text-gray-600 hover:border-blue-400 hover:text-blue-700 hover:shadow-md hover:scale-105 active:scale-95"
        )}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
