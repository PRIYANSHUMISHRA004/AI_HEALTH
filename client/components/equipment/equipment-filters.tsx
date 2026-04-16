import { Search, SlidersHorizontal } from "lucide-react";

interface EquipmentFiltersValue {
  status: "" | "available" | "in-use" | "maintenance";
  type: string;
  hospitalSection: string;
}

interface EquipmentFiltersProps {
  value: EquipmentFiltersValue;
  onChange: (next: EquipmentFiltersValue) => void;
}

export function EquipmentFilters({ value, onChange }: EquipmentFiltersProps) {
  return (
    <section className="rounded-[28px] border border-[var(--border)] bg-white/90 p-5 shadow-[0_18px_40px_rgba(16,35,27,0.05)]">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-[rgba(15,118,110,0.08)] p-2 text-[var(--primary)]">
          <SlidersHorizontal className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Filter equipment</h2>
          <p className="text-sm text-[var(--muted)]">Narrow by status, type, or hospital section.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">Status</span>
          <select
            value={value.status}
            onChange={(event) => onChange({ ...value, status: event.target.value as EquipmentFiltersValue["status"] })}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
          >
            <option value="">All statuses</option>
            <option value="available">Available</option>
            <option value="in-use">In use</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">Type</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              value={value.type}
              onChange={(event) => onChange({ ...value, type: event.target.value })}
              placeholder="Ventilator, MRI, monitor..."
              className="w-full rounded-2xl border border-[var(--border)] bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[var(--primary)]"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">Hospital section</span>
          <input
            value={value.hospitalSection}
            onChange={(event) => onChange({ ...value, hospitalSection: event.target.value })}
            placeholder="ICU, ER, Radiology..."
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
          />
        </label>
      </div>
    </section>
  );
}
