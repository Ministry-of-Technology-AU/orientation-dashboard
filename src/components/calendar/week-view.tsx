import { cn } from "@/lib/utils";
import type { CalendarEvent, EventCategory } from "@/mock-data/calendar";
import { getEventsForDate, formatTime } from "@/mock-data/calendar";

const categoryPill: Record<EventCategory, string> = {
  mandatory: "bg-[#f9e8e9] text-[#A61017] border-l-2 border-[#A61017]",
  social:    "bg-[#e6edf5] text-[#0A3864] border-l-2 border-[#0A3864]",
  sports:    "bg-emerald-50 text-emerald-700 border-l-2 border-emerald-500",
  misc:      "bg-gray-100 text-gray-600 border-l-2 border-gray-400",
};

function getWeekDays(date: Date): Date[] {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(d);
    day.setDate(d.getDate() + i);
    return day;
  });
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
  currentDate: Date;
  today: Date;
  onEventClick: (e: CalendarEvent) => void;
}

export function WeekView({ currentDate, today, onEventClick }: Props) {
  const days = getWeekDays(currentDate);
  const todayStr = toDateStr(today);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {days.map((day, i) => {
          const isToday = toDateStr(day) === todayStr;
          return (
            <div key={i} className="py-3 text-center border-r border-gray-200 last:border-r-0">
              <p className="text-xs text-gray-500 mb-0.5">{SHORT_DAYS[i]}</p>
              <span
                className={cn(
                  "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium",
                  isToday ? "bg-[#A61017] text-white" : "text-gray-800"
                )}
              >
                {day.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-7 flex-1">
        {days.map((day, i) => {
          const events = getEventsForDate(toDateStr(day));
          return (
            <div key={i} className="p-2 border-r border-gray-200 last:border-r-0 flex flex-col gap-1.5">
              {events.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => onEventClick(ev)}
                  className={cn(
                    "w-full text-left rounded-lg px-2 py-1.5 hover:opacity-75 transition-opacity",
                    categoryPill[ev.category]
                  )}
                >
                  <p className="text-[11px] font-medium leading-snug truncate">{ev.title}</p>
                  <p className="text-[10px] opacity-60">{formatTime(ev.startTime)}</p>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
