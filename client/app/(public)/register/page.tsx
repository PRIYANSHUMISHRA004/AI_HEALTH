"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Building2, ChevronDown, UserRound } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { useAsyncTask, useAuth, useToast } from "@/hooks";
import { getErrorMessage } from "@/lib/utils";
import { authService } from "@/services";
import { useAuthStore } from "@/store";
import type { AuthResponse, UserRole } from "@/types";

const roleOptions: Array<{ label: string; value: UserRole }> = [
  { label: "Patient", value: "patient" },
  { label: "Hospital Admin", value: "hospital_admin" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const { setSession } = useAuthStore();
  const toast = useToast();
  const { isLoading, error, run } = useAsyncTask<AuthResponse>();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "patient" as UserRole,
    hospitalName: "",
  });

  const { syncCurrentUser } = useAuth();

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;
    syncCurrentUser().then((user) => {
      if (user) {
        router.replace(user.role === "patient" ? "/patient/feed" : "/hospital");
      }
    });
  }, [isAuthenticated, isHydrated, router, syncCurrentUser]);

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      role: form.role,
      ...(form.role === "hospital_admin" && form.hospitalName.trim()
        ? { hospitalName: form.hospitalName.trim() }
        : {}),
    };

    try {
      const result = await run(() => authService.register(payload));
      setSession(result);
      toast.success("Account created", "Your new account is ready to use.");
      router.push(form.role === "patient" ? "/patient/feed" : "/hospital");
    } catch (submitError) {
      toast.error("Registration failed", getErrorMessage(submitError, "Please review the form and try again."));
    }
  };

  return (
    <AuthShell
      title="Create your account"
      description="Set up access for care discovery or hospital operations."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[var(--primary)]">
            Sign in
          </Link>
        </p>
      }
    >
      <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-[var(--foreground)]" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            required
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
            placeholder="Your full name"
          />
        </div>

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
          <label className="mb-2 block text-sm font-medium text-[var(--foreground)]" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            required
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
            placeholder="+91..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--foreground)]" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            minLength={6}
            required
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
            placeholder="At least 6 characters"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--foreground)]" htmlFor="role">
            Role
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary)]">
              {form.role === "patient" ? <UserRound className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
            </div>
            <select
              id="role"
              value={form.role}
              onChange={(event) =>
                setForm((current) => ({ ...current, role: event.target.value as UserRole, hospitalName: "" }))
              }
              className="w-full appearance-none rounded-2xl border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,251,249,0.98))] py-3 pr-11 pl-11 outline-none transition focus:border-[var(--primary)] focus:shadow-[0_0_0_4px_rgba(15,118,110,0.08)]"
            >
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-1.5 text-xs text-[var(--muted)]">
            Choose patient access or a hospital workspace.
          </p>
        </div>

        {form.role === "hospital_admin" ? (
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]" htmlFor="hospitalName">
              Hospital name <span className="font-normal text-[var(--muted)]">(required)</span>
            </label>
            <input
              id="hospitalName"
              required
              value={form.hospitalName}
              onChange={(event) =>
                setForm((current) => ({ ...current, hospitalName: event.target.value }))
              }
              className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
              placeholder="e.g. City General Hospital"
            />
            <p className="mt-1.5 text-xs text-[var(--muted)]">
              A hospital will be created automatically and linked to your account.
            </p>
          </div>
        ) : null}

        {error ? <p className="sm:col-span-2 text-sm text-red-600">{error}</p> : null}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
