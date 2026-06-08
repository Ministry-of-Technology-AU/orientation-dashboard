"use client";

interface Props {
  view: "month" | "week" | "list";
}

function Shimmer({ className }: { className: string }) {
  return (
    <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
  );
}

function MonthSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="py-2.5 flex justify-center bg-gray-50">
            <Shimmer className="h-3 w-6" />
          </div>
        ))}
      </div>
      {/* Grid cells */}
      <div className="grid grid-cols-7 flex-1">
        {Array.from({ length: 35 }).map((_, i) => {
          const isLastCol = (i + 1) % 7 === 0;
          const isLastRow = i >= 28;
          return (
            <div
              key={i}
              className={[
                "min-h-[90px] p-2 space-y-1.5",
                !isLastRow ? "border-b border-gray-100" : "",
                !isLastCol ? "border-r border-gray-100" : "",
              ].join(" ")}
            >
              <Shimmer className="h-5 w-5 rounded-full" />
              {(i % 2 === 0) && <Shimmer className="h-4 w-full" />}
              {(i % 3 === 0) && <Shimmer className="h-4 w-4/5" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="py-3 flex flex-col items-center gap-1 border-r border-gray-100 last:border-r-0">
            <Shimmer className="h-2.5 w-6" />
            <Shimmer className="h-7 w-7 rounded-full" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="p-2 space-y-1.5 border-r border-gray-100 last:border-r-0">
            {Array.from({ length: (i % 2) + 1 }).map((_, j) => (
              <Shimmer key={j} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="overflow-y-auto px-6 py-4 flex flex-col gap-2.5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 flex items-start gap-4">
          <div className="w-10 shrink-0 flex flex-col items-center gap-1">
            <Shimmer className="h-2.5 w-6" />
            <Shimmer className="h-6 w-8" />
          </div>
          <Shimmer className="w-0.5 self-stretch" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between gap-2">
              <Shimmer className="h-4 w-2/3" />
              <Shimmer className="h-4 w-14 rounded-full" />
            </div>
            <Shimmer className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LoadingSkeleton({ view }: Props) {
  return (
    <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white">
      {view === "month" && <MonthSkeleton />}
      {view === "week" && <WeekSkeleton />}
      {view === "list" && <ListSkeleton />}
    </div>
  );
}
