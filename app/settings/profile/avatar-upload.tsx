"use client";

import { ImageUpload } from "@/components/editorial";
import { useRouter } from "next/navigation";
import { useUploadAvatar } from "@/hooks/use-identity";
import { getErrorMessage } from "@/lib/error-messages";

interface AvatarUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

export function AvatarUpload({ value, onChange }: AvatarUploadProps) {
  const router = useRouter();
  const upload = useUploadAvatar();

  // ImageUpload's API requires a Promise<string> back — it threads the resolved
  // URL into its own internal state. mutateAsync (rather than mutate) is what
  // makes that contract honourable from a useMutation.
  const handleUpload = async (file: File): Promise<string> => {
    const result = await upload.mutateAsync(file);
    router.refresh();
    return result.avatarUrl;
  };

  return (
    <ImageUpload
      value={value}
      onChange={onChange}
      onUpload={handleUpload}
      uploading={upload.isPending}
      error={upload.isError ? getErrorMessage(upload.error, "Upload failed. Please try again.") : null}
      shape="circle"
      size={160}
    />
  );
}
