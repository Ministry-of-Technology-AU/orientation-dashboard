"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, ArrowRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuizConfig } from "@/mock-data/modules";

interface Props {
  config: QuizConfig;
  pointsValue: number;
  moduleSlug: string;
}

export function QuizGame({ config, pointsValue, moduleSlug }: Props) {
  const { questions } = config;
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const question = questions[currentQ];
  const isCorrect = selected === question?.answer;
  const progress = ((currentQ) / questions.length) * 100;

  function handleSelect(option: string) {
    if (confirmed) return;
    setSelected(option);
  }

  function handleConfirm() {
    if (!selected) return;
    if (isCorrect) setCorrectCount((c) => c + 1);
    setConfirmed(true);
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

  if (done) {
    const earned = correctCount === questions.length ? pointsValue : 0;
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
              : `Answer all questions correctly to earn ${pointsValue} points.`}
          </p>
        </div>
        <a
          href={`/modules/${moduleSlug}`}
          className="bg-[#0A3864] text-white rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-[#1a5fa0] transition-colors"
        >
          Back to Module
        </a>
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
          const isAnswer = opt === question.answer;
          let style = "border-gray-200 bg-white text-gray-700 hover:border-[#0A3864]/30 hover:bg-blue-50/30";

          if (confirmed) {
            if (isAnswer) style = "border-emerald-400 bg-emerald-50 text-emerald-800";
            else if (isSelected && !isAnswer) style = "border-rose-400 bg-rose-50 text-rose-700";
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
              {confirmed && isAnswer && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
              {confirmed && isSelected && !isAnswer && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      {!confirmed ? (
        <button
          onClick={handleConfirm}
          disabled={!selected}
          className="w-full bg-[#A61017] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl py-3 text-sm font-medium hover:bg-[#d44049] transition-colors"
        >
          Submit Answer
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
