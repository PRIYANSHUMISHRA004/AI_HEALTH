import { BrainCircuit, SearchCheck, Sparkles } from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";

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
      <div className="rounded-[32px] border border-[var(--border)] bg-white p-8 shadow-sm">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--primary)]">AI features highlight</p>
          <h3 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)]">Helpful AI where it matters most</h3>
          <p className="mt-4 text-sm leading-8 text-[var(--muted)]">
            The platform uses AI to improve discovery, summarization, and assistance, but the product
            remains usable even if AI services are unavailable during the hackathon demo.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {aiItems.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="rounded-[24px] border border-[var(--border)] bg-[var(--background)] p-5">
                <div className="inline-flex rounded-2xl bg-[var(--primary-soft)] p-3 text-[var(--primary)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="mt-4 text-lg font-semibold text-[var(--foreground)]">{item.title}</h4>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </FadeIn>
  );
}
