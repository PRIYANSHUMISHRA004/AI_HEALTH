"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/hooks";
import type { UserRole } from "@/types";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  unauthenticatedRedirectTo?: string;
  unauthorizedRedirectTo?: string;
}

export function AuthGuard({
  children,
  allowedRoles,
  unauthenticatedRedirectTo,
  unauthorizedRedirectTo = "/",
}: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isHydrated, token, user, isAuthenticated, syncCurrentUser } = useAuth();

  const loginRedirectPath = useMemo(
    () => unauthenticatedRedirectTo ?? `/login?redirect=${encodeURIComponent(pathname)}`,
    [pathname, unauthenticatedRedirectTo],
  );

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!token) {
      router.replace(loginRedirectPath as Parameters<typeof router.replace>[0]);
      return;
    }

    void syncCurrentUser();
  }, [isHydrated, loginRedirectPath, router, syncCurrentUser, token]);

  useEffect(() => {
    if (!isHydrated || !user || !allowedRoles?.length) {
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      router.replace(unauthorizedRedirectTo as Parameters<typeof router.replace>[0]);
    }
  }, [allowedRoles, isHydrated, router, unauthorizedRedirectTo, user]);

  if (!isHydrated) {
    return <div className="p-6 text-sm text-[var(--muted)]">Loading session...</div>;
  }

  if (!isAuthenticated || !token || !user) {
    return <div className="p-6 text-sm text-[var(--muted)]">Checking access...</div>;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <div className="p-6 text-sm text-[var(--muted)]">Redirecting...</div>;
  }

  return <>{children}</>;
}
