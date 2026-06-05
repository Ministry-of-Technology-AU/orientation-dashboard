"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileText, Map, Navigation2, PackageCheck,
  HeartPulse, Phone, CheckCircle2, Circle, ArrowRight, ChevronDown,
} from "lucide-react";
import { TourStep } from "@/components/guided-tour";
import { useWebHaptics } from "web-haptics/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const GUIDES = [
  {
    id: "documents",
    icon: FileText,
    label: "Documents",
    title: "Documents to Submit",
    description: "Complete your profile and upload all required documents on the dashboard before arriving on campus.",
    items: [
      "Complete Anti-ragging Affidavit on the UGC portal — enter the reference number in the Upload Originals section",
      "Download, fill, and upload the Authorization Form for Emergency Medical & General Health — carry a physical copy to the Registrar's desk on campus",
      "Fill and upload the Student and Parent Handbook Declaration Form",
      "Fill and upload the Residence Leave Approval and Consent Form — read the policy carefully before signing",
      "Upload Class XII mark sheet/transcript and passing certificate (DigiLocker accepted if originals are delayed)",
      "Upload Class X mark sheet/transcript and certificate",
      "Upload Aadhaar card (Indian nationals) or Passport (international students)",
      "Optional: Submit UGC Academic Bank of Credits (ABC) form and enter the 12-digit reference number",
      "Optional: Upload Domicile certificate (Haryana domicile students) or UG mark sheet (transfer students)",
      "Bring all original documents on arrival — the Registrar's Office will verify and return them immediately",
    ],
  },
  {
    id: "campus-tour",
    icon: Map,
    label: "Campus Map",
    title: "Campus Tour",
    description: "Key buildings and facilities you'll be using from day one. Use the virtual campus map to locate your residential block.",
    items: [
      "Use Google Chrome or Safari to view the interactive campus map — Firefox may not render it correctly",
      "Search by residential block name in the map search bar to find your room location",
      "Rooms are twin-sharing with central air-conditioning and window blinds for privacy",
      "Each floor has a pantry: microwave, fridge, induction plate, kettle, and water cooler",
      "Washing machines are available in all residence halls",
      "ACWB (Counselling Centre) — CN313, 3rd Floor, AC04, Library Building",
      "Student Care Office — RH2, Ground Floor",
      "Tuck Shop and Stationery Shop are on campus — good for buying toiletries and supplies after arrival",
    ],
  },
  {
    id: "reach-campus",
    icon: Navigation2,
    label: "Getting Here",
    title: "How to Reach Campus",
    description: "Directions, shuttle timings, and transport options from major hubs to Ashoka University.",
    items: [
      "Refer to the 'How to Reach Ashoka University' PDF and video guide available in the Quick Links section of the dashboard",
      "An updated shuttle schedule is available in the Quick Links section — refer to the shuttle booking guide for instructions",
      "From IGI Airport (T1/T2/T3): ~45 min via NH-44 towards Sonipat, Haryana",
      "From Hazrat Nizamuddin / New Delhi railway station: ~60 min by cab",
      "Nearest railway station: Sonipat Junction — 30 min by auto/cab to campus",
      "Nearest metro: Samaypur Badli (Red Line, Delhi) — take a cab from there",
      "Campus is located in Rajiv Gandhi Education City, Sonipat — GPS: 28.9452° N, 77.0964° E",
    ],
  },
  {
    id: "movein",
    icon: PackageCheck,
    label: "Move-in",
    title: "Move-in Checklist",
    description: "What's in your room and what to bring — so nothing gets left behind before your big move.",
    items: [
      "Room comes with: extra-long single bed (L80\" × W38\") with mattress, 2 bed drawers, overhead bed light",
      "Room comes with: wardrobe/cupboard with mirror, study table & chair, white board, soft board, and bookshelves",
      "Bring: bedding (pillow, sheets, light blanket) — mattress is provided but linen is not",
      "Bring: towels × 2 and personal hygiene essentials",
      "Bring: laptop, charger, and earphones",
      "Bring: rain jacket or umbrella — August is monsoon season during O-Week",
      "Bring: a warm layer — classrooms and the library are heavily air-conditioned",
      "Bring: any personal medications and a copy of your prescription",
      "Tip: buy toiletries and stationery from campus shops after arrival to save packing space",
      "Tip: pack clothes for one season at a time — ideal for students with families living close to campus",
    ],
  },
  {
    id: "health",
    icon: HeartPulse,
    label: "Health & Wellbeing",
    title: "Health & Wellbeing",
    description: "Counselling, mental health support, and student care resources available to all Ashokans.",
    items: [
      "ACWB (Ashoka Centre for Well-Being) offers free, confidential counselling — book via the ACWB Portal or email well.being@ashoka.edu.in",
      "ACWB Helpline: +91-7082000421 (Mon–Fri, 10 AM–6 PM) for appointments and queries",
      "Walk-in sessions for urgent emotional needs: CN313, 3rd Floor, AC04, Library Building",
      "24/7 Mental Health Helplines: 1800-258-8121 | 1800-258-8999 | 1800-202-6121 (toll-free)",
      "Online counselling also available via the '1 to 1 Help' mobile app",
      "Student Care Office: non-clinical case managers for academic, emotional, and wellness support — studentcare@ashoka.edu.in | +91-7082000403",
      "OLS (Office of Learning Support): accessibility, academic accommodations, and assistive technology — ols@ashoka.edu.in",
      "Download the Ashoka mobile app (requires a registered Indian mobile number) for easy access to all campus services",
    ],
  },
  {
    id: "contacts",
    icon: Phone,
    label: "Key Contacts",
    title: "Key Contacts",
    description: "Save these numbers and emails before you arrive on campus.",
    items: [
      "Student Affairs (general queries): studentaffairs@ashoka.edu.in",
      "Registrar's Office (documents & verification): registrar@ashoka.edu.in",
      "ACWB Counselling: well.being@ashoka.edu.in | +91-7082000421 (Mon–Fri, 10 AM–6 PM)",
      "24/7 Mental Health Helpline: 1800-258-8121 (toll-free)",
      "Student Care Office: studentcare@ashoka.edu.in | +91-7082000403",
      "OLS (Learning Support): ols@ashoka.edu.in",
      "OSA Instagram: follow for campus updates and announcements",
    ],
  },
];

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

type Phase = "splash" | "settling" | "done";

export default function HomePageClient({ isOnboarded }: { isOnboarded: boolean }) {
  const haptic = useWebHaptics();

  const [selectedId, setSelectedId] = useState(GUIDES[0].id);
  const [visible, setVisible] = useState(true);
  const [completedIds, setCompletedIds] = useState<Set<string>>(loadCompleted);
  const prevId = useRef(selectedId);

  // Splash state initialized based on DB isOnboarded status
  const [phase, setPhase] = useState<Phase>(!isOnboarded ? "splash" : "done");
  const [canContinue, setCanContinue] = useState(false);

  // Ref for the mobile tab bar — auto-scroll active tab into view
  const tabBarRef = useRef<HTMLDivElement>(null);

  // Welcome card collapse state (starts expanded by default)
  const [isWelcomeCollapsed, setIsWelcomeCollapsed] = useState(false);

  // Scroll tracking for container
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const checkScroll = () => {
    const el = contentScrollRef.current;
    if (!el) return;
    const isScrollable = el.scrollHeight > el.clientHeight;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 12;
    setShowScrollHint(isScrollable && !atBottom);
  };

  // Reset scroll and check height on tab change / visibility change
  useEffect(() => {
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTop = 0;
    }
    const timer = setTimeout(checkScroll, 60);
    return () => clearTimeout(timer);
  }, [selectedId, visible]);

  // Check scroll on window resize
  useEffect(() => {
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  useEffect(() => {
    if (phase !== "splash") return;
    const readTimer = setTimeout(() => setCanContinue(true), 3500);
    return () => clearTimeout(readTimer);
  }, [phase]);

  // Signal to the guided tour provider when the welcome splash is fully dismissed / done
  useEffect(() => {
    if (phase === "done") {
      if (typeof window !== "undefined") {
        (window as any).__welcomeSplashDismissed = true;
        window.dispatchEvent(new Event("welcomeSplashDismissed"));
      }
    }
  }, [phase]);

  // Auto-scroll active tab into view on mobile
  useEffect(() => {
    if (!tabBarRef.current) return;
    const activeBtn = tabBarRef.current.querySelector("[data-active='true']") as HTMLElement | null;
    activeBtn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [selectedId]);

  function dismissSplash() {
    if (!canContinue) return;
    // Haptic: medium impact
    haptic.trigger("medium");
    setPhase("settling");

    // Save flag state to DB
    fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOnboarded: true }),
    }).catch((err) => console.error("Error setting onboarding complete:", err));

    setTimeout(() => setPhase("done"), 900);
  }

  function select(id: string) {
    if (id === selectedId) return;
    // Haptic: selection
    haptic.trigger("selection");
    setVisible(false);
    setTimeout(() => {
      setSelectedId(id);
      prevId.current = id;
      setVisible(true);
    }, 180);
  }

  function toggleComplete(id: string) {
    setCompletedIds(prev => {
      const next = new Set(prev);
      const wasCompleted = next.has(id);
      if (wasCompleted) {
        next.delete(id);
        haptic.trigger("light");
      } else {
        next.add(id);
        haptic.trigger("success");
      }
      saveCompleted(next);
      return next;
    });
  }

  function goNext() {
    const idx = GUIDES.findIndex(g => g.id === selectedId);
    if (idx < GUIDES.length - 1) select(GUIDES[idx + 1].id);
  }

  function handleNextGuide() {
    toggleComplete(selectedId);
    goNext();
  }

  const guide = GUIDES.find(g => g.id === selectedId)!;
  const Icon = guide.icon;
  const isCompleted = completedIds.has(selectedId);
  const currentIdx = GUIDES.findIndex(g => g.id === selectedId);
  const isLast = currentIdx === GUIDES.length - 1;
  const completedCount = GUIDES.filter(g => completedIds.has(g.id)).length;

  return (
    <>
      {/* ── SPLASH OVERLAY ─────────────────────────────────────────────────── */}
      {phase !== "done" && (
        <div
          aria-modal="true"
          role="dialog"
          aria-label="Welcome to Ashoka University"
          onClick={dismissSplash}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: canContinue ? "pointer" : "default",
            background: "rgba(250, 246, 240, 0.88)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            opacity: phase === "settling" ? 0 : 1,
            transition: phase === "settling"
              ? "opacity 0.55s cubic-bezier(0.4, 0, 0.2, 1)"
              : "none",
          }}
        >
          {/* Radial glow */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              width: "min(560px, 90vw)",
              height: "min(560px, 90vw)",
              borderRadius: "50%",
              background: "radial-gradient(ellipse at center, rgba(166, 16, 23, 0.07) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Welcome text */}
          <div
            style={{
              textAlign: "center",
              maxWidth: "min(580px, 90vw)",
              padding: "0 1.5rem",
              transform: phase === "settling" ? "translateY(-40px) scale(0.9)" : "translateY(0) scale(1)",
              transition: phase === "settling"
                ? "opacity 0.5s ease-in, transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)"
                : "none",
              animation: "splash-rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            <p style={{
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.22em",
              textTransform: "uppercase", color: "rgba(10, 56, 100, 0.35)",
              marginBottom: "1.5rem", fontFamily: "var(--font-sans)",
              animation: "splash-fade-in 0.7s 0.3s ease-out both",
            }}>
              Office of Student Affairs · Ashoka University
            </p>

            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: 700, lineHeight: 1.2, color: "#0A3864",
              marginBottom: "1.5rem",
              animation: "splash-fade-in 0.9s 0.15s cubic-bezier(0.22, 1, 0.36, 1) both",
            }}>
              Congratulations &<br />
              <span style={{
                fontStyle: "italic", color: "#A61017", display: "inline-block",
                animation: "splash-fade-in 0.9s 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
              }}>
                Welcome to Ashoka University!
              </span>
            </h1>

            <p style={{
              fontFamily: "var(--font-display)", fontStyle: "italic",
              fontSize: "clamp(0.9rem, 1.8vw, 1.05rem)", lineHeight: 1.8,
              color: "rgba(10, 56, 100, 0.72)", maxWidth: "52ch",
              margin: "0 auto 2rem",
              animation: "splash-fade-in 0.9s 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
            }}>
              &ldquo;You are about to begin an incredible journey, and it all starts here.
              Get ready to connect, explore, and grow as you prepare for success in your undergraduate journey.
              At Ashoka, you will find a community that inspires you to flourish and truly thrive.
              Let the adventure begin!&rdquo;
            </p>

            <div aria-hidden="true" style={{
              width: "3rem", height: "1.5px",
              background: "rgba(10, 56, 100, 0.18)",
              margin: "0 auto 2rem",
              animation: "splash-fade-in 0.7s 0.8s ease-out both",
            }} />

            <div style={{
              animation: "splash-fade-in 0.7s 1.1s ease-out both",
              minHeight: "2.25rem", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              {canContinue ? (
                <span style={{
                  fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "rgba(10, 56, 100, 0.4)",
                  fontFamily: "var(--font-sans)",
                  animation: "splash-pulse 2s ease-in-out infinite",
                }}>
                  Tap anywhere to continue
                </span>
              ) : (
                <span style={{ display: "inline-flex", gap: "5px", alignItems: "center", height: "8px" }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} aria-hidden="true" style={{
                      width: "5px", height: "5px", borderRadius: "50%",
                      background: "rgba(10, 56, 100, 0.25)", display: "inline-block",
                      animation: `splash-dot 1.2s ${i * 0.2}s ease-in-out infinite`,
                    }} />
                  ))}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN PAGE ──────────────────────────────────────────────────────── */}
      <main
        className="flex-1 overflow-y-auto min-w-0 flex flex-col"
        style={{
          opacity: phase === "done" ? 1 : 0,
          transform: phase === "done" ? "translateY(0)" : "translateY(16px)",
          transition: phase === "done"
            ? "opacity 0.55s 0.1s cubic-bezier(0.22, 1, 0.36, 1), transform 0.55s 0.1s cubic-bezier(0.22, 1, 0.36, 1)"
            : "none",
        }}
      >
        {/* ── Header ── */}
        <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-5 shrink-0">
          <p className="text-[10px] font-bold tracking-[0.2em] text-primary-blue/25 uppercase mb-1.5 sm:mb-2">
            Orientation Dashboard · Ashoka University
          </p>
          <h1
            className="text-3xl sm:text-4xl font-bold text-primary-blue leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Welcome to Ashoka.
          </h1>
        </div>

        {/* ── SLO Letter Card ── */}
        <div className="mx-4 sm:mx-8 mb-4 sm:mb-6 shrink-0">
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              border: "1px solid rgba(166, 16, 23, 0.12)",
              background: "linear-gradient(108deg, rgba(253,248,240,0.85) 0%, rgba(235,240,250,0.55) 100%)",
              boxShadow: "0 1px 3px rgba(10,56,100,0.04), 0 4px 16px rgba(166,16,23,0.04)",
            }}
          >
            <div aria-hidden="true" style={{
              position: "absolute", left: 0, top: 0, bottom: 0, width: "3px",
              background: "linear-gradient(180deg, rgba(166,16,23,0.55) 0%, rgba(166,16,23,0.12) 100%)",
              borderRadius: "2px 0 0 2px",
            }} />
            <div className="absolute -left-8 -top-8 w-40 h-40 rounded-full pointer-events-none"
              aria-hidden="true" style={{ background: "rgba(166,16,23,0.04)" }} />

            <div
              onClick={() => {
                haptic.trigger("light");
                setIsWelcomeCollapsed(!isWelcomeCollapsed);
              }}
              className="relative flex items-center justify-between gap-4 px-5 py-4 cursor-pointer hover:bg-black/[0.01] transition-colors select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex flex-col items-center justify-center gap-0.5 shrink-0"
                  style={{ border: "1.5px solid rgba(166, 16, 23, 0.18)", background: "rgba(255,255,255,0.7)" }}>
                  <span className="text-[7px] font-black tracking-widest text-primary-red/60 uppercase">SLO</span>
                  <div className="w-4 h-px bg-primary-red/20" />
                  <span className="text-[5px] font-semibold tracking-wider text-primary-blue/35 uppercase">Ashoka</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold tracking-[0.2em] text-primary-red/40 uppercase mb-0.5">
                    Student Life Office
                  </p>
                  <h3 className="text-[13.5px] font-bold text-primary-blue font-display">
                    Welcome to Ashoka University!
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-primary-blue/40 hidden xs:inline">
                  {isWelcomeCollapsed ? "Read letter" : "Collapse"}
                </span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-primary-blue/40 transition-transform duration-200",
                    !isWelcomeCollapsed && "rotate-180"
                  )}
                />
              </div>
            </div>

            <AnimatePresence initial={false}>
              {!isWelcomeCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-1 border-t border-primary-blue/5">
                    <p
                      className="text-[13.5px] leading-[1.8] italic text-center sm:text-left"
                      style={{ fontFamily: "var(--font-display)", color: "rgba(10, 56, 100, 0.78)" }}
                    >
                      &ldquo;Congratulations and Welcome to Ashoka University! You are about to begin
                      an incredible journey, and it all starts here. Get ready to connect, explore,
                      and grow as you prepare for success in your undergraduate journey. At Ashoka,
                      you will find a community that inspires you to flourish and truly thrive.
                      Let the adventure begin!&rdquo;
                    </p>
                    <p className="text-primary-blue/35 text-[11px] mt-2 text-center sm:text-left">
                      — Office of Student Affairs, Ashoka University &nbsp;·&nbsp; Batch of UG 2029
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div
              className="px-5 sm:px-7 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5"
              style={{ borderTop: "1px solid rgba(166, 16, 23, 0.07)", background: "rgba(255,255,255,0.35)" }}
            >
              {[
                ["Online Orientation", "11 Aug 2025"],
                ["O-Week begins", "18 Aug 2025"],
                ["Move-in", "Before 18 Aug 2025"],
              ].map(([label, value]) => (
                <span key={label} className="text-[11px] text-primary-blue/30 whitespace-nowrap">
                  {label}: <span className="text-primary-blue/55 font-medium">{value}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Guide Reader ── */}
        <TourStep
          id="home-guides"
          title="Orientation Guides"
          content="Read through each guide carefully — they cover everything you need before and after arriving on campus. Mark each one complete as you go."
          order={8}
          position="top"
          className="mx-4 sm:mx-8 mb-6 sm:mb-8 flex flex-col flex-1 min-h-0"
        >
          <div className="flex flex-col md:flex-row w-full rounded-2xl border border-primary-blue/10 bg-white/50 backdrop-blur-sm overflow-hidden flex-1 min-h-0">
            {/* ── MOBILE: horizontal scrolling tab strip ── */}
            <div className="md:hidden shrink-0 border-b border-primary-blue/8 bg-white/30">
              <div className="h-0.5 bg-primary-blue/5">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${(completedCount / GUIDES.length) * 100}%` }}
                />
              </div>

              <div
                ref={tabBarRef}
                className="flex overflow-x-auto scrollbar-none px-3 py-2 gap-1.5"
                style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
              >
                {GUIDES.map(({ id, icon: NavIcon, label }) => {
                  const isActive = id === selectedId;
                  const isDone = completedIds.has(id);
                  return (
                    <button
                      key={id}
                      data-active={isActive}
                      onClick={() => select(id)}
                      className={[
                        "shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-all duration-150 relative whitespace-nowrap touch-manipulation z-0",
                        isActive
                          ? "text-primary-blue"
                          : "text-primary-blue/45 hover:text-primary-blue/70 hover:bg-primary-blue/4",
                      ].join(" ")}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="activeGuideTabMobileBg"
                          className="absolute inset-0 bg-primary-blue/8 rounded-xl -z-10"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                      {isActive && (
                        <motion.span
                          layoutId="activeGuideTabMobileIndicator"
                          className="absolute bottom-0 left-3 right-3 h-0.5 rounded-t-full bg-primary-red"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                      <NavIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-primary-red" : ""}`} />
                      {label}
                      {isDone && (
                        <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-500 ml-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="px-4 pb-2 flex items-center justify-between">
                <p className="text-[9px] font-black tracking-[0.18em] text-primary-blue/20 uppercase">
                  Guides
                </p>
                <span className="text-[9px] font-semibold text-primary-blue/30 tabular-nums">
                  {completedCount}/{GUIDES.length}
                  {completedCount === GUIDES.length && (
                    <span className="ml-1.5 text-emerald-600"> · All complete!</span>
                  )}
                </span>
              </div>
            </div>

            {/* ── DESKTOP: vertical left nav ── */}
            <nav className="hidden md:flex w-48 shrink-0 border-r border-primary-blue/8 py-3 flex-col">
              <div className="px-4 pb-2 flex items-center justify-between">
                <p className="text-[9px] font-black tracking-[0.2em] text-primary-blue/25 uppercase">
                  Guides
                </p>
                <span className="text-[9px] font-semibold text-primary-blue/30 tabular-nums">
                  {completedCount}/{GUIDES.length}
                </span>
              </div>

              {GUIDES.map(({ id, icon: NavIcon, label }) => {
                const isActive = id === selectedId;
                const isDone = completedIds.has(id);
                return (
                  <button
                    key={id}
                    onClick={() => select(id)}
                    className={[
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 relative z-0",
                      isActive
                        ? "text-primary-blue"
                        : "text-primary-blue/40 hover:text-primary-blue/70 hover:bg-primary-blue/4",
                    ].join(" ")}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeGuideTabDesktopBg"
                        className="absolute inset-0 bg-primary-blue/4 rounded-xl -z-10"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    {isActive && (
                      <motion.span
                        layoutId="activeGuideTabDesktopIndicator"
                        className="absolute left-0 inset-y-1.5 w-0.75 rounded-r-full bg-primary-red"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <NavIcon className={`w-3.5 h-3.5 shrink-0 transition-colors ${isActive ? "text-primary-red" : ""}`} />
                    <span className={`text-[13px] font-medium flex-1 ${isActive ? "text-primary-blue" : ""}`}>
                      {label}
                    </span>
                    {isDone && (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                    )}
                  </button>
                );
              })}

              <div className="mt-auto px-4 pt-3 pb-2">
                <div className="w-full h-1 rounded-full bg-primary-blue/8 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${(completedCount / GUIDES.length) * 100}%` }}
                  />
                </div>
                {completedCount === GUIDES.length && (
                  <p className="text-[9px] text-emerald-600 font-semibold mt-1.5 text-center">
                    All guides complete!
                  </p>
                )}
              </div>
            </nav>

            {/* ── Content panel (shared mobile + desktop) ── */}
            <div
              className="flex-1 flex flex-col overflow-hidden transition-opacity"
              style={{ opacity: visible ? 1 : 0, transitionDuration: "180ms" }}
            >
              <div className="flex-1 relative flex flex-col min-h-0">
                <div
                  ref={contentScrollRef}
                  onScroll={checkScroll}
                  className="flex-1 px-5 sm:px-8 py-5 sm:py-7 overflow-y-auto"
                >
                  <div className="flex items-start gap-3 sm:gap-4 mb-5 sm:mb-6">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isCompleted ? "bg-emerald-50" : "bg-primary-red/8"}`}>
                      {isCompleted
                        ? <CheckCircle2 className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-emerald-500" />
                        : <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-primary-red" />
                      }
                    </div>
                    <div className="min-w-0">
                      <h2
                        className="text-xl sm:text-2xl font-bold text-primary-blue leading-tight"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {guide.title}
                      </h2>
                      <p className="text-sm text-primary-blue/40 mt-0.5 sm:mt-1 leading-snug">{guide.description}</p>
                    </div>
                  </div>

                  <div className="w-full h-px bg-primary-blue/6 mb-5 sm:mb-6" />

                  <ol className="space-y-0">
                    {guide.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 sm:gap-4 py-3 sm:py-3.5 border-b border-primary-blue/5 last:border-none"
                      >
                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary-blue/6 text-primary-blue/50 text-[10px] sm:text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                          {idx + 1}
                        </span>
                        <span className="text-[13px] sm:text-[13.5px] text-primary-blue/75 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div
                  className={[
                    "absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center justify-center transition-all duration-300 z-10",
                    showScrollHint ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                  ].join(" ")}
                >
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-white/80 backdrop-blur-[2px] border border-primary-blue/5 shadow-[0_2px_8px_rgba(10,56,100,0.04)]"
                    style={{
                      animation: showScrollHint ? "scroll-bounce 1.6s ease-in-out infinite" : "none",
                    }}
                  >
                    <ChevronDown className="w-4 h-4 text-primary-blue/45" strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="shrink-0 border-t border-primary-blue/8 px-5 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-3">
                <button
                  onClick={() => toggleComplete(selectedId)}
                  className={[
                    "flex items-center gap-2 text-[12px] sm:text-[13px] font-medium transition-colors touch-manipulation",
                    isCompleted
                      ? "text-emerald-600 hover:text-emerald-700"
                      : "text-primary-blue/40 hover:text-primary-blue/70",
                  ].join(" ")}
                >
                  {isCompleted
                    ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                    : <Circle className="w-4 h-4 shrink-0" />
                  }
                  <span className="hidden xs:inline">
                    {isCompleted ? "Marked as complete" : "Mark as complete"}
                  </span>
                  <span className="xs:hidden">
                    {isCompleted ? "Complete" : "Mark done"}
                  </span>
                </button>

                {!isLast ? (
                  <button
                    onClick={handleNextGuide}
                    className="flex items-center gap-2 text-[12px] sm:text-[13px] font-medium text-primary-blue bg-primary-blue/6 hover:bg-primary-blue/10 rounded-lg px-3 sm:px-4 py-2 transition-colors touch-manipulation whitespace-nowrap"
                  >
                    Next guide
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                ) : (
                  !isCompleted && (
                    <button
                      onClick={() => toggleComplete(selectedId)}
                      className="flex items-center gap-2 text-[12px] sm:text-[13px] font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg px-3 sm:px-4 py-2 transition-colors touch-manipulation whitespace-nowrap"
                    >
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

        @media (prefers-reduced-motion: reduce) {
          @keyframes splash-rise    { from { opacity: 0; } to { opacity: 1; } }
          @keyframes splash-fade-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes splash-pulse   { 0%, 100% { opacity: 0.6; } }
          @keyframes splash-dot     { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.65; } }
          @keyframes scroll-bounce  { 0%, 100% { transform: translateY(0); } }
        }
      `}</style>
    </>
  );
}
