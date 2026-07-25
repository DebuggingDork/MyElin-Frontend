"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = {
  stage: string;
  traditional: number;
  myelin: number;
};

export function PathwayChart({ data }: { data: Point[] }) {
  return (
    <div className="h-[280px] w-full sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="myelinFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#08a8a0" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#08a8a0" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="tradFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4a8a86" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#4a8a86" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#d4ebe9" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="stage"
            tick={{ fill: "#4a8a86", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#4a8a86", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #d4ebe9",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="traditional"
            name="Traditional"
            stroke="#4a8a86"
            fill="url(#tradFill)"
            strokeWidth={1.5}
          />
          <Area
            type="monotone"
            dataKey="myelin"
            name="Myelin"
            stroke="#08a8a0"
            fill="url(#myelinFill)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
