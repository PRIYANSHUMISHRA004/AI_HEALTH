"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarClock,
  RefreshCcw,
  PackageCheck,
  PackageSearch,
  ShieldAlert,
  Stethoscope,
  Truck,
} from "lucide-react";

import { getErrorMessage } from "@/lib/utils";
import { createAsyncState, type AIInsight, type AsyncState } from "@/types";
import { aiService, getHospitalDashboardMetrics, type HospitalDashboardMetrics } from "@/services";
import { useAuth } from "@/hooks/use-auth";
import { AppointmentsBarChart } from "@/components/dashboard/appointments-bar-chart";
import { EquipmentStatusChart } from "@/components/dashboard/equipment-status-chart";
import { IssueTrendsChart } from "@/components/dashboard/issue-trends-chart";
import { SectionPanel } from "@/components/dashboard/section-panel";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { ErrorState } from "@/components/ui/error-state";

const summaryConfig = [
  {
    key: "totalDoctors",
    title: "Total doctors",
    detail: "Active specialists linked to this hospital network profile.",
    accent: "bg-teal-50 text-teal-700",
    icon: Stethoscope,
  },
  {
    key: "totalEquipment",
    title: "Total equipment",
    detail: "All tracked devices and operational assets across departments.",
    accent: "bg-emerald-50 text-emerald-700",
    icon: PackageSearch,
  },
  {
    key: "availableEquipment",
    title: "Available equipment",
    detail: "Units currently ready for allocation without maintenance blockers.",
    accent: "bg-lime-50 text-lime-700",
    icon: PackageCheck,
  },
  {
    key: "totalAmbulances",
    title: "Total ambulances",
    detail: "Vehicles in your response fleet including active and standby units.",
    accent: "bg-sky-50 text-sky-700",
    icon: Truck,
  },
  {
    key: "pendingAppointments",
    title: "Pending appointments",
    detail: "Requests that still need confirmation or scheduling action.",
    accent: "bg-amber-50 text-amber-700",
    icon: CalendarClock,
  },
  {
    key: "openIssues",
    title: "Open issues",
    detail: "Public and operational issues still waiting for team resolution.",
    accent: "bg-rose-50 text-rose-700",
    icon: ShieldAlert,
  },
] as const;

export function DashboardShell() {
  const { token, user } = useAuth();
  const [state, setState] = useState<AsyncState<HospitalDashboardMetrics>>(createAsyncState());
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);

  const loadInsights = useCallback(async (hospitalId: string, accessToken: string) => {
    setIsInsightsLoading(true);
    setInsightsError(null);

    try {
      const response = await aiService.getInsights(accessToken, hospitalId);
      setInsights(response.insights);
    } catch (error) {
      setInsightsError(getErrorMessage(error, "Unable to generate AI insights right now."));
    } finally {
      setIsInsightsLoading(false);
    }
  }, []);

  useEffect(() => {
    const linkedHospitalId = user?.linkedHospitalId;

    if (!token || !linkedHospitalId) {
      setState({
        data: null,
        isLoading: false,
        error: "Hospital dashboard is available after linking a hospital admin account to a hospital profile.",
      });
      return;
    }

    let isMounted = true;

    setState((current) => ({
      ...current,
      isLoading: true,
      error: null,
    }));

    getHospitalDashboardMetrics(linkedHospitalId, token)
      .then((data) => {
        if (!isMounted) return;
        setState({
          data,
          isLoading: false,
          error: null,
        });
        void loadInsights(linkedHospitalId, token);
      })
      .catch((error: unknown) => {
        if (!isMounted) return;
        setState({
          data: null,
          isLoading: false,
          error: getErrorMessage(error),
        });
      });

    return () => {
      isMounted = false;
    };
  }, [loadInsights, token, user?.linkedHospitalId]);

  if (state.error && !state.data) {
    return (
      <ErrorState
        title="Dashboard unavailable"
        description={state.error}
      />
    );
  }

  const metrics = state.data;

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="overflow-hidden rounded-[30px] border border-[var(--border)] bg-[linear-gradient(135deg,#0f766e_0%,#134e4a_55%,#10231b_100%)] px-5 py-6 text-white shadow-[0_25px_70px_rgba(15,118,110,0.24)] sm:rounded-[34px] sm:px-8 sm:py-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-100/90">Hospital dashboard</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {metrics?.hospital.name ?? "Operations overview"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-teal-50/88 sm:text-[15px]">
              Track doctors, resources, appointments, and issue pressure from one admin surface built for quick demo flow and easy expansion.
            </p>
          </div>
          <div className="w-full rounded-[22px] border border-white/12 bg-white/8 px-5 py-4 backdrop-blur sm:w-auto sm:min-w-[220px] sm:rounded-[24px]">
            <p className="text-[11px] uppercase tracking-[0.22em] text-teal-100/80">Location</p>
            <p className="mt-2 text-lg font-semibold">
              {metrics ? `${metrics.hospital.city}, ${metrics.hospital.state}` : "Loading profile"}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryConfig.map((item) => (
          <SummaryCard
            key={item.key}
            title={item.title}
            value={state.isLoading ? "..." : (metrics?.summary[item.key] ?? 0)}
            detail={item.detail}
            accent={item.accent}
            icon={item.icon}
          />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <SectionPanel
          eyebrow="Charts"
          title="Readiness and demand trends"
          description="Live operational charts fed by the backend analytics endpoints so the dashboard reads clearly during demos and scales into deeper reporting later."
        >
          <div className="grid gap-4 xl:grid-cols-2">
            <EquipmentStatusChart data={metrics?.charts.equipmentStatus ?? []} />
            <IssueTrendsChart data={metrics?.charts.issueTrends ?? []} />
            <div className="xl:col-span-2">
              <AppointmentsBarChart data={metrics?.charts.appointmentsPerDay ?? []} />
            </div>
          </div>
        </SectionPanel>

        <SectionPanel
          eyebrow="AI insights"
          title="What the team should watch next"
          description="Concise AI-generated observations based on issue patterns, equipment demand, and appointment behavior."
        >
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--muted)]">
                Refresh to regenerate the latest insights from current hospital activity.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (token && user?.linkedHospitalId) {
                    void loadInsights(user.linkedHospitalId, token);
                  }
                }}
                disabled={isInsightsLoading || !token || !user?.linkedHospitalId}
                className="btn-secondary btn-sm self-start"
              >
                <RefreshCcw className={`h-4 w-4 ${isInsightsLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {insightsError ? (
              <div className="rounded-[22px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {insightsError}
              </div>
            ) : null}

            <div className="space-y-3">
              {(insights.length
                ? insights
                : [
                    {
                      id: "fallback-appointments",
                      title: "Appointment response queue",
                      insight: `${metrics?.summary.pendingAppointments ?? 0} appointments are still pending confirmation and are the fastest operational follow-up for the admin team.`,
                    },
                    {
                      id: "fallback-equipment",
                      title: "Resource pressure",
                      insight:
                        metrics?.charts.mostUsedEquipmentTypes[0]
                          ? `${metrics.charts.mostUsedEquipmentTypes[0].type} is currently the most represented equipment type in tracked inventory.`
                          : "Available equipment is separated from total stock so shortage signals are immediately visible.",
                    },
                    {
                      id: "fallback-issues",
                      title: "Issue resolution lane",
                      insight:
                        metrics?.charts.topIssueTypes[0]
                          ? `${metrics.charts.topIssueTypes[0].issueType} is the most frequent issue category right now, which helps the team focus recurring pain points quickly.`
                          : "Open issues stay visible beside charts to keep public-facing problems part of the daily workflow.",
                    },
                  ]
              ).map((item) => (
                <article key={item.id} className="rounded-[22px] border border-[var(--border)] bg-[rgba(16,35,27,0.03)] p-4 sm:p-5">
                  <h3 className="text-base font-semibold text-[var(--foreground)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{item.insight}</p>
                </article>
              ))}
            </div>
          </div>
        </SectionPanel>
      </div>
    </div>
  );
}
