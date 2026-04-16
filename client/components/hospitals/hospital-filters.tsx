import Link from "next/link";

interface HospitalFiltersProps {
  city?: string;
  state?: string;
  availabilityStatus?: string;
  search?: string;
}

export function HospitalFilters({
  city = "",
  state = "",
  availabilityStatus = "",
  search = "",
}: HospitalFiltersProps) {
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-white/90 p-5 shadow-sm">
      <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_0.9fr_auto]">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by specialty or treatment"
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
        />
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
        <select
          name="availabilityStatus"
          defaultValue={availabilityStatus}
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
        >
          <option value="">All statuses</option>
          <option value="free">Free</option>
          <option value="busy">Busy</option>
        </select>

        <div className="flex gap-3">
          <button
            type="submit"
            className="inline-flex flex-1 items-center justify-center rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)]"
          >
            Apply
          </button>
          <Link
            href="/hospitals"
            className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)]"
          >
            Reset
          </Link>
        </div>
      </form>
    </div>
  );
}
