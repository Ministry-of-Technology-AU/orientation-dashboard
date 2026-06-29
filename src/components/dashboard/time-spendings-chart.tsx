"use client";

import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { TimeSpendingPoint } from "@/components/dashboard/dashboard-types";

export function TimeSpendingsChart({ data }: { data?: TimeSpendingPoint[] }) {
  const safeData = data ?? [];
  const maxMinutes = Math.max(...safeData.map((item) => item.minutes), 0);

  if (safeData.length === 0) {
    return (
      <div className="h-[260px] flex items-center justify-center rounded-lg border border-dashed border-primary-blue/15 bg-white/40 text-center">
        <p className="text-sm font-medium text-primary-blue/45">Start reading a module to see time here.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260} minWidth={0}>
      <BarChart data={safeData} barSize={42} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#6b7280", fontSize: 12 }}
          interval={0}
          tickMargin={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          width={36}
          domain={[0, Math.max(5, maxMinutes)]}
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          tickFormatter={(value) => `${value}m`}
        />
        <Tooltip
          cursor={{ fill: "rgba(10,56,100,0.05)" }}
          formatter={(value) => [`${value} min`, "Reading time"]}
          labelStyle={{ color: "#0A3864", fontWeight: 700 }}
          contentStyle={{ borderRadius: 8, borderColor: "rgba(10,56,100,0.12)" }}
        />
        <Bar dataKey="minutes" radius={[5, 5, 0, 0]}>
          {safeData.map((entry, index) => (
            <Cell key={index} fill={entry.active ? "#0A3864" : "#c8d3de"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
