import Link from "next/link";
import { ArrowRight, BrainCircuit, Building2, HeartHandshake, ShieldPlus, Sparkles } from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";
import { InteractiveCard } from "@/components/motion/interactive-card";
import { Pill } from "@/components/ui/pill";

const statItems = [
  { value: "2", label: "Primary user roles" },
  { value: "10+", label: "Core coordination modules" },
  { value: "AI + Realtime", label: "Smart search and live updates" },
];

const spotlightItems = [
  "Search hospitals by location, treatment, doctors, and facilities",
  "Coordinate equipment, issues, and ambulance help across hospitals",
  "Keep AI assistive so the core platform still works if models fail",
];

export function HeroSection() {
  return (
    <section className="grid gap-8 py-8 sm:gap-10 sm:py-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)] lg:items-center lg:gap-12 lg:py-13">
      <FadeIn className="space-y-6 sm:space-y-8">
        <Pill label="Premium healthcare platform" />
        <div className="space-y-4 sm:space-y-5">
          <h1 className="max-w-[11.5ch] text-[2.15rem] font-semibold leading-[0.98] tracking-[-0.055em] text-[var(--foreground)] sm:max-w-4xl sm:text-balance sm:text-5xl sm:leading-[0.95] lg:text-6xl">
            One platform for patients, hospitals, equipment, and urgent care coordination.
          </h1>
          <p className="max-w-[32ch] text-[0.98rem] leading-7 text-[var(--muted)] sm:max-w-2xl sm:text-lg sm:leading-8 lg:text-xl">
            Swasth Setu helps people discover care faster and gives hospitals a cleaner way to
            manage doctors, ambulances, equipment shortages, and live support workflows.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/hospitals"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:min-w-[190px]"
          >
            Explore Hospitals
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/hospital/dashboard"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:min-w-[190px]"
          >
            Hospital Dashboard
            <Building2 className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {statItems.map((item) => (
            <InteractiveCard key={item.label}>
              <div className="rounded-3xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-5">
                <p className="text-2xl font-semibold text-[var(--foreground)]">{item.value}</p>
                <p className="mt-2 max-w-[18ch] text-sm leading-6 text-[var(--muted)]">{item.label}</p>
              </div>
            </InteractiveCard>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="relative overflow-hidden rounded-[30px] border border-[var(--border)] bg-white p-5 shadow-sm sm:rounded-[36px] sm:p-7">
          <div className="relative space-y-5">
            <div className="flex items-start gap-3 sm:items-center">
              <div className="rounded-2xl bg-[var(--primary-soft)] p-3 text-[var(--primary)]">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--muted)] sm:text-sm sm:tracking-[0.24em]">
                  Project vision
                </p>
                <p className="mt-1 text-lg font-semibold text-[var(--foreground)] sm:text-xl">
                  AI-powered coordination, not just directory search
                </p>
              </div>
            </div>

            <div className="grid gap-3 rounded-[24px] border border-[var(--border)] bg-[var(--background)] p-4 sm:gap-4 sm:rounded-[28px] sm:p-5">
              {spotlightItems.map((item, index) => {
                const Icon = [ShieldPlus, Sparkles, BrainCircuit][index];

                return (
                  <InteractiveCard key={item}>
                    <div className="flex items-start gap-3 rounded-2xl bg-white/70 px-3 py-3 sm:bg-transparent sm:px-0 sm:py-0">
                      <div className="mt-1 rounded-xl bg-[var(--primary-soft)] p-2 text-[var(--primary)]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-sm leading-6 text-[var(--muted)] sm:leading-7">{item}</p>
                    </div>
                  </InteractiveCard>
                );
              })}
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
