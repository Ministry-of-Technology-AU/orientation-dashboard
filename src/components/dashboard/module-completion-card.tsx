interface ModuleCompletionData {
  percentage: number;
  completed: number;
  total: number;
}

export function ModuleCompletionCard({ data }: { data?: ModuleCompletionData }) {
  const safeData = data ?? { percentage: 0, completed: 0, total: 0 };
  return (
    <div className="bg-[#f9e8e9] rounded-2xl p-4">
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
    </div>
  );
}
