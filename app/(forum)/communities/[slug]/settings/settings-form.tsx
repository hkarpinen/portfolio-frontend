"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUpdateCommunity, useUploadCommunityImage, useDeleteCommunity } from "@/hooks/use-forum";
import { useMe } from "@/hooks/use-identity";
import { ApiError } from "@/lib/api-client";
import styles from "./settings-form.module.css";
import { Button } from "@/components/ui/button";
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
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-2)", letterSpacing: "0.02em" }}>
        {label}
      </label>
      {children}
      {hint && <span style={{ fontSize: "11px", color: "var(--text-3)" }}>{hint}</span>}
    </div>
  );
}

const iStyle: React.CSSProperties = {
  height: "38px", width: "100%",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  padding: "0 12px",
  fontSize: "13px",
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
    el.style.borderColor = "var(--accent)";
    el.style.boxShadow = "0 0 0 3px var(--accent-subtle)";
  };
  const blurFn = (el: HTMLElement) => {
    el.style.borderColor = "var(--border)";
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
            router.push(`/communities/${updated.slug}/settings`);
          }
        },
      }
    );
  }

  const saving = updateCommunity.isPending;

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {updateCommunity.isError && (
        <div style={{
          padding: "12px 16px", borderRadius: "10px",
          background: "var(--danger-s)", border: "1px solid oklch(62% 0.21 22 / 0.3)",
          fontSize: "13px", color: "var(--danger)",
        }}>
          {updateCommunity.error instanceof ApiError ? updateCommunity.error.message : "Something went wrong."}
        </div>
      )}
      {updateCommunity.isSuccess && (
        <div style={{
          padding: "12px 16px", borderRadius: "10px",
          background: "var(--success-s)", border: "1px solid oklch(68% 0.18 152 / 0.25)",
          fontSize: "13px", color: "var(--success)",
        }}>Settings saved.</div>
      )}

      {/* Profile image */}
      <div style={{
        background: "var(--surface-2)", border: "1px solid var(--border)",
        borderRadius: "12px", padding: "16px",
        display: "flex", alignItems: "center", gap: "16px",
      }}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            style={{ width: "56px", height: "56px", borderRadius: "12px", objectFit: "cover", border: "1px solid var(--border)", flexShrink: 0 }}
          />
        ) : (
          <div style={{
            width: "56px", height: "56px", borderRadius: "12px",
            background: "var(--accent-subtle)", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px", fontWeight: "700", fontFamily: "var(--ff-display)",
            color: "var(--accent)",
          }}>
            {name[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-2)" }}>Community image</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadImage.isPending}
              style={{
                padding: "7px 14px", borderRadius: "10px",
                background: "var(--surface-3)", color: "var(--text-2)",
                border: "1px solid var(--border)", fontSize: "12px", fontWeight: "500",
                cursor: uploadImage.isPending ? "not-allowed" : "pointer",
                opacity: uploadImage.isPending ? 0.6 : 1,
                transition: "background 110ms",
              }}
            >
              {uploadImage.isPending ? "Uploading…" : "Choose image"}
            </button>
            {imageUrl && (
              <button
                type="button"
                onClick={() => setImageUrl("")}
                style={{
                  padding: "7px 10px", borderRadius: "10px",
                  background: "transparent", color: "var(--text-3)",
                  border: "1px solid var(--border)", fontSize: "12px",
                  cursor: "pointer", transition: "background 110ms, color 110ms",
                }}
              >
                Remove
              </button>
            )}
          </div>
          {uploadImage.isError && (
            <span style={{ fontSize: "11px", color: "var(--danger)" }}>
              {uploadImage.error instanceof ApiError ? uploadImage.error.message : "Upload failed."}
            </span>
          )}
          <span style={{ fontSize: "11px", color: "var(--text-3)" }}>JPEG, PNG, WebP or GIF · max 5 MB</span>
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
          style={{
            ...iStyle, height: "auto", padding: "10px 12px",
            resize: "vertical", lineHeight: "1.6", fontFamily: "var(--ff-body)",
          }}
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
        <Button
          type="submit"
          disabled={saving || !name.trim()}
          variant="primary"
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>

      {isOwner && (
        <div style={{
          marginTop: "8px",
          borderTop: "1px solid var(--border)",
          paddingTop: "24px",
          display: "flex", flexDirection: "column", gap: "12px",
        }}>
          <div>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--danger)", margin: "0 0 4px" }}>Danger zone</p>
            <p style={{ fontSize: "12px", color: "var(--text-3)", margin: 0 }}>
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
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-2)", margin: 0 }}>
                Are you sure? Type <strong>{name}</strong> to confirm.
              </p>
              <DeleteConfirm
                communityName={name}
                isPending={deleteCommunity.isPending}
                onCancel={() => setConfirmDelete(false)}
                onConfirm={() =>
                  deleteCommunity.mutate(communityId, {
                    onSuccess: () => router.push("/communities"),
                  })
                }
              />
              {deleteCommunity.isError && (
                <span style={{ fontSize: "12px", color: "var(--danger)" }}>
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
    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={communityName}
        style={{
          height: "36px", borderRadius: "10px",
          background: "var(--surface-2)", border: "1px solid var(--border)",
          padding: "0 12px", fontSize: "13px", color: "var(--text)", outline: "none",
          minWidth: "180px",
        }}
      />
      <button
        type="button"
        disabled={!matches || isPending}
        onClick={onConfirm}
        style={{
          padding: "8px 18px", borderRadius: "10px",
          background: matches && !isPending ? "var(--danger)" : "var(--surface-3)",
          color: matches && !isPending ? "#fff" : "var(--text-3)",
          border: "none", fontSize: "13px", fontWeight: "600",
          cursor: matches && !isPending ? "pointer" : "not-allowed",
          transition: "background 110ms",
        }}
      >
        {isPending ? "Deleting…" : "Confirm delete"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={isPending}
        style={{
          padding: "8px 14px", borderRadius: "10px",
          background: "transparent", color: "var(--text-3)",
          border: "1px solid var(--border)", fontSize: "13px",
          cursor: "pointer", transition: "background 110ms",
        }}
      >
        Cancel
      </button>
    </div>
  );
}