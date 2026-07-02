import { Eye, PencilLine, Trash2 } from "lucide-react";

import { StatusBadge } from "@/components/ui/status-badge";
import type { Doctor } from "@/types";

type DoctorWithMeta = Doctor;

interface DoctorTableProps {
  doctors: DoctorWithMeta[];
  onView: (doctor: DoctorWithMeta) => void;
  onEdit: (doctor: DoctorWithMeta) => void;
  onDelete: (doctor: DoctorWithMeta) => void;
  deletingId?: string | null;
}

function getHospitalLabel(doctor: Doctor) {
  if (typeof doctor.hospitalId === "string") return doctor.hospitalId;
  return doctor.hospitalId?.name ?? "Hospital unavailable";
}

function getRatingLabel(rating: number) {
  return rating > 0 ? rating.toFixed(1) : "No ratings yet";
}

export function DoctorTable({ doctors, onView, onEdit, onDelete, deletingId }: DoctorTableProps) {
  return (
    <>
      <div className="hidden w-full overflow-hidden lg:block">
        <div className="w-full overflow-x-auto overscroll-x-contain">
        <table className="min-w-[980px] divide-y divide-[var(--border)]">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
              <th className="px-6 py-4 font-medium">Doctor</th>
              <th className="px-6 py-4 font-medium">Specialization</th>
              <th className="px-6 py-4 font-medium">Department</th>
              <th className="px-6 py-4 font-medium">Experience</th>
              <th className="px-6 py-4 font-medium">Availability</th>
              <th className="px-6 py-4 font-medium">Rating</th>
              <th className="px-6 py-4 font-medium">Hospital</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {doctors.map((doctor) => (
              <tr key={doctor._id} className="align-top">
                <td className="px-6 py-5">
                  <p className="max-w-[12rem] text-balance font-semibold leading-8 text-[var(--foreground)]">{doctor.name}</p>
                </td>
                <td className="px-6 py-5 text-sm text-[var(--muted)]">
                  <span className="inline-block min-w-[10rem]">{doctor.specialization}</span>
                </td>
                <td className="px-6 py-5 text-sm text-[var(--muted)]">
                  <span className="inline-block min-w-[9rem]">{doctor.department}</span>
                </td>
                <td className="px-6 py-5 text-sm text-[var(--muted)]">{doctor.experience} yrs</td>
                <td className="px-6 py-5">
                  <StatusBadge
                    label={doctor.availability ? "Available" : "Unavailable"}
                    tone={doctor.availability ? "success" : "neutral"}
                  />
                </td>
                <td className="px-6 py-5 text-sm text-[var(--muted)]">
                  <span className="inline-block min-w-[7rem]">{getRatingLabel(doctor.averageRating)}</span>
                </td>
                <td className="px-6 py-5 text-sm text-[var(--muted)]">
                  <span className="inline-block min-w-[10rem] text-balance">{getHospitalLabel(doctor)}</span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex min-w-[14rem] gap-2">
                    <button type="button" onClick={() => onView(doctor)} className="btn-secondary btn-sm whitespace-nowrap">
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                    <button type="button" onClick={() => onEdit(doctor)} className="btn-secondary btn-sm whitespace-nowrap">
                      <PencilLine className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(doctor)}
                      disabled={deletingId === doctor._id}
                      className="btn-danger btn-sm whitespace-nowrap"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <div className="grid gap-4 lg:hidden">
        {doctors.map((doctor) => (
          <article key={doctor._id} className="surface-card rounded-[24px] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">{doctor.name}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{doctor.specialization}</p>
              </div>
              <StatusBadge
                label={doctor.availability ? "Available" : "Unavailable"}
                tone={doctor.availability ? "success" : "neutral"}
              />
            </div>

            <div className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
              <p><span className="font-medium text-[var(--foreground)]">Department:</span> {doctor.department}</p>
              <p><span className="font-medium text-[var(--foreground)]">Experience:</span> {doctor.experience} yrs</p>
              <p><span className="font-medium text-[var(--foreground)]">Rating:</span> {getRatingLabel(doctor.averageRating)}</p>
              <p><span className="font-medium text-[var(--foreground)]">Hospital:</span> {getHospitalLabel(doctor)}</p>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <button type="button" onClick={() => onView(doctor)} className="btn-secondary btn-sm">
                <Eye className="h-4 w-4" />
                View
              </button>
              <button type="button" onClick={() => onEdit(doctor)} className="btn-secondary btn-sm">
                <PencilLine className="h-4 w-4" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(doctor)}
                disabled={deletingId === doctor._id}
                className="btn-danger btn-sm"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

export type { DoctorWithMeta };
