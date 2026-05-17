"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUpdateCommunity, useUploadCommunityImage, useDeleteCommunity } from "@/hooks/use-community";
import { useMe } from "@/hooks/use-identity";
import { ApiError } from "@/lib/api-client";
import styles from "./settings-form.module.css";
import { Btn } from "@/components/editorial";
interface Props {
  communityId: string;
  ownerId: string;
  slug: string;
  initialName: string;
  initialDescription: string;
  initialImageUrl: string;
  initialVisibility: string;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-base font-medium text-ink-2 tracking-[0.02em]">
        {label}
      </label>
      {children}
      {hint && <span className="text-sm text-ink-3">{hint}</span>}
    </div>
  );
}

const iStyle: React.CSSProperties = {
  height: "38px", width: "100%",
  background: "var(--paper-2)",
  border: "1.5px solid var(--ink)",
  
  padding: "0 12px",
  fontSize: "var(--ts-body-sm)",
  color: "var(--text)",
  outline: "none",
  transition: "border-color 110ms, box-shadow 110ms",
};

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

  const focusFn = (el: HTMLElement) => {
    el.style.borderColor = "var(--ink)";
    el.style.boxShadow = "0 0 0 3px rgba(178,42,26,0.08)";
  };
  const blurFn = (el: HTMLElement) => {
    el.style.borderColor = "var(--ink-3)";
    el.style.boxShadow = "none";
  };

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
        <div className="py-6 px-8 bg-[rgba(178,42,26,0.10)] text-base text-red" style={{ border: "1px solid oklch(62% 0.21 22 / 0.3)" }}>
          {updateCommunity.error instanceof ApiError ? updateCommunity.error.message : "Something went wrong."}
        </div>
      )}
      {updateCommunity.isSuccess && (
        <div className="py-6 px-8 bg-[rgba(61,107,43,0.10)] text-base text-green" style={{ border: "1px solid oklch(68% 0.18 152 / 0.25)" }}>Settings saved.</div>
      )}

      {/* Profile image */}
      <div className="bg-paper-2 p-8 flex items-center gap-8" style={{ border: "1.5px solid var(--ink)" }}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="w-[56px] h-[56px] object-cover shrink-0" style={{ border: "1.5px solid var(--ink)" }}
          />
        ) : (
          <div className="w-[56px] h-[56px] bg-[rgba(178,42,26,0.10)] shrink-0 flex items-center justify-center text-xl font-bold font-serif text-red">
            {name[0]?.toUpperCase() ?? "?"}
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
              className="py-[7px] px-[14px] bg-paper-3 text-ink-2 text-base font-medium" style={{ border: "1.5px solid var(--ink)", cursor: uploadImage.isPending ? "not-allowed" : "pointer", opacity: uploadImage.isPending ? 0.6 : 1, transition: "background 110ms" }}
            >
              {uploadImage.isPending ? "Uploading…" : "Choose image"}
            </button>
            {imageUrl && (
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="py-[7px] px-[10px] bg-transparent text-ink-3 text-base cursor-pointer" style={{ border: "1.5px solid var(--ink)", transition: "background 110ms, color 110ms" }}
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

      <Field label="Name">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={120}
          style={iStyle}
          onFocus={e => focusFn(e.currentTarget)}
          onBlur={e => blurFn(e.currentTarget)}
        />
      </Field>

      <Field label="Description" hint={`${description.length}/1000`}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="What's this community about?"
          className="h-auto py-5 px-6 leading-[1.6] font-body" style={{ ...iStyle, resize: "vertical" }}
          onFocus={e => focusFn(e.currentTarget)}
          onBlur={e => blurFn(e.currentTarget)}
        />
      </Field>

      <Field label="Visibility">
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          style={iStyle}
          onFocus={e => focusFn(e.currentTarget)}
          onBlur={e => blurFn(e.currentTarget)}
        >
          <option value="Public">Public</option>
          <option value="Private">Private</option>
        </select>
      </Field>

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

function DeleteConfirm({
  communityName,
  isPending,
  onCancel,
  onConfirm,
}: {
  communityName: string;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [value, setValue] = useState("");
  const matches = value === communityName;
  return (
    <div className="flex gap-4 items-center flex-wrap">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={communityName}
        className="h-[36px] bg-paper-2 p-[0_12px] text-base text-ink outline-none min-w-[180px]" style={{ border: "1.5px solid var(--ink)" }}
      />
      <button
        type="button"
        disabled={!matches || isPending}
        onClick={onConfirm}
        className="py-[8px] px-[18px] text-base font-semibold" style={{ background: matches && !isPending ? "var(--danger)" : "var(--paper-3)", color: matches && !isPending ? "#fff" : "var(--text-3)", border: "none", cursor: matches && !isPending ? "pointer" : "not-allowed", transition: "background 110ms" }}
      >
        {isPending ? "Deleting…" : "Confirm delete"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={isPending}
        className="py-[8px] px-[14px] bg-transparent text-ink-3 text-base cursor-pointer" style={{ border: "1.5px solid var(--ink)", transition: "background 110ms" }}
      >
        Cancel
      </button>
    </div>
  );
}