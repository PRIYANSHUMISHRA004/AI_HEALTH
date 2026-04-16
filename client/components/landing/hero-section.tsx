import Link from "next/link";
import { ArrowRight, BrainCircuit, Building2, HeartHandshake, ShieldPlus, Sparkles } from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";
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
    <section className="grid gap-12 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-24">
      <FadeIn className="space-y-8">
        <Pill label="Premium healthcare platform" />
        <div className="space-y-5">
          <h1 className="text-balance text-5xl font-semibold tracking-tight text-[var(--foreground)] sm:text-6xl">
            One platform for patients, hospitals, equipment, and urgent care coordination.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
            Swasth Setu helps people discover care faster and gives hospitals a cleaner way to
            manage doctors, ambulances, equipment shortages, and live support workflows.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/hospitals"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            Explore Hospitals
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/hospital/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            Hospital Dashboard
            <Building2 className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {statItems.map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm"
            >
              <p className="text-2xl font-semibold text-[var(--foreground)]">{item.value}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.label}</p>
            </div>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="relative overflow-hidden rounded-[36px] border border-[var(--border)] bg-white p-7 shadow-sm">
          <div className="relative space-y-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[var(--primary-soft)] p-3 text-[var(--primary)]">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--muted)]">
                  Project vision
                </p>
                <p className="text-xl font-semibold text-[var(--foreground)]">
                  AI-powered coordination, not just directory search
                </p>
              </div>
            </div>

            <div className="grid gap-4 rounded-[28px] border border-[var(--border)] bg-[var(--background)] p-5">
              {spotlightItems.map((item, index) => {
                const Icon = [ShieldPlus, Sparkles, BrainCircuit][index];

                return (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-1 rounded-xl bg-[var(--primary-soft)] p-2 text-[var(--primary)]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm leading-7 text-[var(--muted)]">{item}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
