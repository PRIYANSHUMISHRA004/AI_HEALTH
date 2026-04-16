"use client";

import { useMemo, useState } from "react";
import { FileText, Film, ImageIcon, PlayCircle } from "lucide-react";

import type { MediaAttachment } from "@/types";
import { EmptyState } from "@/components/ui/empty-state";
import { MediaViewerModal, type MediaViewerItem } from "@/components/media/media-viewer-modal";

export interface LocalMediaPreview {
  id: string;
  name: string;
  kind: "image" | "video" | "file";
  url?: string;
  sizeLabel?: string;
  note?: string;
}

interface MediaThumbnailGridProps {
  items: Array<MediaAttachment | LocalMediaPreview>;
  title?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  maxItems?: number;
}

const isLocalPreview = (
  value: MediaAttachment | LocalMediaPreview,
): value is LocalMediaPreview => "kind" in value;

const toGridItem = (item: MediaAttachment | LocalMediaPreview): MediaViewerItem & { sizeLabel?: string; note?: string } => {
  if (isLocalPreview(item)) {
    return item;
  }

  return {
    id: item.publicId,
    name: item.originalName || item.publicId,
    url: item.url,
    kind: item.resourceType === "raw" ? "file" : item.resourceType,
  };
};

const getItemIcon = (kind: MediaViewerItem["kind"]) => {
  if (kind === "image") return <ImageIcon className="h-5 w-5" />;
  if (kind === "video") return <Film className="h-5 w-5" />;
  return <FileText className="h-5 w-5" />;
};

export function MediaThumbnailGrid({
  items,
  title,
  emptyTitle = "No media selected",
  emptyDescription = "Add files to see previews here.",
  maxItems,
}: MediaThumbnailGridProps) {
  const normalizedItems = useMemo(() => items.map(toGridItem), [items]);
  const visibleItems = maxItems ? normalizedItems.slice(0, maxItems) : normalizedItems;
  const [activeItem, setActiveItem] = useState<MediaViewerItem | null>(null);

  if (!normalizedItems.length) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <>
      <div className="space-y-3">
        {title ? <p className="text-sm font-semibold text-[var(--foreground)]">{title}</p> : null}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item) => {
            const canPreviewInModal = Boolean(item.url && item.kind !== "file");

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (canPreviewInModal) {
                    setActiveItem(item);
                  }
                }}
                className="overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--card)] text-left transition hover:border-[rgba(15,118,110,0.22)] disabled:cursor-default"
                disabled={!canPreviewInModal}
              >
                {item.kind === "image" && item.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.name} className="h-36 w-full object-cover" />
                ) : item.kind === "video" && item.url ? (
                  <div className="relative">
                    <video src={item.url} className="h-36 w-full object-cover" muted />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/16">
                      <PlayCircle className="h-10 w-10 text-white drop-shadow" />
                    </div>
                  </div>
                ) : (
                  <div className="flex h-36 items-center justify-center bg-white">
                    <div className="text-center">
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                        {getItemIcon(item.kind)}
                      </div>
                      <p className="mt-3 text-xs font-medium text-[var(--muted)]">
                        {item.note || "Preview unavailable"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-4">
                  <div className="rounded-xl bg-[var(--accent-soft)] p-2 text-[var(--accent)]">
                    {getItemIcon(item.kind)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--foreground)]">{item.name}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {item.sizeLabel || (item.kind === "file" ? "Unsupported preview" : item.kind)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {maxItems && normalizedItems.length > maxItems ? (
          <p className="text-xs font-medium text-[var(--muted)]">
            Showing {maxItems} of {normalizedItems.length} attachments.
          </p>
        ) : null}
      </div>

      <MediaViewerModal item={activeItem} onClose={() => setActiveItem(null)} />
    </>
  );
}
