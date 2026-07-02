"use client";

import { X } from "lucide-react";

interface DoctorFormValues {
  name: string;
  specialization: string;
  department: string;
  experience: string;
  availability: boolean;
  hospitalId: string;
}

interface DoctorFormModalProps {
  mode: "create" | "edit" | "view";
  open: boolean;
  values: DoctorFormValues;
  onChange: (next: DoctorFormValues) => void;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error?: string | null;
  hospitalLocked?: boolean;
}

const modeCopy = {
  create: {
    title: "Add doctor",
    description: "Create a new doctor profile for this hospital workspace.",
    cta: "Create doctor",
  },
  edit: {
    title: "Edit doctor",
    description: "Update doctor information, department, and availability.",
    cta: "Save changes",
  },
  view: {
    title: "Doctor details",
    description: "Review this doctor profile and linked hospital information.",
    cta: "",
  },
} as const;

export function DoctorFormModal({
  mode,
  open,
  values,
  onChange,
  onClose,
  onSubmit,
  isSubmitting,
  error,
  hospitalLocked = false,
}: DoctorFormModalProps) {
  if (!open) return null;

  const copy = modeCopy[mode];
  const readOnly = mode === "view";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(10,32,28,0.48)] px-4 py-6 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center">
        <div className="surface-panel my-auto w-full max-w-2xl rounded-[28px] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">Doctor profile</p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)] sm:text-2xl">{copy.title}</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{copy.description}</p>
          </div>
          <button type="button" onClick={onClose} className="icon-button" aria-label="Close dialog">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="doctor-name">
              Name
            </label>
            <input
              id="doctor-name"
              value={values.name}
              readOnly={readOnly}
              onChange={(event) => onChange({ ...values, name: event.target.value })}
              className="field-control"
              placeholder="Doctor full name"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="doctor-specialization-field">
              Specialization
            </label>
            <input
              id="doctor-specialization-field"
              value={values.specialization}
              readOnly={readOnly}
              onChange={(event) => onChange({ ...values, specialization: event.target.value })}
              className="field-control"
              placeholder="e.g. Cardiology"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="doctor-department-field">
              Department
            </label>
            <input
              id="doctor-department-field"
              value={values.department}
              readOnly={readOnly}
              onChange={(event) => onChange({ ...values, department: event.target.value })}
              className="field-control"
              placeholder="e.g. Critical Care"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="doctor-experience">
              Experience
            </label>
            <input
              id="doctor-experience"
              type="number"
              min={0}
              value={values.experience}
              readOnly={readOnly}
              onChange={(event) => onChange({ ...values, experience: event.target.value })}
              className="field-control"
              placeholder="Years of experience"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="doctor-availability-field">
              Availability
            </label>
            <select
              id="doctor-availability-field"
              value={values.availability ? "true" : "false"}
              disabled={readOnly}
              onChange={(event) =>
                onChange({ ...values, availability: event.target.value === "true" })
              }
              className="field-control"
            >
              <option value="true">Available</option>
              <option value="false">Unavailable</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="doctor-hospital-id">
              Hospital ID
            </label>
            <input
              id="doctor-hospital-id"
              value={values.hospitalId}
              readOnly={readOnly || hospitalLocked}
              onChange={(event) => onChange({ ...values, hospitalId: event.target.value })}
              className="field-control"
              placeholder="Linked hospital ID"
            />
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary btn-sm">
              {readOnly ? "Close" : "Cancel"}
            </button>
            {!readOnly ? (
              <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="btn-primary btn-sm"
              >
                {isSubmitting ? "Saving..." : copy.cta}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export type { DoctorFormValues };
