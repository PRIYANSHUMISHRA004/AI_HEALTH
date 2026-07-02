"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, UserCircle2 } from "lucide-react";

import { EmergencyLauncher } from "@/components/emergency/emergency-launcher";
import { useAuth } from "@/hooks";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { GlobalSearch } from "@/components/search/global-search";

export function HospitalTopbar() {
  const { logout, user } = useAuth();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleLogout = () => {
    setIsAccountMenuOpen(false);
    logout();
  };

  return (
    <div className="surface-card flex flex-col gap-4 rounded-[24px] px-4 py-4 sm:rounded-[26px] sm:px-5 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">Workspace shell</p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">Hospital operations</h1>
      </div>

      <div className="flex w-full flex-col gap-3 lg:max-w-2xl lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <GlobalSearch compact />
        </div>
        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <EmergencyLauncher compact />
          <NotificationBell />
          <div ref={accountMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen((current) => !current)}
              className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-white px-2.5 py-2 pr-3 text-left shadow-sm transition hover:border-[var(--primary)] hover:bg-[rgba(15,118,110,0.03)]"
              aria-label="Open account menu"
              aria-expanded={isAccountMenuOpen}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(15,118,110,0.12)] text-sm font-semibold text-[var(--primary)]">
                {user?.name?.charAt(0).toUpperCase() ?? "H"}
              </div>
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                  {user?.name ?? "Hospital admin"}
                </p>
                <p className="truncate text-xs text-[var(--muted)]">
                  {user?.role === "hospital_admin" ? "Hospital admin" : user?.role ?? "Workspace account"}
                </p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-[var(--muted)] transition ${isAccountMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isAccountMenuOpen ? (
              <div className="absolute right-0 top-[calc(100%+0.75rem)] z-40 w-[270px] rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.98)] p-3 shadow-[0_24px_64px_rgba(16,35,27,0.12)] backdrop-blur-xl">
                <div className="rounded-[18px] border border-[var(--border)] bg-[rgba(16,35,27,0.03)] px-4 py-3">
                  <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                    {user?.name ?? "Hospital admin"}
                  </p>
                  <p className="mt-1 truncate text-xs text-[var(--muted)]">
                    {user?.email ?? "Signed-in workspace account"}
                  </p>
                </div>

                <div className="mt-3 grid gap-2">
                  <Link
                    href="/hospital/profile"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--primary)] hover:bg-[rgba(15,118,110,0.03)]"
                  >
                    <UserCircle2 className="h-4 w-4 text-[var(--primary)]" />
                    <span>View profile</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
