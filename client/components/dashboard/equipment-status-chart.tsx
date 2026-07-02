"use client";

import { memo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { AnalyticsDistributionItem } from "@/types";
import { ChartCard } from "@/components/dashboard/chart-card";
import { EmptyState } from "@/components/ui/empty-state";

interface EquipmentStatusChartProps {
  data: AnalyticsDistributionItem[];
}

const PIE_COLORS: Record<string, string> = {
  available: "#10b981",
  "in-use": "#f59e0b",
  maintenance: "#ef4444",
};

export const EquipmentStatusChart = memo(function EquipmentStatusChart({ data }: EquipmentStatusChartProps) {
  if (!data.length) {
    return (
      <ChartCard
        title="Equipment status mix"
        description="Operational stock split across available, active, and maintenance states."
      >
        <EmptyState
          title="No equipment analytics yet"
          description="Equipment status distribution will appear once equipment records are available."
          compact
        />
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Equipment status mix"
      description="Operational stock split across available, active, and maintenance states."
      aside={<span>{data.reduce((total, item) => total + item.count, 0)} tracked units</span>}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              innerRadius={62}
              outerRadius={96}
              paddingAngle={4}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.label}
                  fill={PIE_COLORS[entry.label] ?? "#0f766e"}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [Number(value ?? 0), String(name).replace("-", " ")]}
              contentStyle={{ borderRadius: 16, borderColor: "rgba(16,35,27,0.08)" }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex flex-col justify-center gap-3">
          {data.map((entry) => (
            <div
              key={entry.label}
              className="rounded-[18px] border border-[var(--border)] bg-[rgba(16,35,27,0.03)] px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[entry.label] ?? "#0f766e" }}
                  />
                  <span className="text-sm font-medium capitalize text-[var(--foreground)]">
                    {entry.label.replace("-", " ")}
                  </span>
                </div>
                <span className="text-base font-semibold text-[var(--foreground)]">{entry.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
});
