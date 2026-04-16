import { Types, isValidObjectId } from "mongoose";

import { env } from "../config/env";
import {
  Ambulance,
  Appointment,
  Equipment,
  Hospital,
  Issue,
  User,
} from "../models";
import { HttpError } from "../utils/http-error";

const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 25_000;

export interface SmartSearchQueryResult {
  cleanedQuery: string;
  intent: string;
  entities: Record<string, string>;
}

interface InsightsScopeInput {
  userId: string;
  hospitalId?: string;
}

interface InsightsScope {
  hospitalId: Types.ObjectId;
  hospitalName: string;
}

export interface AIInsightItem {
  id: string;
  title: string;
  insight: string;
}

interface EmergencyInterpretation {
  summary: string;
  priority: "critical" | "high" | "medium";
  suggestedDepartment?: string;
  equipmentHints: string[];
  locationHints: {
    city?: string;
    state?: string;
  };
}

interface EmergencyModeInput {
  problemDescription: string;
  location: string;
}

interface EmergencyHospitalMatch {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  contactNumber: string;
  emergencyContact: string;
  availabilityStatus: string;
  distanceKm?: number;
  availableEquipmentCount: number;
  availableAmbulanceCount: number;
  matchReason: string;
}

interface EmergencyEquipmentMatch {
  id: string;
  name: string;
  type: string;
  status: string;
  hospitalSection: string;
  hospital: {
    id: string;
    name: string;
    city: string;
    state: string;
    contactNumber: string;
  };
}

interface EmergencyAmbulanceMatch {
  id: string;
  vehicleNumber: string;
  driverName: string;
  contactNumber: string;
  currentLocation?: string;
  hospital: {
    id: string;
    name: string;
    city: string;
    state: string;
    emergencyContact: string;
  };
}

type OpenRouterChatRole = "system" | "user" | "assistant";

interface OpenRouterChatMessage {
  role: OpenRouterChatRole;
  content: string;
}

interface OpenRouterChatCompletionResponse {
  choices?: Array<{
    message?: { content?: string };
  }>;
  error?: { message?: string };
}

/** Minimal OpenRouter client — hackathon-friendly, single responsibility. */
export class OpenRouterProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string
  ) {}

  async completeChat(messages: OpenRouterChatMessage[], temperature = 0.2): Promise<string> {
    const response = await fetchWithTimeout(
      OPENROUTER_CHAT_URL,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          temperature,
          messages,
        }),
      },
      REQUEST_TIMEOUT_MS
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new HttpError(502, `OpenRouter request failed: ${detail || response.statusText}`);
    }

    const json = (await response.json()) as OpenRouterChatCompletionResponse;
    if (json.error?.message) {
      throw new HttpError(502, `OpenRouter error: ${json.error.message}`);
    }

    const content = json.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new HttpError(502, "OpenRouter returned an empty response");
    }

    return content.trim();
  }
}

const getOpenRouterOrThrow = (): OpenRouterProvider =>
  new OpenRouterProvider(env.openRouterApiKey, env.openRouterModel);

const resolveInsightsScope = async ({
  userId,
  hospitalId,
}: InsightsScopeInput): Promise<InsightsScope> => {
  let resolvedHospitalId: Types.ObjectId | undefined;

  if (hospitalId) {
    if (!isValidObjectId(hospitalId)) {
      throw new HttpError(400, "Invalid hospitalId");
    }
    resolvedHospitalId = new Types.ObjectId(hospitalId);
  } else {
    if (!isValidObjectId(userId)) {
      throw new HttpError(400, "Invalid user id");
    }

    const user = await User.findById(userId).select("linkedHospitalId").lean();
    if (!user?.linkedHospitalId) {
      throw new HttpError(400, "No linkedHospitalId found for the current user");
    }

    resolvedHospitalId = user.linkedHospitalId as Types.ObjectId;
  }

  const hospital = await Hospital.findById(resolvedHospitalId).select("name").lean();
  if (!hospital) {
    throw new HttpError(404, "Hospital not found");
  }

  return {
    hospitalId: resolvedHospitalId,
    hospitalName: hospital.name,
  };
};

const fetchWithTimeout = async (
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (controller.signal.aborted) {
      throw new HttpError(504, "AI request timed out");
    }
    if (err instanceof HttpError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : "Network error";
    throw new HttpError(502, `AI request failed: ${message}`);
  } finally {
    clearTimeout(timeout);
  }
};

const callOpenRouter = async (opts: {
  system: string;
  user: string;
  temperature?: number;
}): Promise<string> => {
  const provider = getOpenRouterOrThrow();
  return provider.completeChat(
    [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
    opts.temperature ?? 0.2
  );
};

const extractJsonPayload = (raw: string): string => {
  const trimmed = raw.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  if (fence?.[1]) {
    return fence[1].trim();
  }
  return trimmed;
};

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseCoordinates = (input: string): { lat: number; lng: number } | undefined => {
  const match = input.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (!match) {
    return undefined;
  }

  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return undefined;
  }

  return { lat, lng };
};

const toRadians = (value: number) => (value * Math.PI) / 180;

const haversineDistanceKm = (
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number => {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(deltaLng / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
};

const uniqueStrings = (values: Array<string | undefined>): string[] =>
  [...new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))];

const inferEmergencyFallback = (problemDescription: string, location: string): EmergencyInterpretation => {
  const problem = problemDescription.toLowerCase();
  const locationText = location.toLowerCase();
  const equipmentHints = new Set<string>();
  let suggestedDepartment = "Emergency";
  let priority: EmergencyInterpretation["priority"] = "high";

  if (/(breath|oxygen|respirat|asthma|lungs)/.test(problem)) {
    equipmentHints.add("ventilator");
    equipmentHints.add("oxygen");
    suggestedDepartment = "ICU";
    priority = "critical";
  }

  if (/(heart|cardiac|chest pain|bp|pulse)/.test(problem)) {
    equipmentHints.add("patient monitor");
    equipmentHints.add("defibrillator");
    suggestedDepartment = "Cardiology";
    priority = "critical";
  }

  if (/(fracture|bone|accident|trauma|bleeding|injury)/.test(problem)) {
    equipmentHints.add("x-ray");
    equipmentHints.add("trauma");
    suggestedDepartment = "Emergency";
    priority = "critical";
  }

  if (/(pregnan|labor|delivery)/.test(problem)) {
    equipmentHints.add("fetal monitor");
    suggestedDepartment = "Obstetrics";
  }

  if (!equipmentHints.size) {
    equipmentHints.add("emergency");
  }

  const locationParts = location
    .split(/[,\-]/)
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    summary: problemDescription.trim(),
    priority,
    suggestedDepartment,
    equipmentHints: [...equipmentHints],
    locationHints: {
      city: locationParts[0],
      state: locationParts.length > 1 ? locationParts[locationParts.length - 1] : undefined,
    },
  };
};

const interpretEmergencyInput = async (
  problemDescription: string,
  location: string
): Promise<EmergencyInterpretation> => {
  try {
    const raw = await callOpenRouter({
      system:
        "You interpret emergency healthcare requests. Return ONLY valid JSON with keys summary, priority, suggestedDepartment, equipmentHints, and locationHints. priority must be one of critical, high, medium.",
      user: `Problem description: ${problemDescription}\nLocation: ${location}\n\nExtract the best emergency intent for hospital triage.`,
      temperature: 0.1,
    });

    const parsed = JSON.parse(extractJsonPayload(raw)) as Record<string, unknown>;
    const equipmentHints = Array.isArray(parsed.equipmentHints)
      ? uniqueStrings(parsed.equipmentHints.map((item) => String(item ?? "")))
      : [];
    const locationHintsRaw =
      parsed.locationHints && typeof parsed.locationHints === "object" && !Array.isArray(parsed.locationHints)
        ? (parsed.locationHints as Record<string, unknown>)
        : {};
    const priority =
      parsed.priority === "critical" || parsed.priority === "high" || parsed.priority === "medium"
        ? parsed.priority
        : "high";

    return {
      summary: String(parsed.summary ?? problemDescription).trim() || problemDescription.trim(),
      priority,
      suggestedDepartment: String(parsed.suggestedDepartment ?? "").trim() || undefined,
      equipmentHints: equipmentHints.length ? equipmentHints : inferEmergencyFallback(problemDescription, location).equipmentHints,
      locationHints: {
        city: String(locationHintsRaw.city ?? "").trim() || undefined,
        state: String(locationHintsRaw.state ?? "").trim() || undefined,
      },
    };
  } catch {
    return inferEmergencyFallback(problemDescription, location);
  }
};

export const summarizeReviews = async (reviewTexts: string[]): Promise<string> => {
  const texts = (reviewTexts ?? [])
    .map((t) => (t ?? "").toString().trim())
    .filter(Boolean);
  if (!texts.length) {
    throw new HttpError(400, "reviewTexts must be a non-empty array of strings");
  }

  const system =
    "You summarize healthcare facility reviews for a dashboard. Output only concise bullet points (use '- ' lines). No title, no preamble.";
  const user = `Summarize these reviews into 4–7 bullet points:\n\n${texts
    .slice(0, 50)
    .map((t, i) => `${i + 1}. ${t}`)
    .join("\n")}`;

  return callOpenRouter({ system, user, temperature: 0.3 });
};

export const chat = async (prompt: string): Promise<string> => {
  const message = prompt.trim();
  if (!message) {
    throw new HttpError(400, "prompt is required");
  }

  const system =
    "You are a helpful assistant for hospital and equipment coordination. Be brief and actionable. If critical information is missing, ask one short clarifying question.";

  return callOpenRouter({ system, user: message, temperature: 0.4 });
};

export const smartSearchQuery = async (query: string | undefined): Promise<SmartSearchQueryResult> => {
  const q = (query ?? "").trim();
  if (!q) {
    throw new HttpError(400, "query is required");
  }

  const system =
    "You help parse natural language into search intent for a hospital/equipment/medical directory. Reply with ONLY valid JSON, no markdown.";
  const user = `User query: "${q}"\n\nReturn JSON: {"cleanedQuery": string, "intent": string, "entities": object with string values only}.`;

  let raw: string;
  try {
    raw = await callOpenRouter({ system, user, temperature: 0.1 });
  } catch {
    return { cleanedQuery: q, intent: "search", entities: {} };
  }

  try {
    const parsed = JSON.parse(extractJsonPayload(raw)) as Record<string, unknown>;
    const cleanedQuery = String(parsed.cleanedQuery ?? "").trim();
    const intent = String(parsed.intent ?? "").trim();
    const rawEntities = parsed.entities;

    const entities: Record<string, string> = {};
    if (rawEntities && typeof rawEntities === "object" && !Array.isArray(rawEntities)) {
      for (const [k, v] of Object.entries(rawEntities)) {
        if (typeof v === "string" && v.trim()) {
          entities[k] = v.trim();
        }
      }
    }

    if (!cleanedQuery || !intent) {
      return { cleanedQuery: q, intent: "search", entities: {} };
    }

    return { cleanedQuery, intent, entities };
  } catch {
    return { cleanedQuery: q, intent: "search", entities: {} };
  }
};

const buildFallbackInsights = (params: {
  topIssueType?: string;
  topIssueCount?: number;
  topEquipmentType?: string;
  topEquipmentCount?: number;
  busiestWeekday?: string;
  busiestWeekdayCount?: number;
  peakAppointmentBucket?: string;
}): AIInsightItem[] => {
  const insights: AIInsightItem[] = [];

  if (params.topEquipmentType) {
    insights.push({
      id: "equipment-demand",
      title: "Equipment pressure",
      insight: `High demand for ${params.topEquipmentType.toLowerCase()} across key care sections with ${params.topEquipmentCount ?? 0} tracked units in rotation.`,
    });
  }

  if (params.topIssueType) {
    insights.push({
      id: "issue-pattern",
      title: "Issue pattern",
      insight: `Most reported issues are related to ${params.topIssueType.replace("-", " ").toLowerCase()}, suggesting a recurring operational bottleneck.`,
    });
  }

  if (params.busiestWeekday) {
    const bucketText = params.peakAppointmentBucket
      ? ` and ${params.peakAppointmentBucket.toLowerCase()} appear busiest`
      : "";

    insights.push({
      id: "appointment-peak",
      title: "Appointment peak",
      insight: `Appointments peak on ${params.busiestWeekday}s${bucketText}, with ${params.busiestWeekdayCount ?? 0} bookings in the current window.`,
    });
  }

  if (!insights.length) {
    insights.push({
      id: "baseline",
      title: "Operational baseline",
      insight: "The hospital has limited recent activity data, so more issues, equipment updates, and appointments are needed for stronger AI signals.",
    });
  }

  return insights.slice(0, 3);
};

export const generateHospitalInsights = async (
  scopeInput: InsightsScopeInput
): Promise<{
  hospital: { id: string; name: string };
  insights: AIInsightItem[];
}> => {
  const scope = await resolveInsightsScope(scopeInput);

  const [topIssueTypeRaw, topEquipmentTypeRaw, weekdayRaw, hourRaw] = await Promise.all([
    Issue.aggregate<{ _id: string; count: number }>([
      { $match: { hospitalId: scope.hospitalId } },
      { $group: { _id: "$issueType", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 1 },
    ]),
    Equipment.aggregate<{ _id: string; count: number }>([
      { $match: { hospitalId: scope.hospitalId } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 1 },
    ]),
    Appointment.aggregate<{ _id: number; count: number }>([
      { $match: { hospitalId: scope.hospitalId } },
      { $group: { _id: { $dayOfWeek: "$appointmentDate" }, count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 1 },
    ]),
    Appointment.aggregate<{ _id: number; count: number }>([
      { $match: { hospitalId: scope.hospitalId } },
      { $group: { _id: { $hour: "$appointmentDate" }, count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 1 },
    ]),
  ]);

  const weekdayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const topIssueType = topIssueTypeRaw?.[0]?._id;
  const topIssueCount = topIssueTypeRaw?.[0]?.count;
  const topEquipmentType = topEquipmentTypeRaw?.[0]?._id;
  const topEquipmentCount = topEquipmentTypeRaw?.[0]?.count;
  const busiestWeekdayIndex = weekdayRaw?.[0]?._id;
  const busiestWeekday =
    typeof busiestWeekdayIndex === "number" ? weekdayLabels[Math.max(0, busiestWeekdayIndex - 1)] : undefined;
  const busiestWeekdayCount = weekdayRaw?.[0]?.count;
  const peakHour = hourRaw?.[0]?._id;
  const peakAppointmentBucket =
    typeof peakHour === "number"
      ? peakHour >= 17
        ? "evenings"
        : peakHour >= 12
          ? "afternoons"
          : "mornings"
      : undefined;

  const fallbackInsights = buildFallbackInsights({
    topIssueType,
    topIssueCount,
    topEquipmentType,
    topEquipmentCount,
    busiestWeekday,
    busiestWeekdayCount,
    peakAppointmentBucket,
  });

  try {
    const raw = await callOpenRouter({
      system:
        "You generate concise operational insights for a hospital dashboard. Return ONLY valid JSON as an array of exactly 3 objects with keys title and insight. Each insight should be one sentence, specific, and executive-friendly.",
      user: `Hospital: ${scope.hospitalName}
Top issue type: ${topIssueType ?? "n/a"} (${topIssueCount ?? 0})
Top equipment type: ${topEquipmentType ?? "n/a"} (${topEquipmentCount ?? 0})
Busiest appointment weekday: ${busiestWeekday ?? "n/a"} (${busiestWeekdayCount ?? 0})
Peak appointment time bucket: ${peakAppointmentBucket ?? "n/a"}

Create 3 impactful dashboard insights.`,
      temperature: 0.3,
    });

    const parsed = JSON.parse(extractJsonPayload(raw)) as Array<Record<string, unknown>>;
    const insights = parsed
      .map((item, index) => ({
        id: `ai-${index + 1}`,
        title: String(item.title ?? "").trim(),
        insight: String(item.insight ?? "").trim(),
      }))
      .filter((item) => item.title && item.insight)
      .slice(0, 3);

    if (insights.length) {
      return {
        hospital: {
          id: scope.hospitalId.toString(),
          name: scope.hospitalName,
        },
        insights,
      };
    }
  } catch {
    // Fall back to heuristic insights so the dashboard stays useful without AI.
  }

  return {
    hospital: {
      id: scope.hospitalId.toString(),
      name: scope.hospitalName,
    },
    insights: fallbackInsights,
  };
};

export const runEmergencyMode = async (
  input: EmergencyModeInput
): Promise<{
  query: {
    problemDescription: string;
    location: string;
  };
  interpretation: EmergencyInterpretation;
  bestHospital: EmergencyHospitalMatch | null;
  bestEquipment: EmergencyEquipmentMatch | null;
  bestAmbulance: EmergencyAmbulanceMatch | null;
  nearbyHospitals: EmergencyHospitalMatch[];
  contactInfo: {
    hospitalContact?: string;
    emergencyContact?: string;
    ambulanceContact?: string;
  };
}> => {
  const problemDescription = (input.problemDescription ?? "").trim();
  const location = (input.location ?? "").trim();

  if (!problemDescription) {
    throw new HttpError(400, "problemDescription is required");
  }

  if (!location) {
    throw new HttpError(400, "location is required");
  }

  const interpretation = await interpretEmergencyInput(problemDescription, location);
  const coordinates = parseCoordinates(location);

  const hospitalQuery: Record<string, unknown> = {};
  const locationOr: Array<Record<string, unknown>> = [];
  const exactLocationRegex = new RegExp(escapeRegex(location), "i");

  locationOr.push({ city: exactLocationRegex }, { state: exactLocationRegex }, { address: exactLocationRegex });

  if (interpretation.locationHints.city) {
    locationOr.push({ city: { $regex: escapeRegex(interpretation.locationHints.city), $options: "i" } });
  }
  if (interpretation.locationHints.state) {
    locationOr.push({ state: { $regex: escapeRegex(interpretation.locationHints.state), $options: "i" } });
  }

  if (locationOr.length) {
    hospitalQuery.$or = locationOr;
  }

  let hospitals = await Hospital.find(hospitalQuery)
    .select("name address city state location contactNumber emergencyContact availabilityStatus")
    .limit(12)
    .lean();

  if (!hospitals.length) {
    hospitals = await Hospital.find({})
      .select("name address city state location contactNumber emergencyContact availabilityStatus")
      .limit(12)
      .lean();
  }

  const hospitalIds = hospitals.map((hospital) => hospital._id);

  const [equipmentDocs, ambulanceDocs] = await Promise.all([
    Equipment.find({
      hospitalId: { $in: hospitalIds },
      status: "available",
      $or: interpretation.equipmentHints.map((hint) => ({
        $or: [
          { name: { $regex: escapeRegex(hint), $options: "i" } },
          { type: { $regex: escapeRegex(hint), $options: "i" } },
          { hospitalSection: { $regex: escapeRegex(hint), $options: "i" } },
        ],
      })),
    })
      .populate("hospitalId", "name city state contactNumber emergencyContact availabilityStatus")
      .limit(12)
      .lean(),
    Ambulance.find({
      hospitalId: { $in: hospitalIds },
      status: "available",
    })
      .populate("hospitalId", "name city state contactNumber emergencyContact")
      .limit(12)
      .lean(),
  ]);

  const equipmentCounts = new Map<string, number>();
  for (const equipment of equipmentDocs) {
    const rawHospital = equipment.hospitalId as { _id?: Types.ObjectId | string } | undefined;
    const hospitalId = rawHospital?._id?.toString?.() ?? equipment.hospitalId?.toString?.();
    if (!hospitalId) {
      continue;
    }
    equipmentCounts.set(hospitalId, (equipmentCounts.get(hospitalId) ?? 0) + 1);
  }

  const ambulanceCounts = new Map<string, number>();
  for (const ambulance of ambulanceDocs) {
    const rawHospital = ambulance.hospitalId as { _id?: Types.ObjectId | string } | undefined;
    const hospitalId = rawHospital?._id?.toString?.() ?? ambulance.hospitalId?.toString?.();
    if (!hospitalId) {
      continue;
    }
    ambulanceCounts.set(hospitalId, (ambulanceCounts.get(hospitalId) ?? 0) + 1);
  }

  const scoredHospitals = hospitals
    .map((hospital) => {
      const hospitalId = hospital._id.toString();
      const availableEquipmentCount = equipmentCounts.get(hospitalId) ?? 0;
      const availableAmbulanceCount = ambulanceCounts.get(hospitalId) ?? 0;
      const distanceKm = coordinates ? haversineDistanceKm(coordinates, hospital.location) : undefined;

      const locationScore = coordinates
        ? Math.max(0, 25 - (distanceKm ?? 25))
        : [hospital.city, hospital.state, hospital.address].reduce((score, field) => {
            if (field.toLowerCase().includes(location.toLowerCase())) {
              return score + 8;
            }
            if (interpretation.locationHints.city && field.toLowerCase().includes(interpretation.locationHints.city.toLowerCase())) {
              return score + 5;
            }
            if (
              interpretation.locationHints.state &&
              field.toLowerCase().includes(interpretation.locationHints.state.toLowerCase())
            ) {
              return score + 3;
            }
            return score;
          }, 0);

      const readinessScore =
        (hospital.availabilityStatus === "free" ? 8 : 3) + availableEquipmentCount * 3 + availableAmbulanceCount * 4;

      const departmentScore = interpretation.suggestedDepartment
        ? hospital.name.toLowerCase().includes(interpretation.suggestedDepartment.toLowerCase())
          ? 2
          : 0
        : 0;

      const score = locationScore + readinessScore + departmentScore;

      const matchReason = [
        coordinates && distanceKm !== undefined ? `${distanceKm.toFixed(1)} km away` : `near ${hospital.city}`,
        availableEquipmentCount > 0 ? `${availableEquipmentCount} matching equipment ready` : "equipment can be coordinated",
        availableAmbulanceCount > 0 ? `${availableAmbulanceCount} ambulance available` : "ambulance support needs confirmation",
      ].join(" • ");

      return {
        score,
        hospital: {
          id: hospitalId,
          name: hospital.name,
          city: hospital.city,
          state: hospital.state,
          address: hospital.address,
          contactNumber: hospital.contactNumber,
          emergencyContact: hospital.emergencyContact,
          availabilityStatus: hospital.availabilityStatus,
          distanceKm: distanceKm !== undefined ? Number(distanceKm.toFixed(1)) : undefined,
          availableEquipmentCount,
          availableAmbulanceCount,
          matchReason,
        } satisfies EmergencyHospitalMatch,
      };
    })
    .sort((left, right) => right.score - left.score);

  const bestHospital = scoredHospitals[0]?.hospital ?? null;

  const bestEquipmentDoc = equipmentDocs
    .sort((left, right) => {
      const leftHospitalId =
        (left.hospitalId as { _id?: Types.ObjectId | string } | undefined)?._id?.toString?.() ??
        left.hospitalId?.toString?.();
      const rightHospitalId =
        (right.hospitalId as { _id?: Types.ObjectId | string } | undefined)?._id?.toString?.() ??
        right.hospitalId?.toString?.();
      const leftScore = scoredHospitals.find((item) => item.hospital.id === leftHospitalId)?.score ?? 0;
      const rightScore = scoredHospitals.find((item) => item.hospital.id === rightHospitalId)?.score ?? 0;
      return rightScore - leftScore;
    })[0];

  const bestEquipment = bestEquipmentDoc
    ? {
        id: bestEquipmentDoc._id.toString(),
        name: bestEquipmentDoc.name,
        type: bestEquipmentDoc.type,
        status: bestEquipmentDoc.status,
        hospitalSection: bestEquipmentDoc.hospitalSection,
        hospital: {
          id:
            ((bestEquipmentDoc.hospitalId as { _id?: Types.ObjectId | string } | undefined)?._id?.toString?.() as string) ??
            "",
          name: String((bestEquipmentDoc.hospitalId as { name?: string } | undefined)?.name ?? "Unknown hospital"),
          city: String((bestEquipmentDoc.hospitalId as { city?: string } | undefined)?.city ?? ""),
          state: String((bestEquipmentDoc.hospitalId as { state?: string } | undefined)?.state ?? ""),
          contactNumber: String(
            (bestEquipmentDoc.hospitalId as { contactNumber?: string } | undefined)?.contactNumber ?? ""
          ),
        },
      }
    : null;

  const bestAmbulanceDoc = ambulanceDocs
    .sort((left, right) => {
      const leftHospitalId =
        (left.hospitalId as { _id?: Types.ObjectId | string } | undefined)?._id?.toString?.() ??
        left.hospitalId?.toString?.();
      const rightHospitalId =
        (right.hospitalId as { _id?: Types.ObjectId | string } | undefined)?._id?.toString?.() ??
        right.hospitalId?.toString?.();
      const leftScore = scoredHospitals.find((item) => item.hospital.id === leftHospitalId)?.score ?? 0;
      const rightScore = scoredHospitals.find((item) => item.hospital.id === rightHospitalId)?.score ?? 0;
      return rightScore - leftScore;
    })[0];

  const bestAmbulance = bestAmbulanceDoc
    ? {
        id: bestAmbulanceDoc._id.toString(),
        vehicleNumber: bestAmbulanceDoc.vehicleNumber,
        driverName: bestAmbulanceDoc.driverName,
        contactNumber: bestAmbulanceDoc.contactNumber,
        currentLocation: bestAmbulanceDoc.currentLocation,
        hospital: {
          id:
            ((bestAmbulanceDoc.hospitalId as { _id?: Types.ObjectId | string } | undefined)?._id?.toString?.() as string) ??
            "",
          name: String((bestAmbulanceDoc.hospitalId as { name?: string } | undefined)?.name ?? "Unknown hospital"),
          city: String((bestAmbulanceDoc.hospitalId as { city?: string } | undefined)?.city ?? ""),
          state: String((bestAmbulanceDoc.hospitalId as { state?: string } | undefined)?.state ?? ""),
          emergencyContact: String(
            (bestAmbulanceDoc.hospitalId as { emergencyContact?: string } | undefined)?.emergencyContact ?? ""
          ),
        },
      }
    : null;

  return {
    query: {
      problemDescription,
      location,
    },
    interpretation,
    bestHospital,
    bestEquipment,
    bestAmbulance,
    nearbyHospitals: scoredHospitals.slice(0, 3).map((item) => item.hospital),
    contactInfo: {
      hospitalContact: bestHospital?.contactNumber,
      emergencyContact: bestHospital?.emergencyContact,
      ambulanceContact: bestAmbulance?.contactNumber,
    },
  };
};
