import { Building2, UserRoundSearch } from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";
import { InteractiveCard } from "@/components/motion/interactive-card";

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
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
      {roles.map((role, index) => {
        const Icon = role.icon;

        return (
          <FadeIn key={role.title} delay={index * 0.08}>
            <InteractiveCard>
              <article className="rounded-[24px] border border-[var(--border)] bg-white/90 p-5 shadow-sm sm:rounded-[30px] sm:p-7">
                <div className="flex items-start gap-4 sm:items-center">
                  <div className="rounded-2xl bg-[var(--foreground)]/6 p-3 text-[var(--primary)]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--muted)] sm:text-sm sm:tracking-[0.24em]">User role</p>
                    <h3 className="text-xl font-semibold text-[var(--foreground)] sm:text-2xl">{role.title}</h3>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-[var(--muted)] sm:mt-5 sm:leading-7">{role.description}</p>
                <div className="mt-5 space-y-3 sm:mt-6">
                  {role.bullets.map((bullet) => (
                    <div key={bullet} className="flex items-start gap-3">
                      <div className="mt-2 h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
                      <p className="text-sm leading-6 text-[var(--muted)] sm:leading-7">{bullet}</p>
                    </div>
                  ))}
                </div>
              </article>
            </InteractiveCard>
          </FadeIn>
        );
      })}
    </div>
  );
}
