"use client";

import { PieChart, Pie, Cell } from "recharts";

interface ModuleStats {
  total: number;
  completedWithGames: number;
  completedModules: number;
  notStarted: number;
}

const COLORS = ["#0A3864", "#1a5fa0", "#d1dae3"];

const legend = [
  { label: "Modules + Test Completed", color: "#0A3864" },
  { label: "Modules Completed", color: "#1a5fa0" },
  { label: "Yet to Start", color: "#d1dae3" },
];

export function StatisticsDonut({ stats }: { stats?: ModuleStats }) {
  const safeStats = stats ?? { total: 0, completedWithGames: 0, completedModules: 0, notStarted: 0 };
  const data = [
    { value: safeStats.completedWithGames ?? 0 },
    { value: safeStats.completedModules ?? 0 },
    { value: safeStats.notStarted ?? 0 },
  ];

  const total = safeStats.total || 1; // Avoid division by zero
  const pcts = data.map((d) => Math.round((d.value / total) * 100));


  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Statistics</h3>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative">
          <PieChart width={220} height={220}>
            <Pie
              data={data}
              cx={110}
              cy={110}
              innerRadius={72}
              outerRadius={100}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-4xl font-bold text-gray-900">
              {String(safeStats.total).padStart(2, "0")}
            </span>
            <span className="text-sm text-gray-500 mt-0.5">Modules</span>
          </div>
        </div>

        <div className="flex gap-4 mt-4 flex-wrap justify-center">
          {legend.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11px] text-gray-600 leading-tight">
                <span className="font-semibold">{pcts[i]}%</span>
                <br />
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
