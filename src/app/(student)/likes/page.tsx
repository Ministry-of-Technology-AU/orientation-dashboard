"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Search } from "lucide-react";
import Link from "next/link";
import { mockClubs } from "@/mock-data/clubs";
import type { Club } from "@/mock-data/clubs";
import { ClubCard } from "@/components/explore/club-card";
import { ClubDetailPanel } from "@/components/explore/club-detail-panel";

export default function LikesPage() {
  const [swipes, setSwipes] = useState<Record<string, "liked" | "dismissed">>({});
  const [isClient, setIsClient] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem("club_swipes");
    if (stored) {
      try {
        setSwipes(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const likedClubs = mockClubs.filter((c) => swipes[c.id] === "liked");

  function handleUnlike(id: string) {
    const next = { ...swipes };
    delete next[id];
    setSwipes(next);
    localStorage.setItem("club_swipes", JSON.stringify(next));
    if (selectedClub?.id === id) {
      setSelectedClub(null);
    }
  }

  if (!isClient) return null;

  return (
    <div className="flex flex-col h-full w-full bg-neutral-50 overflow-hidden relative font-sans">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-5 z-10 border-b border-neutral-200/60 bg-white">
        <div className="flex items-center gap-4">
          <Link 
            href="/explore" 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 flex items-center gap-2">
            Your Likes <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
          </h1>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
        {likedClubs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {likedClubs.map((club, index) => (
              <motion.div 
                key={club.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ClubCard 
                  club={club}
                  swipeStatus="liked"
                  onClick={() => setSelectedClub(club)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Heart className="w-10 h-10 text-neutral-300" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">No likes yet</h2>
            <p className="text-neutral-500 mb-8 leading-relaxed">
              You haven't liked any organizations yet. Head back to Explore to discover some!
            </p>
            <Link 
              href="/explore"
              className="px-8 py-3 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 transition-colors active:scale-95 shadow-md"
            >
              Start Exploring
            </Link>
          </div>
        )}
      </main>

      {/* Modal for selected club */}
      <AnimatePresence>
        {selectedClub && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm"
            onClick={() => setSelectedClub(null)}
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
                onDismiss={() => setSelectedClub(null)}
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
