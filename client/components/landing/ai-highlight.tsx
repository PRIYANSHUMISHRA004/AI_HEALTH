import { BrainCircuit, SearchCheck, Sparkles } from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";
import { InteractiveCard } from "@/components/motion/interactive-card";

const aiItems = [
  {
    title: "Semantic search",
    description: "Embeddings help match hospitals and equipment by meaning, not only exact keywords.",
    icon: SearchCheck,
  },
  {
    title: "Review and dashboard insights",
    description: "Summaries and insight cards help teams scan sentiment and shortage trends faster.",
    icon: Sparkles,
  },
  {
    title: "Assistant layer",
    description: "Chat-style support can guide users while the core product still works without AI.",
    icon: BrainCircuit,
  },
];

export function AiHighlight() {
  return (
    <FadeIn>
      <div className="rounded-[24px] border border-[var(--border)] bg-white p-5 shadow-sm sm:rounded-[32px] sm:p-8">
        <div className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--primary)] sm:text-sm sm:tracking-[0.24em]">AI features highlight</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:mt-4 sm:text-3xl">Helpful AI where it matters most</h3>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:mt-4 sm:leading-8">
            The platform uses AI to improve discovery, summarization, and assistance, but the product
            remains usable even if AI services are unavailable during the hackathon demo.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:mt-8 md:grid-cols-3">
          {aiItems.map((item) => {
            const Icon = item.icon;

            return (
              <InteractiveCard key={item.title}>
                <div className="rounded-[20px] border border-[var(--border)] bg-[var(--background)] p-4 sm:rounded-[24px] sm:p-5">
                  <div className="inline-flex rounded-2xl bg-[var(--primary-soft)] p-3 text-[var(--primary)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="mt-4 text-lg font-semibold text-[var(--foreground)]">{item.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)] sm:leading-7">{item.description}</p>
                </div>
              </InteractiveCard>
            );
          })}
        </div>
      </div>
    </FadeIn>
  );
}
