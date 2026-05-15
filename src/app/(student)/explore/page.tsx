"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import type { Club } from "@/mock-data/clubs";
import {
  mockUserInterestTags,
  getRecommendedClubs,
  getLikedClubs,
  getExploreAllClubs,
  getTierClubs
} from "@/mock-data/clubs";
import { ClubCarousel } from "@/components/explore/club-carousel";
import { ClubDetailPanel } from "@/components/explore/club-detail-panel";

// Pre-like a couple of clubs so "Liked by You" isn't empty on first load
const INITIAL_SWIPES: Record<string, "liked" | "dismissed"> = {
  c5: "liked",
  c8: "liked",
};

const cardVariants = {
  initial: { scale: 0.95, opacity: 0, y: 10 },
  animate: { scale: 1, opacity: 1, x: 0, y: 0, rotate: 0 },
  exit: (dir: 'left' | 'right' | null) => {
    if (dir === 'left') return { x: -200, opacity: 0, rotate: -15, scale: 0.9 };
    if (dir === 'right') return { x: 200, opacity: 0, rotate: 15, scale: 0.9 };
    return { scale: 0.95, opacity: 0, x: 0, y: 0, rotate: 0 };
  }
};

export default function ExplorePage() {
  const [swipes, setSwipes] = useState<Record<string, "liked" | "dismissed">>(INITIAL_SWIPES);
  const [selected, setSelected] = useState<Club | null>(null);
  
  // Animation states
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [flyingHeart, setFlyingHeart] = useState<number>(0);

  const recommended = getRecommendedClubs(mockUserInterestTags, swipes);
  const liked = getLikedClubs(swipes);
  
  const tier4 = getTierClubs(swipes, 4);
  const tier3 = getTierClubs(swipes, 3);
  const tier2 = getTierClubs(swipes, 2);
  const tier1 = getTierClubs(swipes, 1);
  
  const exploreAll = getExploreAllClubs(swipes, mockUserInterestTags);

  function handleSelect(club: Club) {
    setDirection(null);
    setFlyingHeart(0);
    setSelected((prev) => (prev?.id === club.id ? null : club));
  }

  function advanceToNext(id: string) {
    const listSequence = [recommended, tier4, tier3, tier2, tier1, exploreAll];
    
    // Liked list logic (if user is just browsing their liked clubs)
    if (liked.some(c => c.id === id)) {
      const idx = liked.findIndex(c => c.id === id);
      if (idx !== -1 && idx + 1 < liked.length) {
        setSelected(liked[idx + 1]);
      } else {
        setSelected(null);
      }
      return;
    }

    // Progression logic through categories
    let currentListIdx = -1;
    for (let i = 0; i < listSequence.length; i++) {
      if (listSequence[i].some(c => c.id === id)) {
        currentListIdx = i;
        break;
      }
    }

    if (currentListIdx !== -1) {
      const currentList = listSequence[currentListIdx];
      const idx = currentList.findIndex(c => c.id === id);
      
      // Try next in current list
      if (idx !== -1 && idx + 1 < currentList.length) {
        setSelected(currentList[idx + 1]);
        return;
      }
      
      // Exhausted current list, find the next available list
      for (let i = currentListIdx + 1; i < listSequence.length; i++) {
        if (listSequence[i].length > 0) {
          setSelected(listSequence[i][0]);
          return;
        }
      }
    }

    setSelected(null);
  }

  function handleLike(id: string) {
    setDirection('right');
    setFlyingHeart(Date.now());
    advanceToNext(id);
    setSwipes((s) => ({ ...s, [id]: "liked" }));
  }

  function handleDismiss(id: string) {
    setDirection('left');
    advanceToNext(id);
    setSwipes((s) => ({ ...s, [id]: "dismissed" }));
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
    <div className="flex flex-1 overflow-hidden min-w-0 bg-neutral/40">
      {/* ── Left: scrollable sections ── */}
      <motion.main layout className="flex-1 overflow-y-auto px-6 py-6 min-w-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Explore in and around Ashoka
        </h1>

        {/* Recommended */}
        <section className="mb-8">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Recommended</h2>
          <ClubCarousel clubs={recommended} selectedId={selected?.id ?? null} onSelect={handleSelect} />
        </section>

        {/* Liked by you */}
        <section className="mb-8">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Liked by you</h2>
          <ClubCarousel clubs={liked} selectedId={selected?.id ?? null} onSelect={handleSelect} />
        </section>

        {/* Tier 4 */}
        <section className="mb-8">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Tier 4 Organizations</h2>
          <ClubCarousel clubs={tier4} selectedId={selected?.id ?? null} swipes={swipes} onSelect={handleSelect} />
        </section>

        {/* Tier 3 */}
        <section className="mb-8">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Tier 3 Organizations</h2>
          <ClubCarousel clubs={tier3} selectedId={selected?.id ?? null} swipes={swipes} onSelect={handleSelect} />
        </section>

        {/* Tier 2 */}
        <section className="mb-8">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Tier 2 Organizations</h2>
          <ClubCarousel clubs={tier2} selectedId={selected?.id ?? null} swipes={swipes} onSelect={handleSelect} />
        </section>

        {/* Tier 1 */}
        <section className="mb-8">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Tier 1 Organizations</h2>
          <ClubCarousel clubs={tier1} selectedId={selected?.id ?? null} swipes={swipes} onSelect={handleSelect} />
        </section>

        {/* Explore all (fallback) */}
        {exploreAll.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-semibold text-gray-800 mb-3">Explore all</h2>
            <ClubCarousel clubs={exploreAll} selectedId={selected?.id ?? null} swipes={swipes} onSelect={handleSelect} />
          </section>
        )}
      </motion.main>

      {/* ── Right: conditionally rendered club detail panel ── */}
      <AnimatePresence initial={false}>
        {selected && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="shrink-0 h-full flex items-center mr-20 overflow-hidden" 
          >
            <div className="bg-[#e6edf5] rounded-2xl h-[92%] my-auto p-5 flex flex-col w-[320px] mx-auto shadow-sm border border-blue-100 relative overflow-hidden">
              <AnimatePresence mode="popLayout" custom={direction}>
                <motion.div
                  key={selected.id}
                  custom={direction}
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="flex flex-col h-full origin-bottom"
                >
                  <ClubDetailPanel
                    club={selected}
                    isLiked={isLiked}
                    onLike={handleLike}
                    onDismiss={handleDismiss}
                    onUnlike={handleUnlike}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Flying Heart Animation */}
              <AnimatePresence>
                {flyingHeart > 0 && (
                  <motion.div
                    key={flyingHeart}
                    initial={{ opacity: 0, scale: 0.5, y: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 2], y: -200 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    onAnimationComplete={() => setFlyingHeart(0)}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-rose-500 z-50"
                  >
                    <Heart className="w-24 h-24 fill-current drop-shadow-xl" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
