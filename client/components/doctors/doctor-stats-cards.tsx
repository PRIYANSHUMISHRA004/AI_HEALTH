import { Building2, Star, Stethoscope, UserRoundCheck, type LucideIcon } from "lucide-react";

interface DoctorStatsCardsProps {
  totalDoctors: number;
  availableDoctors: number;
  departments: number;
  averageRatingLabel: string;
}

interface DoctorStatCardProps {
  title: string;
  value: number | string;
  supporting: string;
  accent: string;
  icon: LucideIcon;
  auxiliary?: string;
}

function DoctorStatCard({
  title,
  value,
  supporting,
  accent,
  icon: Icon,
  auxiliary,
}: DoctorStatCardProps) {
  return (
    <article className="surface-card rounded-[24px] border border-[var(--border)] p-5 shadow-[0_16px_40px_rgba(16,35,27,0.05)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--muted)]">{title}</p>
          <div className="mt-4 flex min-h-[4.75rem] flex-col justify-start">
            <p className="text-[2.9rem] font-semibold leading-[0.95] tracking-[-0.04em] text-[var(--foreground)]">
              {value}
            </p>
            {auxiliary ? <p className="mt-2 text-sm font-medium text-[var(--muted)]">{auxiliary}</p> : null}
          </div>
        </div>

        <div className={`rounded-[18px] ${accent} p-3 shadow-sm`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-4 max-w-[16rem] text-sm leading-6 text-[var(--muted)]">{supporting}</p>
    </article>
  );
}

export function DoctorStatsCards({
  totalDoctors,
  availableDoctors,
  departments,
  averageRatingLabel,
}: DoctorStatsCardsProps) {
  const hasRatings = averageRatingLabel !== "No ratings yet";

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <DoctorStatCard
        title="Total doctors"
        value={totalDoctors}
        supporting="Profiles linked to this hospital."
        accent="bg-teal-50 text-teal-700"
        icon={Stethoscope}
      />
      <DoctorStatCard
        title="Available doctors"
        value={availableDoctors}
        supporting="Ready for duty or appointments."
        accent="bg-emerald-50 text-emerald-700"
        icon={UserRoundCheck}
      />
      <DoctorStatCard
        title="Departments"
        value={departments}
        supporting="Active medical departments."
        accent="bg-sky-50 text-sky-700"
        icon={Building2}
      />
      <DoctorStatCard
        title="Average rating"
        value={hasRatings ? averageRatingLabel : "--"}
        auxiliary={hasRatings ? undefined : "No ratings yet"}
        supporting="Current review snapshot."
        accent="bg-amber-50 text-amber-700"
        icon={Star}
      />
    </section>
  );
}
