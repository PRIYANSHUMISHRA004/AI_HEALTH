"use client";

import { useEffect } from "react";
import { Download, X } from "lucide-react";

export interface MediaViewerItem {
  id: string;
  kind: "image" | "video" | "file";
  name: string;
  url?: string;
}

interface MediaViewerModalProps {
  item: MediaViewerItem | null;
  onClose: () => void;
}

export function MediaViewerModal({ item, onClose }: MediaViewerModalProps) {
  useEffect(() => {
    if (!item) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [item, onClose]);

  if (!item || !item.url || item.kind === "file") {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(8,18,14,0.82)] p-4 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close media viewer"
        onClick={onClose}
      />

      <div className="relative z-[101] flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(15,23,20,0.96)] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-white">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{item.name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/60">{item.kind}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/14"
            >
              <Download className="h-4 w-4" />
              Open
            </a>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/8 p-2 text-white transition hover:bg-white/14"
              aria-label="Close media viewer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex min-h-[320px] flex-1 items-center justify-center p-4">
          {item.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.url}
              alt={item.name}
              className="max-h-[74vh] w-auto max-w-full rounded-[22px] object-contain"
            />
          ) : (
            <video
              src={item.url}
              controls
              className="max-h-[74vh] w-full rounded-[22px] bg-black object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
}
