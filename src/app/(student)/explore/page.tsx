"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { Heart, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  mockUserInterestTags,
  getRecommendedClubs,
  mockClubs,
} from "@/mock-data/clubs";
import { ClubDetailPanel } from "@/components/explore/club-detail-panel";
import { useWebHaptics } from "web-haptics/react";
import { cn } from "@/lib/utils";

// Pre-like a couple of clubs so "Liked by You" isn't empty on first load
const INITIAL_SWIPES: Record<string, "liked" | "dismissed"> = {
  c5: "liked",
  c8: "liked",
};

export default function ExplorePage() {
  const haptic = useWebHaptics();
  const [swipes, setSwipes] = useState<Record<string, "liked" | "dismissed">>(INITIAL_SWIPES);
  
  // Animation states
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [flyingHeart, setFlyingHeart] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);
  const [isLowPower, setIsLowPower] = useState(false);

  // Motion values for drag tracking
  const x = useMotionValue(0);
  
  // High-performance function-based transforms (GPU friendly and conditionally simplified for low-power/mobile devices)
  const rotate = useTransform(x, (val) => {
    if (isLowPower) return 0;
    const angle = (val / 200) * 25;
    return Math.max(-25, Math.min(25, angle));
  });

  const opacity = useTransform(x, (val) => {
    if (isLowPower) return 1;
    const abs = Math.abs(val);
    if (abs <= 150) return 1;
    const ratio = Math.min(1, (abs - 150) / 50);
    return 1 - ratio * 0.4;
  });

  // Swipe overlay opacities
  const likeOpacity = useTransform(x, [0, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, 0], [1, 0]);

  // Haptic threshold tracker ref
  const thresholdTriggered = useRef<'left' | 'right' | null>(null);
  const heartIdCounter = useRef(0);
  const exploreMarkedRef = useRef(false);

  function markExploreUsed() {
    if (exploreMarkedRef.current) return;
    exploreMarkedRef.current = true;
    fetch("/api/dashboard/progress", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markExploreUsed" }),
      keepalive: true,
    }).catch((error) => {
      exploreMarkedRef.current = false;
      console.error("Failed to mark explore usage:", error);
    });
  }

  useEffect(() => {
    setTimeout(() => {
      setIsClient(true);
      
      // Check device specs and power preference
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
      const isLowSpec = 
        (typeof navigator !== 'undefined' && 
         ((navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
          ((navigator as unknown as { deviceMemory?: number }).deviceMemory && 
           (navigator as unknown as { deviceMemory?: number }).deviceMemory! <= 4)));

      if (prefersReduced || isMobile || isLowSpec) {
        setIsLowPower(true);
      }

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

  // Save swipes whenever they change
  useEffect(() => {
    /*
    if (isClient) {
      localStorage.setItem("club_swipes", JSON.stringify(swipes));
    }
    */
  }, [swipes, isClient]);

  const recommended = getRecommendedClubs(mockUserInterestTags, swipes);
  const currentClub = recommended.length > 0 ? recommended[0] : null;

  // Reset x and haptic trackers when active card changes
  useEffect(() => {
    x.set(0);
    thresholdTriggered.current = null;
  }, [currentClub?.id, x]);

  // Preload and save next clubs' assets (photos and logos) in the browser's Cache Storage
  useEffect(() => {
    if (recommended.length === 0) return;
    
    // Cache the current club plus the next 5 clubs in the queue
    const nextClubs = recommended.slice(0, 6);
    const urls = nextClubs.flatMap((club) => [
      `/clubs/${club.id}.webp`,
      `/clubs/logos/${club.id}.webp`,
    ]);

    if (typeof window !== "undefined" && "caches" in window) {
      caches.open("club-assets-v1").then((cache) => {
        urls.forEach((url) => {
          cache.match(url).then((matched) => {
            if (!matched) {
              // Fetch and cache the asset persistently
              cache.add(url).catch(() => {
                // Ignore errors for missing files (e.g., 404)
              });
            }
          });
        });
      });
    }
  }, [recommended]);

  const handleDrag = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (isLowPower) return; // Skip high-frequency selection haptics on weaker devices
    const swipeThreshold = 120;
    if (info.offset.x > swipeThreshold) {
      if (thresholdTriggered.current !== 'right') {
        haptic.trigger("selection");
        thresholdTriggered.current = 'right';
      }
    } else if (info.offset.x < -swipeThreshold) {
      if (thresholdTriggered.current !== 'left') {
        haptic.trigger("selection");
        thresholdTriggered.current = 'left';
      }
    } else {
      thresholdTriggered.current = null;
    }
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const swipeThreshold = 120;
    if (!currentClub) return;

    if (info.offset.x > swipeThreshold) {
      handleLike(currentClub.id);
    } else if (info.offset.x < -swipeThreshold) {
      handleDismiss(currentClub.id);
    } else {
      // Snapped back
      haptic.trigger("light");
    }
  };

  function handleLike(id: string) {
    haptic.trigger("success");
    markExploreUsed();
    setDirection('right');
    heartIdCounter.current += 1;
    setFlyingHeart(heartIdCounter.current);
    setTimeout(() => {
      setSwipes((s) => ({ ...s, [id]: "liked" }));
    }, 150); // slight delay so animation starts before unmounting
  }

  const handleDismiss = (id: string) => {
    haptic.trigger("light");
    markExploreUsed();
    setDirection('left');
    setTimeout(() => {
      setSwipes((s) => ({ ...s, [id]: "dismissed" }));
    }, 150);
  };

  function handleUnlike(id: string) {
    haptic.trigger("light");
    setSwipes((s) => {
      const next = { ...s };
      delete next[id];
      return next;
    });
  }

  const cardVariants = {
    initial: (customObj: { isTop: boolean; direction: 'left' | 'right' | null }) => ({
      scale: customObj.isTop ? 0.95 : 0.92,
      opacity: 0,
      y: customObj.isTop ? 20 : 30
    }),
    animate: (customObj: { isTop: boolean; direction: 'left' | 'right' | null }) => ({
      scale: customObj.isTop ? 1 : 0.96,
      opacity: customObj.isTop ? 1 : 0.5,
      y: customObj.isTop ? 0 : 16,
      x: 0,
      rotate: 0
    }),
    exit: (customObj: { isTop: boolean; direction: 'left' | 'right' | null }) => {
      if (customObj.direction === 'left') return { x: -300, opacity: 0, rotate: -20, scale: 0.9 };
      if (customObj.direction === 'right') return { x: 300, opacity: 0, rotate: 20, scale: 0.9 };
      return { scale: 0.95, opacity: 0, x: 0, y: 0, rotate: 0 };
    }
  };

  const likedClubs = mockClubs.filter((c) => swipes[c.id] === "liked");
  const visibleClubs = recommended.slice(0, isLowPower ? 1 : 2);

  if (!isClient) return null;

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full w-full overflow-hidden bg-neutral-50/50">
      
      {/* Left Area: Swipe Deck & Headers */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navigation */}
        <header className="shrink-0 flex items-center justify-between px-6 py-5 z-10 relative">
          <h1
            className="text-2xl font-black text-primary-blue tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Discover
          </h1>
          <Link
            href="/likes"
            onClick={() => haptic.trigger("light")}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-primary-blue/10 text-sm font-bold text-primary-red hover:bg-red-tint hover:border-primary-red/20 hover:shadow-md transition-all active:scale-95 shrink-0"
          >
            <Heart className="w-4 h-4 fill-primary-red" />
            <span>View likes</span>
          </Link>
        </header>

        {/* Main Card Area */}
        <main className="flex-1 flex flex-col items-center justify-center relative px-4 pb-12 w-full max-w-md mx-auto relative select-none">
          <div className="relative w-full aspect-3/4 max-h-[75vh] flex items-center justify-center">
            {/* Active Card / Deck Stack */}
            <AnimatePresence mode="popLayout" custom={direction}>
              {visibleClubs.map((club) => {
                const isTop = currentClub && club.id === currentClub.id;
                
                return (
                  <motion.div
                    key={club.id}
                    custom={{ isTop, direction }}
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    exit={isTop ? "exit" : undefined}
                    style={isTop ? { x, rotate, opacity, zIndex: 10 } : { zIndex: 0 }}
                    drag={isTop ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    onDrag={isTop ? handleDrag : undefined}
                    onDragEnd={isTop ? handleDragEnd : undefined}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={cn(
                      "absolute inset-0 bg-white rounded-3xl shadow-xl shadow-primary-blue/8 border border-primary-blue/8 flex flex-col overflow-hidden origin-bottom select-none touch-pan-y will-change-transform",
                      isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
                    )}
                  >
                    <ClubDetailPanel
                      club={club}
                      isLiked={false}
                      onLike={handleLike}
                      onDismiss={handleDismiss}
                      onUnlike={() => {}}
                    />
                    
                    {isTop && !isLowPower && (
                      <>
                        {/* Swipe Stamp Indicators */}
                        <motion.div 
                          style={{ opacity: likeOpacity }}
                          className="absolute top-10 left-10 z-30 border-4 border-green-500 text-green-500 font-black text-3xl uppercase tracking-widest px-4 py-2 rounded-xl rotate-[-12deg] pointer-events-none select-none bg-green-500/10 backdrop-blur-xs"
                        >
                          LIKE
                        </motion.div>
                        <motion.div 
                          style={{ opacity: nopeOpacity }}
                          className="absolute top-10 right-10 z-30 border-4 border-red-500 text-red-500 font-black text-3xl uppercase tracking-widest px-4 py-2 rounded-xl rotate-[12deg] pointer-events-none select-none bg-red-500/10 backdrop-blur-xs"
                        >
                          NOPE
                        </motion.div>
                      </>
                    )}
                  </motion.div>
                );
              }).reverse()}

              {recommended.length === 0 && (
                <motion.div
                  key="end-state"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center text-center p-8 z-10 w-full"
                >
                  <div className="w-20 h-20 bg-blue-tint rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Search className="w-8 h-8 text-primary-blue/30" />
                  </div>
                  <h2
                    className="text-2xl font-bold text-primary-blue mb-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    That&apos;s all we had for now!
                  </h2>
                  <p className="text-primary-blue/50 mb-8 max-w-65">
                    You&apos;ve seen all our recommendations based on your interests.
                  </p>

                  <div className="flex flex-col gap-3 w-full">
                    <Link
                      href="/likes"
                      onClick={() => haptic.trigger("medium")}
                      className="w-full flex items-center justify-center gap-2 bg-primary-red text-white font-bold py-4 rounded-2xl hover:bg-primary-red/90 hover:shadow-lg hover:shadow-primary-red/20 transition-all active:scale-95"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                      Go to your Likes
                    </Link>
                    <a
                      href="https://sg.ashoka.edu.in/platform/organisations-catalogue"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => haptic.trigger("medium")}
                      className="w-full flex items-center justify-center gap-2 bg-white text-primary-blue font-bold py-4 rounded-2xl border-2 border-primary-blue/15 hover:border-primary-blue/25 hover:bg-blue-tint transition-all active:scale-95"
                    >
                      View Full Catalogue
                    </a>
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
          </div>
        </main>

        {/* Bottom Navigation */}
        <footer className="shrink-0 flex items-center justify-center py-6 px-6 z-10">
          <a
            href="https://sg.ashoka.edu.in/platform/organisations-catalogue"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => haptic.trigger("light")}
            className="text-sm font-semibold text-primary-blue/45 hover:text-primary-blue transition-colors underline decoration-primary-blue/20 underline-offset-4"
          >
            View full catalogue
          </a>
        </footer>
      </div>

      {/* Right Column: "Your Likes" sidebar (Desktop only) */}
      <aside className="hidden lg:flex flex-col w-96 shrink-0 border-l border-primary-blue/8 bg-white/40 backdrop-blur-md p-6 h-full overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-primary-red text-primary-red" />
            <h2 className="font-black text-lg text-primary-blue tracking-tight">Your Likes</h2>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold bg-primary-red/10 text-primary-red rounded-full">
            {likedClubs.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
          {likedClubs.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {likedClubs.map((club) => (
                <motion.div
                  key={club.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-primary-blue/6 shadow-sm hover:shadow-md hover:border-primary-blue/15 transition-all group animate-in fade-in duration-200"
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shrink-0"
                    style={{
                      background: `linear-gradient(135deg, hsl(${(club.name.charCodeAt(0) * 13) % 360}, 80%, 45%), hsl(${(club.name.charCodeAt(club.name.length - 1) * 27) % 360}, 80%, 30%))`
                    }}
                  >
                    {club.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-extrabold text-primary-blue truncate">{club.name}</p>
                    <p className="text-[10px] font-bold text-primary-blue/40 uppercase tracking-wider mt-0.5">{club.type}</p>
                  </div>
                  <button
                    onClick={() => handleUnlike(club.id)}
                    className="p-2 rounded-xl text-primary-blue/30 hover:text-primary-red hover:bg-red-tint transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Unlike club"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center text-primary-blue/40">
              <Heart className="w-8 h-8 mb-2 stroke-1" />
              <p className="text-xs font-semibold">Clubs you like will appear here</p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-primary-blue/8 flex flex-col gap-2">
          <Link
            href="/likes"
            onClick={() => haptic.trigger("medium")}
            className="w-full flex items-center justify-center gap-2 bg-primary-blue text-white text-xs font-bold py-3.5 rounded-xl hover:bg-primary-blue/90 shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            Manage Likes Page
          </Link>
        </div>
      </aside>
    </div>
  );
}
