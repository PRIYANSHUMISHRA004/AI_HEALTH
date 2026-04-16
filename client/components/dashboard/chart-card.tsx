interface ChartCardProps {
  title: string;
  description: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}

export function ChartCard({ title, description, aside, children }: ChartCardProps) {
  return (
    <article className="surface-card rounded-[24px] p-5 sm:rounded-[26px] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">{title}</h3>
          <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--muted)]">{description}</p>
        </div>
        {aside ? <div className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary-strong)]">{aside}</div> : null}
      </div>
      <div className="mt-5 h-[260px] sm:h-[280px]">{children}</div>
    </article>
  );
}
