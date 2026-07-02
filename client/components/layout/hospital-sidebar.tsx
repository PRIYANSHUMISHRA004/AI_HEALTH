"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, Building2, CalendarClock, ClipboardPlus, LogOut, MessageSquareMore, Package, ShieldAlert, Share2, Truck, UserCircle } from "lucide-react";

import { useAuth } from "@/hooks";

const navItems = [
  { label: "Dashboard", href: "/hospital/dashboard", icon: Activity },
  { label: "Doctors", href: "/hospital/doctors", icon: ClipboardPlus },
  { label: "Equipment", href: "/hospital/equipment", icon: Package },
  { label: "Ambulances", href: "/hospital/ambulances", icon: Truck },
  { label: "Appointments", href: "/hospital/appointments", icon: CalendarClock },
  { label: "Issues", href: "/hospital/issues", icon: ShieldAlert },
  { label: "Network", href: "/hospital/network", icon: Share2 },
  { label: "Chat", href: "/hospital/chat", icon: MessageSquareMore },
  { label: "Profile", href: "/hospital/profile", icon: UserCircle },
] as const;

export function HospitalSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <aside className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(10,32,28,0.98),rgba(10,32,28,0.94))] p-4 text-white shadow-[var(--shadow)] sm:p-5 xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)] xl:rounded-[32px] xl:p-6 xl:flex xl:flex-col">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-semibold tracking-tight">Hospital Portal</p>
          <p className="text-sm text-white/68">Operations workspace</p>
        </div>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2 xl:mt-10 xl:grid-cols-1 xl:flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition xl:px-4 xl:py-3.5 ${
                isActive
                  ? "border-teal-300/40 bg-teal-400/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  : "border-white/10 bg-white/5 text-white/86 hover:border-white/20 hover:bg-white/8"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-teal-200" : "text-teal-300"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 border-t border-white/10 pt-4">
        {user && (
          <Link
            href="/hospital/profile"
            className="mb-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 transition hover:bg-white/8"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-400/20 text-sm font-semibold text-teal-200">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="truncate text-xs text-white/50">{user.linkedHospitalId ? "Hospital linked" : "No hospital linked"}</p>
            </div>
            <UserCircle className="h-4 w-4 shrink-0 text-white/40" />
          </Link>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/86 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
