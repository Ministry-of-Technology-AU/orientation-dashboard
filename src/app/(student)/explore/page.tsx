"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Search } from "lucide-react";
import Link from "next/link";
import type { Club } from "@/mock-data/clubs";
import {
  mockUserInterestTags,
  getRecommendedClubs,
} from "@/mock-data/clubs";
import { ClubDetailPanel } from "@/components/explore/club-detail-panel";

// Pre-like a couple of clubs so "Liked by You" isn't empty on first load
const INITIAL_SWIPES: Record<string, "liked" | "dismissed"> = {
  c5: "liked",
  c8: "liked",
};

const cardVariants = {
  initial: { scale: 0.95, opacity: 0, y: 20 },
  animate: { scale: 1, opacity: 1, x: 0, y: 0, rotate: 0 },
  exit: (dir: 'left' | 'right' | null) => {
    if (dir === 'left') return { x: -300, opacity: 0, rotate: -20, scale: 0.9 };
    if (dir === 'right') return { x: 300, opacity: 0, rotate: 20, scale: 0.9 };
    return { scale: 0.95, opacity: 0, x: 0, y: 0, rotate: 0 };
  }
};

export default function ExplorePage() {
  const [swipes, setSwipes] = useState<Record<string, "liked" | "dismissed">>(INITIAL_SWIPES);
  
  // Animation states
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [flyingHeart, setFlyingHeart] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem("club_swipes");
    if (stored) {
      try {
        setSwipes(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  // Save swipes whenever they change
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("club_swipes", JSON.stringify(swipes));
    }
  }, [swipes, isClient]);

  const recommended = getRecommendedClubs(mockUserInterestTags, swipes);
  const currentClub = recommended.length > 0 ? recommended[0] : null;

  function handleLike(id: string) {
    setDirection('right');
    setFlyingHeart(Date.now());
    setTimeout(() => {
      setSwipes((s) => ({ ...s, [id]: "liked" }));
    }, 150); // slight delay so animation starts before unmounting
  }

  function handleDismiss(id: string) {
    setDirection('left');
    setTimeout(() => {
      setSwipes((s) => ({ ...s, [id]: "dismissed" }));
    }, 150);
  }

  if (!isClient) return null;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden relative">

      {/* Top Navigation */}
      <header className="shrink-0 flex items-center justify-between px-6 py-5 z-10 relative">
        <h1
          className="text-2xl font-bold text-primary-blue"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Discover
        </h1>
        <Link
          href="/likes"
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-primary-blue/10 text-sm font-bold text-primary-red hover:bg-red-tint hover:border-primary-red/20 hover:shadow-md transition-all active:scale-95"
        >
          <Heart className="w-4 h-4 fill-primary-red" />
          View your likes
        </Link>
      </header>

      {/* Main Card Area */}
      <main className="flex-1 flex flex-col items-center justify-center relative px-4 w-full max-w-md mx-auto">
        <AnimatePresence mode="popLayout" custom={direction}>
          {currentClub ? (
            <motion.div
              key={currentClub.id}
              custom={direction}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full aspect-3/4 max-h-[75vh] bg-white rounded-3xl shadow-xl shadow-primary-blue/8 border border-primary-blue/8 flex flex-col overflow-hidden relative origin-bottom z-10"
            >
              <ClubDetailPanel
                club={currentClub}
                isLiked={false}
                onLike={handleLike}
                onDismiss={handleDismiss}
                onUnlike={() => {}}
              />
            </motion.div>
          ) : (
            <motion.div
              key="end-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center p-8 z-10"
            >
              <div className="w-20 h-20 bg-blue-tint rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Search className="w-8 h-8 text-primary-blue/30" />
              </div>
              <h2
                className="text-2xl font-bold text-primary-blue mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                That's all we had for now!
              </h2>
              <p className="text-primary-blue/50 mb-8 max-w-65">
                You've seen all our recommendations based on your interests.
              </p>

              <div className="flex flex-col gap-3 w-full">
                <Link
                  href="/likes"
                  className="w-full flex items-center justify-center gap-2 bg-primary-red text-white font-bold py-4 rounded-2xl hover:bg-primary-red/90 hover:shadow-lg hover:shadow-primary-red/20 transition-all active:scale-95"
                >
                  <Heart className="w-5 h-5 fill-current" />
                  Go to your Likes
                </Link>
                <Link
                  href="/catalogue"
                  className="w-full flex items-center justify-center gap-2 bg-white text-primary-blue font-bold py-4 rounded-2xl border-2 border-primary-blue/15 hover:border-primary-blue/25 hover:bg-blue-tint transition-all active:scale-95"
                >
                  View Full Catalogue
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flying Heart Animation */}
        <AnimatePresence>
          {flyingHeart > 0 && (
            <motion.div
              key={flyingHeart}
              initial={{ opacity: 0, scale: 0.5, y: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 2.5], y: -300 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              onAnimationComplete={() => setFlyingHeart(0)}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-primary-red z-50"
            >
              <Heart className="w-32 h-32 fill-current drop-shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <footer className="shrink-0 flex items-center justify-center py-6 px-6 z-10">
        <Link
          href="/catalogue"
          className="text-sm font-semibold text-primary-blue/40 hover:text-primary-blue transition-colors underline decoration-primary-blue/20 underline-offset-4"
        >
          View full catalogue
        </Link>
      </footer>
    </div>
  );
}
