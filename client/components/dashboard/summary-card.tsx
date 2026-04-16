import type { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: number | string;
  detail: string;
  accent: string;
  icon: LucideIcon;
}

export function SummaryCard({ title, value, detail, accent, icon: Icon }: SummaryCardProps) {
  return (
    <article className="rounded-[28px] border border-[var(--border)] bg-white/92 p-5 shadow-[0_16px_40px_rgba(16,35,27,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{title}</p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)]">{value}</p>
        </div>
        <div className={`rounded-2xl ${accent} p-3`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{detail}</p>
    </article>
  );
}
