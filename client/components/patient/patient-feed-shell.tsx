"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Ambulance,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock,
  Hospital,
  Map,
  Pencil,
  Plus,
  Siren,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { IssueCard } from "@/components/issues/issue-card";
import { IssuesPagination } from "@/components/issues/issues-pagination";
import { FadeIn } from "@/components/motion/fade-in";
import { EmptyState } from "@/components/ui/empty-state";
import { useSocketEvents } from "@/hooks";
import type { Issue } from "@/types";

/* ------------------------------------------------------------------ */
/* Types                                                                  */
/* ------------------------------------------------------------------ */

interface PatientFeedShellProps {
  initialIssues: Issue[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: {
    status?: "open" | "in-progress" | "resolved";
    issueType?: "public-help" | "equipment-shortage" | "ambulance-request" | "general";
  };
}

type IssueTypeFilter = "all" | "public-help" | "equipment-shortage" | "ambulance-request" | "general";
type StatusFilter = "all" | "open" | "in-progress" | "resolved";

/* ------------------------------------------------------------------ */
/* Filter config                                                          */
/* ------------------------------------------------------------------ */

const issueTypeFilters: { value: IssueTypeFilter; label: string; icon: React.ElementType; color: string }[] = [
  { value: "all", label: "All", icon: Siren, color: "text-[var(--primary)]" },
  { value: "public-help", label: "Public Help", icon: Users, color: "text-blue-600" },
  { value: "equipment-shortage", label: "Equipment", icon: Zap, color: "text-orange-500" },
  { value: "ambulance-request", label: "Ambulance", icon: Ambulance, color: "text-red-500" },
  { value: "general", label: "General", icon: CircleDot, color: "text-[var(--muted)]" },
];

const statusFilters: { value: StatusFilter; label: string; dot: string }[] = [
  { value: "all", label: "All Status", dot: "bg-[var(--muted)]" },
  { value: "open", label: "Open", dot: "bg-red-500" },
  { value: "in-progress", label: "In Progress", dot: "bg-amber-500" },
  { value: "resolved", label: "Resolved", dot: "bg-green-500" },
];

/* ------------------------------------------------------------------ */
/* Quick actions                                                          */
/* ------------------------------------------------------------------ */

const quickActions = [
  {
    href: "/appointments/new",
    label: "Book Appointment",
    description: "Schedule with a doctor",
    icon: CalendarDays,
    bg: "bg-[var(--primary-soft)]",
    text: "text-[var(--primary)]",
    iconBg: "bg-[var(--primary)]",
  },
  {
    href: "/hospitals",
    label: "Find Hospital",
    description: "Browse nearby facilities",
    icon: Hospital,
    bg: "bg-blue-50",
    text: "text-blue-700",
    iconBg: "bg-blue-600",
  },
  {
    href: "/issues/new",
    label: "Report Issue",
    description: "Flag a health concern",
    icon: AlertTriangle,
    bg: "bg-orange-50",
    text: "text-orange-700",
    iconBg: "bg-orange-500",
  },
  {
    href: "/assistant",
    label: "AI Assistant",
    description: "Get instant health guidance",
    icon: Bot,
    bg: "bg-purple-50",
    text: "text-purple-700",
    iconBg: "bg-purple-600",
  },
] as const satisfies ReadonlyArray<{
  href: Route;
  label: string;
  description: string;
  icon: React.ElementType;
  bg: string;
  text: string;
  iconBg: string;
}>;

/* ------------------------------------------------------------------ */
/* Stats strip                                                            */
/* ------------------------------------------------------------------ */

function StatsStrip({ total, open }: { total: number; open: number }) {
  const resolved = total - open;
  const pct = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[var(--border)] bg-gradient-to-r from-[var(--primary-soft)] to-white px-5 py-3.5">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
        <span className="text-sm font-semibold text-[var(--foreground)]">{total}</span>
        <span className="text-sm text-[var(--muted)]">total issues</span>
      </div>
      <span className="hidden text-[var(--border)] sm:block">|</span>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        <span className="text-sm text-[var(--muted)]">
          <span className="font-semibold text-[var(--foreground)]">{open}</span> open
        </span>
      </div>
      <span className="hidden text-[var(--border)] sm:block">|</span>
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <span className="text-sm text-[var(--muted)]">
          <span className="font-semibold text-[var(--foreground)]">{pct}%</span> resolved
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Right panel — quick actions card                                       */
/* ------------------------------------------------------------------ */

function QuickActionsPanel() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[var(--primary)]" />
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`group flex flex-col gap-2 rounded-2xl p-3 transition-all hover:shadow-md ${action.bg}`}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${action.iconBg} shadow-sm`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className={`text-xs font-semibold ${action.text}`}>{action.label}</p>
                <p className="text-[10px] text-[var(--muted)] leading-tight mt-0.5">{action.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Right panel — explore card                                             */
/* ------------------------------------------------------------------ */

const exploreLinks = [
  { href: "/hospitals", label: "Browse Hospitals", icon: Hospital, desc: "View all healthcare facilities" },
  { href: "/map", label: "View on Map", icon: Map, desc: "Find hospitals near you" },
  { href: "/activity", label: "My Activity", icon: Activity, desc: "Track your history" },
] as const satisfies ReadonlyArray<{
  href: Route;
  label: string;
  icon: React.ElementType;
  desc: string;
}>;

function ExplorePanel() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Map className="h-4 w-4 text-[var(--primary)]" />
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Explore</h3>
      </div>
      <div className="space-y-1">
        {exploreLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[rgba(15,118,110,0.06)]"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)]">
                <Icon className="h-4 w-4 text-[var(--primary)]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)]">{link.label}</p>
                <p className="text-xs text-[var(--muted)] truncate">{link.desc}</p>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 flex-shrink-0 text-[var(--muted)]" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Right panel — trending issue types                                     */
/* ------------------------------------------------------------------ */

const trendingTypes = [
  { label: "Public Help Requests", href: "/issues?issueType=public-help", icon: Users, count: "Most active" },
  { label: "Equipment Shortages", href: "/issues?issueType=equipment-shortage", icon: Zap, count: "Urgent" },
  { label: "Ambulance Requests", href: "/issues?issueType=ambulance-request", icon: Ambulance, count: "Critical" },
] as const satisfies ReadonlyArray<{
  href: Route;
  label: string;
  icon: React.ElementType;
  count: string;
}>;

function TrendingPanel() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-[var(--accent)]" />
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Trending</h3>
      </div>
      <div className="space-y-1">
        {trendingTypes.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[rgba(15,118,110,0.06)]"
            >
              <Icon className="h-4 w-4 flex-shrink-0 text-[var(--muted)]" />
              <span className="flex-1 text-sm text-[var(--foreground)]">{item.label}</span>
              <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--accent)]">
                {item.count}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Right panel — AI assistant promo                                       */
/* ------------------------------------------------------------------ */

function AiPanel() {
  return (
    <Link
      href="/assistant"
      className="group flex flex-col gap-3 rounded-2xl border border-[var(--primary)] bg-gradient-to-br from-[var(--primary-soft)] to-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-md">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--primary)]">AI Health Assistant</p>
          <p className="text-xs text-[var(--muted)]">Powered by Swasth Setu</p>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-[var(--muted)]">
        Describe your symptoms or health question and get instant AI-powered guidance on the best hospitals, equipment, or care options.
      </p>
      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] group-hover:underline">
        Chat with AI
        <ChevronRight className="h-3.5 w-3.5" />
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Create issue prompt card                                               */
/* ------------------------------------------------------------------ */

function CreateIssuePrompt() {
  return (
    <Link
      href="/issues/new"
      className="group flex items-center gap-4 rounded-2xl border border-dashed border-[var(--primary)] bg-[var(--primary-soft)] px-5 py-4 transition hover:bg-[rgba(15,118,110,0.1)]"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-md">
        <Pencil className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--muted)]">
          Report a health issue or community concern…
        </p>
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white shadow-md transition group-hover:bg-[var(--primary-strong)]">
        <Plus className="h-3.5 w-3.5" />
        Post
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Filter bar                                                             */
/* ------------------------------------------------------------------ */

interface FilterBarProps {
  activeType: IssueTypeFilter;
  activeStatus: StatusFilter;
  onTypeChange: (v: IssueTypeFilter) => void;
  onStatusChange: (v: StatusFilter) => void;
}

function FilterBar({ activeType, activeStatus, onTypeChange, onStatusChange }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Issue type tabs */}
      <div className="flex flex-wrap gap-1.5">
        {issueTypeFilters.map((f) => {
          const Icon = f.icon;
          const isActive = activeType === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => onTypeChange(f.value)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[var(--primary)] text-white shadow-md"
                  : "bg-white border border-[var(--border)] text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Status filter */}
      <div className="flex gap-1">
        {statusFilters.map((f) => {
          const isActive = activeStatus === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => onStatusChange(f.value)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[var(--foreground)] text-white"
                  : "bg-white border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${f.dot}`} />
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main shell                                                             */
/* ------------------------------------------------------------------ */

function matchesFilters(
  issue: Issue,
  type: IssueTypeFilter,
  status: StatusFilter,
): boolean {
  if (type !== "all" && issue.issueType !== type) return false;
  if (status !== "all" && issue.status !== status) return false;
  return true;
}

export function PatientFeedShell({ initialIssues, pagination: initialPagination, filters }: PatientFeedShellProps) {
  const [issues, setIssues] = useState(initialIssues);
  const [pagination, setPagination] = useState(initialPagination);
  const [activeType, setActiveType] = useState<IssueTypeFilter>(filters.issueType ?? "all");
  const [activeStatus, setActiveStatus] = useState<StatusFilter>(filters.status ?? "all");

  useSocketEvents({
    "issue:created": (payload) => {
      const nextIssue = payload as Issue;
      if (!nextIssue?._id) return;

      setIssues((current) => {
        if (current.some((item) => item._id === nextIssue._id)) return current;
        return [nextIssue, ...current].slice(0, initialPagination.limit);
      });

      setPagination((current) => ({
        ...current,
        total: current.total + 1,
        totalPages: Math.max(1, Math.ceil((current.total + 1) / current.limit)),
      }));
    },
    "issue:updated": (payload) => {
      const updated = payload as Issue;
      if (!updated?._id) return;
      setIssues((current) =>
        current.map((item) => (item._id === updated._id ? updated : item)),
      );
    },
  });

  const visibleIssues = issues.filter((issue) => matchesFilters(issue, activeType, activeStatus));
  const openCount = issues.filter((i) => i.status === "open").length;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_296px]">
      {/* ── LEFT / MAIN FEED ── */}
      <div className="min-w-0 space-y-5">
        {/* Stats strip */}
        <FadeIn>
          <StatsStrip total={pagination.total} open={openCount} />
        </FadeIn>

        {/* Create issue prompt */}
        <FadeIn delay={0.04}>
          <CreateIssuePrompt />
        </FadeIn>

        {/* Section header */}
        <FadeIn delay={0.06}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Siren className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">Community Health Feed</h2>
              <p className="text-xs text-[var(--muted)]">Real-time issues from across the network</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
              <Clock className="h-3 w-3" />
              Live
            </div>
          </div>
        </FadeIn>

        {/* Filter bar */}
        <FadeIn delay={0.08}>
          <FilterBar
            activeType={activeType}
            activeStatus={activeStatus}
            onTypeChange={setActiveType}
            onStatusChange={setActiveStatus}
          />
        </FadeIn>

        {/* Result count */}
        <FadeIn delay={0.1}>
          <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white px-5 py-3 text-sm">
            <p className="text-[var(--muted)]">
              Showing{" "}
              <span className="font-semibold text-[var(--foreground)]">{visibleIssues.length}</span> of{" "}
              <span className="font-semibold text-[var(--foreground)]">{pagination.total}</span> issues
            </p>
            <p className="text-xs text-[var(--muted)]">
              Page {pagination.page} / {pagination.totalPages}
            </p>
          </div>
        </FadeIn>

        {/* Feed cards */}
        {visibleIssues.length > 0 ? (
          <div className="space-y-4">
            {visibleIssues.map((issue, index) => (
              <FadeIn key={issue._id} delay={index * 0.04}>
                <IssueCard issue={issue} />
              </FadeIn>
            ))}
          </div>
        ) : (
          <FadeIn>
            <EmptyState
              title="No issues found"
              description="Try adjusting the category or status filters to see more results."
            />
          </FadeIn>
        )}

        {/* Pagination */}
        <FadeIn delay={0.1}>
          <IssuesPagination currentPage={pagination.page} totalPages={pagination.totalPages} />
        </FadeIn>
      </div>

      {/* ── RIGHT PANEL ── */}
      <aside className="hidden xl:flex xl:flex-col xl:gap-4">
        <FadeIn delay={0.05}>
          <QuickActionsPanel />
        </FadeIn>
        <FadeIn delay={0.08}>
          <AiPanel />
        </FadeIn>
        <FadeIn delay={0.1}>
          <TrendingPanel />
        </FadeIn>
        <FadeIn delay={0.12}>
          <ExplorePanel />
        </FadeIn>
      </aside>
    </div>
  );
}
