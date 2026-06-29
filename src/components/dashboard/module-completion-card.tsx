import Link from "next/link";
import type { ModuleCompletionData } from "@/components/dashboard/dashboard-types";

export function ModuleCompletionCard({ data }: { data?: ModuleCompletionData }) {
  const safeData = data ?? { percentage: 0, completed: 0, total: 0 };
  return (
    <div className="bg-[#f9e8e9] rounded-2xl p-5 min-h-[164px] flex flex-col">
      <p className="text-sm text-gray-600 mb-1">Module Completion:</p>
      <p className="text-4xl font-bold text-[#A61017] mb-2">{safeData.percentage}%</p>
      <div className="w-full h-2 bg-[#e8c4c5] rounded-full overflow-hidden mb-1.5">
        <div
          className="h-full bg-[#A61017] rounded-full"
          style={{ width: `${safeData.percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 text-right">
        {safeData.completed} out of {safeData.total} modules completed
      </p>
      <div className="mt-auto pt-4">
        {safeData.nextModule ? (
          <Link href={safeData.nextModule.href} className="inline-flex items-center text-xs font-semibold text-[#A61017] hover:text-[#7d0c11]">
            Next: {safeData.nextModule.title} →
          </Link>
        ) : (
          <p className="text-xs font-semibold text-[#A61017]">All mandatory modules are complete.</p>
        )}
      </div>
    </div>
  );
}
