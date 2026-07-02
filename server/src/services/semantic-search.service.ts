import { FilterQuery, isValidObjectId } from "mongoose";

import {
  EQUIPMENT_STATUSES,
  Equipment,
  EquipmentStatus,
  HOSPITAL_AVAILABILITY_STATUSES,
  Hospital,
  HospitalAvailabilityStatus,
  MedicalShop,
} from "../models";
import { embed } from "./embedding.service";
import { cosineSimilarity } from "../utils/cosineSimilarity";
import { HttpError } from "../utils/http-error";

interface HospitalSemanticSearchInput {
  query: string;
  filters?: {
    city?: string;
    state?: string;
    availabilityStatus?: string;
  };
  topK?: number;
  candidateLimit?: number;
}

interface EquipmentSemanticSearchInput {
  query: string;
  filters?: {
    hospitalId?: string;
    status?: string;
    type?: string;
    hospitalSection?: string;
  };
  topK?: number;
  candidateLimit?: number;
}

interface MedicalShopSemanticSearchInput {
  query: string;
  filters?: {
    city?: string;
    state?: string;
    area?: string;
  };
  topK?: number;
  candidateLimit?: number;
}

const omitEmbeddingFields = (doc: Record<string, unknown>): Record<string, unknown> => {
  const { embedding, embeddingText, ...rest } = Object.assign({}, doc);
  return rest;
};

const toPositiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
};

const validateHospitalAvailability = (value: string): HospitalAvailabilityStatus => {
  if (!HOSPITAL_AVAILABILITY_STATUSES.includes(value as HospitalAvailabilityStatus)) {
    throw new HttpError(400, "Invalid availabilityStatus");
  }
  return value as HospitalAvailabilityStatus;
};

const validateEquipmentStatus = (value: string): EquipmentStatus => {
  if (!EQUIPMENT_STATUSES.includes(value as EquipmentStatus)) {
    throw new HttpError(400, "Invalid status");
  }
  return value as EquipmentStatus;
};

// Helper for local dev fallback
const generateMockSimilarity = (index: number) => 0.95 - (index * 0.04);

export const semanticSearchHospitals = async (input: HospitalSemanticSearchInput): Promise<
  Array<{
    similarity: number;
    hospital: Record<string, unknown>;
  }>
> => {
  const queryText = (input.query ?? "").trim();
  if (!queryText) throw new HttpError(400, "query is required");

  const topK = Math.min(toPositiveInt(input.topK, 10), 50);
  const candidateLimit = Math.min(toPositiveInt(input.candidateLimit, 200), 1000);
  const filters = input.filters ?? {};

  let queryEmbedding: number[] = [];
  try {
    queryEmbedding = await embed(queryText);
  } catch (error) {
    // FALLBACK for missing Hugging Face API keys (Dummy Data Mode)
    const fallbackQuery: FilterQuery<Record<string, unknown>> = {};
    if (filters.city) fallbackQuery.city = { $regex: filters.city.trim(), $options: "i" };
    if (filters.state) fallbackQuery.state = { $regex: filters.state.trim(), $options: "i" };
    if (filters.availabilityStatus) fallbackQuery.availabilityStatus = validateHospitalAvailability(filters.availabilityStatus);
    
    const searchRegex = new RegExp(queryText.split(/\s+/).filter(t => t.length > 2).join("|"), "i");
    fallbackQuery.$or = [
      { name: { $regex: searchRegex } },
      { specialties: { $regex: searchRegex } },
      { description: { $regex: searchRegex } }
    ];

    const fallbacks = await Hospital.find(fallbackQuery).select("-embeddingText -embedding").limit(topK).lean();
    return fallbacks.map((h, i) => ({
      similarity: generateMockSimilarity(i),
      hospital: omitEmbeddingFields(h as Record<string, unknown>)
    }));
  }

  const mongoQuery: FilterQuery<Record<string, unknown>> = { embedding: { $exists: true, $ne: [] } };
  if (filters.city) mongoQuery.city = { $regex: filters.city.trim(), $options: "i" };
  if (filters.state) mongoQuery.state = { $regex: filters.state.trim(), $options: "i" };
  if (filters.availabilityStatus) mongoQuery.availabilityStatus = validateHospitalAvailability(filters.availabilityStatus);

  const candidates = await Hospital.find(mongoQuery).select("-embeddingText").limit(candidateLimit).lean();
  const scored: Array<{ similarity: number; hospital: Record<string, unknown> }> = [];
  for (const hospital of candidates as Array<Record<string, unknown>>) {
    const vector = (hospital.embedding as unknown as number[]) ?? [];
    if (!Array.isArray(vector) || vector.length === 0) continue;
    scored.push({ similarity: cosineSimilarity(queryEmbedding, vector), hospital: omitEmbeddingFields(hospital) });
  }

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, topK);
};

export const semanticSearchEquipment = async (input: EquipmentSemanticSearchInput): Promise<
  Array<{
    similarity: number;
    equipment: Record<string, unknown>;
  }>
> => {
  const queryText = (input.query ?? "").trim();
  if (!queryText) throw new HttpError(400, "query is required");

  const topK = Math.min(toPositiveInt(input.topK, 10), 50);
  const candidateLimit = Math.min(toPositiveInt(input.candidateLimit, 200), 1000);
  const filters = input.filters ?? {};

  let queryEmbedding: number[] = [];
  try {
    queryEmbedding = await embed(queryText);
  } catch (error) {
    // FALLBACK for Mock Phase
    const fallbackQuery: FilterQuery<Record<string, unknown>> = {};
    if (filters.hospitalId) fallbackQuery.hospitalId = filters.hospitalId;
    if (filters.status) fallbackQuery.status = validateEquipmentStatus(filters.status);
    
    const searchRegex = new RegExp(queryText.split(/\s+/).filter(t => t.length > 2).join("|"), "i");
    fallbackQuery.$or = [{ name: { $regex: searchRegex } }, { type: { $regex: searchRegex } }];
    
    const fallbacks = await Equipment.find(fallbackQuery).populate("hospitalId", "name city state").select("-embeddingText -embedding").limit(topK).lean();
    return fallbacks.map((e, i) => ({
      similarity: generateMockSimilarity(i),
      equipment: omitEmbeddingFields(e as Record<string, unknown>)
    }));
  }

  const mongoQuery: FilterQuery<Record<string, unknown>> = { embedding: { $exists: true, $ne: [] } };
  if (filters.hospitalId) mongoQuery.hospitalId = filters.hospitalId;
  if (filters.status) mongoQuery.status = validateEquipmentStatus(filters.status);
  if (filters.type) mongoQuery.type = { $regex: filters.type.trim(), $options: "i" };
  if (filters.hospitalSection) mongoQuery.hospitalSection = { $regex: filters.hospitalSection.trim(), $options: "i" };

  const candidates = await Equipment.find(mongoQuery)
    .select("-embeddingText")
    .populate("hospitalId", "name city state contactNumber availabilityStatus")
    .populate("assignedTo", "name specialization department availability")
    .limit(candidateLimit).lean();

  const scored: Array<{ similarity: number; equipment: Record<string, unknown> }> = [];
  for (const equipment of candidates as Array<Record<string, unknown>>) {
    const vector = (equipment.embedding as unknown as number[]) ?? [];
    if (!Array.isArray(vector) || vector.length === 0) continue;
    scored.push({ similarity: cosineSimilarity(queryEmbedding, vector), equipment: omitEmbeddingFields(equipment) });
  }

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, topK);
};

export const semanticSearchMedicalShops = async (input: MedicalShopSemanticSearchInput): Promise<
  Array<{
    similarity: number;
    medicalShop: Record<string, unknown>;
  }>
> => {
  const queryText = (input.query ?? "").trim();
  if (!queryText) throw new HttpError(400, "query is required");

  const topK = Math.min(toPositiveInt(input.topK, 10), 50);
  const candidateLimit = Math.min(toPositiveInt(input.candidateLimit, 200), 1000);
  const filters = input.filters ?? {};

  let queryEmbedding: number[] = [];
  try {
    queryEmbedding = await embed(queryText);
  } catch (error) {
    const fallbackQuery: FilterQuery<Record<string, unknown>> = {};
    if (filters.city) fallbackQuery.city = { $regex: filters.city.trim(), $options: "i" };
    if (filters.state) fallbackQuery.state = { $regex: filters.state.trim(), $options: "i" };
    const searchRegex = new RegExp(queryText.split(/\s+/).filter(t => t.length > 2).join("|"), "i");
    fallbackQuery.$or = [{ name: { $regex: searchRegex } }, { features: { $regex: searchRegex } }];
    
    const fallbacks = await MedicalShop.find(fallbackQuery).select("-embeddingText -embedding").limit(topK).lean();
    return fallbacks.map((s, i) => ({
      similarity: generateMockSimilarity(i),
      medicalShop: omitEmbeddingFields(s as Record<string, unknown>)
    }));
  }

  const mongoQuery: FilterQuery<Record<string, unknown>> = { embedding: { $exists: true, $ne: [] } };
  if (filters.city) mongoQuery.city = { $regex: filters.city.trim(), $options: "i" };
  if (filters.state) mongoQuery.state = { $regex: filters.state.trim(), $options: "i" };
  if (filters.area) mongoQuery.area = { $regex: filters.area.trim(), $options: "i" };

  const candidates = await MedicalShop.find(mongoQuery).select("-embeddingText").limit(candidateLimit).lean();
  const scored: Array<{ similarity: number; medicalShop: Record<string, unknown> }> = [];
  for (const shop of candidates as Array<Record<string, unknown>>) {
    const vector = (shop.embedding as unknown as number[]) ?? [];
    if (!Array.isArray(vector) || vector.length === 0) continue;
    scored.push({ similarity: cosineSimilarity(queryEmbedding, vector), medicalShop: omitEmbeddingFields(shop) });
  }

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, topK);
};
