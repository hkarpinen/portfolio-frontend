"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUpdateCommunity, useUploadCommunityImage, useDeleteCommunity } from "@/hooks/use-community";
import { useMe } from "@/hooks/use-identity";
import { ApiError } from "@/lib/api-client";
import { getInitials } from "@/lib/utils";
import styles from "./settings-form.module.css";
import { Btn, Alert, Input, Textarea, SelectField } from "@/components/editorial";
import { DeleteConfirm } from "./delete-confirm";
interface Props {
  communityId: string;
  ownerId: string;
  slug: string;
  initialName: string;
  initialDescription: string;
  initialImageUrl: string;
  initialVisibility: string;
}

export function CommunitySettingsForm({
  communityId,
  ownerId,
  slug,
  initialName,
  initialDescription,
  initialImageUrl,
  initialVisibility,
}: Props) {
  const router = useRouter();
  const { data: me } = useMe();
  const isOwner = !!me && me.id === ownerId;
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [visibility, setVisibility] = useState(initialVisibility);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const updateCommunity = useUpdateCommunity(communityId);
  const uploadImage = useUploadCommunityImage();
  const deleteCommunity = useDeleteCommunity();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await uploadImage.mutateAsync(file);
    setImageUrl(result.url);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    updateCommunity.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        visibility,
      },
      {
        onSuccess: (updated) => {
          if (updated?.slug && updated.slug !== slug) {
            router.push(`/forum/${updated.slug}/settings`);
          }
        },
      }
    );
  }

  const saving = updateCommunity.isPending;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
      {updateCommunity.isError && (
        <Alert variant="danger">
          {updateCommunity.error instanceof ApiError ? updateCommunity.error.message : "Something went wrong."}
        </Alert>
      )}
      {updateCommunity.isSuccess && <Alert variant="success">Settings saved.</Alert>}

      {/* Profile image */}
      <div className="bg-paper-2 p-8 flex items-center gap-8 border-ink">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="w-[56px] h-[56px] object-cover shrink-0 border-ink"
          />
        ) : (
          <div className="w-[56px] h-[56px] bg-red-soft shrink-0 flex items-center justify-center text-xl font-bold font-serif text-red">
            {getInitials(name)}
          </div>
        )}
        <div className="flex-1 flex flex-col gap-3">
          <span className="text-base font-medium text-ink-2">Community image</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleImageChange}
          />
          <div className="flex gap-4 items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadImage.isPending}
              className="py-[7px] px-[14px] bg-paper-3 text-ink-2 text-base font-medium border-ink" style={{cursor: uploadImage.isPending ? "not-allowed" : "pointer", opacity: uploadImage.isPending ? 0.6 : 1, transition: "background 110ms" }}
            >
              {uploadImage.isPending ? "Uploading…" : "Choose image"}
            </button>
            {imageUrl && (
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="py-[7px] px-[10px] bg-transparent text-ink-3 text-base cursor-pointer border-ink" style={{transition: "background 110ms, color 110ms" }}
              >
                Remove
              </button>
            )}
          </div>
          {uploadImage.isError && (
            <span className="text-sm text-red">
              {uploadImage.error instanceof ApiError ? uploadImage.error.message : "Upload failed."}
            </span>
          )}
          <span className="text-sm text-ink-3">JPEG, PNG, WebP or GIF · max 5 MB</span>
        </div>
      </div>

      <Input
        type="text"
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        maxLength={120}
      />

      <Textarea
        label="Description"
        hint={`${description.length}/1000`}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={1000}
        rows={3}
        placeholder="What's this community about?"
      />

      <SelectField
        label="Visibility"
        value={visibility}
        onChange={(e) => setVisibility(e.target.value)}
      >
        <option value="Public">Public</option>
        <option value="Private">Private</option>
      </SelectField>

      <div>
        <Btn
          type="submit"
          disabled={saving || !name.trim()}
          variant="primary"
        >
          {saving ? "Saving…" : "Save changes"}
        </Btn>
      </div>

      {isOwner && (
        <div className="mt-4 pt-12 flex flex-col gap-6" style={{ borderTop: "1.5px solid var(--ink)" }}>
          <div>
            <p className="text-base font-semibold text-red" style={{ margin: "0 0 4px" }}>Danger zone</p>
            <p className="text-base text-ink-3 m-0">
              Permanently delete this community and all its threads. This cannot be undone.
            </p>
          </div>
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className={styles.deleteBtn}
            >
              Delete community
            </button>
          ) : (
            <div className="flex flex-col gap-5">
              <p className="text-base text-ink-2 m-0">
                Are you sure? Type <strong>{name}</strong> to confirm.
              </p>
              <DeleteConfirm
                communityName={name}
                isPending={deleteCommunity.isPending}
                onCancel={() => setConfirmDelete(false)}
                onConfirm={() =>
                  deleteCommunity.mutate(communityId, {
                    onSuccess: () => router.push("/forum"),
                  })
                }
              />
              {deleteCommunity.isError && (
                <span className="text-base text-red">
                  {deleteCommunity.error instanceof ApiError ? deleteCommunity.error.message : "Something went wrong."}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </form>
  );
}
