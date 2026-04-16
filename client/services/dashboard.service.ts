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

export async function getHospitalDashboardMetrics(hospitalId: string, token: string) {
  const cacheKey = `${hospitalId}:${token}`;
  const cachedRequest = dashboardMetricsRequests.get(cacheKey);
  if (cachedRequest) {
    return cachedRequest;
  }

  const request = Promise.all([
    hospitalService.getById(hospitalId) as Promise<HospitalDetailWithStats>,
    analyticsService.getOverview(token, hospitalId) as Promise<OverviewAnalytics>,
    analyticsService.getEquipment(token, hospitalId) as Promise<EquipmentAnalytics>,
    analyticsService.getIssues(token, hospitalId) as Promise<IssueAnalytics>,
    analyticsService.getAppointments(token, hospitalId) as Promise<AppointmentAnalytics>,
  ])
    .then(([hospital, overview, equipment, issues, appointments]) => ({
      hospital,
      summary: {
        totalDoctors: hospital.stats?.doctorCount ?? overview.totals.doctors,
        totalEquipment: hospital.stats?.equipmentCount ?? overview.totals.equipment,
        availableEquipment:
          equipment.statusDistribution.find((entry) => entry.label === "available")?.count ?? 0,
        totalAmbulances: hospital.stats?.ambulanceCount ?? overview.totals.ambulances,
        pendingAppointments:
          appointments.statusDistribution.find((entry) => entry.label === "pending")?.count ?? 0,
        openIssues: issues.statusDistribution.find((entry) => entry.label === "open")?.count ?? 0,
      },
      charts: {
        equipmentStatus: equipment.statusDistribution,
        issueTrends: issues.trends.last7Days,
        appointmentsPerDay: appointments.trends.last7Days,
        topIssueTypes: issues.topIssueTypes,
        mostUsedEquipmentTypes: equipment.mostUsedEquipmentTypes,
        appointmentStatus: appointments.statusDistribution,
      },
    }) satisfies HospitalDashboardMetrics)
    .finally(() => {
      dashboardMetricsRequests.delete(cacheKey);
    });

  dashboardMetricsRequests.set(cacheKey, request);
  return request;
}
