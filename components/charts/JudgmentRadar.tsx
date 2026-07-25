"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type RadarPoint = { skill: string; score: number; full: number };

export function JudgmentRadar({ data }: { data: RadarPoint[] }) {
  return (
    <div className="h-[280px] w-full sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
          <PolarGrid stroke="#d4ebe9" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: "#4a8a86", fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Judgment"
            dataKey="score"
            stroke="#08a8a0"
            fill="#08a8a0"
            fillOpacity={0.22}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #d4ebe9",
              fontSize: 12,
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
