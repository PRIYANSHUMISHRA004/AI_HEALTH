"use client";

import { useEffect, useState } from "react";
import { HeartPulse, LayoutDashboard, LogOut, Menu, Stethoscope, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks";
import { EmergencyLauncher } from "@/components/emergency/emergency-launcher";
import { NotificationBell } from "@/components/notifications/notification-bell";

interface NavLink { href: string; label: string }

const publicLinks: NavLink[] = [];

const guestLinks: NavLink[] = [];

const patientAuthLinks: NavLink[] = [];

const hospitalAuthLinks: NavLink[] = [];

export function PublicNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, isHydrated, logout, user } = useAuth();

  const authLinks = user?.role === "patient" ? patientAuthLinks : hospitalAuthLinks;
  const navLinks = [...publicLinks, ...(isHydrated && isAuthenticated ? authLinks : guestLinks)];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 18);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4 lg:px-8">
      <div
        className={cn(
          "mx-auto max-w-7xl rounded-[28px] border transition-all duration-300",
          isScrolled
            ? "border-[rgba(16,35,27,0.08)] bg-[rgba(255,255,255,0.96)] shadow-[0_18px_40px_rgba(16,35,27,0.08)] backdrop-blur-xl"
            : "border-transparent bg-white/72 backdrop-blur-md",
        )}
      >
        <div className="flex items-center gap-3 px-4 py-3 sm:flex-wrap sm:gap-4 sm:px-8 sm:py-4 lg:px-10">
          <a href="/" className="min-w-0 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--foreground)] text-white shadow-lg sm:h-11 sm:w-11">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-[var(--foreground)] sm:text-base">
                Swasth Setu
              </p>
              <p className="hidden text-[11px] uppercase tracking-[0.22em] text-[var(--muted)] sm:block">
                Hospital coordination
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-7 xl:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <EmergencyLauncher compact />
            </div>

            {isHydrated && isAuthenticated ? (
              <div className="hidden items-center gap-2 md:flex">
                <NotificationBell />
                <a
                  href={user?.role === "patient" ? "/patient/feed" : "/hospital"}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)]"
                >
                  <LayoutDashboard className="h-4 w-4 text-[var(--primary)]" />
                  {user?.role === "patient" ? "My Feed" : "Dashboard"}
                </a>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-red-400 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                >
                  <Stethoscope className="h-4 w-4 text-[var(--primary)]" />
                  Sign in
                </a>
                <a
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                >
                <Stethoscope className="h-4 w-4 text-[var(--primary)]" />
                  Register
                </a>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              className="inline-flex shrink-0 rounded-2xl border border-[var(--border)] bg-white p-2 text-[var(--foreground)] md:hidden"
              aria-label="Toggle navigation"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen ? (
          <div className="border-t border-[var(--border)] px-4 py-4 sm:px-6 md:hidden">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-2xl px-3 py-2 text-sm font-medium text-[var(--muted)] transition hover:bg-[rgba(16,35,27,0.04)] hover:text-[var(--foreground)]"
                >
                  {link.label}
                </a>
              ))}
              {isHydrated && isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => { setIsMenuOpen(false); logout(); }}
                  className="rounded-2xl px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-[rgba(16,35,27,0.04)]"
                >
                  Logout
                </button>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <a
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-2xl border border-[var(--border)] px-3 py-2 text-center text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  >
                    Log in
                  </a>
                  <a
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-2xl border border-[var(--border)] px-3 py-2 text-center text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)]"
                  >
                    Register
                  </a>
                </div>
              )}
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
