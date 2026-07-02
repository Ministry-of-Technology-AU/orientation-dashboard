"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FileText, CheckCircle2, Circle, ArrowRight, ChevronDown,
  Calendar, MessageCircle, MapPin
} from "lucide-react";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { TourStep } from "@/components/guided-tour";
import { useWebHaptics } from "web-haptics/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { GuideMeta } from "@/lib/notion";
import { Confetti } from "@/components/ui/confetti";
import type { ConfettiApi } from "@/components/ui/confetti";
import { toast } from "sonner";

// ── localStorage helpers ─────────────────────────────────────────────────────
function loadCompleted(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem("orientation-guides-completed");
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}
function saveCompleted(set: Set<string>) {
  localStorage.setItem("orientation-guides-completed", JSON.stringify([...set]));
}

// ── Greeting ─────────────────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ── Level label ──────────────────────────────────────────────────────────────
function getLevelLabel(pct: number): { icon: string; label: string } {
  if (pct === 0) return { icon: "🌱", label: "Just Getting Started" };
  if (pct < 50) return { icon: "🌿", label: "Finding Your Way" };
  if (pct < 100) return { icon: "🌳", label: "Almost There" };
  return { icon: "🎓", label: "Ashoka Ready!" };
}

// ── Circular progress ring ────────────────────────────────────────────────────
function ProgressRing({ pct, size = 72 }: { pct: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const isComplete = pct >= 100;
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        strokeWidth={6} stroke="rgba(10,56,100,0.08)" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        strokeWidth={6}
        stroke={isComplete ? "#10b981" : "#0A3864"}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.22,1,0.36,1), stroke 0.4s ease" }}
      />
    </svg>
  );
}

// ── Interactive checkbox ──────────────────────────────────────────────────────
function InteractiveCheckbox({
  defaultChecked,
  disabled = false,
  onChange,
}: {
  defaultChecked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  const haptic = useWebHaptics();
  useEffect(() => { setChecked(defaultChecked); }, [defaultChecked]);
  const toggle = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (disabled) return;
    const next = !checked; setChecked(next);
    onChange?.(next);
    haptic.trigger(next ? "success" : "light");
  };
  return (
    <button type="button" role="checkbox" aria-checked={checked} onClick={toggle} disabled={disabled}
      className={cn(
        "peer h-5 w-5 shrink-0 rounded border-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 inline-flex items-center justify-center transition-all duration-200 align-middle -mt-0.5 mr-2.5 cursor-pointer select-none",
        checked ? "bg-primary-blue border-primary-blue text-[#FAF6F0]" : "border-primary-blue/20 bg-transparent hover:border-primary-blue/40 hover:bg-primary-blue/5"
      )}>
      {checked && (
        <svg className="w-3.5 h-3.5 fill-none stroke-current animate-in fade-in zoom-in-75 duration-100" strokeWidth={3.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

// ── Mascot images by guide index ─────────────────────────────────────────────
const MASCOT_IMAGES = ["/bijlee_waving.png", "/bijlee_reading.png", "/bijlee_exploring.png"];

type Phase = "splash" | "settling" | "done";

export default function HomePageClient({
  isOnboarded,
  guides,
  userName,
  initialCompletedGuideIds = [],
  hasConfirmedInternationalGuidelines,
}: {
  isOnboarded: boolean;
  guides: GuideMeta[];
  userName: string | null;
  initialCompletedGuideIds?: string[];
  hasConfirmedInternationalGuidelines?: boolean;
}) {
  const haptic = useWebHaptics();
  const confettiRef = useRef<ConfettiApi | null>(null);

  const [selectedId, setSelectedId] = useState<string>(guides[0]?.id ?? "");
  const [contentCache, setContentCache] = useState<Map<string, string>>(new Map());
  const [contentLoading, setContentLoading] = useState(false);
  const [visible, setVisible] = useState(true);
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set(initialCompletedGuideIds));
  const [intlConfirmed, setIntlConfirmed] = useState(hasConfirmedInternationalGuidelines ?? false);
  const [isConfirmingIntl, setIsConfirmingIntl] = useState(false);
  const prevId = useRef(selectedId);
  const prevCompletedCount = useRef(0);

  const [phase, setPhase] = useState<Phase>(isOnboarded ? "done" : "splash");
  const [canContinue, setCanContinue] = useState(false);

  const tabBarRef = useRef<HTMLDivElement>(null);
  const [isWelcomeCollapsed, setIsWelcomeCollapsed] = useState(false);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const [scrollPct, setScrollPct] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const guideReaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) setIsWelcomeCollapsed(true);
  }, []);

  const checkScroll = () => {
    const el = contentScrollRef.current;
    if (!el) return;
    const isScrollable = el.scrollHeight > el.clientHeight;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 12;
    setShowScrollHint(isScrollable && !atBottom);
    const pct = el.scrollHeight <= el.clientHeight ? 0
      : Math.min(100, (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
    setScrollPct(pct);
  };

  const fetchContent = useCallback(async (id: string) => {
    if (!id || contentCache.has(id)) return;
    setContentLoading(true);
    try {
      const res = await fetch(`/api/guides/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { markdown?: string };
      setContentCache(prev => new Map(prev).set(id, data.markdown ?? ""));
    } catch (err) {
      console.error(`Failed to fetch content for guide ${id}:`, err);
      setContentCache(prev => new Map(prev).set(id, ""));
    } finally {
      setContentLoading(false);
    }
  }, [contentCache]);

  useEffect(() => {
    if (guides.length > 0) fetchContent(guides[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guides]);

  useEffect(() => {
    if (contentScrollRef.current) contentScrollRef.current.scrollTop = 0;
    setScrollPct(0);
    const timer = setTimeout(checkScroll, 60);
    return () => clearTimeout(timer);
  }, [selectedId, visible]);

  useEffect(() => {
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  useEffect(() => {
    if (phase !== "splash") return;
    const t = setTimeout(() => setCanContinue(true), 3500);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    const localCompleted = loadCompleted();
    queueMicrotask(() => {
      setCompletedIds(prev => {
        const next = new Set([...prev, ...localCompleted]);
        saveCompleted(next);
        return next;
      });
    });
    localCompleted.forEach((guideId) => {
      if (!initialCompletedGuideIds.includes(guideId)) {
        fetch("/api/dashboard/progress", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "completeGuide", guideId }),
        }).catch(err => console.error("Failed to sync local guide completion:", err));
      }
    });
    if (!isOnboarded) {
      try {
        if (localStorage.getItem("orientation-hub-onboarded") === "true") setPhase("done");
      } catch { }
    }
  }, [initialCompletedGuideIds, isOnboarded]);

  useEffect(() => {
    if (isOnboarded) {
      try { localStorage.setItem("orientation-hub-onboarded", "true"); } catch { }
    }
  }, [isOnboarded]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("onboarding_answers");
      if (!raw) return;
      const answers: Record<string, string | string[]> = JSON.parse(raw);
      const petName = typeof answers.name === "string" ? answers.name : undefined;
      const city = typeof answers.city === "string" ? answers.city : undefined;
      const phoneNumber = typeof answers.phone === "string" ? answers.phone : undefined;
      const interests = { question1: Array.isArray(answers.interests) ? answers.interests : [], question2: Array.isArray(answers.hobbies) ? answers.hobbies : [] };
      fetch("/api/user", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ petName, city, phoneNumber, interests, isOnboarded: true }) })
        .then(res => res.ok && localStorage.removeItem("onboarding_answers"))
        .catch(err => console.error("Failed to sync onboarding answers:", err));
    } catch { }
  }, []);

  useEffect(() => {
    if (phase === "done") {
      if (typeof window !== "undefined") {
        (window as any).__welcomeSplashDismissed = true;
        window.dispatchEvent(new Event("welcomeSplashDismissed"));
      }
    }
  }, [phase]);

  useEffect(() => {
    if (!tabBarRef.current) return;
    const activeBtn = tabBarRef.current.querySelector("[data-active='true']") as HTMLElement | null;
    activeBtn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [selectedId]);

  // Fire confetti when all guides newly completed
  useEffect(() => {
    if (guides.length === 0) return;
    const count = completedIds.size;
    if (count === guides.length && prevCompletedCount.current < guides.length) {
      confettiRef.current?.fire({
        particleCount: 200,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors: ["#0A3864", "#A61017", "#e6edf5", "#f9e8e9", "#10b981"],
      });
    }
    prevCompletedCount.current = count;
  }, [completedIds, guides.length]);

  const handleIntlConfirm = (checked: boolean) => {
    setIntlConfirmed(checked);
    haptic.trigger("medium");
  };

  function dismissSplash() {
    if (!canContinue) return;
    haptic.trigger("medium");
    setPhase("settling");
    try { localStorage.setItem("orientation-hub-onboarded", "true"); } catch { }
    fetch("/api/user", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isOnboarded: true }) })
      .catch(err => console.error("Error setting onboarding complete:", err));
    setTimeout(() => setPhase("done"), 900);
  }

  function select(id: string) {
    if (id === selectedId) return;
    haptic.trigger("selection");
    setVisible(false);
    setTimeout(() => { setSelectedId(id); prevId.current = id; setVisible(true); }, 180);
  }

  function toggleComplete(id: string) {
    setCompletedIds(prev => {
      const next = new Set(prev);
      const was = next.has(id);
      if (was) next.delete(id);
      else next.add(id);
      haptic.trigger(was ? "light" : "success");
      saveCompleted(next);
      fetch("/api/dashboard/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: was ? "uncompleteGuide" : "completeGuide", guideId: id }),
      }).catch(err => console.error("Failed to persist guide completion:", err));
      return next;
    });
  }

  function goNext() {
    const idx = guides.findIndex(g => g.id === selectedId);
    if (idx < guides.length - 1) { const nid = guides[idx + 1].id; select(nid); fetchContent(nid); }
  }

  async function handleNextGuide() { 
    toggleComplete(selectedId); 
    
    // Sync the international confirmation if we are on the international guide
    const guide = guides.find(g => g.id === selectedId);
    if (guide?.title?.toLowerCase().includes("international")) {
      try {
        await fetch("/api/user", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hasConfirmedInternationalGuidelines: intlConfirmed }),
        });
        if (intlConfirmed) {
          toast.success("Guidelines confirmed!");
        }
      } catch (err) {
        console.error("Failed to sync international guidelines confirmation:", err);
      }
    }

    goNext(); 
  }

  function scrollToReader() {
    guideReaderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const guide = guides.find(g => g.id === selectedId) ?? guides[0];
  const isCompleted = selectedId ? completedIds.has(selectedId) : false;
  const currentIdx = guides.findIndex(g => g.id === selectedId);
  const isLast = currentIdx === guides.length - 1;
  const completedCount = guides.filter(g => completedIds.has(g.id)).length;
  const currentMarkdown = selectedId ? (contentCache.get(selectedId) ?? null) : null;
  const progressPct = guides.length > 0 ? Math.round((completedCount / guides.length) * 100) : 0;
  const { icon: levelIcon, label: levelLabel } = getLevelLabel(progressPct);

  // firstName from userName
  const firstName = userName?.split(" ")[0] ?? null;

  // ── Empty state ────────────────────────────────────────────────────────────
  if (guides.length === 0) {
    return (
      <main className="flex-1 overflow-y-auto min-w-0 flex flex-col">
        <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-5 shrink-0">
          <p className="text-[10px] font-bold tracking-[0.2em] text-primary-blue/25 uppercase mb-1.5 sm:mb-2">
            Orientation Dashboard · Ashoka University
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-blue leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            Welcome to Ashoka.
          </h1>
        </div>
        <div className="mx-4 sm:mx-8 mb-6 flex flex-col items-center justify-center rounded-2xl border border-primary-blue/8 bg-white/40 py-16 text-center">
          <Image src="/bijlee_reading.png" alt="Bijlee reading" width={80} height={80} className="mb-4 object-contain" />
          <h2 className="text-lg font-semibold text-primary-blue/60 mb-2" style={{ fontFamily: "var(--font-display)" }}>Guides coming soon</h2>
          <p className="text-sm text-primary-blue/35 max-w-[30ch]">Orientation guides are being prepared. Check back shortly.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Confetti canvas */}
      <Confetti ref={confettiRef} manualstart className="!fixed !inset-0 !z-[9998] pointer-events-none" />

      {/* ── SPLASH ────────────────────────────────────────────────────────── */}
      {phase !== "done" && (
        <div
          aria-modal="true" role="dialog" aria-label="Welcome to Ashoka University"
          onClick={dismissSplash}
          style={{
            position: "fixed", inset: 0, zIndex: 9999, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            cursor: canContinue ? "pointer" : "default",
            background: "rgba(250, 246, 240, 0.92)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
            opacity: phase === "settling" ? 0 : 1,
            transition: phase === "settling" ? "opacity 0.55s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
          }}
        >
          <div aria-hidden="true" style={{ position: "absolute", width: "min(560px, 90vw)", height: "min(560px, 90vw)", borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(166, 16, 23, 0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ textAlign: "center", maxWidth: "min(580px, 90vw)", padding: "0 1.5rem", transform: phase === "settling" ? "translateY(-40px) scale(0.9)" : "translateY(0) scale(1)", transition: phase === "settling" ? "opacity 0.5s ease-in, transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)" : "none", animation: "splash-rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both" }}>
            {/* Mascot waving */}
            <div style={{ animation: "splash-fade-in 0.9s 0.1s cubic-bezier(0.22, 1, 0.36, 1) both", display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
              <Image src="/bijlee_waving.png" alt="Bijlee waving" width={120} height={120} style={{ objectFit: "contain" }} />
            </div>
            <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(10, 56, 100, 0.35)", marginBottom: "1rem", fontFamily: "var(--font-sans)", animation: "splash-fade-in 0.7s 0.3s ease-out both" }}>
              Office of Student Affairs · Ashoka University
            </p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 700, lineHeight: 1.2, color: "#0A3864", marginBottom: "1.5rem", animation: "splash-fade-in 0.9s 0.15s cubic-bezier(0.22, 1, 0.36, 1) both" }}>
              Congratulations &<br />
              <span style={{ fontStyle: "italic", color: "#A61017", display: "inline-block", animation: "splash-fade-in 0.9s 0.35s cubic-bezier(0.22, 1, 0.36, 1) both" }}>Welcome to Ashoka!</span>
            </h1>
            <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "clamp(0.9rem, 1.8vw, 1.05rem)", lineHeight: 1.8, color: "rgba(10, 56, 100, 0.72)", maxWidth: "52ch", margin: "0 auto 2rem", animation: "splash-fade-in 0.9s 0.6s cubic-bezier(0.22, 1, 0.36, 1) both" }}>
              &ldquo;You are about to begin an incredible journey, and it all starts here. Get ready to connect, explore, and grow as you prepare for success in your undergraduate journey. At Ashoka, you will find a community that inspires you to flourish and truly thrive. Let the adventure begin!&rdquo;
            </p>
            <div aria-hidden="true" style={{ width: "3rem", height: "1.5px", background: "rgba(10, 56, 100, 0.18)", margin: "0 auto 2rem", animation: "splash-fade-in 0.7s 0.8s ease-out both" }} />
            <div style={{ animation: "splash-fade-in 0.7s 1.1s ease-out both", minHeight: "2.25rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {canContinue ? (
                <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(10, 56, 100, 0.4)", fontFamily: "var(--font-sans)", animation: "splash-pulse 2s ease-in-out infinite" }}>
                  Tap anywhere to continue
                </span>
              ) : (
                <span style={{ display: "inline-flex", gap: "5px", alignItems: "center", height: "8px" }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} aria-hidden="true" style={{ width: "5px", height: "5px", borderRadius: "50%", background: "rgba(10, 56, 100, 0.25)", display: "inline-block", animation: `splash-dot 1.2s ${i * 0.2}s ease-in-out infinite` }} />
                  ))}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN PAGE ────────────────────────────────────────────────────────── */}
      <main
        className="flex-1 overflow-y-auto min-w-0 flex flex-col"
        style={{
          opacity: phase === "done" ? 1 : 0,
          transform: phase === "done" ? "translateY(0)" : "translateY(16px)",
          transition: phase === "done" ? "opacity 0.55s 0.1s cubic-bezier(0.22, 1, 0.36, 1), transform 0.55s 0.1s cubic-bezier(0.22, 1, 0.36, 1)" : "none",
        }}
      >
        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="px-4 sm:px-8 pt-6 sm:pt-8 pb-0 shrink-0"
        >
          <p className="text-[10px] font-bold tracking-[0.2em] text-primary-blue/25 uppercase mb-3 sm:mb-4">
            Orientation Dashboard · Ashoka University
          </p>

          {/* Greeting row */}
          <div className="flex items-center gap-4 mb-4">
            {/* Progress ring + text */}
            <div className="relative shrink-0" title={`${progressPct}% complete`}>
              <ProgressRing pct={progressPct} size={68} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[12px] font-bold text-primary-blue tabular-nums leading-none">{progressPct}%</span>
              </div>
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-primary-blue leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                {getGreeting()}{firstName ? `, ${firstName}` : ""}!
              </h1>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-sm text-primary-blue/50">
                  {completedCount}/{guides.length} guides complete
                </span>
                <span className="text-[11px] bg-primary-blue/6 text-primary-blue/60 rounded-full px-2 py-0.5 font-medium">
                  {levelIcon} {levelLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Quick-action chips */}
          <div className="flex flex-wrap gap-2 mb-5 sm:mb-6">
            {(() => {
              const firstIncomplete = guides.find(g => !completedIds.has(g.id));
              return firstIncomplete ? (
                <button
                  onClick={() => { select(firstIncomplete.id); fetchContent(firstIncomplete.id); setTimeout(scrollToReader, 300); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-primary-blue text-white hover:bg-primary-blue/90 transition-colors active:scale-95 cursor-pointer touch-manipulation"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Continue Reading
                </button>
              ) : null;
            })()}
            <Link href="/chat" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-primary-blue/8 text-primary-blue hover:bg-primary-blue/14 transition-colors active:scale-95 cursor-pointer touch-manipulation">
              <MessageCircle className="w-3.5 h-3.5" />
              Ask Bijlee
            </Link>
            <Link href="/calendar" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-primary-blue/8 text-primary-blue hover:bg-primary-blue/14 transition-colors active:scale-95 cursor-pointer touch-manipulation">
              <Calendar className="w-3.5 h-3.5" />
              Events
            </Link>
            <Link href="/explore" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-primary-blue/8 text-primary-blue hover:bg-primary-blue/14 transition-colors active:scale-95 cursor-pointer touch-manipulation">
              <MapPin className="w-3.5 h-3.5" />
              Explore
            </Link>
          </div>
        </motion.div>

        {/* ── SLO WELCOME CARD ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mx-4 sm:mx-8 mb-4 sm:mb-5 shrink-0"
        >
          <div className="relative rounded-2xl overflow-hidden border border-primary-red/15 bg-gradient-to-br from-red-tint/80 to-blue-tint/50 shadow-[0_4px_16px_rgba(166,16,23,0.06)]">
            <div aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-red/50 to-primary-red/10 rounded-l-sm" />
            <div className="absolute -left-8 -top-8 w-40 h-40 rounded-full pointer-events-none bg-primary-red/5" aria-hidden="true" />

            <div onClick={() => { haptic.trigger("light"); setIsWelcomeCollapsed(!isWelcomeCollapsed); }} className="relative flex items-center justify-between gap-4 px-5 py-4 cursor-pointer hover:bg-white/30 transition-colors select-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex flex-col items-center justify-center gap-0.5 shrink-0 border-[1.5px] border-primary-red/20 bg-white/80">
                  <span className="text-[7px] font-black tracking-widest text-primary-red/60 uppercase">SLO</span>
                  <div className="w-4 h-px bg-primary-red/20" />
                  <span className="text-[5px] font-semibold tracking-wider text-primary-blue/35 uppercase">Ashoka</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold tracking-[0.2em] text-primary-red/40 uppercase mb-0.5">Student Life Office</p>
                  <h3 className="text-[13.5px] font-bold text-primary-blue font-display">Welcome to Ashoka University!</h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-primary-blue/40 hidden xs:inline">{isWelcomeCollapsed ? "Read letter" : "Collapse"}</span>
                <ChevronDown className={cn("w-4 h-4 text-primary-blue/40 transition-transform duration-200", !isWelcomeCollapsed && "rotate-180")} />
              </div>
            </div>

            <AnimatePresence initial={false}>
              {!isWelcomeCollapsed && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: "easeInOut" }} className="overflow-hidden">
                  <div className="px-5 pb-5 pt-1 border-t border-primary-blue/5">
                    <p className="text-[13.5px] leading-[1.8] italic text-center sm:text-left" style={{ fontFamily: "var(--font-display)", color: "rgba(10, 56, 100, 0.78)" }}>
                      &ldquo;Congratulations and Welcome to Ashoka University! You are about to begin an incredible journey, and it all starts here. Get ready to connect, explore, and grow as you prepare for success in your undergraduate journey. At Ashoka, you will find a community that inspires you to flourish and truly thrive. Let the adventure begin!&rdquo;
                    </p>
                    <p className="text-primary-blue/35 text-[11px] mt-2 text-center sm:text-left">— Office of Student Affairs, Ashoka University &nbsp;·&nbsp; Batch of UG 2029</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="px-5 sm:px-7 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-primary-red/10 bg-white/40">
              {[["Online Orientation", "11 Aug 2026"], ["O-Week begins", "18 Aug 2026"], ["Move-in", "Before 18 Aug 2026"]].map(([label, value]) => (
                <span key={label} className="text-[11px] text-primary-blue/30 whitespace-nowrap">
                  {label}: <span className="text-primary-blue/55 font-medium">{value}</span>
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── GUIDE READER ─────────────────────────────────────────────────────── */}
        <TourStep id="home-guides" title="Orientation Guides" content="Read through each guide carefully — they cover everything you need before and after arriving on campus. Mark each one complete as you go." order={8} position="top" className="mx-4 sm:mx-8 mb-6 sm:mb-8 flex flex-col flex-1 min-h-[500px] md:min-h-[600px] relative z-10">

          <div ref={guideReaderRef} className="flex flex-col md:flex-row w-full rounded-2xl border-2 border-primary-blue/15 bg-white/80 backdrop-blur-md overflow-hidden flex-1 min-h-[500px] md:min-h-[600px] shadow-[0_8px_30px_rgba(10,56,100,0.06)] relative">

            {/* ── MOBILE: horizontal tab strip ── */}
            <div className="md:hidden shrink-0 border-b border-primary-blue/8 bg-white/30">
              {/* Reading progress bar */}
              <div className="h-0.5 bg-primary-blue/5">
                <div className="h-full bg-primary-blue/30 transition-all duration-200" style={{ width: `${scrollPct}%` }} />
              </div>
              {/* Completion progress bar */}
              <div className="h-0.5 bg-primary-blue/5">
                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${guides.length > 0 ? (completedCount / guides.length) * 100 : 0}%` }} />
              </div>

              <div ref={tabBarRef} className="flex overflow-x-auto scrollbar-none px-3 py-2 gap-1.5" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
                {guides.map(({ id, iconName, label }) => {
                  const isActive = id === selectedId;
                  const isDone = completedIds.has(id);
                  return (
                    <button key={id} data-active={isActive} onClick={() => { select(id); fetchContent(id); }}
                      className={["shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-all duration-150 relative whitespace-nowrap touch-manipulation z-0", isActive ? "text-primary-blue" : "text-primary-blue/45 hover:text-primary-blue/70 hover:bg-primary-blue/4"].join(" ")}>
                      {isActive && <motion.span layoutId="activeGuideTabMobileBg" className="absolute inset-0 bg-primary-blue/8 rounded-xl -z-10" transition={{ type: "spring", stiffness: 350, damping: 30 }} />}
                      {isActive && <motion.span layoutId="activeGuideTabMobileIndicator" className="absolute bottom-0 left-3 right-3 h-0.5 rounded-t-full bg-primary-red" transition={{ type: "spring", stiffness: 350, damping: 30 }} />}
                      <DynamicIcon name={iconName} className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-primary-red" : ""}`} />
                      {label}
                      {isDone && <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-500 ml-0.5" />}
                    </button>
                  );
                })}
              </div>

              <div className="px-4 pb-2 flex items-center justify-between">
                <p className="text-[9px] font-black tracking-[0.18em] text-primary-blue/20 uppercase">Guides</p>
                <span className="text-[9px] font-semibold text-primary-blue/30 tabular-nums">
                  {completedCount}/{guides.length}
                  {guides.length > 0 && completedCount === guides.length && <span className="ml-1.5 text-emerald-600"> · All complete!</span>}
                </span>
              </div>
            </div>

            {/* ── DESKTOP: vertical nav ── */}
            <nav className="hidden md:flex w-48 shrink-0 border-r border-primary-blue/8 py-3 flex-col">
              {/* Reading progress bar */}
              <div className="h-0.5 bg-primary-blue/5 mb-0">
                <div className="h-full bg-primary-blue/25 transition-all duration-200" style={{ width: `${scrollPct}%` }} />
              </div>

              <div className="px-4 pb-2 pt-3 flex items-center justify-between shrink-0">
                <p className="text-[9px] font-black tracking-[0.2em] text-primary-blue/25 uppercase">Guides</p>
                <span className="text-[9px] font-semibold text-primary-blue/30 tabular-nums">{completedCount}/{guides.length}</span>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-none py-1">
                {guides.map(({ id, iconName, label }) => {
                  const isActive = id === selectedId;
                  const isDone = completedIds.has(id);
                  return (
                    <button key={id} onClick={() => { select(id); fetchContent(id); }}
                      className={["w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 relative z-0", isActive ? "text-primary-blue" : "text-primary-blue/40 hover:text-primary-blue/70 hover:bg-primary-blue/4"].join(" ")}>
                      {isActive && <motion.span layoutId="activeGuideTabDesktopBg" className="absolute inset-0 bg-primary-blue/4 rounded-xl -z-10" transition={{ type: "spring", stiffness: 350, damping: 30 }} />}
                      {isActive && <motion.span layoutId="activeGuideTabDesktopIndicator" className="absolute left-0 inset-y-1.5 w-0.75 rounded-r-full bg-primary-red" transition={{ type: "spring", stiffness: 350, damping: 30 }} />}
                      <DynamicIcon name={iconName} className={`w-3.5 h-3.5 shrink-0 transition-colors ${isActive ? "text-primary-red" : ""}`} />
                      <span className={`text-[13px] font-medium flex-1 ${isActive ? "text-primary-blue" : ""}`}>{label}</span>
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto px-4 pt-3 pb-2 shrink-0">
                <div className="w-full h-1 rounded-full bg-primary-blue/8 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${guides.length > 0 ? (completedCount / guides.length) * 100 : 0}%` }} />
                </div>
                {guides.length > 0 && completedCount === guides.length && (
                  <p className="text-[9px] text-emerald-600 font-semibold mt-1.5 text-center">All guides complete!</p>
                )}
              </div>
            </nav>

            {/* ── Content panel ── */}
            <div className="flex-1 min-w-0 flex flex-col overflow-hidden transition-opacity" style={{ opacity: visible ? 1 : 0, transitionDuration: "180ms" }}>
              <div className="flex-1 relative flex flex-col min-h-0">
                <div ref={contentScrollRef} onScroll={checkScroll} className="flex-1 px-5 sm:px-8 py-5 sm:py-7 overflow-y-auto overflow-x-hidden">

                  {guide && (
                    <div
                      className={cn(
                        "flex flex-row items-center gap-3 sm:gap-6 p-4 sm:p-6 mb-4 sm:mb-8 rounded-2xl border border-primary-blue/10 shadow-sm relative overflow-hidden",
                        !guide.coverImage && "bg-gradient-to-r from-blue-tint/60 to-white"
                      )}
                      style={
                        guide.coverImage
                          ? {
                            backgroundImage: `linear-gradient(to right, rgba(230, 237, 245, 0.75) 30%, rgba(255, 255, 255, 0.45) 100%), url(${guide.coverImage})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                          : undefined
                      }
                    >

                      <div className="hidden sm:block shrink-0 relative z-10">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-md border-[3px] border-white overflow-hidden group hover:scale-105 transition-transform duration-300 cursor-pointer">
                          <Image
                            src={MASCOT_IMAGES[currentIdx % MASCOT_IMAGES.length]}
                            alt="Bijlee"
                            width={72} height={72}
                            className="object-contain group-hover:-translate-y-1 transition-transform duration-300"
                          />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 relative z-10">
                        <h2 className="text-xl sm:text-3xl font-extrabold text-primary-blue leading-tight tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                          {guide.title}
                        </h2>
                        {guide.description && (
                          <p className="text-[15px] text-primary-blue/70 mt-1.5 leading-snug font-medium">{guide.description}</p>
                        )}
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-[10px] font-bold tracking-wider uppercase text-white bg-primary-red px-2.5 py-1 rounded-full shadow-sm">
                            Guide {currentIdx + 1}
                          </span>
                          {isCompleted && (
                            <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="w-full h-px bg-primary-blue/6 mb-5 sm:mb-6" />

                  {/* ── Markdown content ── */}
                  {contentLoading && !currentMarkdown ? (
                    <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="Loading guide content">
                      {["80%", "65%", "90%", "55%", "75%"].map((w, i) => (
                        <div key={i} className="h-3 rounded-full bg-primary-blue/8" style={{ width: w }} />
                      ))}
                    </div>
                  ) : currentMarkdown ? (
                    <div className="guide-content max-w-[70ch]">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => (
                            <h3 className="text-xl sm:text-[26px] font-bold text-primary-blue mt-6 mb-3 first:mt-0 flex items-center gap-2.5" style={{ fontFamily: "var(--font-display)" }}>
                              <span className="w-1.5 h-6 sm:h-7 bg-primary-red rounded-full inline-block shrink-0" />
                              {children}
                            </h3>
                          ),
                          h2: ({ children }) => (
                            <h4 className="text-[18px] sm:text-[22px] font-bold text-primary-blue mt-6 mb-3 border-b-2 border-primary-blue/10 pb-1.5 first:mt-0" style={{ fontFamily: "var(--font-display)" }}>{children}</h4>
                          ),
                          h3: ({ children }) => (
                            <h5 className="text-[16px] sm:text-lg font-bold text-primary-blue/90 mt-4 mb-2 first:mt-0">{children}</h5>
                          ),
                          p: ({ children }) => (
                            <p className="text-[15.5px] sm:text-[16px] text-primary-blue/80 leading-normal mb-3.5">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="pl-2 space-y-0.5 mb-4">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="pl-6 space-y-0.5 mb-4 list-decimal marker:text-primary-red marker:font-bold text-primary-blue/80 text-[15.5px]">{children}</ol>
                          ),
                          li: ({ children, checked, className, ...props }: any) => {
                            const isCheckbox = checked !== undefined || className?.includes("task-list-item");
                            return (
                              <li className={cn("flex items-start gap-2.5 py-1 px-2 rounded-xl hover:bg-blue-tint/40 transition-colors duration-200 group", isCheckbox && "list-none")} {...props}>
                                {!isCheckbox && <div className="mt-[0.65em] w-1.5 h-1.5 rounded-full bg-primary-red/60 group-hover:bg-primary-red transition-colors shrink-0" />}
                                <div className="text-[15.5px] sm:text-[16px] text-primary-blue/80 leading-normal flex-1 min-w-0 wrap-break-word">{children}</div>
                              </li>
                            );
                          },
                          input: ({ checked, type }: any) => {
                            if (type === "checkbox") return <InteractiveCheckbox defaultChecked={!!checked} />;
                            return null;
                          },
                          blockquote: ({ children }) => (
                            <blockquote className="my-4 relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-tint to-transparent border border-primary-blue/10 p-4 pl-12 shadow-sm group hover:shadow-md transition-shadow">
                              <div className="absolute left-3 top-4 text-primary-red/20 group-hover:text-primary-red/40 transition-colors">
                                <MessageCircle className="w-5 h-5 fill-current" />
                              </div>
                              <div className="text-[15px] sm:text-[15.5px] text-primary-blue/90 italic font-medium leading-[1.6] relative z-10">{children}</div>
                            </blockquote>
                          ),
                          code: ({ children, className }) => {
                            const isBlock = className?.startsWith("language-");
                            return isBlock ? (
                              <code className="block bg-primary-blue/4 rounded-lg px-4 py-3 text-[13px] font-mono text-primary-blue/70 my-3 whitespace-pre-wrap break-all">{children}</code>
                            ) : (
                              <code className="bg-primary-blue/6 rounded px-1.5 py-0.5 text-[13px] font-mono text-primary-blue/70">{children}</code>
                            );
                          },
                          hr: () => <hr className="border-none h-px bg-primary-blue/8 my-6" />,
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary-red underline underline-offset-2 hover:text-primary-red/70 transition-colors wrap-break-word">{children}</a>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-primary-blue/90">{children}</strong>
                          ),
                        }}
                      >
                        {currentMarkdown}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-[14px] text-primary-blue/30 italic">No content available for this guide.</p>
                  )}

                  {guide?.title?.toLowerCase().includes("international") && (
                    <div className="mt-8 pt-6 border-t border-primary-blue/10 flex items-start gap-3">
                      <div className="pt-0.5">
                        <InteractiveCheckbox
                          defaultChecked={intlConfirmed}
                          disabled={isConfirmingIntl}
                          onChange={(checked) => handleIntlConfirm(checked)}
                        />
                      </div>
                      <div>
                        <label className="text-[15px] font-medium text-primary-blue leading-snug cursor-pointer select-none" onClick={() => !isConfirmingIntl && handleIntlConfirm(!intlConfirmed)}>
                          I confirm that I have read and understood the above-mentioned guidelines.
                        </label>
                        <p className="text-[13px] text-primary-blue/60 mt-1">This confirmation is required for all international students.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Scroll hint */}
                <div className={["absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center justify-center transition-all duration-300 z-10", showScrollHint ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"].join(" ")}>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/80 backdrop-blur-[2px] border border-primary-blue/5 shadow-[0_2px_8px_rgba(10,56,100,0.04)]" style={{ animation: showScrollHint ? "scroll-bounce 1.6s ease-in-out infinite" : "none" }}>
                    <ChevronDown className="w-4 h-4 text-primary-blue/45" strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="shrink-0 border-t border-primary-blue/8 px-5 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-3">
                <button
                  onClick={() => toggleComplete(selectedId)}
                  className={["flex items-center gap-2 text-[13px] sm:text-[14px] font-medium transition-colors touch-manipulation", isCompleted ? "text-emerald-600 hover:text-emerald-700" : "text-primary-blue/40 hover:text-primary-blue/70"].join(" ")}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Circle className="w-4 h-4 shrink-0" />}
                  <span className="hidden xs:inline">{isCompleted ? "Marked as complete" : "Mark as complete"}</span>
                  <span className="xs:hidden">{isCompleted ? "Complete" : "Mark done"}</span>
                </button>

                {!isLast ? (
                  <button onClick={handleNextGuide} className="flex items-center gap-2 text-[13px] sm:text-[14px] font-semibold text-white bg-primary-blue hover:bg-primary-blue/90 rounded-xl px-4 sm:px-5 py-2 transition-all duration-150 touch-manipulation whitespace-nowrap shadow-sm active:scale-95">
                    Next guide
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                ) : (
                  !isCompleted && (
                    <button onClick={() => toggleComplete(selectedId)} className="flex items-center gap-2 text-[13px] sm:text-[14px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl px-4 sm:px-5 py-2 transition-colors touch-manipulation whitespace-nowrap">
                      <span className="hidden xs:inline">Complete all guides</span>
                      <span className="xs:hidden">Finish</span>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </TourStep>
      </main>

      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }

        @keyframes scroll-bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(4px); }
        }
        @keyframes card-entrance {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes splash-rise {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splash-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splash-pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.8; }
        }
        @keyframes splash-dot {
          0%, 80%, 100% { transform: scale(1);   opacity: 0.3; }
          40%            { transform: scale(1.45); opacity: 0.65; }
        }

        .guide-content img { border-radius: 0.75rem; max-width: 100%; margin: 1rem 0; }

        @media (prefers-reduced-motion: reduce) {
          @keyframes splash-rise    { from { opacity: 0; } to { opacity: 1; } }
          @keyframes splash-fade-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes splash-pulse   { 0%, 100% { opacity: 0.6; } }
          @keyframes splash-dot     { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.65; } }
          @keyframes scroll-bounce  { 0%, 100% { transform: translateY(0); } }
          @keyframes card-entrance  { from { opacity: 0; } to { opacity: 1; } }
        }
      `}</style>
    </>
  );
}
