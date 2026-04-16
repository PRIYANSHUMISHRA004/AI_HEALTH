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
      <div className="rounded-[32px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(10,32,28,0.98),rgba(15,118,110,0.95))] p-8 text-white shadow-[var(--shadow)]">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-teal-200">AI features highlight</p>
          <h3 className="mt-4 text-3xl font-semibold tracking-tight">Helpful AI where it matters most</h3>
          <p className="mt-4 text-sm leading-8 text-white/78">
            The platform uses AI to improve discovery, summarization, and assistance, but the product
            remains usable even if AI services are unavailable during the hackathon demo.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {aiItems.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/8 p-5">
                <div className="inline-flex rounded-2xl bg-white/10 p-3 text-teal-200">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="mt-4 text-lg font-semibold">{item.title}</h4>
                <p className="mt-2 text-sm leading-7 text-white/72">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </FadeIn>
  );
}
