"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, PackageSearch, Siren, Sparkles } from "lucide-react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/hooks";
import { getErrorMessage } from "@/lib/utils";
import { appointmentService, equipmentService, issueService } from "@/services";
import type { Appointment, Equipment, Issue } from "@/types";

type ActivityType = "new_issue" | "resolved_issue" | "equipment_update" | "appointment_created";

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  badge: {
    label: string;
    tone: "danger" | "warning" | "success" | "info" | "neutral";
  };
}

const ACTIVITY_LIMIT = 12;

const typeMeta: Record<
  ActivityType,
  {
    icon: typeof Siren;
    panelClass: string;
  }
> = {
  new_issue: {
    icon: Siren,
    panelClass: "bg-rose-50 text-rose-700",
  },
  resolved_issue: {
    icon: Sparkles,
    panelClass: "bg-emerald-50 text-emerald-700",
  },
  equipment_update: {
    icon: PackageSearch,
    panelClass: "bg-sky-50 text-sky-700",
  },
  appointment_created: {
    icon: CalendarClock,
    panelClass: "bg-amber-50 text-amber-700",
  },
};

function getAppointmentDoctorName(appointment: Appointment) {
  return typeof appointment.doctorId === "object" && appointment.doctorId
    ? appointment.doctorId.name
    : "doctor";
}

function getEquipmentHospitalName(equipment: Equipment) {
  const hospital = equipment.hospitalId as unknown as string | { name?: string } | undefined;

  if (hospital && typeof hospital === "object" && hospital.name) {
    return hospital.name;
  }

  return "hospital";
}

function buildActivityItems(
  issues: Issue[],
  equipment: Equipment[],
  appointments: Appointment[],
) {
  const issueItems: ActivityItem[] = issues.flatMap((item) => {
    const createdItem: ActivityItem = {
      id: `issue-created-${item._id}`,
      type: "new_issue",
      title: item.title,
      description: item.description,
      timestamp: item.createdAt,
      badge: {
        label: "New issue",
        tone: "danger",
      },
    };

    const resolvedItem =
      item.status === "resolved"
        ? ({
            id: `issue-resolved-${item._id}`,
            type: "resolved_issue",
            title: item.title,
            description: "This issue was resolved and closed.",
            timestamp: item.resolvedAt || item.updatedAt,
            badge: {
              label: "Resolved",
              tone: "success",
            },
          } satisfies ActivityItem)
        : null;

    return resolvedItem ? [createdItem, resolvedItem] : [createdItem];
  });

  const equipmentItems: ActivityItem[] = equipment.map((item) => ({
    id: `equipment-${item._id}`,
    type: "equipment_update",
    title: item.name,
    description: `${item.type} in ${item.hospitalSection} at ${getEquipmentHospitalName(item)} is now ${item.status.replace("-", " ")}.`,
    timestamp: item.updatedAt,
    badge: {
      label: "Equipment update",
      tone: "info",
    },
  }));

  const appointmentItems: ActivityItem[] = appointments.map((item) => ({
    id: `appointment-${item._id}`,
    type: "appointment_created",
    title: "Appointment created",
    description: `${getAppointmentDoctorName(item)} received a new appointment request.`,
    timestamp: item.createdAt,
    badge: {
      label: "New appointment",
      tone: "warning",
    },
  }));

  return [...issueItems, ...equipmentItems, ...appointmentItems]
    .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
    .slice(0, 36);
}

export function ActivityFeed() {
  const { token } = useAuth();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;

    const loadActivity = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [issuesResponse, equipmentResponse, appointmentsResponse] = await Promise.all([
          issueService.list({ limit: ACTIVITY_LIMIT }),
          equipmentService.list({ limit: ACTIVITY_LIMIT }),
          appointmentService.list({ limit: ACTIVITY_LIMIT }, token),
        ]);

        if (!isMounted) return;

        setItems(
          buildActivityItems(
            issuesResponse.data,
            equipmentResponse.data,
            appointmentsResponse.data,
          ),
        );
      } catch (loadError) {
        if (!isMounted) return;
        setError(getErrorMessage(loadError, "Failed to load the activity feed."));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadActivity();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const summary = useMemo(
    () => ({
      issues: items.filter((item) => item.type === "new_issue").length,
      resolved: items.filter((item) => item.type === "resolved_issue").length,
      equipment: items.filter((item) => item.type === "equipment_update").length,
      appointments: items.filter((item) => item.type === "appointment_created").length,
    }),
    [items],
  );

  return (
    <AuthGuard allowedRoles={["patient", "hospital_admin", "doctor"]}>
      <div className="mx-auto flex w-full max-w-7xl flex-col px-6 pb-20 pt-10 sm:px-8 lg:px-12">
        <section className="space-y-8 py-12">
          <div className="rounded-[34px] border border-[var(--border)] bg-[linear-gradient(135deg,#0f766e_0%,#134e4a_55%,#10231b_100%)] px-6 py-8 text-white shadow-[0_25px_70px_rgba(15,118,110,0.24)] sm:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-100/90">Global activity</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Latest platform activity across care coordination</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-teal-50/86">
                  One shared feed for new issues, resolved issues, equipment updates, and appointments created across the platform.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "New issues", value: summary.issues },
                  { label: "Resolved", value: summary.resolved },
                  { label: "Equipment", value: summary.equipment },
                  { label: "Appointments", value: summary.appointments },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[22px] border border-white/12 bg-white/8 px-4 py-3 text-white/90 backdrop-blur"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-teal-100/80">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {isLoading ? (
            <LoadingState
              title="Loading activity feed"
              description="Pulling the latest issue, equipment, and appointment activity."
            />
          ) : error ? (
            <ErrorState
              title="Unable to load activity"
              description={error}
            />
          ) : items.length === 0 ? (
            <EmptyState
              title="No activity yet"
              description="Once issues, equipment updates, and appointments start flowing, they will appear here."
            />
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const meta = typeMeta[item.type];
                const Icon = meta.icon;

                return (
                  <article
                    key={item.id}
                    className="surface-card rounded-[30px] p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`rounded-[18px] p-3 ${meta.panelClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-lg font-semibold text-[var(--foreground)]">{item.title}</h2>
                            <StatusBadge label={item.badge.label} tone={item.badge.tone} />
                          </div>
                          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{item.description}</p>
                        </div>
                      </div>

                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AuthGuard>
  );
}
