import Link from "next/link";
import { Plus, Siren } from "lucide-react";

import { IssueCard } from "@/components/issues/issue-card";
import { IssueFilters } from "@/components/issues/issue-filters";
import { IssuesPagination } from "@/components/issues/issues-pagination";
import { FadeIn } from "@/components/motion/fade-in";
import { SectionHeading } from "@/components/ui/section-heading";
import { issueService } from "@/services";

export const dynamic = "force-dynamic";

interface IssuesPageProps {
  searchParams?: Promise<{
    status?: "open" | "in-progress" | "resolved";
    issueType?: "public-help" | "equipment-shortage" | "ambulance-request" | "general";
    roleType?: "patient" | "hospital";
    page?: string;
  }>;
}

const toPositivePage = (value?: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 1;
  }
  return Math.floor(parsed);
};

export default async function IssuesPage({ searchParams }: IssuesPageProps) {
  const params = (await searchParams) ?? {};
  const currentPage = toPositivePage(params.page);

  const result = await issueService.list({
    status: params.status,
    issueType: params.issueType,
    roleType: params.roleType,
    page: currentPage,
    limit: 9,
  });

  const createPageHref = (page: number) => {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.issueType) query.set("issueType", params.issueType);
    if (params.roleType) query.set("roleType", params.roleType);
    if (page > 1) query.set("page", String(page));
    const queryString = query.toString();
    return queryString ? `/issues?${queryString}` : "/issues";
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-6 pb-20 pt-10 sm:px-8 lg:px-12">
      <section className="space-y-8 py-12 sm:py-16">
        <FadeIn>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
                <Siren className="h-6 w-6" />
              </div>
              <SectionHeading
                eyebrow="Public issues feed"
                title="Track public help requests, shortages, and hospital-side updates"
                description="This feed surfaces urgent operational issues so patients and hospitals can see what needs attention across the network."
              />
            </div>

            <Link
              href="/issues/new"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)]"
            >
              <Plus className="h-4 w-4" />
              Create New Issue
            </Link>
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <IssueFilters status={params.status} issueType={params.issueType} roleType={params.roleType} />
        </FadeIn>

        <FadeIn delay={0.08}>
          <div className="flex flex-col gap-3 rounded-[24px] border border-[var(--border)] bg-[var(--card)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--muted)]">
              Showing <span className="font-semibold text-[var(--foreground)]">{result.data.length}</span> issues on
              this page out of <span className="font-semibold text-[var(--foreground)]">{result.pagination.total}</span>{" "}
              total results.
            </p>
            <p className="text-sm text-[var(--muted)]">
              Page {result.pagination.page} of {result.pagination.totalPages}
            </p>
          </div>
        </FadeIn>

        {result.data.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {result.data.map((issue, index) => (
              <FadeIn key={issue._id} delay={index * 0.04}>
                <IssueCard issue={issue} />
              </FadeIn>
            ))}
          </div>
        ) : (
          <FadeIn>
            <div className="rounded-[28px] border border-[var(--border)] bg-white/90 p-10 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">No issues found</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                Try adjusting the status, issue type, or role type filters to see more records.
              </p>
            </div>
          </FadeIn>
        )}

        <FadeIn delay={0.1}>
          <IssuesPagination
            currentPage={result.pagination.page}
            totalPages={result.pagination.totalPages}
            createPageHref={createPageHref}
          />
        </FadeIn>
      </section>
    </div>
  );
}
