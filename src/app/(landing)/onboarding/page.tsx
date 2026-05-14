"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";

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

export default function OnboardingPage() {
  const router = useRouter();
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
    setAnswers(prev => ({ ...prev, [question.id]: val }));
  }

  function canAdvance() {
    const v = getCurrentValue();
    if (Array.isArray(v)) return v.length > 0;
    return (v as string).trim().length > 0;
  }

  function advance() {
    if (!canAdvance()) return;
    setAnimPhase("exit");
    setTimeout(() => {
      if (isLast) {
        router.push("/login");
      } else {
        setStep(s => s + 1);
        setAnimPhase("enter");
      }
    }, 360);
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") advance();
  }

  function toggleOption(option: string) {
    const current = getCurrentValue() as string[];
    setCurrentValue(
      current.includes(option)
        ? current.filter(o => o !== option)
        : [...current, option]
    );
  }

  const progress = ((step + 1) / QUESTIONS.length) * 100;

  return (
    <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden px-6">

      {/* Top progress bar */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-primary-blue/10">
        <div
          className="h-full bg-primary-blue transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step counter */}
      <div className="absolute top-6 right-8 text-[11px] font-medium text-primary-blue/30 tabular-nums">
        <span className="text-primary-blue/60 font-semibold">{step + 1}</span>
        {" "}/{" "}{QUESTIONS.length}
      </div>

      {/* Back */}
      {step > 0 && (
        <button
          onClick={() => {
            setAnimPhase("exit");
            setTimeout(() => { setStep(s => s - 1); setAnimPhase("enter"); }, 360);
          }}
          className="absolute top-5 left-8 text-[11px] font-medium text-primary-blue/30 hover:text-primary-blue/60 transition-colors"
        >
          ← Back
        </button>
      )}

      {/* Question card */}
      <div
        className="w-full max-w-lg"
        style={{
          animation: animPhase === "enter"
            ? "q-enter 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards"
            : "q-exit 0.34s ease forwards",
        }}
      >
        <p className="text-[10px] font-bold tracking-[0.2em] text-primary-red/70 uppercase mb-5">
          Question {step + 1}
        </p>

        <h2
          className="text-3xl sm:text-4xl font-bold text-primary-blue leading-[1.2] mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {question.label}
        </h2>
        <p className="text-sm text-primary-blue/35 mb-10">{question.hint}</p>

        {/* Text / Tel input */}
        {(question.type === "text" || question.type === "tel") && (
          <div className="border-b-2 border-primary-blue/15 focus-within:border-primary-blue/60 transition-colors duration-300 mb-10">
            <input
              ref={inputRef}
              type={question.type}
              placeholder={question.placeholder}
              value={getCurrentValue() as string}
              onChange={e => setCurrentValue(e.target.value)}
              onKeyDown={handleKey}
              className="w-full bg-transparent text-xl sm:text-2xl text-primary-blue placeholder:text-primary-blue/15 outline-none py-3 font-medium"
            />
          </div>
        )}

        {/* Multi-select chips */}
        {question.type === "multiselect" && (
          <div className="flex flex-wrap gap-2.5 mb-10">
            {question.options!.map(option => {
              const selected = (getCurrentValue() as string[]).includes(option);
              return (
                <button
                  key={option}
                  onClick={() => toggleOption(option)}
                  className={[
                    "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
                    selected
                      ? "bg-primary-blue border-primary-blue text-white shadow-sm scale-[1.03]"
                      : "bg-white/50 border-primary-blue/20 text-primary-blue/60 hover:border-primary-blue/40 hover:text-primary-blue backdrop-blur-sm",
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
              "flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold transition-all duration-200",
              canAdvance()
                ? "bg-primary-blue text-white shadow-md hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                : "bg-primary-blue/8 text-primary-blue/25 cursor-not-allowed",
            ].join(" ")}
          >
            {isLast ? "Let's go" : "OK"}
            <ArrowRight className="w-4 h-4" />
          </button>

          {question.type !== "multiselect" && (
            <span className="text-xs text-primary-blue/25">
              press <kbd className="font-mono bg-primary-blue/6 px-1.5 py-0.5 rounded text-primary-blue/40">Enter ↵</kbd>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
