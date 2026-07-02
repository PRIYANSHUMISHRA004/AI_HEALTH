"use client";

import { memo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { AnalyticsTrendPoint } from "@/types";
import { ChartCard } from "@/components/dashboard/chart-card";
import { EmptyState } from "@/components/ui/empty-state";

interface AppointmentsBarChartProps {
  data: AnalyticsTrendPoint[];
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(value));

export const AppointmentsBarChart = memo(function AppointmentsBarChart({ data }: AppointmentsBarChartProps) {
  if (!data.length) {
    return (
      <ChartCard
        title="Appointments per day"
        description="Daily booking volume across the last seven days."
      >
        <EmptyState
          title="No appointment trend yet"
          description="Appointment volume will appear here once bookings are made."
          compact
        />
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Appointments per day"
      description="Daily booking volume across the last seven days."
      aside={<span>Last 7 days</span>}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 4 }}>
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
            formatter={(value) => [Number(value ?? 0), "Appointments"]}
            contentStyle={{ borderRadius: 16, borderColor: "rgba(16,35,27,0.08)" }}
          />
          <Bar
            dataKey="count"
            fill="#14b8a6"
            radius={[12, 12, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
});
