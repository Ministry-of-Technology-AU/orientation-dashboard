import { cn } from "@/lib/utils";
import type { ModuleStatus } from "@/mock-data/modules";

const config: Record<ModuleStatus, { label: string; className: string }> = {
  completed:    { label: "Complete",     className: "bg-emerald-100 text-emerald-700" },
  in_progress:  { label: "In Progress",  className: "bg-amber-100 text-amber-700" },
  not_started:  { label: "Yet To Start", className: "bg-rose-100 text-rose-600" },
};

export function ModuleStatusBadge({
  status,
  className,
}: {
  status: ModuleStatus;
  className?: string;
}) {
  const { label, className: base } = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        base,
        className
      )}
    >
      {label}
    </span>
  );
}
