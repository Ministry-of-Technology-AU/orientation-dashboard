"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useWebHaptics } from "web-haptics/react";
import type { JourneyMilestone, JourneyNextUp } from "@/components/dashboard/dashboard-types";

interface MyJourneyPanelProps {
  milestones?: JourneyMilestone[];
  nextUp?: JourneyNextUp;
}

function MilestoneDot({ status }: { status: JourneyMilestone["status"] }) {
  if (status === "done") {
    return (
      <div className="w-4 h-4 rounded-full bg-[#0A3864] border-2 border-[#0A3864] shrink-0" />
    );
  }
  if (status === "in_progress") {
    return (
      <div className="w-4 h-4 rounded-full bg-[#A61017] border-2 border-[#A61017] shrink-0" />
    );
  }
  return (
    <div className="w-4 h-4 rounded-full bg-gray-300 border-2 border-gray-300 shrink-0" />
  );
}

function StatusBadge({ status }: { status: JourneyMilestone["status"] }) {
  if (status === "done") {
    return (
      <span className="ml-2 text-[10px] font-semibold bg-[#0A3864] text-white rounded-full px-2 py-0.5">
        Done
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="ml-2 text-[10px] font-semibold bg-[#A61017] text-white rounded-full px-2 py-0.5">
        In Progress
      </span>
    );
  }
  return null;
}

export function MyJourneyPanel({ milestones, nextUp }: MyJourneyPanelProps) {
  const haptic = useWebHaptics();
  const safeMilestones = milestones ?? [];
  const safeNextUp = nextUp ?? { title: "", subtitle: "", href: "" };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-3xl font-bold text-gray-900 mb-1">My Journey</h2>
      <p className="text-sm text-gray-500 mb-6">Orientation milestone completion status:</p>

      {/* Stepper */}
      <div className="flex flex-col gap-0 flex-1">
        {safeMilestones.map((milestone, i) => (
          <div key={i} className="flex gap-3">
            {/* Dot + connector line */}
            <div className="flex flex-col items-center">
              <MilestoneDot status={milestone.status} />
              {i < safeMilestones.length - 1 && (
              <div className="w-0.5 flex-1 min-h-[22px] bg-gray-300 my-1" />
              )}
            </div>

            {/* Label */}
            <div className={cn("pb-4", i === safeMilestones.length - 1 && "pb-0")}>
              <div className="flex items-center flex-wrap gap-y-0.5">
                <span
                  className={cn(
                    "text-sm font-medium",
                    milestone.status === "not_started" ? "text-gray-400" : "text-gray-800"
                  )}
                >
                  {milestone.label}
                </span>
                <StatusBadge status={milestone.status} />
              </div>
              {milestone.subProgress && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {milestone.subProgress.done} out of {milestone.subProgress.total} done
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Next Up */}
      {safeNextUp.title && (
        <div className="mt-6">
          <h3 className="text-base font-semibold text-gray-800 mb-2">Next Up</h3>
          <div className="bg-[#0A3864] rounded-2xl p-4 text-white">
            <p className="font-semibold text-sm mb-1">{safeNextUp.title}</p>
            <p className="text-xs text-blue-200 mb-3">{safeNextUp.subtitle}</p>
            {safeNextUp.href && (
              <Link
                href={safeNextUp.href}
                onClick={() => haptic.trigger("selection")}
                className="block w-full text-center text-xs bg-[#0d4a7a] hover:bg-[#1a5fa0] text-white rounded-lg py-2 transition-all duration-200 active:scale-95 cursor-pointer font-semibold shadow-sm"
              >
                {safeNextUp.ctaLabel ?? "Continue →"}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
