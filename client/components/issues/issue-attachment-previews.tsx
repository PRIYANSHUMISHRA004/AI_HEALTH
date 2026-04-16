"use client";

import { MediaThumbnailGrid, type LocalMediaPreview } from "@/components/media/media-thumbnail-grid";

interface AttachmentPreview extends LocalMediaPreview {
  file: File;
}

interface IssueAttachmentPreviewsProps {
  attachments: AttachmentPreview[];
}

export function IssueAttachmentPreviews({ attachments }: IssueAttachmentPreviewsProps) {
  if (!attachments.length) {
    return null;
  }

  return (
    <MediaThumbnailGrid
      items={attachments}
      title="Attachment previews"
      emptyTitle="No attachments selected"
      emptyDescription="Add images, videos, or documents to preview them here before upload."
    />
  );
}
