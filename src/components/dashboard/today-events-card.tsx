interface TodayEventsData {
  day: string;
  date: number;
  events: { title: string; location: string; time: string }[];
}

export function TodayEventsCard({ data }: { data: TodayEventsData }) {
  const [firstEvent, ...restEvents] = data.events;

  return (
    <div className="bg-[#A61017] rounded-2xl p-4 text-white">
      <div className="flex gap-4">
        {/* Date block */}
        <div className="shrink-0">
          <p className="text-base font-semibold leading-tight">{data.day}</p>
          <p className="text-5xl font-bold leading-none mt-0.5">{data.date}</p>
        </div>

        {/* Events */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          {firstEvent && (
            <div>
              <p className="text-sm font-semibold leading-tight">{firstEvent.title}</p>
              <p className="text-xs text-red-200 leading-tight">{firstEvent.location}</p>
              <p className="text-xs text-red-200 leading-tight">{firstEvent.time}</p>
            </div>
          )}
          {restEvents.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {restEvents.map((event, i) => (
                <div key={i}>
                  <p className="text-[11px] font-semibold leading-tight">{event.title}</p>
                  <p className="text-[11px] text-red-200 leading-tight">{event.location}</p>
                  <p className="text-[11px] text-red-200 leading-tight">{event.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
