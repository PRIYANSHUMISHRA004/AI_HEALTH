import { Star } from "lucide-react";

import type { Doctor } from "@/types";

interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <article className="rounded-[22px] border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[var(--foreground)]">{doctor.name}</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {doctor.specialization} • {doctor.department}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            doctor.availability ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          {doctor.availability ? "Available" : "Unavailable"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[var(--muted)]">
        <span>{doctor.experience} years experience</span>
        <span className="inline-flex items-center gap-1">
          <Star className="h-4 w-4 fill-current text-[var(--accent)]" />
          {doctor.averageRating.toFixed(1)} rating
        </span>
      </div>
    </article>
  );
}
