"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/mock-data/calendar";
import { MonthView } from "@/components/calendar/month-view";
import { WeekView } from "@/components/calendar/week-view";
import { ListView } from "@/components/calendar/list-view";
import { EventModal } from "@/components/calendar/event-modal";
import { LoadingSkeleton } from "@/components/calendar/loading-skeleton";

type View = "month" | "week" | "list";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const VIEW_LABELS: Record<View, string> = {
  month: "Month",
  week: "Week",
  list: "List",
};

export default function CalendarPage() {
  const haptic = useWebHaptics();
  const today = new Date();

  const [view, setView] = useState<View>("month");
  const [currentDate, setCurrentDate] = useState(new Date(today));
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Data state
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // ── Fetch events from API ────────────────────────────────────────────────────
  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/calendar");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: CalendarEvent[] = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("[CalendarPage] Failed to load events:", err);
      setError("Couldn't load events right now. Tap to retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // ── Navigation ───────────────────────────────────────────────────────────────
  function goToToday() {
    haptic.trigger("light");
    setCurrentDate(new Date(today));
  }

  function navigate(dir: -1 | 1) {
    haptic.trigger("selection");
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (view === "week") d.setDate(d.getDate() + dir * 7);
      else d.setMonth(d.getMonth() + dir);
      return d;
    });
  }

  function switchView(v: View) {
    haptic.trigger("selection");
    setView(v);
  }

  // ── Derived label ────────────────────────────────────────────────────────────
  const headerLabel = view === "week"
    ? (() => {
        // Show week range
        const d = new Date(currentDate);
        d.setDate(d.getDate() - d.getDay());
        const end = new Date(d);
        end.setDate(end.getDate() + 6);
        if (d.getMonth() === end.getMonth()) {
          return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}–${end.getDate()}, ${d.getFullYear()}`;
        }
        return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()} – ${MONTH_NAMES[end.getMonth()]} ${end.getDate()}, ${d.getFullYear()}`;
      })()
    : `${MONTH_NAMES[month]} ${year}`;

  return (
    <main className="flex-1 flex flex-col overflow-hidden px-6 py-5">
      {/* ── Title ── */}
      <div className="flex items-center justify-between mb-3">
        <h1
          className="text-2xl font-black text-primary-blue tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Discover What&apos;s Happening
        </h1>

        {/* Refresh button */}
        <motion.button
          whileTap={{ scale: 0.9, rotate: 180 }}
          transition={{ duration: 0.3 }}
          onClick={() => {
            haptic.trigger("light");
            loadEvents();
          }}
          disabled={loading}
          className="p-2 rounded-xl text-gray-400 hover:text-primary-blue hover:bg-blue-tint transition-all disabled:opacity-40"
          aria-label="Refresh events"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </motion.button>
      </div>

      {/* ── Sub-header: nav + view toggle ── */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={goToToday}
            className="text-xs text-gray-500 hover:text-primary-red transition-colors font-semibold px-2 py-1 rounded-lg hover:bg-red-tint"
          >
            Today
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate(1)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>

          <span className="text-sm font-bold text-gray-700 ml-1">{headerLabel}</span>
        </div>

        {/* View toggle pill */}
        <div className="flex items-center gap-0.5 bg-gray-100 rounded-xl p-1">
          {(["month", "week", "list"] as View[]).map((v) => (
            <motion.button
              key={v}
              whileTap={{ scale: 0.93 }}
              onClick={() => switchView(v)}
              className={cn(
                "relative text-xs font-semibold px-3 py-1.5 rounded-lg transition-all",
                view === v
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {VIEW_LABELS[v]}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Calendar body ── */}
      {loading ? (
        <LoadingSkeleton view={view} />
      ) : error ? (
        <div className="flex-1 rounded-2xl border border-red-100 bg-red-50/50 flex flex-col items-center justify-center gap-4 p-8">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-primary-red" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-800 mb-1">Couldn&apos;t load events</p>
            <p className="text-xs text-gray-500">Check your internet connection and try again.</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              haptic.trigger("light");
              loadEvents();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-red text-white text-xs font-bold rounded-xl hover:bg-primary-red/90 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </motion.button>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {view === "month" && (
            <MonthView
              year={year}
              month={month}
              today={today}
              events={events}
              onEventClick={(ev) => {
                haptic.trigger("light");
                setSelectedEvent(ev);
              }}
            />
          )}
          {view === "week" && (
            <WeekView
              currentDate={currentDate}
              today={today}
              events={events}
              onEventClick={(ev) => {
                haptic.trigger("light");
                setSelectedEvent(ev);
              }}
            />
          )}
          {view === "list" && (
            <ListView
              year={year}
              month={month}
              events={events}
              onEventClick={(ev) => {
                haptic.trigger("light");
                setSelectedEvent(ev);
              }}
            />
          )}
        </div>
      )}

      {/* ── Event detail modal ── */}
      <AnimatePresence>
        {selectedEvent && (
          <EventModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
