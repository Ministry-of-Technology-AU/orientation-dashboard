"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TextGenerateEffect } from "@/components/landing/text-generate-effect";

const HEADLINE_START = "We know college life can feel ";
const HEADLINE_END = "overwhelming.";
const SUBTEXT =
  "Student Life Office & Ministry of Tech are here to help you settle in, one step at a time.";

const BUBBLE_LEAD = 5000; // bubbles float for this long before headline starts typing

const WORD_POOL = [
  "Hostel life", "Campus food", "Deadlines", "New roommate?",
  "Assignments", "Making friends", "Club fair", "Exams ahead",
  "New city", "Societies", "Course load", "Housing lottery",
  "Midsems", "Lost & found", "Mess timings", "Internships",
  "Late nights", "Group projects", "Office hours", "Campus events",
];

function pickRandom(pool: string[], exclude?: string) {
  let word: string;
  do { word = pool[Math.floor(Math.random() * pool.length)]; }
  while (pool.length > 1 && word === exclude);
  return word;
}

const POSITIONS = [
  { top: "42%", left: "8%",   delay: "0s",   duration: 9000  },
  { top: "62%", left: "18%",  delay: "1.4s", duration: 7000  },
  { top: "52%", left: "72%",  delay: "7.1s", duration: 8000  },
  { top: "67%", left: "60%",  delay: "4.0s", duration: 10000 },
  { top: "45%", left: "80%",  delay: "2.8s", duration: 8000  },
  { top: "58%", left: "38%",  delay: "5.2s", duration: 10000 },
  { top: "38%", left: "55%",  delay: "3.6s", duration: 9000  },
  { top: "70%", left: "82%",  delay: "6.0s", duration: 9000  },
  { top: "48%", left: "28%",  delay: "8.5s", duration: 11000 },
];

export default function LandingClient() {
  const router = useRouter();
  const [showSub, setShowSub] = useState(false);
  const [showBottom, setShowBottom] = useState(false);
  const [bubbleWords, setBubbleWords] = useState<string[]>(
    () => POSITIONS.map(() => pickRandom(WORD_POOL))
  );

  // Client-side redirect if local storage already indicates the user is onboarded
  useEffect(() => {
    try {
      if (localStorage.getItem("orientation-hub-onboarded") === "true") {
        router.replace("/home");
      }
    } catch {}
  }, [router]);

  useEffect(() => {
    const headlineDuration = BUBBLE_LEAD + (HEADLINE_START + HEADLINE_END).length * 48 + 200;
    const t1 = setTimeout(() => setShowSub(true), headlineDuration);
    const t2 = setTimeout(
      () => setShowBottom(true),
      headlineDuration + SUBTEXT.length * 32 + 400
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    const timers = POSITIONS.map((pos, i) =>
      setInterval(() => {
        setBubbleWords(prev => {
          const next = [...prev];
          next[i] = pickRandom(WORD_POOL, next[i]);
          return next;
        });
      }, pos.duration)
    );
    return () => timers.forEach(clearInterval);
  }, []);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">

      {/* Subtle dot-grid texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(circle, #0A3864 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Floating thought-bubble pills — desktop only, visible immediately */}
      <div aria-hidden="true" className="hidden sm:block pointer-events-none">
        {POSITIONS.map(({ top, left, delay, duration }, i) => (
          <span
            key={i}
            suppressHydrationWarning
            className="absolute text-[11px] font-medium text-primary-red/50 bg-primary-red/6 border border-primary-blue/10 rounded-full px-3 py-1 whitespace-nowrap"
            style={{
              top,
              left,
              animation: `float-up-fade ${duration}ms ease-in-out ${delay} infinite backwards`,
            }}
          >
            {bubbleWords[i]}
          </span>
        ))}
      </div>

      {/* Top wordmark */}
      <p className="hidden sm:block absolute top-10 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-[0.25em] text-primary-blue/30 uppercase z-10">
        Orientation Platform · Ashoka University
      </p>

      {/* Mobile top bar */}
      <div className="sm:hidden flex items-center justify-between px-5 pt-5 relative z-10">
        <span className="text-[10px] font-bold tracking-widest text-primary-blue/40 uppercase">
          Orientation Platform
        </span>
      </div>

      {/* Headline copy */}
      <div className="relative flex flex-col items-center px-6 sm:px-12 sm:pt-48 text-center landing-headline-container">
        <h1
          className="text-3xl sm:text-5xl font-bold text-primary-blue leading-[1.2] max-w-xs sm:max-w-2xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <TextGenerateEffect words={HEADLINE_START} delay={48} startDelay={BUBBLE_LEAD} />
          <span className="italic text-primary-red">
            <TextGenerateEffect
              words={HEADLINE_END}
              delay={48}
              startDelay={BUBBLE_LEAD + HEADLINE_START.length * 48}
            />
          </span>
        </h1>

        <p
          className="mt-4 text-sm sm:text-base text-gray-400 max-w-xs sm:max-w-md leading-relaxed transition-opacity duration-700"
          style={{ opacity: showSub ? 1 : 0 }}
        >
          {showSub && (
            <TextGenerateEffect words={SUBTEXT} delay={32} startDelay={0} />
          )}
        </p>
      </div>

      {/* Bottom section — desktop */}
      <div
        className="hidden sm:flex absolute bottom-0 inset-x-0 items-end justify-center gap-6 lg:gap-10 transition-all duration-700"
        style={{
          opacity: showBottom ? 1 : 0,
          transform: showBottom ? "translateY(0)" : "translateY(28px)",
        }}
      >
        <div className="shrink-0">
          <Image
            src="/mascot.png"
            alt="Bijlee the mascot"
            width={420}
            height={580}
            priority
            className="w-full max-w-105 h-auto object-contain desktop-mascot-image"
          />
        </div>

        <div className="flex flex-col items-start gap-3 desktop-details-container">
          <div className="relative bg-white rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-lg border border-gray-100 whitespace-nowrap">
            <p className="text-xs font-semibold text-primary-blue leading-snug">
              Hi! I&apos;m Bijlee ⚡ — ready to explore?
            </p>
            <div className="absolute -bottom-1.75 left-4 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45" />
          </div>
          <Link
            href="/onboarding"
            className="group px-10 py-3.5 rounded-lg bg-primary-blue hover:bg-[#0d4a80] text-white text-sm font-semibold shadow-md transition-all hover:shadow-lg hover:scale-[1.02]"
          >
            Begin Journey
            <span className="inline-block ml-1 transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>

      {/* Bottom section — mobile */}
      <div
        className="sm:hidden absolute inset-x-0 flex flex-col items-center transition-all duration-700 mobile-mascot-container"
        style={{
          opacity: showBottom ? 1 : 0,
          transform: showBottom ? "translateY(0)" : "translateY(28px)",
        }}
      >
        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="relative bg-white rounded-2xl px-4 py-2.5 shadow-lg border border-gray-100 whitespace-nowrap">
            <p className="text-xs font-semibold text-primary-blue">
              Hi! I&apos;m Bijlee ⚡ — ready to explore?
            </p>
            <div className="absolute -bottom-1.75 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45" />
          </div>
          <Link
            href="/onboarding"
            className="px-8 py-3 rounded-full bg-primary-blue text-white text-sm font-semibold shadow-md"
          >
            Begin Journey →
          </Link>
        </div>

        <Image
          src="/mascot.png"
          alt="Bijlee the mascot"
          width={200}
          height={260}
          className="object-contain mobile-mascot-image"
          style={{ width: 200, height: "auto" }}
        />
      </div>

      <style>{`
        .mobile-mascot-container {
          bottom: clamp(0.5rem, 2vh, 4rem);
        }
        .mobile-mascot-image {
          max-height: clamp(120px, 20vh, 240px);
          width: auto !important;
        }
        .desktop-mascot-image {
          max-height: clamp(200px, 45vh, 480px);
          width: auto !important;
        }
        .desktop-details-container {
          margin-bottom: clamp(1.5rem, 10vh, 8rem);
        }
        .landing-headline-container {
          padding-top: clamp(2.5rem, 8vh, 8rem);
        }
      `}</style>

    </div>
  );
}
