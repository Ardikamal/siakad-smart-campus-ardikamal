"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface MahasiswaChartProps {
  data: { prodi: string; jumlah: number }[];
}

export function MahasiswaChart({ data }: MahasiswaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="prodi" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="jumlah" fill="var(--color-accent)" radius={[6, 6, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
