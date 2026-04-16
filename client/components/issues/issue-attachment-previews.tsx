"use client";

import { FileText, Film, ImageIcon } from "lucide-react";

interface AttachmentPreview {
  file: File;
  previewUrl: string;
}

interface IssueAttachmentPreviewsProps {
  attachments: AttachmentPreview[];
}

export function IssueAttachmentPreviews({ attachments }: IssueAttachmentPreviewsProps) {
  if (!attachments.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[var(--foreground)]">Attachment previews</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {attachments.map((attachment) => {
          const { file, previewUrl } = attachment;
          const isImage = file.type.startsWith("image/");
          const isVideo = file.type.startsWith("video/");

          return (
            <div
              key={`${file.name}-${file.lastModified}`}
              className="overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--card)]"
            >
              {isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt={file.name} className="h-36 w-full object-cover" />
              ) : isVideo ? (
                <video src={previewUrl} className="h-36 w-full object-cover" controls />
              ) : (
                <div className="flex h-36 items-center justify-center bg-white">
                  <div className="text-center">
                    <FileText className="mx-auto h-8 w-8 text-[var(--primary)]" />
                    <p className="mt-3 text-xs font-medium text-[var(--muted)]">Preview unavailable</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-4">
                <div className="rounded-xl bg-[var(--accent-soft)] p-2 text-[var(--accent)]">
                  {isImage ? <ImageIcon className="h-4 w-4" /> : isVideo ? <Film className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--foreground)]">{file.name}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{Math.ceil(file.size / 1024)} KB</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
