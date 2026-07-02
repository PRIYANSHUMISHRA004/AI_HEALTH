"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bot,
  CalendarDays,
  HeartPulse,
  Hospital,
  LayoutGrid,
  LogOut,
  Map,
  MessageCircle,
  ShoppingBag,
  Siren,
  X,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks";
import { EmergencyLauncher } from "@/components/emergency/emergency-launcher";

const navItems = [
  { href: "/patient/feed", label: "Feed", icon: LayoutGrid },
  { href: "/hospitals", label: "Hospitals", icon: Hospital },
  { href: "/map", label: "Map", icon: Map },
  { href: "/medical-shops", label: "Medical Shops", icon: ShoppingBag },
  { href: "/appointments/new", label: "Book Appointment", icon: CalendarDays },
  { href: "/issues", label: "Issues", icon: Siren },
  { href: "/activity", label: "My Activity", icon: Activity },
  { href: "/chat", label: "Messages", icon: MessageCircle },
  { href: "/assistant", label: "AI Assistant", icon: Bot },
] as const;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function PatientSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 pb-6 pt-2">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--foreground)] text-white shadow-lg">
          <HeartPulse className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-[var(--foreground)]">Swasth Setu</p>
          <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">Patient Portal</p>
        </div>
      </div>

      {/* Profile Card */}
      {user ? (
        <div className="mx-3 mb-5 rounded-2xl bg-gradient-to-br from-[var(--primary-soft)] to-[rgba(255,255,255,0.6)] p-4 border border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)] text-white text-sm font-bold shadow-md">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--foreground)]">{user.name}</p>
              <p className="truncate text-xs text-[var(--muted)]">{user.email}</p>
            </div>
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white">
            <HeartPulse className="h-3 w-3" />
            Patient
          </div>
        </div>
      ) : null}

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/patient/feed" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[var(--primary)] text-white shadow-md"
                  : "text-[var(--muted)] hover:bg-[rgba(15,118,110,0.07)] hover:text-[var(--foreground)]",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 flex-shrink-0 transition-colors",
                  isActive ? "text-white" : "text-[var(--muted)] group-hover:text-[var(--primary)]",
                )}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-4 space-y-2 px-3 pb-3">
        <div className="rounded-2xl overflow-hidden">
          <EmergencyLauncher compact />
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden xl:block">
        <div className="sticky top-4 rounded-[28px] border border-[var(--border)] bg-[var(--card)] py-4 shadow-[var(--shadow)] backdrop-blur h-[calc(100vh-2rem)] overflow-hidden">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile topbar trigger */}
      <div className="flex items-center justify-between xl:hidden mb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--foreground)] text-white">
            <HeartPulse className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-[var(--foreground)]">Swasth Setu</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-2xl border border-[var(--border)] bg-white p-2"
          aria-label="Open menu"
        >
          <LayoutGrid className="h-5 w-5 text-[var(--foreground)]" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 rounded-r-[28px] border-r border-[var(--border)] bg-[var(--card)] py-4 shadow-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 rounded-xl border border-[var(--border)] bg-white p-1.5"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebarContent}
          </div>
        </div>
      ) : null}
    </>
  );
}
