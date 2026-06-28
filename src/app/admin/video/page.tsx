"use client";

import VideoManager from "@/components/admin/video/VideoManager";
import { PageHeader } from "@/components/admin/ui";

export default function VideoPage() {
  return (
    <div>
      <PageHeader
        title="Promo Video"
        description="Manage the single video featured in the homepage promo section."
      />
      <VideoManager />
    </div>
  );
}
