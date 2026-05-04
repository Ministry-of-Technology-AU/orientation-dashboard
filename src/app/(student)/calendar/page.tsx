"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/mock-data/calendar";
import { MonthView } from "@/components/calendar/month-view";
import { WeekView } from "@/components/calendar/week-view";
import { ListView } from "@/components/calendar/list-view";
import { EventModal } from "@/components/calendar/event-modal";

type View = "month" | "week" | "list";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function CalendarPage() {
  const today = new Date();
  const [view, setView] = useState<View>("month");
  const [currentDate, setCurrentDate] = useState(new Date(today));
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  function goToToday() { setCurrentDate(new Date(today)); }

  function navigate(dir: -1 | 1) {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (view === "week") d.setDate(d.getDate() + dir * 7);
      else d.setMonth(d.getMonth() + dir);
      return d;
    });
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden px-6 py-5">
      {/* ── Title ── */}
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Discover What&apos;s Happening</h1>

      {/* ── Sub-header: nav + view toggle ── */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToToday}
            className="text-sm text-gray-500 hover:text-[#A61017] transition-colors font-medium"
          >
            Today
          </button>
          <button
            onClick={() => navigate(1)}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-gray-700 ml-1">
            {MONTH_NAMES[month]} {year}
          </span>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-3">
          {(["month", "week", "list", "today"] as const).map((v) => {
            const isActive = v !== "today" && view === v;
            return (
              <button
                key={v}
                onClick={() => {
                  if (v === "today") { goToToday(); return; }
                  setView(v as View);
                }}
                className={cn(
                  "text-sm transition-colors capitalize",
                  isActive
                    ? "font-semibold text-gray-900"
                    : "text-gray-400 hover:text-gray-700"
                )}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Calendar body ── */}
      <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {view === "month" && (
          <MonthView year={year} month={month} today={today} onEventClick={setSelectedEvent} />
        )}
        {view === "week" && (
          <WeekView currentDate={currentDate} today={today} onEventClick={setSelectedEvent} />
        )}
        {view === "list" && (
          <ListView year={year} month={month} onEventClick={setSelectedEvent} />
        )}
      </div>

      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </main>
  );
}
