"use client";

import { useEffect, useState } from "react";
import { TrashIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import { adminService } from "@/services/admin.service";
import { PromoVideo } from "@/types/video.types";
import ImageUpload from "@/components/admin/products/ImageUpload";
import {
  Card,
  Button,
  Skeleton,
  EmptyState,
  ConfirmDialog,
} from "@/components/admin/ui";
import toast from "react-hot-toast";

export default function VideoManager() {
  const [video, setVideo] = useState<PromoVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // URL staged from a successful S3 upload, awaiting "Save".
  const [stagedUrl, setStagedUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVideo = async () => {
    try {
      const response = await adminService.getVideo();
      setVideo(response.data.video);
    } catch (error) {
      toast.error("Failed to fetch the promo video");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideo();
  }, []);

  // uploadImages resolves to presign objects; each one's `mediaUrl` is the final
  // public (CloudFront) URL we store.
  const handleUpload = (urls: string[]) => {
    const media = urls as unknown as { mediaUrl: string }[];
    if (media[0]?.mediaUrl) {
      setStagedUrl(media[0].mediaUrl);
    }
  };

  const handleSave = async () => {
    if (!stagedUrl) return;
    setIsSaving(true);
    try {
      const response = await adminService.createVideo(stagedUrl);
      setVideo(response.data.video);
      setStagedUrl("");
      toast.success("Video uploaded successfully");
    } catch (error: any) {
      // Backend enforces the single-video rule (409 if one already exists).
      toast.error(
        error?.response?.data?.message ?? "Failed to save the video"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!video) return;
    setIsDeleting(true);
    try {
      await adminService.deleteVideo(video._id);
      setVideo(null);
      setConfirmDelete(false);
      toast.success("Video deleted successfully");
    } catch (error) {
      toast.error("Failed to delete the video");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <Skeleton className="h-80 w-full max-w-sm" />
      </Card>
    );
  }

  // A video already exists — only a delete is allowed. To replace it the admin
  // must delete this one first (the backend rejects a second upload).
  if (video) {
    return (
      <>
        <Card>
          <div className="flex flex-col items-start gap-6">
            <video
              className="aspect-[4/5] w-full max-w-sm rounded-lg bg-black object-cover"
              src={video.mediaUrl}
              controls
              playsInline
              preload="metadata"
            />
            <div className="rounded-md bg-admin-surface-muted px-4 py-3 text-sm text-admin-ink-muted">
              Only one promo video can exist at a time. To upload a different
              video, delete this one first.
            </div>
            <Button
              variant="danger"
              leftIcon={<TrashIcon className="h-5 w-5" />}
              onClick={() => setConfirmDelete(true)}
            >
              Delete Video
            </Button>
          </div>
        </Card>

        <ConfirmDialog
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          onConfirm={handleDelete}
          title="Delete promo video"
          description="This video will be permanently removed from the storefront homepage and from storage."
          confirmLabel="Delete"
          danger
          loading={isDeleting}
        />
      </>
    );
  }

  // No video yet — show the uploader.
  return (
    <Card>
      {stagedUrl ? (
        <div className="flex flex-col items-start gap-6">
          <video
            className="aspect-[4/5] w-full max-w-sm rounded-lg bg-black object-cover"
            src={stagedUrl}
            controls
            playsInline
            preload="metadata"
          />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setStagedUrl("")}
              disabled={isSaving}
            >
              Discard
            </Button>
            <Button onClick={handleSave} loading={isSaving}>
              Save Video
            </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-lg">
          <EmptyState
            icon={VideoCameraIcon}
            title="No promo video"
            description="Upload a video to feature in the homepage promo section."
          />
          <div className="mt-4">
            <ImageUpload
              onUpload={handleUpload}
              folder="video"
              accept="video/*"
              mediaPrefix="video/"
              multiple={false}
              prompt="Drag and drop a video here, or click to select a file"
            />
          </div>
        </div>
      )}
    </Card>
  );
}
