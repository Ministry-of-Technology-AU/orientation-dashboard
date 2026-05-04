import { cn } from "@/lib/utils";
import type { CalendarEvent, EventCategory } from "@/mock-data/calendar";
import { getEventsForDate } from "@/mock-data/calendar";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const categoryPill: Record<EventCategory, string> = {
  mandatory: "bg-[#f9e8e9] text-[#A61017]",
  social:    "bg-[#e6edf5] text-[#0A3864]",
  sports:    "bg-emerald-50 text-emerald-700",
  misc:      "bg-gray-100 text-gray-600",
};

function getMonthCells(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const cells: { date: Date; isCurrentMonth: boolean }[] = [];

  for (let i = startOffset - 1; i >= 0; i--)
    cells.push({ date: new Date(year, month, -i), isCurrentMonth: false });
  for (let d = 1; d <= lastDay.getDate(); d++)
    cells.push({ date: new Date(year, month, d), isCurrentMonth: true });
  let next = 1;
  while (cells.length % 7 !== 0)
    cells.push({ date: new Date(year, month + 1, next++), isCurrentMonth: false });

  return cells;
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface Props {
  year: number;
  month: number;
  today: Date;
  onEventClick: (e: CalendarEvent) => void;
}

export function MonthView({ year, month, today, onEventClick }: Props) {
  const cells = getMonthCells(year, month);
  const todayStr = toDateStr(today);

  return (
    <div className="flex flex-col h-full">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {DAYS.map((day) => (
          <div key={day} className="py-2.5 text-center text-xs font-medium text-gray-500 bg-gray-50">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 flex-1 overflow-y-auto">
        {cells.map(({ date, isCurrentMonth }, i) => {
          const dateStr = toDateStr(date);
          const isToday = dateStr === todayStr;
          const events = getEventsForDate(dateStr);
          const isLastCol = (i + 1) % 7 === 0;
          const isLastRow = i >= cells.length - 7;

          return (
            <div
              key={dateStr + i}
              className={cn(
                "min-h-[90px] p-1.5",
                !isLastRow && "border-b border-gray-200",
                !isLastCol && "border-r border-gray-200",
                !isCurrentMonth && "bg-gray-50/60"
              )}
            >
              <span
                className={cn(
                  "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs mb-1",
                  isToday
                    ? "bg-[#A61017] text-white font-semibold"
                    : isCurrentMonth
                    ? "text-gray-800"
                    : "text-gray-300"
                )}
              >
                {date.getDate()}
              </span>

              <div className="flex flex-col gap-0.5">
                {events.slice(0, 2).map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => onEventClick(ev)}
                    className={cn(
                      "w-full text-left text-[10px] rounded px-1.5 py-0.5 truncate leading-snug hover:opacity-75 transition-opacity",
                      categoryPill[ev.category]
                    )}
                  >
                    {ev.title}
                  </button>
                ))}
                {events.length > 2 && (
                  <span className="text-[10px] text-gray-400 px-1">+{events.length - 2} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
