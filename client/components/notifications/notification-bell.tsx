"use client";

import { useMemo, useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";

import { useNotifications } from "@/hooks";
import { cn } from "@/lib/utils";

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, clearNotifications, markRead } = useNotifications();

  const buttonLabel = useMemo(() => {
    if (!unreadCount) {
      return "Notifications";
    }
    return `Notifications (${unreadCount} unread)`;
  }, [unreadCount]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setIsOpen((current) => !current);
          if (!isOpen) {
            markAllRead();
          }
        }}
        className="icon-button relative text-[var(--foreground)]"
        aria-label={buttonLabel}
      >
        <Bell className="h-5 w-5" />
        {unreadCount ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {Math.min(unreadCount, 9)}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(24rem,calc(100vw-2rem))] rounded-[26px] border border-[var(--border)] bg-[rgba(255,255,255,0.98)] p-4 shadow-[0_24px_70px_rgba(16,35,27,0.12)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">Notifications</p>
              <p className="text-xs text-[var(--muted)]">Live updates from issues, chat, equipment, and appointments.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => markAllRead()}
                className="btn-secondary btn-sm px-3 text-xs"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Read all
              </button>
              <button
                type="button"
                onClick={() => clearNotifications()}
                className="btn-secondary btn-sm px-3 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
          </div>

          <div className="mt-3 max-h-[24rem] space-y-2 overflow-y-auto pr-1">
            {notifications.length ? (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => markRead(notification.id)}
                  className={cn(
                    "w-full rounded-[18px] border px-4 py-3 text-left transition",
                    notification.read
                      ? "border-[var(--border)] bg-[rgba(16,35,27,0.02)]"
                      : "border-[rgba(15,118,110,0.18)] bg-[rgba(15,118,110,0.06)]",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">{notification.title}</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{notification.description}</p>
                    </div>
                    {!notification.read ? (
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                    {formatTime(notification.createdAt)}
                  </p>
                </button>
              ))
            ) : (
              <div className="rounded-[20px] border border-[var(--border)] bg-[rgba(16,35,27,0.02)] px-4 py-6 text-center text-sm text-[var(--muted)]">
                No notifications yet.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
