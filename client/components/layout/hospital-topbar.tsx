"use client";

import { EmergencyLauncher } from "@/components/emergency/emergency-launcher";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { GlobalSearch } from "@/components/search/global-search";

export function HospitalTopbar() {
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
        </div>
      </div>
    </div>
  );
}
