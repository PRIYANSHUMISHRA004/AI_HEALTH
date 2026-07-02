"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { useAsyncTask, useAuth, useToast } from "@/hooks";
import { getErrorMessage } from "@/lib/utils";
import { authService } from "@/services";
import { useAuthStore } from "@/store";
import type { AuthResponse } from "@/types";

interface LoginFormProps {
  redirectTo: "/" | "/hospital" | "/patient/feed";
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const { isAuthenticated, isHydrated, syncCurrentUser } = useAuth();
  const { setSession } = useAuthStore();
  const toast = useToast();
  const { isLoading, error, run } = useAsyncTask<AuthResponse>();

  const [isValidating, setIsValidating] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;

    setIsValidating(true);
    syncCurrentUser()
      .then((user) => {
        if (user) {
          router.replace(user.role === "patient" ? "/patient/feed" : "/hospital");
        }
      })
      .finally(() => setIsValidating(false));
  }, [isAuthenticated, isHydrated, router, syncCurrentUser]);

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const result = await run(() => authService.login(form));
      setSession(result);
      toast.success("Signed in successfully", "Your account session is ready.");
      const dest = result.user?.role === "patient" ? "/patient/feed" : result.user?.role ? "/hospital" : redirectTo;
      router.push(dest);
    } catch (submitError) {
      toast.error("Login failed", getErrorMessage(submitError, "Please check your credentials and try again."));
    }
  };

  if (isValidating) {
    return (
      <AuthShell
        title="Welcome back"
        description="Sign in to continue with patient support or hospital operations."
        footer={null}
      >
        <p className="py-6 text-center text-sm text-[var(--muted)]">Verifying your session...</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue with patient support or hospital operations."
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-[var(--primary)]">
            Create one
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--foreground)]" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--foreground)]" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
            placeholder="Enter your password"
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
