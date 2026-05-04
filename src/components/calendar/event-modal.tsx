import { X, Calendar, Clock, MapPin, Users } from "lucide-react";
import type { CalendarEvent } from "@/mock-data/calendar";
import { formatDateOrdinal, formatTime, buildGcalLink } from "@/mock-data/calendar";

interface Props {
  event: CalendarEvent;
  onClose: () => void;
}

export function EventModal({ event, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-7">
          {event.title}
        </h2>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-6">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-[#A61017] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Date</p>
              <p className="text-sm text-gray-500">{formatDateOrdinal(event.date)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#A61017] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Time</p>
              <p className="text-sm text-gray-500">
                {formatTime(event.startTime)} – {formatTime(event.endTime)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#A61017] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Venue</p>
              <p className="text-sm text-gray-500">{event.venue}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-[#A61017] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Organising Body</p>
              <p className="text-sm text-gray-500">{event.organisingBody}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-7">
          <p className="text-sm font-semibold text-gray-800 mb-2">Description</p>
          <p className="text-sm text-gray-500 leading-relaxed">{event.description}</p>
        </div>

        {/* CTA */}
        <div className="flex justify-end">
          <a
            href={buildGcalLink(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#f9e8e9] hover:bg-[#f3d5d6] text-gray-800 text-sm font-medium rounded-2xl px-6 py-3 transition-colors"
          >
            Add to my calendar
          </a>
        </div>
      </div>
    </div>
  );
}
