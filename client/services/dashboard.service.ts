import { analyticsService } from "@/services/analytics.service";
import { hospitalService } from "@/services/hospital.service";
import type {
  AnalyticsDistributionItem,
  AnalyticsTrendPoint,
  AppointmentAnalytics,
  EquipmentAnalytics,
  Hospital,
  IssueAnalytics,
  OverviewAnalytics,
} from "@/types";

interface HospitalStats {
  doctorCount?: number;
  equipmentCount?: number;
  ambulanceCount?: number;
  appointmentCount?: number;
  issueCount?: number;
  reviewCount?: number;
}

interface HospitalDetailWithStats extends Hospital {
  stats?: HospitalStats;
}

export interface HospitalDashboardMetrics {
  hospital: HospitalDetailWithStats;
  summary: {
    totalDoctors: number;
    totalEquipment: number;
    availableEquipment: number;
    totalAmbulances: number;
    pendingAppointments: number;
    openIssues: number;
  };
  charts: {
    equipmentStatus: AnalyticsDistributionItem[];
    issueTrends: AnalyticsTrendPoint[];
    appointmentsPerDay: AnalyticsTrendPoint[];
    topIssueTypes: IssueAnalytics["topIssueTypes"];
    mostUsedEquipmentTypes: EquipmentAnalytics["mostUsedEquipmentTypes"];
    appointmentStatus: AppointmentAnalytics["statusDistribution"];
  };
}

const dashboardMetricsRequests = new Map<string, Promise<HospitalDashboardMetrics>>();

export function clearDashboardCache() {
  dashboardMetricsRequests.clear();
}

export async function getHospitalDashboardMetrics(
  hospitalId: string | undefined,
  token: string,
): Promise<HospitalDashboardMetrics> {
  const cacheKey = `${hospitalId ?? "me"}:${token}`;
  const cached = dashboardMetricsRequests.get(cacheKey);
  if (cached) return cached;

  // Server resolves hospital scope from the hospitalId query param or from the
  // authenticated user's linkedHospitalId. Only fetch the hospital profile when
  // a concrete id is already known on the client side.
  const request = Promise.all([
    hospitalId
      ? (hospitalService.getById(hospitalId) as Promise<HospitalDetailWithStats>)
      : Promise.resolve(null as HospitalDetailWithStats | null),
    analyticsService.getOverview(token, hospitalId) as Promise<OverviewAnalytics>,
    analyticsService.getEquipment(token, hospitalId) as Promise<EquipmentAnalytics>,
    analyticsService.getIssues(token, hospitalId) as Promise<IssueAnalytics>,
    analyticsService.getAppointments(token, hospitalId) as Promise<AppointmentAnalytics>,
  ])
    .then(([hospitalProfile, overview, equipment, issues, appointments]) => {
      // Fall back to overview metadata when no profile was fetched directly
      const hospital: HospitalDetailWithStats =
        hospitalProfile ??
        ({ _id: overview.hospital.id, name: overview.hospital.name } as unknown as HospitalDetailWithStats);

      const metrics: HospitalDashboardMetrics = {
        hospital,
        summary: {
          totalDoctors: hospital.stats?.doctorCount ?? overview.totals.doctors,
          totalEquipment: hospital.stats?.equipmentCount ?? overview.totals.equipment,
          availableEquipment:
            equipment.statusDistribution.find((e) => e.label === "available")?.count ?? 0,
          totalAmbulances: hospital.stats?.ambulanceCount ?? overview.totals.ambulances,
          pendingAppointments:
            appointments.statusDistribution.find((e) => e.label === "pending")?.count ?? 0,
          openIssues: issues.statusDistribution.find((e) => e.label === "open")?.count ?? 0,
        },
        charts: {
          equipmentStatus: equipment.statusDistribution,
          issueTrends: issues.trends.last7Days,
          appointmentsPerDay: appointments.trends.last7Days,
          topIssueTypes: issues.topIssueTypes,
          mostUsedEquipmentTypes: equipment.mostUsedEquipmentTypes,
          appointmentStatus: appointments.statusDistribution,
        },
      };

      return metrics;
    })
    .finally(() => {
      dashboardMetricsRequests.delete(cacheKey);
    });

  dashboardMetricsRequests.set(cacheKey, request);
  return request;
}
