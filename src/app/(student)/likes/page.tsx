"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";
import { mockClubs } from "@/mock-data/clubs";
import type { Club } from "@/mock-data/clubs";
import { ClubCard } from "@/components/explore/club-card";
import { ClubDetailPanel } from "@/components/explore/club-detail-panel";
import { useWebHaptics } from "web-haptics/react";

export default function LikesPage() {
  const haptic = useWebHaptics();
  const [swipes, setSwipes] = useState<Record<string, "liked" | "dismissed">>({});
  const [isClient, setIsClient] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setIsClient(true);
      /*
      const stored = localStorage.getItem("club_swipes");
      if (stored) {
        try {
          setSwipes(JSON.parse(stored));
        } catch {
          // Ignore parsing errors
        }
      }
      */
    }, 0);
  }, []);

  const likedClubs = mockClubs.filter((c) => swipes[c.id] === "liked");

  function handleUnlike(id: string) {
    haptic.trigger("light");
    const next = { ...swipes };
    delete next[id];
    setSwipes(next);
    /*
    localStorage.setItem("club_swipes", JSON.stringify(next));
    */
    if (selectedClub?.id === id) {
      setSelectedClub(null);
    }
  }

  if (!isClient) return null;

  return (
    <div className="flex flex-col flex-1 h-full w-full overflow-y-auto lg:overflow-hidden min-w-0 p-3 md:pl-0">
      <div className="flex-1 w-full lg:h-full lg:overflow-y-auto px-5 py-6 sm:px-7 bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl shadow-[0_8px_32px_0_rgba(10,56,100,0.04)] min-w-0 flex flex-col gap-6 overflow-hidden">
        {/* Header */}
        <header className="shrink-0 flex items-center justify-between py-4 border-b border-primary-blue/8 z-10 relative">
          <div className="flex items-center gap-4">
            <Link 
              href="/explore" 
              onClick={() => haptic.trigger("light")}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-blue/6 hover:bg-primary-blue/10 border border-primary-blue/10 transition-colors text-primary-blue active:scale-95 shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 
                className="text-2xl sm:text-3xl font-black text-primary-blue tracking-tight flex items-center gap-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Your Likes <Heart className="w-6 h-6 fill-primary-red text-primary-red" />
              </h1>
            </div>
          </div>
        </header>

        {/* Main Grid */}
        <main className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          {likedClubs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {likedClubs.map((club, index) => (
                <motion.div 
                  key={club.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                >
                  <ClubCard 
                    club={club}
                    swipeStatus="liked"
                    onClick={() => {
                      haptic.trigger("medium");
                      setSelectedClub(club);
                    }}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-center max-w-sm mx-auto">
              <div className="w-20 h-20 bg-blue-tint rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Heart className="w-8 h-8 text-primary-blue/30" />
              </div>
              <h2 
                className="text-2xl font-bold text-primary-blue mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                No likes yet
              </h2>
              <p className="text-primary-blue/50 mb-8 leading-relaxed text-sm">
                You haven&apos;t liked any organizations yet. Head back to Explore to discover some!
              </p>
              <Link 
                href="/explore"
                onClick={() => haptic.trigger("medium")}
                className="px-8 py-3.5 bg-primary-blue text-white font-bold rounded-xl hover:bg-primary-blue/90 shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                Start Exploring
              </Link>
            </div>
          )}
        </main>
      </div>

      {/* Modal for selected club */}
      <AnimatePresence>
        {selectedClub && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm"
            onClick={() => {
              haptic.trigger("light");
              setSelectedClub(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-sm aspect-[3/4] max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <ClubDetailPanel
                club={selectedClub}
                isLiked={true}
                onDismiss={() => {
                  haptic.trigger("light");
                  setSelectedClub(null);
                }}
                onLike={() => {}}
                onUnlike={handleUnlike}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
