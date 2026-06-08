"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, MapPin, Users, CalendarPlus } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";
import type { CalendarEvent } from "@/mock-data/calendar";
import { formatDateOrdinal, formatTime, buildGcalLink } from "@/mock-data/calendar";

interface Props {
  event: CalendarEvent;
  onClose: () => void;
}

const categoryAccent: Record<string, { bg: string; border: string; text: string }> = {
  mandatory: { bg: "#f9e8e9", border: "#A61017", text: "#A61017" },
  social:    { bg: "#e6edf5", border: "#0A3864", text: "#0A3864" },
  sports:    { bg: "#ecfdf5", border: "#10b981", text: "#059669" },
  misc:      { bg: "#f9fafb", border: "#9ca3af", text: "#6b7280" },
};

export function EventModal({ event, onClose }: Props) {
  const haptic = useWebHaptics();
  const accent = categoryAccent[event.category] ?? categoryAccent.misc;

  // Fire haptic on mount (modal open)
  useEffect(() => {
    haptic.trigger("medium");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose() {
    haptic.trigger("light");
    onClose();
  }

  function handleAddToCalendar() {
    haptic.trigger("success");
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={handleClose}
      style={{ willChange: "opacity" }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ willChange: "transform, opacity" }}
      >
        {/* Coloured top accent strip */}
        <div
          className="h-1.5 w-full"
          style={{ background: accent.border }}
        />

        <div className="p-8">
          {/* Close */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Category badge */}
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4"
            style={{ background: accent.bg, color: accent.text }}
          >
            {event.category}
          </span>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6 leading-tight pr-6">
            {event.title}
          </h2>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: accent.bg }}>
                <Calendar className="w-4 h-4" style={{ color: accent.text }} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Date</p>
                <p className="text-sm font-semibold text-gray-800">{formatDateOrdinal(event.date)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: accent.bg }}>
                <Clock className="w-4 h-4" style={{ color: accent.text }} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Time</p>
                <p className="text-sm font-semibold text-gray-800">
                  {formatTime(event.startTime)} – {formatTime(event.endTime)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: accent.bg }}>
                <MapPin className="w-4 h-4" style={{ color: accent.text }} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Venue</p>
                <p className="text-sm font-semibold text-gray-800">{event.venue}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: accent.bg }}>
                <Users className="w-4 h-4" style={{ color: accent.text }} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Organiser</p>
                <p className="text-sm font-semibold text-gray-800">{event.organisingBody}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && event.description !== "No description provided." && (
            <div className="mb-6 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About</p>
              <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* CTA */}
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            href={buildGcalLink(event)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleAddToCalendar}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-white transition-colors"
            style={{ background: accent.border }}
          >
            <CalendarPlus className="w-4 h-4" />
            Add to my calendar
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
}
