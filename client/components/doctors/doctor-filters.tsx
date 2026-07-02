interface DoctorFiltersValue {
  search: string;
  specialization: string;
  department: string;
  availability: "" | "true" | "false";
}

interface DoctorFiltersProps {
  value: DoctorFiltersValue;
  specializationOptions: string[];
  departmentOptions: string[];
  onChange: (next: DoctorFiltersValue) => void;
  onReset: () => void;
}

export function DoctorFilters({
  value,
  specializationOptions,
  departmentOptions,
  onChange,
  onReset,
}: DoctorFiltersProps) {
  return (
    <section className="surface-card rounded-[26px] p-5 sm:rounded-[30px] sm:p-6">
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">Filters</p>
          <h2 className="mt-2 text-lg font-semibold text-[var(--foreground)]">Search and refine doctors</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <div>
            <label className="field-label" htmlFor="doctor-search">
              Search by doctor name
            </label>
            <input
              id="doctor-search"
              value={value.search}
              onChange={(event) => onChange({ ...value, search: event.target.value })}
              className="field-control"
              placeholder="Search doctor name"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="doctor-specialization">
              Specialization
            </label>
            <select
              id="doctor-specialization"
              value={value.specialization}
              onChange={(event) => onChange({ ...value, specialization: event.target.value })}
              className="field-control"
            >
              <option value="">All specializations</option>
              {specializationOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="doctor-department">
              Department
            </label>
            <select
              id="doctor-department"
              value={value.department}
              onChange={(event) => onChange({ ...value, department: event.target.value })}
              className="field-control"
            >
              <option value="">All departments</option>
              {departmentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="doctor-availability">
              Availability
            </label>
            <select
              id="doctor-availability"
              value={value.availability}
              onChange={(event) =>
                onChange({ ...value, availability: event.target.value as DoctorFiltersValue["availability"] })
              }
              className="field-control"
            >
              <option value="">All</option>
              <option value="true">Available</option>
              <option value="false">Unavailable</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onReset} className="btn-secondary btn-sm">
            Reset filters
          </button>
        </div>
      </div>
    </section>
  );
}

export type { DoctorFiltersValue };
