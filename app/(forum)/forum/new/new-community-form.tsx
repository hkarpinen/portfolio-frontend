"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateCommunity, useUploadCommunityImage } from "@/hooks/use-community";
import { useIsDemo } from "@/hooks/use-demo";
import { ApiError } from "@/lib/api-client";
import { Btn, Input, Textarea, SelectField } from "@/components/editorial";

export function NewCommunityForm() {
  const router = useRouter();
  const isDemo = useIsDemo();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("Public");
  const [imageUrl, setImageUrl] = useState("");
  const createCommunity = useCreateCommunity();
  const uploadImage = useUploadCommunityImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isDemo) {
    return (
      <div className="page-enter max-w-[560px] mx-auto flex flex-col gap-12">
        <div>
          <h1 className="font-serif font-bold text-4xl leading-none tracking-snug text-ink m-0">
            Create Community
          </h1>
        </div>
        <div className="bg-paper p-12 shadow-stamp border-ink flex flex-col gap-6">
          <p className="text-base text-ink-2">
            Creating communities is not available in the demo.{" "}
            <a href="/register" className="text-red no-underline font-medium">Create a free account</a>
            {" "}to get started.
          </p>
          <Btn type="button" variant="secondary" onClick={() => router.back()}>Go back</Btn>
        </div>
      </div>
    );
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await uploadImage.mutateAsync(file);
    setImageUrl(result.url);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createCommunity.mutate(
      { name, description: description.trim() || undefined, privacy, imageUrl: imageUrl || undefined },
      {
        onSuccess: (created) => {
          router.push(`/forum/g/${created.slug}`);
        },
      }
    );
  }

  return (
    <div className="page-enter max-w-[560px] mx-auto flex flex-col gap-12" >
      <div>
        <h1 className="font-serif font-bold text-4xl leading-none tracking-snug text-ink m-0">
          Create Community
        </h1>
        <p className="text-ink-3 mt-3 text-md">
          Start a new community
        </p>
      </div>

      <div className="bg-paper p-12 shadow-stamp border-ink">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {createCommunity.isError && (
            <div className="text-base text-red bg-red-soft py-[10px] px-[14px] [border:1px_solid_var(--danger)]">
              {createCommunity.error instanceof ApiError ? createCommunity.error.message : "An unexpected error occurred."}
            </div>
          )}

          {/* Image upload */}
          <div className="flex items-center gap-8">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleImageChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadImage.isPending}
              className={`w-[72px] h-[72px] bg-paper-2 shrink-0 overflow-hidden flex items-center justify-center p-0 cursor-pointer disabled:cursor-not-allowed transition-[border-color] duration-150${imageUrl ? " [border:3px_solid_var(--red)]" : " [border:2px_dashed_var(--ink-3)]"}`}
            >
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
              )}
            </button>
            <div className="flex flex-col gap-2">
              <span className="text-base font-medium text-ink-2">Community image</span>
              {imageUrl ? (
                <Btn type="button" variant="ghost" size="sm" onClick={() => setImageUrl("")}>
                  Remove
                </Btn>
              ) : null}
              {uploadImage.isError && (
                <span className="text-sm text-red">
                  {uploadImage.error instanceof ApiError ? uploadImage.error.message : "Upload failed."}
                </span>
              )}
              <span className="text-sm text-ink-3">Optional · JPEG, PNG, WebP or GIF · max 5 MB</span>
            </div>
          </div>

          <div>
            <Input
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={1}
              maxLength={64}
              placeholder="Community Name"
            />
            <span className="text-sm text-ink-3">Lowercase letters, numbers, underscores only.</span>
          </div>
          <div>
            <Textarea
              label={`Description (optional · ${description.length}/1000)`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="What's this community about?"
            />
          </div>
          <SelectField
            label="Visibility"
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
          >
            <option value="Public">Public</option>
            <option value="Private">Private</option>
            <option value="Restricted">Restricted</option>
          </SelectField>
          <div className="flex gap-5">
            <Btn
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Btn>
            <Btn
              type="submit"
              variant="primary"
              disabled={createCommunity.isPending}
              className="flex-[2]"
            >
              {createCommunity.isPending ? "Creating…" : "Create Community"}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
