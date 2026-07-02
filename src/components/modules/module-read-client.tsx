"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Menu, X, ArrowUp, Check, Lock, CheckCircle2, Loader2, BookOpen, Clock } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/motion-primitives/dialog";
import type { TocHeading } from "./module-toc";
import type { MockModule } from "@/mock-data/modules";
import type { Components } from "react-markdown";
import { cn } from "@/lib/utils";

function slugify(text: string): string {
  return text
    .replace(/[*_`#]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function HeadingWithId({ level, children }: { level: 1 | 2 | 3 | 4; children: React.ReactNode }) {
  const text = typeof children === "string"
    ? children
    : Array.isArray(children)
    ? children.map((c) => (typeof c === "string" ? c : "")).join("")
    : "";
  const id = slugify(text);
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4";
  return <Tag id={id}>{children}</Tag>;
}

const mdComponents: Components = {
  h1: ({ children }) => <HeadingWithId level={1}>{children}</HeadingWithId>,
  h2: ({ children }) => <HeadingWithId level={2}>{children}</HeadingWithId>,
  h3: ({ children }) => <HeadingWithId level={3}>{children}</HeadingWithId>,
  h4: ({ children }) => <HeadingWithId level={4}>{children}</HeadingWithId>,
  table: ({ children }) => (
    <div className="overflow-x-auto my-5 rounded-xl border border-primary-blue/10 shadow-sm">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-primary-blue/7">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-primary-blue/8">{children}</tbody>
  ),
  tr: ({ children }) => (
    <tr className="even:bg-primary-blue/3 hover:bg-primary-blue/5 transition-colors">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2.5 text-left text-xs font-bold text-primary-blue whitespace-nowrap border-b border-primary-blue/12">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2.5 text-sm text-primary-blue/70 align-top leading-relaxed border-r border-primary-blue/6 last:border-r-0">
      {children}
    </td>
  ),
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt}
      className="max-w-full h-auto rounded-xl my-6 mx-auto shadow-sm border border-primary-blue/8"
      loading="lazy"
    />
  ),
  code: ({ children }) => (
    <code className="bg-primary-blue/6 text-primary-blue px-1.5 py-0.5 rounded font-mono text-[13px] wrap-break-word">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="bg-primary-blue/4 text-primary-blue p-4 rounded-xl font-mono text-xs overflow-x-auto my-4 border border-primary-blue/8 max-w-full">
      {children}
    </pre>
  ),
};

// Reading-completion thresholds.
const FAST_READ_MODE =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_MODULE_READ_FAST_MODE === "true";
const SECTION_DWELL_MS = 2500; // a heading counts as "seen" after this much continuous viewport time
const COVERAGE_TARGET = FAST_READ_MODE ? 0 : 0.85; // fraction of sections that must be seen (when there are enough sections)
const MIN_SECTIONS_FOR_COVERAGE = 3; // below this, fall back to time + reached-end only
const END_THRESHOLD = FAST_READ_MODE ? 0.1 : 0.9; // scroll progress that counts as "reached the end"
const WORDS_PER_MINUTE = 200;
const MIN_READ_SECONDS = FAST_READ_MODE ? 3 : 20;
const MAX_READ_SECONDS = FAST_READ_MODE ? 5 : 600; // cap the required reading time at 10 minutes
const IDLE_MS = 60_000; // pause the active-time clock after this long without interaction
const LOCAL_SAVE_MS = 3_000; // how often to snapshot resume state to localStorage (crash-resilient)
const DB_SYNC_MS = 30_000; // how often to push resume state to the DB (cross-device)

function formatMMSS(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function ReadRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span
        className={cn(
          "flex items-center justify-center w-4 h-4 rounded-full shrink-0 transition-colors",
          met ? "bg-emerald-500 text-white" : "bg-primary-blue/10 text-transparent"
        )}
      >
        <Check className="w-2.5 h-2.5" />
      </span>
      <span className={cn("truncate", met ? "text-primary-blue/70 font-medium" : "text-primary-blue/40")}>
        {label}
      </span>
    </div>
  );
}

export interface ReadingProgress {
  readSeconds: number;
  seenSections: string[];
  readPercent: number;
  reachedEnd: boolean;
}

export function ModuleReadClient({
  module,
  content,
  headings,
  moduleId,
  alreadyRead = false,
  wordCount = 0,
  initialProgress,
}: {
  module: MockModule;
  content: string;
  headings: TocHeading[];
  moduleId: string;
  alreadyRead?: boolean;
  wordCount?: number;
  initialProgress?: ReadingProgress;
}) {
  const haptic = useWebHaptics();
  const mainRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: mainRef });
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeId, setActiveId] = useState<string>(() => headings[0]?.id ?? "");

  // ── Reading-completion tracking — hydrated from the DB (cross-device) ──────
  const [isRead, setIsRead] = useState(alreadyRead);
  const [saving, setSaving] = useState(false);
  const [seenIds, setSeenIds] = useState<Set<string>>(
    () => new Set(initialProgress?.seenSections ?? [])
  );
  const [activeSeconds, setActiveSeconds] = useState(initialProgress?.readSeconds ?? 0);
  const [reachedEnd, setReachedEnd] = useState(initialProgress?.reachedEnd ?? false);
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);

  const requiredSeconds = Math.min(
    MAX_READ_SECONDS,
    Math.max(MIN_READ_SECONDS, Math.round((wordCount / WORDS_PER_MINUTE) * 60))
  );
  const totalSections = headings.length;
  const coverageRatio = totalSections > 0 ? seenIds.size / totalSections : 1;
  const coverageOk =
    totalSections < MIN_SECTIONS_FOR_COVERAGE ? true : coverageRatio >= COVERAGE_TARGET;
  const timeOk = activeSeconds >= requiredSeconds;
  const allConditionsMet = coverageOk && timeOk && reachedEnd;
  const canMarkRead = allConditionsMet && !isRead && !saving;

  // Live refs so the sync interval reads current values without re-subscribing.
  const activeSecondsRef = useRef(activeSeconds);
  const seenIdsRef = useRef<Set<string>>(seenIds);
  const reachedEndRef = useRef(reachedEnd);
  const scrollPctRef = useRef(initialProgress?.readPercent ?? 0);
  const maxProgressRef = useRef(initialProgress?.readPercent ?? 0);
  const lastSyncSigRef = useRef("");

  // Keep refs in sync so the sync interval always reads current values.
  useEffect(() => {
    activeSecondsRef.current = activeSeconds;
    seenIdsRef.current = seenIds;
    reachedEndRef.current = reachedEnd;
  }, [activeSeconds, seenIds, reachedEnd]);

  const storageKey = `module-read:${moduleId}`;

  const recomputeMaxProgress = () => {
    const coveragePct = totalSections > 0 ? (seenIdsRef.current.size / totalSections) * 100 : 0;
    const candidate = Math.max(scrollPctRef.current, coveragePct);
    if (candidate > maxProgressRef.current) maxProgressRef.current = Math.round(candidate);
  };

  // Snapshot resume state to localStorage (cheap, every few seconds) for instant
  // reload + crash resilience. The DB remains authoritative for cross-device.
  const saveLocal = () => {
    recomputeMaxProgress();
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          readSeconds: activeSecondsRef.current,
          seenSections: [...seenIdsRef.current],
          reachedEnd: reachedEndRef.current,
          maxProgress: maxProgressRef.current,
          scrollTop: mainRef.current?.scrollTop ?? 0,
        })
      );
    } catch {
      // storage unavailable / quota — non-fatal
    }
  };

  // Push the full resume state to the DB. Skips the write when nothing changed
  // (e.g. the reader is idle), unless `force` is set (start / tab-hide).
  const syncDbProgress = (opts?: { keepalive?: boolean; force?: boolean }) => {
    recomputeMaxProgress();
    const payload = {
      started: true,
      readPercent: maxProgressRef.current,
      readSeconds: activeSecondsRef.current,
      seenSections: [...seenIdsRef.current],
      reachedEnd: reachedEndRef.current,
    };
    const sig = `${payload.readPercent}|${payload.readSeconds}|${payload.seenSections.length}|${payload.reachedEnd}`;
    if (!opts?.force && sig === lastSyncSigRef.current) return;
    lastSyncSigRef.current = sig;
    fetch(`/api/modules/${moduleId}/read`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: opts?.keepalive,
    }).catch(() => {});
  };

  // Track which heading sections have been dwelled on long enough to count as read.
  useEffect(() => {
    if (isRead) return;
    const scroller = mainRef.current;
    if (!scroller || headings.length === 0) return;

    const timers = new Map<string, ReturnType<typeof setTimeout>>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            if (!timers.has(id)) {
              timers.set(
                id,
                setTimeout(() => {
                  setSeenIds((prev) => {
                    if (prev.has(id)) return prev;
                    const next = new Set(prev);
                    next.add(id);
                    return next;
                  });
                }, SECTION_DWELL_MS)
              );
            }
          } else {
            const t = timers.get(id);
            if (t) {
              clearTimeout(t);
              timers.delete(id);
            }
          }
        });
      },
      { root: scroller, threshold: 0.4 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      timers.forEach((t) => clearTimeout(t));
    };
  }, [headings, isRead]);

  // Accumulate *active* reading time — paused when the tab is hidden or the reader is idle.
  useEffect(() => {
    if (isRead) return;
    let lastActivity = Date.now();
    const bump = () => {
      lastActivity = Date.now();
    };
    const scroller = mainRef.current;
    scroller?.addEventListener("scroll", bump, { passive: true });
    window.addEventListener("pointermove", bump, { passive: true });
    window.addEventListener("keydown", bump);

    const interval = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastActivity > IDLE_MS) return;
      setActiveSeconds((s) => s + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      scroller?.removeEventListener("scroll", bump);
      window.removeEventListener("pointermove", bump);
      window.removeEventListener("keydown", bump);
    };
  }, [isRead]);

  // Reached-the-end signal + scroll-based progress (short pages count immediately).
  useEffect(() => {
    if (isRead) return;
    const scroller = mainRef.current;
    if (scroller && scroller.scrollHeight - scroller.clientHeight < 50) {
      setReachedEnd(true);
      scrollPctRef.current = 100;
      recomputeMaxProgress();
      return;
    }
    const unsubscribe = scrollYProgress.on("change", (v) => {
      scrollPctRef.current = v * 100;
      recomputeMaxProgress();
      if (v >= END_THRESHOLD) setReachedEnd(true);
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollYProgress, isRead]);

  // On open: merge localStorage (crash-resilient, 3s) with the DB state already
  // in props. Every field is monotonic, so we take max / union / OR — correct for
  // both crash recovery AND cross-device (a fresher DB from another device wins on
  // the fields where it's ahead; a fresher local cache wins where it's ahead).
  // Syncing React state from an external store on mount is the intended use here.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isRead) return;
    let localScrollTop = 0;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.readSeconds === "number" && s.readSeconds > activeSecondsRef.current) {
          setActiveSeconds(s.readSeconds);
        }
        if (Array.isArray(s.seenSections)) {
          setSeenIds((prev) => {
            const merged = new Set(prev);
            let changed = false;
            for (const id of s.seenSections) {
              if (typeof id === "string" && !merged.has(id)) {
                merged.add(id);
                changed = true;
              }
            }
            return changed ? merged : prev;
          });
        }
        if (s.reachedEnd) setReachedEnd(true);
        if (typeof s.maxProgress === "number" && s.maxProgress > maxProgressRef.current) {
          maxProgressRef.current = s.maxProgress;
        }
        if (typeof s.scrollTop === "number") localScrollTop = s.scrollTop;
      }
    } catch {
      // ignore malformed storage
    }
    // Restore scroll: exact px if cached on this device, else approximate by %.
    const pct = maxProgressRef.current;
    requestAnimationFrame(() => {
      const scroller = mainRef.current;
      if (!scroller) return;
      if (localScrollTop > 0) scroller.scrollTop = localScrollTop;
      else if (pct > 0) scroller.scrollTop = (pct / 100) * (scroller.scrollHeight - scroller.clientHeight);
    });
    // Announce "started" so the badge flips to in_progress immediately.
    syncDbProgress({ force: true });

    // Show requirements popup on first entry for this session
    const hasSeenSessionKey = `has-seen-reading-requirements:${moduleId}`;
    if (!sessionStorage.getItem(hasSeenSessionKey)) {
      setShowRequirementsModal(true);
      sessionStorage.setItem(hasSeenSessionKey, "true");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persist locally every few seconds; push to the DB every 30s; reliable final
  // write on tab-hide / navigation via fetch keepalive (no blocking popup).
  useEffect(() => {
    if (isRead) return;
    const localTimer = setInterval(saveLocal, LOCAL_SAVE_MS);
    const dbTimer = setInterval(() => syncDbProgress(), DB_SYNC_MS);

    const flush = () => {
      if (document.visibilityState === "hidden") {
        saveLocal();
        syncDbProgress({ keepalive: true, force: true });
      }
    };
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", flush);

    return () => {
      clearInterval(localTimer);
      clearInterval(dbTimer);
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", flush);
      // Final flush on unmount (e.g. client-side navigation away).
      saveLocal();
      syncDbProgress({ keepalive: true, force: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRead]);

  const handleMarkRead = async () => {
    if (!canMarkRead) return;
    setSaving(true);
    haptic.trigger("medium");
    try {
      const res = await fetch(`/api/modules/${moduleId}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readPercent: 100 }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setIsRead(true);
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // ignore
      }
      toast.success("Module marked as read — activities unlocked!", {
        action: {
          label: "Take me to games",
          onClick: () => {
            window.location.href = `/modules/${module.slug}`;
          },
        },
      });
    } catch (err) {
      console.error("Failed to mark module as read:", err);
      toast.error("Couldn't save your progress. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const scroller = mainRef.current;
    if (!scroller) return;

    let isShown = false;
    const handleScroll = () => {
      const show = scroller.scrollTop > 300;
      if (show !== isShown) {
        isShown = show;
        setShowBackToTop(show);
      }
    };

    scroller.addEventListener("scroll", handleScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const scroller = mainRef.current;
    if (!scroller || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        root: scroller,
        rootMargin: "-90px 0px -75% 0px",
      }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id: string) => {
    haptic.trigger("selection");
    setIsTocOpen(false);
    setActiveId(id);

    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      
      // Visual flash highlight
      el.classList.add("heading-highlight");
      setTimeout(() => {
        el.classList.remove("heading-highlight");
      }, 1800);
    }
  };

  const scrollToTop = () => {
    haptic.trigger("medium");
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleToc = () => {
    haptic.trigger("light");
    setIsTocOpen(!isTocOpen);
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden relative">
      {/* Top sticky bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-primary-blue/8 px-6 py-4 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href="/modules"
            onClick={() => haptic.trigger("light")}
            className="flex items-center gap-2 text-sm font-medium text-primary-blue/50 hover:text-primary-blue transition-colors active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="h-4 w-px bg-primary-blue/15 shrink-0" />
          <p className="text-sm font-semibold text-primary-blue truncate">{module.title}</p>
        </div>

        {/* Action icons / Mobile TOC trigger */}
        {headings.length > 0 && (
          <button
            onClick={toggleToc}
            className="xl:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary-blue/6 text-primary-blue hover:bg-primary-blue/10 transition-all active:scale-95 cursor-pointer"
          >
            <Menu className="w-3.5 h-3.5" />
            Outline
          </button>
        )}

        {/* Scroll Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-100">
          <motion.div
            className="h-full bg-primary-red origin-left w-full"
            style={{ scaleX: scrollYProgress }}
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto min-w-0 relative h-full"
        >
          <div
            className="flex flex-col items-center py-8 md:py-12 xl:grid xl:items-stretch"
            style={{ gridTemplateColumns: "1fr min(44rem) 1fr" }}
          >
            {/* Left gutter — TOC sits here on desktop, right-aligned so it hugs the article */}
            <div className="hidden xl:block relative">
              <div className="sticky top-10 flex justify-end pr-10">
                <div className="w-44">
                  {/* We map the custom click scrolling to make sure it scroll-margin flashes */}
                  <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
                    <div className="mb-4 px-1">
                      <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-primary-blue/30 mb-0.5">
                        On this page
                      </p>
                      <p className="text-[9px] text-primary-blue/40 leading-normal">
                        Spend 2.5s+ on each section to check it off.
                      </p>
                    </div>
                    <nav className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-px bg-primary-blue/10" />
                      <ul className="space-y-px pl-4 relative">
                        {headings.map(({ text, id }) => {
                          const isActive = activeId === id;
                          return (
                            <li key={id} className="relative py-1">
                              {isActive && (
                                <motion.div
                                  layoutId="active-toc-line"
                                  className="absolute -left-4 top-0 bottom-0 w-0.5 bg-primary-blue rounded-full"
                                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                              )}
                              <a
                                href={`#${id}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  scrollToHeading(id);
                                }}
                                className={cn(
                                  "flex items-center justify-between gap-1.5 leading-snug transition-colors duration-150 text-[11px]",
                                  isActive
                                    ? "text-primary-blue font-semibold"
                                    : "text-primary-blue/40 hover:text-primary-blue/65"
                                )}
                              >
                                <span className="truncate">{text}</span>
                                {seenIds.has(id) && (
                                  <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                                )}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>

            {/* Center column — article content */}
            <motion.article 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
              className="module-content px-4 xl:px-0 w-full max-w-3xl xl:max-w-none overflow-hidden wrap-break-word"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {content}
              </ReactMarkdown>
            </motion.article>

            {/* Right gutter — empty balance column */}
            <div className="hidden xl:block" />
          </div>
        </main>
      </div>

      {/* Mobile Drawer (TOC overlay) for small/tablet screens */}
      <AnimatePresence>
        {isTocOpen && (
          <div className="fixed inset-0 z-40 xl:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.38 }}
              exit={{ opacity: 0 }}
              onClick={toggleToc}
              className="absolute inset-0 bg-primary-blue"
            />

            {/* Content Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="absolute right-0 top-0 bottom-0 w-72 max-w-[80vw] bg-white shadow-2xl p-6 flex flex-col z-10 border-l border-primary-blue/10"
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-primary-blue/30 uppercase tracking-widest">
                    Table of Contents
                  </span>
                  <button
                    onClick={toggleToc}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-primary-blue/40 hover:text-primary-blue hover:bg-primary-blue/6 transition-colors active:scale-90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-primary-blue/40 leading-normal">
                  Spend at least 2.5s on each section to mark it as read.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto pr-2">
                <nav className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-primary-blue/10" />
                  <ul className="space-y-2 pl-4 relative">
                    {headings.map(({ text, id }) => {
                      const isActive = activeId === id;
                      return (
                        <li key={id} className="relative py-1">
                          {isActive && (
                            <motion.div
                              layoutId="active-toc-line-mobile"
                              className="absolute -left-4 top-0 bottom-0 w-0.5 bg-primary-blue rounded-full"
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                          <a
                            href={`#${id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              scrollToHeading(id);
                            }}
                            className={cn(
                              "flex items-center justify-between gap-2 leading-snug transition-colors duration-150 text-[12px]",
                              isActive
                                ? "text-primary-blue font-bold"
                                : "text-primary-blue/60 hover:text-primary-blue font-medium"
                            )}
                          >
                            <span className="truncate">{text}</span>
                            {seenIds.has(id) && (
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            )}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reading completion tracker */}
      <div className="fixed inset-x-0 bottom-20 md:bottom-6 z-30 flex justify-center px-4 pointer-events-none">
        <AnimatePresence mode="wait">
          {isRead ? (
            <motion.div
              key="read"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="pointer-events-auto flex items-center gap-3 bg-emerald-500 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>You&apos;ve read this module</span>
              </div>
              <div className="w-px h-4 bg-white/30" />
              <Link
                href={`/modules/${module.slug}`}
                className="text-white hover:text-white/80 transition-colors flex items-center gap-1 cursor-pointer"
              >
                Go to games
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="pointer-events-auto w-full max-w-md bg-white/95 backdrop-blur-md border border-primary-blue/10 rounded-2xl shadow-xl p-3.5 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-primary-blue/40 mb-0.5">
                  Reading Requirements:
                </div>
                <ReadRequirement
                  met={coverageOk}
                  label={
                    totalSections >= MIN_SECTIONS_FOR_COVERAGE
                      ? `Section-wise time limit (${seenIds.size}/${totalSections} read for 2.5s+)`
                      : "Dwell on the content"
                  }
                />
                <ReadRequirement
                  met={timeOk}
                  label={`Overall time limit (${formatMMSS(
                    Math.min(activeSeconds, requiredSeconds)
                  )} / ${formatMMSS(requiredSeconds)})`}
                />
                <ReadRequirement met={reachedEnd} label="Scroll to bottom" />
              </div>
              <button
                onClick={allConditionsMet ? handleMarkRead : () => setShowRequirementsModal(true)}
                disabled={saving}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 text-xs font-semibold rounded-xl px-4 py-2.5 transition-all cursor-pointer active:scale-95",
                  allConditionsMet
                    ? "bg-primary-blue text-white hover:bg-primary-blue/90"
                    : "bg-primary-blue/10 text-primary-blue/60 hover:bg-primary-blue/15"
                )}
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : allConditionsMet ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
                Mark as read
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Back-to-Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-30 flex items-center justify-center gap-1.5 bg-primary-blue text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg hover:bg-primary-blue/90 transition-all active:scale-95 cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Back to top</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Reading Requirements Onboarding & Help Popup */}
      <Dialog open={showRequirementsModal} onOpenChange={setShowRequirementsModal}>
        <DialogContent className="bg-white rounded-2xl w-full max-w-[440px] p-6 flex flex-col gap-5 border border-primary-blue/10 shadow-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5 text-primary-blue">
              <div className="w-8 h-8 rounded-lg bg-primary-blue/6 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-primary-blue">
                  Reading Requirements
                </DialogTitle>
                <p className="text-[11px] text-primary-blue/40 mt-0.5">
                  Complete these steps to unlock games & activities.
                </p>
              </div>
            </div>
            <DialogClose className="w-7 h-7 rounded-lg flex items-center justify-center text-primary-blue/30 hover:text-primary-blue hover:bg-primary-blue/6 transition-colors relative top-0 right-0">
              <X className="w-4 h-4" />
            </DialogClose>
          </div>

          <div className="flex flex-col gap-3 py-1">
            {/* Requirement 1: Section Dwell */}
            <div className={cn(
              "flex items-start gap-3 p-3 rounded-xl border transition-colors",
              coverageOk 
                ? "border-emerald-100 bg-emerald-50/20" 
                : "border-primary-blue/6 bg-primary-blue/2"
            )}>
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                coverageOk ? "bg-emerald-500 text-white" : "bg-primary-blue/10 text-primary-blue/40"
              )}>
                {coverageOk ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-primary-blue">Spend 2.5s+ on each section</p>
                <p className="text-[11px] text-primary-blue/50 mt-0.5">
                  {totalSections >= MIN_SECTIONS_FOR_COVERAGE
                    ? `Dwell on each heading. Read ${seenIds.size} of ${totalSections} sections.`
                    : "Spend time reading each part of the module."}
                </p>
                {totalSections >= MIN_SECTIONS_FOR_COVERAGE && (
                  <div className="w-full bg-primary-blue/8 h-1 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(seenIds.size / totalSections) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Requirement 2: Overall Time */}
            <div className={cn(
              "flex items-start gap-3 p-3 rounded-xl border transition-colors",
              timeOk 
                ? "border-emerald-100 bg-emerald-50/20" 
                : "border-primary-blue/6 bg-primary-blue/2"
            )}>
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                timeOk ? "bg-emerald-500 text-white" : "bg-primary-blue/10 text-primary-blue/40"
              )}>
                {timeOk ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-primary-blue">Minimum overall reading time</p>
                <p className="text-[11px] text-primary-blue/50 mt-0.5">
                  Spend at least {formatMMSS(requiredSeconds)} on this module.
                </p>
                <p className="text-[10px] font-bold text-primary-blue/40 mt-1">
                  Progress: {formatMMSS(Math.min(activeSeconds, requiredSeconds))} / {formatMMSS(requiredSeconds)}
                </p>
                <div className="w-full bg-primary-blue/8 h-1 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (activeSeconds / requiredSeconds) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Requirement 3: Scroll to End */}
            <div className={cn(
              "flex items-start gap-3 p-3 rounded-xl border transition-colors",
              reachedEnd 
                ? "border-emerald-100 bg-emerald-50/20" 
                : "border-primary-blue/6 bg-primary-blue/2"
            )}>
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                reachedEnd ? "bg-emerald-500 text-white" : "bg-primary-blue/10 text-primary-blue/40"
              )}>
                {reachedEnd ? <Check className="w-3 h-3" /> : <ArrowUp className="w-3 h-3 rotate-180" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-primary-blue">Scroll to the bottom</p>
                <p className="text-[11px] text-primary-blue/50 mt-0.5">
                  Make sure to read through to the very end of the content.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowRequirementsModal(false)}
            className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors cursor-pointer active:scale-95"
          >
            Got it, let&apos;s read!
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
