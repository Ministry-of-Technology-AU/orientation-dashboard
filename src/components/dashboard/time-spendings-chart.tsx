"use client";

import { BarChart, Bar, XAxis, ReferenceLine, Cell, ResponsiveContainer } from "recharts";

interface DataPoint {
  day: string;
  hours: number;
  active: boolean;
}

export function TimeSpendingsChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={180} minWidth={0}>
      <BarChart data={data} barSize={36} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#6b7280", fontSize: 12 }}
        />
        <ReferenceLine
          y={4}
          stroke="#cbd5e1"
          strokeDasharray="4 4"
          label={{ value: "4hr", position: "left", fill: "#9ca3af", fontSize: 11 }}
        />
        <ReferenceLine
          y={2}
          stroke="#cbd5e1"
          strokeDasharray="4 4"
          label={{ value: "2hr", position: "left", fill: "#9ca3af", fontSize: 11 }}
        />
        <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.active ? "#0A3864" : "#c8d3de"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
