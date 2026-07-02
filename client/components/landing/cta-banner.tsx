import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";

export function CtaBanner() {
  return (
    <FadeIn>
      <div className="flex flex-col gap-6 rounded-[24px] border border-[var(--border)] bg-white/90 p-5 shadow-sm sm:rounded-[32px] sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--primary)] sm:text-sm sm:tracking-[0.24em]">Get started</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:mt-4 sm:text-3xl">
            Explore the network or jump straight into hospital operations.
          </h3>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:leading-7">
            This landing page is the clean public entry point. From here, we can keep expanding public
            discovery and the hospital-side dashboard block by block.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/hospitals"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] sm:min-w-[190px]"
          >
            Explore Hospitals
          </Link>
          <Link
            href="/hospital/dashboard"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:min-w-[190px]"
          >
            Hospital Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </FadeIn>
  );
}
