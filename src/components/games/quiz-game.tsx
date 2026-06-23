"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { reportGameCompletion } from "@/lib/games-client";

interface PublicQuizConfig {
  questions: { q: string; options: string[] }[];
}

interface Props {
  config: PublicQuizConfig;
  pointsValue: number;
  moduleId: string;
}

export function QuizGame({ config, pointsValue, moduleId }: Props) {
  const { questions } = config;
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [validated, setValidated] = useState<(boolean | null)[]>(() =>
    Array.from({ length: questions.length }, () => null)
  );
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const reportedRef = useRef(false);

  // Persist completion + points once the quiz finishes (80%+ earns completion).
  useEffect(() => {
    if (!done || reportedRef.current) return;
    reportedRef.current = true;
    reportGameCompletion({
      moduleId,
      type: "quiz",
      answers,
    });
  }, [done, answers, moduleId]);

  const question = questions[currentQ];
  const isCorrect = validated[currentQ] === true;
  const progress = ((currentQ) / questions.length) * 100;

  function handleSelect(option: string) {
    if (confirmed) return;
    setSelected(option);
  }

  async function handleConfirm() {
    if (!selected || validating) return;
    setValidating(true);
    setValidationError(null);
    try {
      const res = await fetch("/api/games/quiz-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, questionIndex: currentQ, answer: selected }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const result = (await res.json()) as { correct?: boolean };
      const correct = result.correct === true;

      setAnswers((prev) => {
        const next = [...prev];
        next[currentQ] = selected;
        return next;
      });
      setValidated((prev) => {
        const next = [...prev];
        next[currentQ] = correct;
        return next;
      });
      if (correct) setCorrectCount((c) => c + 1);
      setConfirmed(true);
    } catch (error) {
      console.error("Failed to validate quiz answer:", error);
      setValidationError("Couldn't check that answer. Please try again.");
    } finally {
      setValidating(false);
    }
  }

  function handleNext() {
    if (currentQ + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setConfirmed(false);
    }
  }

  function handleRetry() {
    reportedRef.current = false;
    setCurrentQ(0);
    setSelected(null);
    setConfirmed(false);
    setAnswers([]);
    setValidated(Array.from({ length: questions.length }, () => null));
    setCorrectCount(0);
    setDone(false);
    setValidating(false);
    setValidationError(null);
  }

  if (done) {
    const passed = questions.length > 0 && correctCount / questions.length >= 0.8;
    const earned = passed ? pointsValue : 0;
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
          <Trophy className="w-10 h-10 text-amber-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {correctCount}/{questions.length} Correct
          </h2>
          <p className="text-gray-500 text-sm">
            {earned > 0
              ? `You earned ${earned} points!`
              : `Score at least 80% to complete this quiz and earn ${pointsValue} points.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {!passed && (
            <button
              onClick={handleRetry}
              className="bg-[#A61017] text-white rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-[#d44049] transition-colors"
            >
              Play Again
            </button>
          )}
          <Link
            href="/modules"
            className="bg-[#0A3864] text-white rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-[#1a5fa0] transition-colors"
          >
            Back to Modules
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto w-full">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
        <span>Question {currentQ + 1} of {questions.length}</span>
        <span>{Math.round(progress)}% complete</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-[#A61017] rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <p className="text-base font-semibold text-gray-900 mb-5 leading-relaxed">
        {question.q}
      </p>

      {/* Options */}
      <div className="flex flex-col gap-2.5 mb-6">
        {question.options.map((opt) => {
          const isSelected = selected === opt;
          let style = "border-gray-200 bg-white text-gray-700 hover:border-[#0A3864]/30 hover:bg-blue-50/30";

          if (confirmed) {
            if (isSelected && isCorrect) style = "border-emerald-400 bg-emerald-50 text-emerald-800";
            else if (isSelected && !isCorrect) style = "border-rose-400 bg-rose-50 text-rose-700";
            else style = "border-gray-100 bg-gray-50 text-gray-400";
          } else if (isSelected) {
            style = "border-[#0A3864] bg-blue-50 text-[#0A3864]";
          }

          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              className={cn(
                "w-full text-left rounded-xl border-2 px-4 py-3 text-sm transition-all flex items-center justify-between gap-2",
                style,
                !confirmed && "cursor-pointer"
              )}
            >
              <span>{opt}</span>
              {confirmed && isSelected && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
              {confirmed && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
            </button>
          );
        })}
      </div>
      {validationError && (
        <p className="mb-3 text-xs font-medium text-rose-600">{validationError}</p>
      )}

      {/* Actions */}
      {!confirmed ? (
        <button
          onClick={handleConfirm}
          disabled={!selected || validating}
          className="w-full bg-[#A61017] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl py-3 text-sm font-medium hover:bg-[#d44049] transition-colors"
        >
          {validating ? "Checking..." : "Submit Answer"}
        </button>
      ) : (
        <button
          onClick={handleNext}
          className="w-full bg-[#0A3864] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#1a5fa0] transition-colors flex items-center justify-center gap-2"
        >
          {currentQ + 1 >= questions.length ? "See Results" : "Next Question"}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
