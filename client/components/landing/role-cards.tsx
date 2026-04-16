import { Building2, UserRoundSearch } from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";

const roles = [
  {
    title: "People / Patients",
    description:
      "Discover hospitals, compare details, book appointments, raise issues, search nearby medical shops, and request ambulance help.",
    bullets: [
      "Search by area, disease, facilities, or doctor specialty",
      "View hospital details, reviews, and support options",
      "Use map-first discovery and public issue reporting",
    ],
    icon: UserRoundSearch,
  },
  {
    title: "Hospitals",
    description:
      "Manage doctors, equipment, ambulances, appointments, issue feeds, and collaborative support with other hospitals.",
    bullets: [
      "Operate from one dashboard with modular tools",
      "Coordinate shortages, chat, and support requests",
      "Track live operations while keeping AI optional",
    ],
    icon: Building2,
  },
];

export function RoleCards() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {roles.map((role, index) => {
        const Icon = role.icon;

        return (
          <FadeIn key={role.title} delay={index * 0.08}>
            <article className="rounded-[30px] border border-[var(--border)] bg-white/90 p-7 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-[var(--foreground)]/6 p-3 text-[var(--primary)]">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--muted)]">User role</p>
                  <h3 className="text-2xl font-semibold text-[var(--foreground)]">{role.title}</h3>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-[var(--muted)]">{role.description}</p>
              <div className="mt-6 space-y-3">
                {role.bullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-3">
                    <div className="mt-2 h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
                    <p className="text-sm leading-7 text-[var(--muted)]">{bullet}</p>
                  </div>
                ))}
              </div>
            </article>
          </FadeIn>
        );
      })}
    </div>
  );
}
