import { Building2 } from "lucide-react";

import { HospitalCard } from "@/components/hospitals/hospital-card";
import { HospitalFilters } from "@/components/hospitals/hospital-filters";
import { HospitalsPagination } from "@/components/hospitals/hospitals-pagination";
import { FadeIn } from "@/components/motion/fade-in";
import { SectionHeading } from "@/components/ui/section-heading";
import { hospitalService } from "@/services";

export const dynamic = "force-dynamic";

interface HospitalsPageProps {
  searchParams?: Promise<{
    city?: string;
    state?: string;
    availabilityStatus?: "free" | "busy";
    page?: string;
    search?: string;
  }>;
}

const toPositivePage = (value?: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 1;
  }
  return Math.floor(parsed);
};

export default async function HospitalsPage({ searchParams }: HospitalsPageProps) {
  const params = (await searchParams) ?? {};
  const currentPage = toPositivePage(params.page);
  const search = params.search?.trim() ?? "";

  const result = await hospitalService.list({
    city: params.city?.trim() || undefined,
    state: params.state?.trim() || undefined,
    availabilityStatus: params.availabilityStatus || undefined,
    specialties: search || undefined,
    page: currentPage,
    limit: 9,
  });

  const createPageHref = (page: number) => {
    const query = new URLSearchParams();
    if (params.city) query.set("city", params.city);
    if (params.state) query.set("state", params.state);
    if (params.availabilityStatus) query.set("availabilityStatus", params.availabilityStatus);
    if (search) query.set("search", search);
    if (page > 1) query.set("page", String(page));
    const queryString = query.toString();
    return queryString ? `/hospitals?${queryString}` : "/hospitals";
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-6 pb-20 pt-10 sm:px-8 lg:px-12">
      <section className="space-y-8 py-12 sm:py-16">
        <FadeIn>
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
              <Building2 className="h-6 w-6" />
            </div>
            <SectionHeading
              eyebrow="Hospitals directory"
              title="Find hospitals by location, availability, and care focus"
              description="Browse the current public listing and narrow it down with city, state, availability, and specialty-based search."
            />
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <HospitalFilters
            city={params.city}
            state={params.state}
            availabilityStatus={params.availabilityStatus}
            search={search}
          />
        </FadeIn>

        <FadeIn delay={0.08}>
          <div className="flex flex-col gap-3 rounded-[24px] border border-[var(--border)] bg-[var(--card)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--muted)]">
              Showing <span className="font-semibold text-[var(--foreground)]">{result.data.length}</span> hospitals on
              this page out of{" "}
              <span className="font-semibold text-[var(--foreground)]">{result.pagination.total}</span> total matches.
            </p>
            <p className="text-sm text-[var(--muted)]">
              Page {result.pagination.page} of {result.pagination.totalPages}
            </p>
          </div>
        </FadeIn>

        {result.data.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {result.data.map((hospital, index) => (
              <FadeIn key={hospital._id} delay={index * 0.04}>
                <HospitalCard hospital={hospital} />
              </FadeIn>
            ))}
          </div>
        ) : (
          <FadeIn>
            <div className="rounded-[28px] border border-[var(--border)] bg-white/90 p-10 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">No hospitals found</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                Try changing the city, state, availability, or specialty search to broaden the results.
              </p>
            </div>
          </FadeIn>
        )}

        <FadeIn delay={0.1}>
          <HospitalsPagination
            currentPage={result.pagination.page}
            totalPages={result.pagination.totalPages}
            createPageHref={createPageHref}
          />
        </FadeIn>
      </section>
    </div>
  );
}
