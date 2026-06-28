"use client";

import { useState, useRef } from "react";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { colors } from "@/constants/colors";
import { adminService } from "@/services/admin.service";
import toast from "react-hot-toast";

interface ImageUploadProps {
  onUpload: (urls: string[]) => void;
  folder?: string;
  // Accept attribute + matching MIME prefix. Defaults preserve the original
  // image-only behaviour; pass `accept="video/*"` and `mediaPrefix="video/"`
  // to reuse this uploader for videos. `multiple` defaults to true.
  accept?: string;
  mediaPrefix?: string;
  multiple?: boolean;
  prompt?: string;
}

export default function ImageUpload({
  onUpload,
  folder,
  accept = "image/*",
  mediaPrefix = "image/",
  multiple = true,
  prompt,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    await uploadFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      await uploadFiles(files);
    }
  };

  const mediaLabel = mediaPrefix.replace("/", "");

  const uploadFiles = async (files: File[]) => {
    const validFiles = files.filter((file) => file.type.startsWith(mediaPrefix));

    if (validFiles.length === 0) {
      toast.error(`Please select ${mediaLabel} files only`);
      return;
    }

    setIsUploading(true);

    try {
      const urls = await adminService.uploadImages(validFiles, folder);

      onUpload(urls);
      toast.success(`${mediaLabel} uploaded successfully`);
    } catch (error) {
      toast.error(`Failed to upload ${mediaLabel}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragging ? "border-brown bg-brown bg-opacity-10" : "border-gray-300"
      }`}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple={multiple}
        accept={accept}
        className="hidden"
      />
      <CloudArrowUpIcon
        className="mx-auto h-12 w-12 mb-3"
        style={{ color: colors.brown }}
      />
      <p className="text-sm text-gray-600">
        {isUploading
          ? "Uploading..."
          : prompt ?? "Drag and drop images here, or click to select files"}
      </p>
    </div>
  );
}
