import Link from "next/link";

interface MapFiltersProps {
  city?: string;
  state?: string;
}

export function MapFilters({ city = "", state = "" }: MapFiltersProps) {
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-white/90 p-5 shadow-sm sm:p-6">
      <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <input
          name="city"
          defaultValue={city}
          placeholder="Filter by city"
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
        />

        <input
          name="state"
          defaultValue={state}
          placeholder="Filter by state"
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
        />

        <div className="flex flex-col gap-3 sm:flex-row lg:self-end">
          <button
            type="submit"
            className="inline-flex flex-1 items-center justify-center rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)]"
          >
            Apply
          </button>
          <Link
            href="/map"
            className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)]"
          >
            Reset
          </Link>
        </div>
      </form>
    </div>
  );
}
