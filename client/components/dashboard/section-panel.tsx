interface SectionPanelProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function SectionPanel({ eyebrow, title, description, children }: SectionPanelProps) {
  return (
    <section className="rounded-[30px] border border-[var(--border)] bg-white/90 p-6 shadow-[0_20px_40px_rgba(16,35,27,0.05)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{eyebrow}</p>
      <h2 className="mt-3 text-xl font-semibold tracking-tight text-[var(--foreground)]">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)]">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}
