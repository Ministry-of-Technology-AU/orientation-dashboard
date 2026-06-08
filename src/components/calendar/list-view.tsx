"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useWebHaptics } from "web-haptics/react";
import { cn } from "@/lib/utils";
import type { CalendarEvent, EventCategory } from "@/mock-data/calendar";
import { formatTime } from "@/mock-data/calendar";

const categoryBar: Record<EventCategory, string> = {
  mandatory: "bg-[#A61017]",
  social:    "bg-[#0A3864]",
  sports:    "bg-emerald-500",
  misc:      "bg-gray-400",
};

const categoryLabel: Record<EventCategory, string> = {
  mandatory: "text-[#A61017] bg-[#f9e8e9]",
  social:    "text-[#0A3864] bg-[#e6edf5]",
  sports:    "text-emerald-700 bg-emerald-50",
  misc:      "text-gray-600 bg-gray-100",
};

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: Math.min(i, 8) * 0.03,
      type: "tween" as const,
      duration: 0.2,
      ease: "easeOut" as const,
    },
  }),
};


interface Props {
  year: number;
  month: number;
  events: CalendarEvent[];
  onEventClick: (e: CalendarEvent) => void;
}

export function ListView({ year, month, events, onEventClick }: Props) {
  const haptic = useWebHaptics();

  const filtered = events
    .filter((e) => {
      const d = new Date(e.date + "T12:00:00");
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  if (!filtered.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-3 p-8">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
          <span className="text-2xl">📭</span>
        </div>
        <p className="text-sm font-semibold text-gray-500">No events this month</p>
        <p className="text-xs text-gray-400 max-w-48">
          Events added to the Ashoka calendar will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-2.5">
      <AnimatePresence>
        {filtered.map((ev, i) => (
          <motion.button
            key={ev.id}
            custom={i}
            variants={rowVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              haptic.trigger("light");
              onEventClick(ev);
            }}
            style={{ willChange: "transform, opacity" }}
            className="w-full text-left bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm rounded-2xl px-5 py-4 flex items-start gap-4 transition-shadow group"
          >
            {/* Date block */}
            <div className="w-10 shrink-0 text-center">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                {new Date(ev.date + "T12:00:00").toLocaleString("en-US", { weekday: "short" })}
              </p>
              <p className="text-xl font-bold text-gray-800 leading-none mt-0.5">
                {new Date(ev.date + "T12:00:00").getDate()}
              </p>
            </div>

            <div className={cn("w-0.5 self-stretch rounded-full", categoryBar[ev.category])} />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-0.5">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-[#0A3864] transition-colors">
                  {ev.title}
                </p>
                <span className={cn("text-[10px] font-medium rounded-full px-2 py-0.5 shrink-0 capitalize", categoryLabel[ev.category])}>
                  {ev.category}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {formatTime(ev.startTime)} – {formatTime(ev.endTime)} · {ev.venue}
              </p>
            </div>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
