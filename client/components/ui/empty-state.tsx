import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ title, description, action, compact = false }: EmptyStateProps) {
  return (
    <div
      className={`rounded-[28px] border border-[var(--border)] bg-white/92 text-center shadow-sm ${
        compact ? "p-6 sm:p-7" : "p-10"
      }`}
    >
      <div className={`mx-auto flex flex-col items-center ${compact ? "max-w-sm" : "max-w-xl"}`}>
        <div className={`rounded-full bg-[var(--card)] text-[var(--muted)] ${compact ? "p-2.5" : "p-3"}`}>
          <Inbox className={compact ? "h-5 w-5" : "h-6 w-6"} />
        </div>
        <h2 className={`font-semibold text-[var(--foreground)] ${compact ? "mt-4 text-lg" : "mt-5 text-xl"}`}>{title}</h2>
        <p className={`text-sm text-[var(--muted)] ${compact ? "mt-2 leading-7" : "mt-3 leading-7"}`}>{description}</p>
        {action ? <div className={compact ? "mt-4" : "mt-5"}>{action}</div> : null}
      </div>
    </div>
  );
}
