"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";

const QUESTIONS = [
  {
    id: "name",
    label: "What should we call you?",
    hint: "Your first name is fine",
    type: "text" as const,
    placeholder: "Type your name...",
  },
  {
    id: "city",
    label: "Which city are you from?",
    hint: "Your hometown",
    type: "text" as const,
    placeholder: "e.g. Mumbai, Delhi, Chennai...",
  },
  {
    id: "phone",
    label: "What's your phone number?",
    hint: "We'll use this for important updates only",
    type: "tel" as const,
    placeholder: "+91 98765 43210",
  },
  {
    id: "interests",
    label: "What excites you most about Ashoka?",
    hint: "Pick as many as you like",
    type: "multiselect" as const,
    options: [
      "Academics", "Research", "Sports", "Arts & Culture",
      "Music", "Entrepreneurship", "Debates", "Social life",
      "Theatre", "Photography", "Policy", "Journalism",
    ],
  },
  {
    id: "hobbies",
    label: "What do you love doing in your free time?",
    hint: "Pick as many as you like",
    type: "multiselect" as const,
    options: [
      "Reading", "Gaming", "Cooking", "Photography",
      "Dancing", "Writing", "Coding", "Fitness",
      "Travel", "Music", "Art", "Films", "Hiking", "Yoga",
    ],
  },
];

type Answers = Record<string, string | string[]>;

const LS_ANSWERS_KEY = "onboarding_answers";
const LS_ONBOARDED_KEY = "orientation-hub-onboarded";

export default function OnboardingPage() {
  const router = useRouter();
  const haptic = useWebHaptics();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [animPhase, setAnimPhase] = useState<"enter" | "exit">("enter");
  const inputRef = useRef<HTMLInputElement>(null);

  const question = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;

  useEffect(() => {
    if (question.type !== "multiselect") {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [step, question.type]);

  function getCurrentValue() {
    const v = answers[question.id];
    if (question.type === "multiselect") return (v as string[]) ?? [];
    return (v as string) ?? "";
  }

  function setCurrentValue(val: string | string[]) {
    setAnswers(prev => {
      const next = { ...prev, [question.id]: val };
      try { localStorage.setItem(LS_ANSWERS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function canAdvance() {
    const v = getCurrentValue();
    if (Array.isArray(v)) return v.length > 0;
    return (v as string).trim().length > 0;
  }

  function advance() {
    if (!canAdvance()) {
      haptic.trigger("error");
      return;
    }
    // Persist the latest answer before advancing
    const latestAnswers = { ...answers, [question.id]: getCurrentValue() };
    try { localStorage.setItem(LS_ANSWERS_KEY, JSON.stringify(latestAnswers)); } catch {}

    setAnimPhase("exit");
    setTimeout(() => {
      if (isLast) {
        haptic.trigger("success");
        // Mark onboarding done locally so the home page can skip the preloader instantly
        try { localStorage.setItem(LS_ONBOARDED_KEY, "true"); } catch {}
        router.push("/login");
      } else {
        haptic.trigger("medium");
        setStep(s => s + 1);
        setAnimPhase("enter");
      }
    }, 360);
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      if (!canAdvance()) {
        haptic.trigger("error");
      } else {
        advance();
      }
    }
  }

  function toggleOption(option: string) {
    haptic.trigger("selection");
    const current = getCurrentValue() as string[];
    setCurrentValue(
      current.includes(option)
        ? current.filter(o => o !== option)
        : [...current, option]
    );
  }

  const progress = ((step + 1) / QUESTIONS.length) * 100;

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-between overflow-y-auto px-4 py-6 sm:px-6 sm:py-12">
      
      {/* Background radial gradient glow */}
      <div 
        aria-hidden="true" 
        className="absolute inset-0 -z-20 pointer-events-none opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 30%, var(--primary-blue-tint, #e0f2fe) 0%, transparent 70%)"
        }}
      />
      
      {/* Subtle dot-grid texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: "radial-gradient(circle, #0A3864 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Top progress bar */}
      <div className="absolute top-0 inset-x-0 h-[3px] bg-primary-blue/5">
        <div
          className="h-full bg-primary-blue transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header bar */}
      <header className="w-full max-w-xl flex items-center justify-between z-10 mb-4 sm:mb-8">
        {/* Back */}
        {step > 0 ? (
          <button
            onClick={() => {
              haptic.trigger("light");
              setAnimPhase("exit");
              setTimeout(() => { setStep(s => s - 1); setAnimPhase("enter"); }, 360);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary-blue/60 hover:text-primary-blue hover:bg-primary-blue/5 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            ← Back
          </button>
        ) : (
          <div className="w-12" /> // spacer
        )}

        {/* Step counter */}
        <div className="text-xs font-medium text-primary-blue/40 tabular-nums bg-primary-blue/5 px-2.5 py-1 rounded-full">
          <span className="text-primary-blue/70 font-semibold">{step + 1}</span>
          {" "}/{" "}{QUESTIONS.length}
        </div>
      </header>

      {/* Main card */}
      <main 
        className="w-full max-w-xl my-auto"
        style={{
          animation: animPhase === "enter"
            ? "q-enter 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards"
            : "q-exit 0.34s ease forwards",
        }}
      >
        <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-3xl p-6 sm:p-10 shadow-[0_8px_32px_0_rgba(10,56,100,0.04)]">
          <p className="text-[10px] font-bold tracking-[0.25em] text-primary-red/80 uppercase mb-4">
            Question {step + 1}
          </p>

          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary-blue leading-[1.25] mb-2 tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {question.label}
          </h2>
          <p className="text-xs sm:text-sm text-primary-blue/40 mb-6 sm:mb-8 font-medium">{question.hint}</p>

          {/* Text / Tel input */}
          {(question.type === "text" || question.type === "tel") && (
            <div className="border-b-2 border-primary-blue/10 focus-within:border-primary-blue/50 transition-colors duration-300 mb-8 sm:mb-10">
              <input
                ref={inputRef}
                type={question.type}
                placeholder={question.placeholder}
                value={getCurrentValue() as string}
                onChange={e => setCurrentValue(e.target.value)}
                onKeyDown={handleKey}
                className="w-full bg-transparent text-lg sm:text-xl md:text-2xl text-primary-blue placeholder:text-primary-blue/20 outline-none py-3 font-semibold"
              />
            </div>
          )}

          {/* Multi-select chips */}
          {question.type === "multiselect" && (
            <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-8 sm:mb-10 max-h-[35vh] overflow-y-auto pr-1">
              {question.options!.map(option => {
                const selected = (getCurrentValue() as string[]).includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => toggleOption(option)}
                    className={[
                      "flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-200 active:scale-95 min-h-[36px] cursor-pointer",
                      selected
                        ? "bg-primary-blue border-primary-blue text-white shadow-sm scale-[1.03]"
                        : "bg-white/40 border-primary-blue/15 text-primary-blue/60 hover:border-primary-blue/30 hover:text-primary-blue backdrop-blur-sm",
                    ].join(" ")}
                  >
                    {selected && <Check className="w-3 h-3 shrink-0" />}
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {/* CTA row */}
          <div className="flex items-center gap-4">
            <button
              onClick={advance}
              disabled={!canAdvance()}
              className={[
                "flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95",
                canAdvance()
                  ? "bg-primary-blue text-white shadow-md hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                  : "bg-primary-blue/5 text-primary-blue/20 cursor-not-allowed",
              ].join(" ")}
            >
              {isLast ? "Let's go" : "OK"}
              <ArrowRight className="w-4 h-4" />
            </button>

            {question.type !== "multiselect" && (
              <span className="hidden sm:inline text-xs text-primary-blue/30">
                press <kbd className="font-mono bg-primary-blue/5 px-1.5 py-0.5 rounded text-primary-blue/40 border border-primary-blue/5">Enter ↵</kbd>
              </span>
            )}
          </div>
        </div>
      </main>

      {/* Footer / Info */}
      <footer className="w-full text-center mt-4 sm:mt-8">
        <p className="text-[9px] font-semibold tracking-wider text-primary-blue/20 uppercase">
          Your answers are synced and secured
        </p>
      </footer>
    </div>
  );
}
