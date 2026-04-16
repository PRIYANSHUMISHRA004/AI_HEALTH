import { FilterQuery } from "mongoose";

import { Doctor, Equipment, Hospital, IDoctor, IEquipment, IHospital, IMedicalShop, MedicalShop } from "../models";
import { semanticSearchEquipment, semanticSearchHospitals, semanticSearchMedicalShops } from "./semantic-search.service";
import { HttpError } from "../utils/http-error";
import { makeContainsRegex } from "../utils/query-builder";

interface GlobalSearchInput {
  query?: string;
  limit?: string;
}

type HospitalSearchResult = Pick<IHospital, "name" | "city" | "state" | "specialties" | "availabilityStatus" | "averageRating"> & {
  _id?: string;
};

type DoctorSearchResult = Pick<IDoctor, "name" | "specialization" | "department" | "averageRating"> & {
  _id?: string;
  hospitalId?:
    | string
    | {
        _id?: string;
        name: string;
        city?: string;
        state?: string;
      };
};

type EquipmentSearchResult = Pick<IEquipment, "name" | "type" | "status" | "hospitalSection"> & {
  _id?: string;
  hospitalId?:
    | string
    | {
        _id?: string;
        name: string;
        city?: string;
        state?: string;
      };
};

type MedicalShopSearchResult = Pick<IMedicalShop, "name" | "area" | "city" | "state" | "availableMedicines"> & {
  _id?: string;
};

const isNamedRef = (
  value: unknown
): value is { _id?: unknown; name: string; city?: string; state?: string } =>
  typeof value === "object" && value !== null && "name" in value;

const normalizeId = (value: unknown) =>
  typeof value === "object" && value !== null && "toString" in value
    ? (value as { toString(): string }).toString()
    : undefined;

const toPositiveInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.min(Math.floor(parsed), 8);
};

const searchHospitalsFallback = async (query: string, limit: number) => {
  const regex = makeContainsRegex(query) as RegExp;
  const mongoQuery: FilterQuery<IHospital> = {
    $or: [
      { name: { $regex: regex } },
      { description: { $regex: regex } },
      { specialties: { $regex: regex } },
      { facilities: { $regex: regex } },
      { city: { $regex: regex } },
      { state: { $regex: regex } },
    ],
  };

  const results = await Hospital.find(mongoQuery)
    .select("name city state specialties availabilityStatus averageRating")
    .limit(limit)
    .lean();

  return results.map((item) => ({
    _id: normalizeId(item._id),
    name: item.name,
    city: item.city,
    state: item.state,
    specialties: item.specialties,
    availabilityStatus: item.availabilityStatus,
    averageRating: item.averageRating,
  }));
};

const searchDoctors = async (query: string, limit: number) => {
  const regex = makeContainsRegex(query) as RegExp;
  const mongoQuery: FilterQuery<IDoctor> = {
    $or: [
      { name: { $regex: regex } },
      { specialization: { $regex: regex } },
      { department: { $regex: regex } },
    ],
  };

  const results = await Doctor.find(mongoQuery)
    .select("name specialization department averageRating hospitalId")
    .populate("hospitalId", "name city state")
    .limit(limit)
    .lean();

  return results.map((item) => ({
    _id: normalizeId(item._id),
    name: item.name,
    specialization: item.specialization,
    department: item.department,
    averageRating: item.averageRating,
    hospitalId: isNamedRef(item.hospitalId)
      ? {
          _id: normalizeId(item.hospitalId._id),
          name: item.hospitalId.name,
          city: item.hospitalId.city,
          state: item.hospitalId.state,
        }
      : normalizeId(item.hospitalId),
  }));
};

const searchEquipmentFallback = async (query: string, limit: number) => {
  const regex = makeContainsRegex(query) as RegExp;
  const mongoQuery: FilterQuery<IEquipment> = {
    $or: [
      { name: { $regex: regex } },
      { type: { $regex: regex } },
      { hospitalSection: { $regex: regex } },
    ],
  };

  const results = await Equipment.find(mongoQuery)
    .select("name type status hospitalSection hospitalId")
    .populate("hospitalId", "name city state")
    .limit(limit)
    .lean();

  return results.map((item) => ({
    _id: normalizeId(item._id),
    name: item.name,
    type: item.type,
    status: item.status,
    hospitalSection: item.hospitalSection,
    hospitalId: isNamedRef(item.hospitalId)
      ? {
          _id: normalizeId(item.hospitalId._id),
          name: item.hospitalId.name,
          city: item.hospitalId.city,
          state: item.hospitalId.state,
        }
      : normalizeId(item.hospitalId),
  }));
};

const searchMedicalShopsFallback = async (query: string, limit: number) => {
  const regex = makeContainsRegex(query) as RegExp;
  const mongoQuery: FilterQuery<IMedicalShop> = {
    $or: [
      { name: { $regex: regex } },
      { area: { $regex: regex } },
      { city: { $regex: regex } },
      { availableMedicines: { $regex: regex } },
    ],
  };

  const results = await MedicalShop.find(mongoQuery)
    .select("name area city state availableMedicines")
    .limit(limit)
    .lean();

  return results.map((item) => ({
    _id: normalizeId(item._id),
    name: item.name,
    area: item.area,
    city: item.city,
    state: item.state,
    availableMedicines: item.availableMedicines,
  }));
};

const searchHospitals = async (query: string, limit: number) => {
  try {
    const semanticResults = await semanticSearchHospitals({ query, topK: limit, candidateLimit: 120 });
    if (semanticResults.length) {
      return semanticResults.map((entry) => entry.hospital as HospitalSearchResult);
    }
  } catch {
    // Fall back to structured text search when semantic search is unavailable.
  }

  return searchHospitalsFallback(query, limit);
};

const searchEquipment = async (query: string, limit: number) => {
  try {
    const semanticResults = await semanticSearchEquipment({ query, topK: limit, candidateLimit: 120 });
    if (semanticResults.length) {
      return semanticResults.map((entry) => entry.equipment as EquipmentSearchResult);
    }
  } catch {
    // Fall back to structured text search when semantic search is unavailable.
  }

  return searchEquipmentFallback(query, limit);
};

const searchMedicalShops = async (query: string, limit: number) => {
  try {
    const semanticResults = await semanticSearchMedicalShops({ query, topK: limit, candidateLimit: 120 });
    if (semanticResults.length) {
      return semanticResults.map((entry) => entry.medicalShop as MedicalShopSearchResult);
    }
  } catch {
    // Fall back to structured text search when semantic search is unavailable.
  }

  return searchMedicalShopsFallback(query, limit);
};

export const globalSearch = async (input: GlobalSearchInput) => {
  const query = input.query?.trim();
  if (!query) {
    throw new HttpError(400, "query is required");
  }

  const limit = toPositiveInt(input.limit, 4);

  const [hospitals, doctors, equipment, shops] = await Promise.all([
    searchHospitals(query, limit),
    searchDoctors(query, limit),
    searchEquipment(query, limit),
    searchMedicalShops(query, limit),
  ]);

  return {
    query,
    hospitals,
    doctors,
    equipment,
    shops,
  };
};
