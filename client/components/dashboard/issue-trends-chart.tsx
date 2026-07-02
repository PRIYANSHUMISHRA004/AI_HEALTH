"use client";

import { memo } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { AnalyticsTrendPoint } from "@/types";
import { ChartCard } from "@/components/dashboard/chart-card";
import { EmptyState } from "@/components/ui/empty-state";

interface IssueTrendsChartProps {
  data: AnalyticsTrendPoint[];
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(value));

export const IssueTrendsChart = memo(function IssueTrendsChart({ data }: IssueTrendsChartProps) {
  if (!data.length) {
    return (
      <ChartCard
        title="Issue trends"
        description="Daily issue creation pattern across the last seven days."
      >
        <EmptyState
          title="No issue trend yet"
          description="Issue trend data will appear once issues are created for this hospital."
          compact
        />
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Issue trends"
      description="Daily issue creation pattern across the last seven days."
      aside={<span>Last 7 days</span>}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 4 }}>
          <CartesianGrid stroke="rgba(16,35,27,0.08)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#61736b", fontSize: 12 }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#61736b", fontSize: 12 }}
          />
          <Tooltip
            labelFormatter={(value) => formatDate(String(value))}
            formatter={(value) => [Number(value ?? 0), "Issues"]}
            contentStyle={{ borderRadius: 16, borderColor: "rgba(16,35,27,0.08)" }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#0f766e"
            strokeWidth={3}
            dot={{ r: 4, fill: "#0f766e" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
});
