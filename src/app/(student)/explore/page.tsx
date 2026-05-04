"use client";

import { useState } from "react";
import type { Club } from "@/mock-data/clubs";
import {
  mockUserInterestTags,
  getRecommendedClubs,
  getLikedClubs,
  getExploreAllClubs,
} from "@/mock-data/clubs";
import { ClubCarousel } from "@/components/explore/club-carousel";
import { ClubDetailPanel } from "@/components/explore/club-detail-panel";

// Pre-like a couple of clubs so "Liked by You" isn't empty on first load
const INITIAL_SWIPES: Record<string, "liked" | "dismissed"> = {
  c5: "liked",
  c8: "liked",
};

export default function ExplorePage() {
  const [swipes, setSwipes] = useState<Record<string, "liked" | "dismissed">>(INITIAL_SWIPES);
  const [selected, setSelected] = useState<Club | null>(null);

  const recommended = getRecommendedClubs(mockUserInterestTags, swipes);
  const liked = getLikedClubs(swipes);
  const exploreAll = getExploreAllClubs(swipes, mockUserInterestTags);

  function handleSelect(club: Club) {
    setSelected((prev) => (prev?.id === club.id ? null : club));
  }

  function handleLike(id: string) {
    setSwipes((s) => ({ ...s, [id]: "liked" }));
  }

  function handleDismiss(id: string) {
    setSwipes((s) => ({ ...s, [id]: "dismissed" }));
    setSelected((prev) => (prev?.id === id ? null : prev));
  }

  function handleUnlike(id: string) {
    setSwipes((s) => {
      const next = { ...s };
      delete next[id];
      return next;
    });
  }

  const isLiked = selected ? swipes[selected.id] === "liked" : false;

  return (
    <div className="flex flex-1 overflow-hidden min-w-0">
      {/* ── Left: scrollable sections ── */}
      <main className="flex-1 overflow-y-auto px-6 py-6 min-w-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Explore in and around Ashoka
        </h1>

        {/* Recommended */}
        <section className="mb-8">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Recommended</h2>
          <ClubCarousel
            clubs={recommended}
            selectedId={selected?.id ?? null}
            onSelect={handleSelect}
          />
        </section>

        {/* Liked by you */}
        <section className="mb-8">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Liked by you</h2>
          <ClubCarousel
            clubs={liked}
            selectedId={selected?.id ?? null}
            onSelect={handleSelect}
          />
        </section>

        {/* Explore all */}
        {exploreAll.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-semibold text-gray-800 mb-3">Explore all</h2>
            <ClubCarousel
              clubs={exploreAll}
              selectedId={selected?.id ?? null}
              onSelect={handleSelect}
            />
          </section>
        )}
      </main>

      {/* ── Right: club detail panel ── */}
      <aside className="w-80 shrink-0 m-3 ml-0">
        <div className="bg-[#e6edf5] rounded-2xl h-full p-5 flex flex-col">
          <ClubDetailPanel
            club={selected}
            isLiked={isLiked}
            onLike={handleLike}
            onDismiss={handleDismiss}
            onUnlike={handleUnlike}
          />
        </div>
      </aside>
    </div>
  );
}
