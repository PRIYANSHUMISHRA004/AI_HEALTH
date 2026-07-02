interface AuthShellProps {
  title: string;
  description: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}

export function AuthShell({ title, description, footer, children }: AuthShellProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-140px)] w-full max-w-6xl items-center px-6 py-16 sm:px-8 lg:px-12">
      <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[32px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(15,118,110,0.98),rgba(10,32,28,0.96))] p-8 text-white shadow-[var(--shadow)]">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-teal-200">Swasth Setu</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-4 max-w-md text-base leading-8 text-white/78">{description}</p>
          <div className="mt-10 space-y-4 text-sm text-white/74">
            <p>Patient access for hospital discovery, booking, and support requests.</p>
            <p>Hospital access for operations, equipment visibility, and ambulance coordination.</p>
            <p>One account layer for public care journeys and hospital-side workflows.</p>
          </div>
        </section>

        <section className="rounded-[32px] border border-[var(--border)] bg-white/88 p-6 shadow-[var(--shadow)] backdrop-blur sm:p-8">
          {children}
          <div className="mt-6 border-t border-[var(--border)] pt-5 text-sm text-[var(--muted)]">{footer}</div>
        </section>
      </div>
    </div>
  );
}
