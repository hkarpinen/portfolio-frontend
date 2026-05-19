"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";
import { ImageUpload } from "@/components/editorial";

interface AvatarUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

export function AvatarUpload({ value, onChange }: AvatarUploadProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const handleUpload = async (file: File): Promise<string> => {
    setAvatarError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await api.upload<{ avatarUrl: string }>("/api/identity/me/avatar", formData);
      router.refresh();
      return result.avatarUrl;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Upload failed. Please try again.";
      setAvatarError(msg);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return (
    <ImageUpload
      value={value}
      onChange={onChange}
      onUpload={handleUpload}
      uploading={uploading}
      error={avatarError}
      shape="circle"
      size={160}
    />
  );
}
