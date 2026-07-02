import { memo } from "react";
import type { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: number | string;
  detail: string;
  accent: string;
  icon: LucideIcon;
  compact?: boolean;
}

export const SummaryCard = memo(function SummaryCard({
  title,
  value,
  detail,
  accent,
  icon: Icon,
  compact = false,
}: SummaryCardProps) {
  return (
    <article className={`surface-card rounded-[26px] p-5 sm:rounded-[30px] ${compact ? "sm:p-5" : "sm:p-6"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--muted)]">{title}</p>
          <p
            className={`font-semibold tracking-tight text-[var(--foreground)] ${
              compact ? "mt-3 text-3xl leading-none sm:text-[2.6rem]" : "mt-4 text-3xl sm:mt-5 sm:text-4xl"
            }`}
          >
            {value}
          </p>
        </div>
        <div className={`rounded-[18px] ${accent} shadow-sm sm:rounded-[20px] ${compact ? "p-2.5 sm:p-3" : "p-3 sm:p-3.5"}`}>
          <Icon className={compact ? "h-[18px] w-[18px]" : "h-5 w-5"} />
        </div>
      </div>

      <p className={`max-w-[18rem] text-sm text-[var(--muted)] ${compact ? "mt-3 leading-6" : "mt-4 leading-7"}`}>{detail}</p>
    </article>
  );
});
