import { PillBottle } from "lucide-react";

import { MedicalShopCard } from "@/components/medical-shops/medical-shop-card";
import { MedicalShopFilters } from "@/components/medical-shops/medical-shop-filters";
import { MedicalShopsPagination } from "@/components/medical-shops/medical-shops-pagination";
import { FadeIn } from "@/components/motion/fade-in";
import { SectionHeading } from "@/components/ui/section-heading";
import { medicalShopService } from "@/services";

export const dynamic = "force-dynamic";

interface MedicalShopsPageProps {
  searchParams?: Promise<{
    city?: string;
    state?: string;
    area?: string;
    page?: string;
  }>;
}

const toPositivePage = (value?: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 1;
  }
  return Math.floor(parsed);
};

export default async function MedicalShopsPage({ searchParams }: MedicalShopsPageProps) {
  const params = (await searchParams) ?? {};
  const currentPage = toPositivePage(params.page);

  const result = await medicalShopService.list({
    city: params.city?.trim() || undefined,
    state: params.state?.trim() || undefined,
    area: params.area?.trim() || undefined,
    page: currentPage,
    limit: 9,
  });

  const createPageHref = (page: number) => {
    const query = new URLSearchParams();
    if (params.city) query.set("city", params.city);
    if (params.state) query.set("state", params.state);
    if (params.area) query.set("area", params.area);
    if (page > 1) query.set("page", String(page));
    const queryString = query.toString();
    return queryString ? `/medical-shops?${queryString}` : "/medical-shops";
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-6 pb-20 pt-10 sm:px-8 lg:px-12">
      <section className="space-y-8 py-12 sm:py-16">
        <FadeIn>
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
              <PillBottle className="h-6 w-6" />
            </div>
            <SectionHeading
              eyebrow="Medical shops"
              title="Find nearby medical shops with basic medicine visibility"
              description="Browse public medical shop listings by city, state, and area to quickly find pharmacy support near the patient."
            />
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <MedicalShopFilters city={params.city} state={params.state} area={params.area} />
        </FadeIn>

        <FadeIn delay={0.08}>
          <div className="flex flex-col gap-3 rounded-[24px] border border-[var(--border)] bg-[var(--card)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--muted)]">
              Showing <span className="font-semibold text-[var(--foreground)]">{result.data.length}</span> shops on
              this page out of <span className="font-semibold text-[var(--foreground)]">{result.pagination.total}</span>{" "}
              total results.
            </p>
            <p className="text-sm text-[var(--muted)]">
              Page {result.pagination.page} of {result.pagination.totalPages}
            </p>
          </div>
        </FadeIn>

        {result.data.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {result.data.map((shop, index) => (
              <FadeIn key={shop._id} delay={index * 0.04}>
                <MedicalShopCard shop={shop} />
              </FadeIn>
            ))}
          </div>
        ) : (
          <FadeIn>
            <div className="rounded-[28px] border border-[var(--border)] bg-white/90 p-10 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">No medical shops found</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                Try adjusting the city, state, or area filters to broaden the results.
              </p>
            </div>
          </FadeIn>
        )}

        <FadeIn delay={0.1}>
          <MedicalShopsPagination
            currentPage={result.pagination.page}
            totalPages={result.pagination.totalPages}
            createPageHref={createPageHref}
          />
        </FadeIn>
      </section>
    </div>
  );
}
