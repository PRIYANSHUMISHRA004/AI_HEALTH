interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl space-y-3 sm:space-y-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--primary)] sm:text-xs">{eyebrow}</p>
      <h2 className="text-balance text-[1.9rem] font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-4xl">
        {title}
      </h2>
      <p className="max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base sm:leading-8">{description}</p>
    </div>
  );
}
