import Link from "next/link";
import type { TodayEventsData } from "@/components/dashboard/dashboard-types";

export function TodayEventsCard({ data }: { data?: TodayEventsData }) {
  const safeData = data ?? { day: "", date: 0, events: [] };
  const events = safeData.events ?? [];

  return (
    <div className="bg-[#A61017] rounded-2xl p-5 min-h-[184px] text-white">
      <div className="flex gap-5">
        {/* Date block */}
        <div className="shrink-0">
          <p className="text-base font-semibold leading-tight">{safeData.day}</p>
          <p className="text-5xl font-bold leading-none mt-0.5">{safeData.date || ""}</p>
        </div>

        {/* Events */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 min-w-0">
          {events.length === 0 ? (
            <div className="sm:col-span-2 self-center">
              <p className="text-sm font-semibold leading-tight">No events scheduled today.</p>
              <Link href="/calendar" className="mt-2 inline-flex text-xs font-semibold text-red-100 hover:text-white">
                Open calendar →
              </Link>
            </div>
          ) : (
            events.map((event, i) => (
              <div key={i} className="min-w-0">
                <p className="text-sm font-semibold leading-tight truncate">{event.title}</p>
                <p className="text-xs text-red-200 leading-tight truncate">{event.location}</p>
                <p className="text-xs text-red-200 leading-tight">{event.time}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
