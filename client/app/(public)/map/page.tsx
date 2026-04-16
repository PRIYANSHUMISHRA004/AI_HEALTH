import { MapPinned } from "lucide-react";

import { MapFilters } from "@/components/map/map-filters";
import { NetworkMap } from "@/components/map/network-map";
import { FadeIn } from "@/components/motion/fade-in";
import { SectionHeading } from "@/components/ui/section-heading";
import { hospitalService, medicalShopService } from "@/services";

export const dynamic = "force-dynamic";

interface MapPageProps {
  searchParams?: Promise<{
    city?: string;
    state?: string;
  }>;
}

export default async function MapPage({ searchParams }: MapPageProps) {
  const params = (await searchParams) ?? {};
  const city = params.city?.trim() || undefined;
  const state = params.state?.trim() || undefined;

  const [hospitalResponse, medicalShopResponse] = await Promise.all([
    hospitalService.list({ city, state, limit: 100 }),
    medicalShopService.list({ city, state, limit: 100 }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-6 pb-20 pt-10 sm:px-8 lg:px-12">
      <section className="space-y-8 py-12 sm:py-16">
        <FadeIn>
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
              <MapPinned className="h-6 w-6" />
            </div>
            <SectionHeading
              eyebrow="Network map"
              title="Explore hospitals and medical shops on a live map"
              description="This demo-friendly map shows hospital and pharmacy markers together so users can understand availability and support coverage by location."
            />
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <MapFilters city={city} state={state} />
        </FadeIn>

        <FadeIn delay={0.08}>
          <NetworkMap hospitals={hospitalResponse.data} medicalShops={medicalShopResponse.data} />
        </FadeIn>
      </section>
    </div>
  );
}
