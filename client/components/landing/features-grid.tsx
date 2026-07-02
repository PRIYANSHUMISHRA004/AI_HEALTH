import { ActivitySquare, CalendarCheck2, MapPinned, MessageSquareMore, PackageSearch, Siren } from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";
import { InteractiveCard } from "@/components/motion/interactive-card";

const features = [
  {
    title: "Hospital discovery",
    description: "Search by city, treatment, facilities, doctor specialization, and availability.",
    icon: MapPinned,
  },
  {
    title: "Appointment flow",
    description: "Patients can move from discovery to doctor booking with a simple flow.",
    icon: CalendarCheck2,
  },
  {
    title: "Equipment visibility",
    description: "Hospitals can manage stock, assignment, and shortage coordination cleanly.",
    icon: PackageSearch,
  },
  {
    title: "Ambulance support",
    description: "Emergency and support requests fit into one connected hospital network.",
    icon: Siren,
  },
  {
    title: "Realtime coordination",
    description: "Chat, issue updates, and equipment changes can be pushed live with Socket.IO.",
    icon: MessageSquareMore,
  },
  {
    title: "Operational dashboard",
    description: "Hospital teams get one place for trends, workloads, and action items.",
    icon: ActivitySquare,
  },
];

export function FeaturesGrid() {
  return (
    <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
      {features.map((item, index) => {
        const Icon = item.icon;

        return (
          <FadeIn key={item.title} delay={index * 0.05}>
            <InteractiveCard>
              <article className="h-full rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm backdrop-blur sm:rounded-[28px] sm:p-6">
                <div className="mb-4 inline-flex rounded-2xl bg-[var(--primary-soft)] p-3 text-[var(--primary)] sm:mb-5">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] sm:text-xl">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:leading-7">{item.description}</p>
              </article>
            </InteractiveCard>
          </FadeIn>
        );
      })}
    </div>
  );
}
