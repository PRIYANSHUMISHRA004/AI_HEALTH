import { FadeIn } from "@/components/motion/fade-in";
import { SectionHeading } from "@/components/ui/section-heading";

interface SectionShellProps {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function SectionShell({ id, eyebrow, title, description, children }: SectionShellProps) {
  return (
    <section id={id} className="space-y-5 py-6 sm:space-y-6 sm:py-10">
      <FadeIn>
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      </FadeIn>
      {children}
    </section>
  );
}
