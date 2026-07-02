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
import { aiService, clearDashboardCache, getHospitalDashboardMetrics, type HospitalDashboardMetrics } from "@/services";
import { useAuth } from "@/hooks/use-auth";
import { AppointmentsBarChart } from "@/components/dashboard/appointments-bar-chart";
import { EquipmentStatusChart } from "@/components/dashboard/equipment-status-chart";
import { IssueTrendsChart } from "@/components/dashboard/issue-trends-chart";
import { SectionPanel } from "@/components/dashboard/section-panel";
import { SummaryCard } from "@/components/dashboard/summary-card";

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
  const [refreshKey, setRefreshKey] = useState(0);

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

  const loadMetrics = useCallback(() => {
    if (!token) return;

    const linkedHospitalId = user?.linkedHospitalId;

    clearDashboardCache();
    setState((current) => ({ ...current, isLoading: true, error: null }));

    getHospitalDashboardMetrics(linkedHospitalId, token)
      .then((data) => {
        setState({ data, isLoading: false, error: null });
        const hospitalId = linkedHospitalId ?? data.hospital._id?.toString();
        if (hospitalId) void loadInsights(hospitalId, token);
      })
      .catch((error: unknown) => {
        setState({ data: null, isLoading: false, error: getErrorMessage(error) });
      });
  }, [loadInsights, token, user?.linkedHospitalId]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics, refreshKey]);

  if (state.isLoading && !state.data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-36 rounded-[30px] bg-[var(--border)]" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-[24px] bg-[var(--border)]" />
          ))}
        </div>
      </div>
    );
  }

  if (state.error && !state.data) {
    const isNoHospital =
      state.error.toLowerCase().includes("no linkedhospitalid") ||
      state.error.toLowerCase().includes("hospital not found");

    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
        <div className="rounded-2xl bg-amber-50 p-4 text-amber-600">
          <RefreshCcw className="h-8 w-8" />
        </div>
        <div className="max-w-md">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {isNoHospital ? "No hospital linked to your account" : "Dashboard unavailable"}
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            {isNoHospital
              ? "Your account is not linked to a hospital profile yet. Register a hospital first, then update your profile with the hospital ID."
              : state.error}
          </p>
        </div>
        {isNoHospital ? (
          <a
            href="/hospital/network"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)]"
          >
            Go to Network
          </a>
        ) : (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--primary)]"
          >
            <RefreshCcw className="h-4 w-4" />
            Retry
          </button>
        )}
      </div>
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

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Summary</p>
        <button
          type="button"
          onClick={() => setRefreshKey((k) => k + 1)}
          disabled={state.isLoading}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-50"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${state.isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.78fr)] 2xl:grid-cols-[minmax(0,1.58fr)_360px]">
        <SectionPanel
          eyebrow="Charts"
          title="Readiness and demand trends"
          description="Live operational charts fed by the backend analytics endpoints so the dashboard reads clearly during demos and scales into deeper reporting later."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <EquipmentStatusChart data={metrics?.charts.equipmentStatus ?? []} />
            <IssueTrendsChart data={metrics?.charts.issueTrends ?? []} />
            <div className="lg:col-span-2">
              <AppointmentsBarChart data={metrics?.charts.appointmentsPerDay ?? []} />
            </div>
          </div>
        </SectionPanel>

        <div className="xl:sticky xl:top-6 xl:self-start">
        <SectionPanel
          eyebrow="AI insights"
          title="What needs attention"
          description="Concise operational observations based on issue patterns, equipment demand, and appointment behaviour."
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
                <article key={item.id} className="rounded-[20px] border border-[var(--border)] bg-[rgba(16,35,27,0.03)] p-4">
                  <h3 className="text-[15px] font-semibold text-[var(--foreground)] sm:text-base">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{item.insight}</p>
                </article>
              ))}
            </div>
          </div>
        </SectionPanel>
        </div>
      </div>
    </div>
  );
}
