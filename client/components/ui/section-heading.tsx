interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl space-y-3 sm:space-y-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--primary)] sm:text-xs">{eyebrow}</p>
      <h2 className="text-balance text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
        {title}
      </h2>
      <p className="text-sm leading-7 text-[var(--muted)] sm:text-base sm:leading-8">{description}</p>
    </div>
  );
}
