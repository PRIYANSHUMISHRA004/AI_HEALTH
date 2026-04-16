interface AmbulanceFiltersValue {
  status: "" | "available" | "busy" | "maintenance";
}

interface AmbulanceFiltersProps {
  value: AmbulanceFiltersValue;
  onChange: (next: AmbulanceFiltersValue) => void;
}

export function AmbulanceFilters({ value, onChange }: AmbulanceFiltersProps) {
  return (
    <section className="rounded-[28px] border border-[var(--border)] bg-white/90 p-5 shadow-[0_18px_40px_rgba(16,35,27,0.05)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Filter ambulances</h2>
          <p className="text-sm text-[var(--muted)]">View fleet availability by current status.</p>
        </div>
        <select
          value={value.status}
          onChange={(event) => onChange({ status: event.target.value as AmbulanceFiltersValue["status"] })}
          className="min-w-[180px] rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
        >
          <option value="">All statuses</option>
          <option value="available">Available</option>
          <option value="busy">Busy</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>
    </section>
  );
}
