"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface AkademikChartProps {
  data: { label: string; ipk: number }[];
}

export function AkademikChart({ data }: AkademikChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
        <YAxis domain={[0, 4]} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Line type="monotone" dataKey="ipk" stroke="var(--color-secondary)" strokeWidth={2.5} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
