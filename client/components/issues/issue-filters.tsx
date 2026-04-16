import Link from "next/link";

interface IssueFiltersProps {
  status?: string;
  issueType?: string;
  roleType?: string;
}

export function IssueFilters({ status = "", issueType = "", roleType = "" }: IssueFiltersProps) {
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-white/90 p-5 shadow-sm">
      <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]">
        <select
          name="status"
          defaultValue={status}
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In progress</option>
          <option value="resolved">Resolved</option>
        </select>

        <select
          name="issueType"
          defaultValue={issueType}
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
        >
          <option value="">All issue types</option>
          <option value="public-help">Public help</option>
          <option value="equipment-shortage">Equipment shortage</option>
          <option value="ambulance-request">Ambulance request</option>
          <option value="general">General</option>
        </select>

        <select
          name="roleType"
          defaultValue={roleType}
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
        >
          <option value="">All role types</option>
          <option value="patient">Patient</option>
          <option value="hospital">Hospital</option>
        </select>

        <div className="flex gap-3">
          <button
            type="submit"
            className="inline-flex flex-1 items-center justify-center rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)]"
          >
            Apply
          </button>
          <Link
            href="/issues"
            className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)]"
          >
            Reset
          </Link>
        </div>
      </form>
    </div>
  );
}
