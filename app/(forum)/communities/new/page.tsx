"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateCommunity, useUploadCommunityImage } from "@/hooks/use-community";
import { ApiError } from "@/lib/api-client";

export default function NewCommunityPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("Public");
  const [imageUrl, setImageUrl] = useState("");
  const createCommunity = useCreateCommunity();
  const uploadImage = useUploadCommunityImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          router.push(`/communities/${created.slug}`);
        },
      }
    );
  }

  return (
    <div className="page-enter" style={{ maxWidth: "560px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "var(--ts-h2)", lineHeight: "var(--lh-display)", letterSpacing: "-0.02em", color: "var(--text)", margin: 0 }}>
          Create Community
        </h1>
        <p style={{ color: "var(--text-3)", marginTop: "6px", fontSize: "var(--ts-body)" }}>
          Start a new community
        </p>
      </div>

      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow-sm)",
      }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {createCommunity.isError && (
            <div style={{
              fontSize: "var(--ts-body-sm)", color: "var(--danger)",
              background: "var(--danger-s)", border: "1px solid var(--danger)",
              borderRadius: "10px", padding: "10px 14px",
            }}>
              {createCommunity.error instanceof ApiError ? createCommunity.error.message : "An unexpected error occurred."}
            </div>
          )}

          {/* Image upload */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadImage.isPending}
              style={{
                width: "72px", height: "72px", borderRadius: "14px",
                background: "var(--surface-2)",
                border: imageUrl ? "2px solid var(--accent)" : "2px dashed var(--border)",
                flexShrink: 0, overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: uploadImage.isPending ? "not-allowed" : "pointer",
                padding: 0, transition: "border-color 0.15s",
              }}
            >
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
              )}
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "var(--ts-body-sm)", fontWeight: 500, color: "var(--text-2)" }}>Community image</span>
              {imageUrl ? (
                <button type="button" onClick={() => setImageUrl("")} style={{ alignSelf: "flex-start", padding: "4px 10px", borderRadius: "8px", background: "transparent", color: "var(--text-3)", border: "1px solid var(--border)", fontSize: "var(--ts-label)", cursor: "pointer" }}>
                  Remove
                </button>
              ) : null}
              {uploadImage.isError && (
                <span style={{ fontSize: "var(--ts-meta)", color: "var(--danger)" }}>
                  {uploadImage.error instanceof ApiError ? uploadImage.error.message : "Upload failed."}
                </span>
              )}
              <span style={{ fontSize: "var(--ts-meta)", color: "var(--text-3)" }}>Optional · JPEG, PNG, WebP or GIF · max 5 MB</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "var(--ts-meta)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={1}
              maxLength={64}
              placeholder="Community Name"
              style={{
                width: "100%", padding: "10px 14px",
                background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: "10px", color: "var(--text)", fontSize: "var(--ts-body)",
                outline: "none", boxSizing: "border-box",
              }}
            />
            <span style={{ fontSize: "var(--ts-meta)", color: "var(--text-3)" }}>Lowercase letters, numbers, underscores only.</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "var(--ts-meta)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Description
              <span style={{ fontWeight: 500, color: "var(--text-3)", marginLeft: "6px", textTransform: "none", letterSpacing: 0 }}>
                optional · {description.length}/1000
              </span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="What's this community about?"
              style={{
                width: "100%", padding: "10px 14px",
                background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: "10px", color: "var(--text)", fontSize: "var(--ts-body)",
                outline: "none", boxSizing: "border-box",
                resize: "vertical", lineHeight: "1.6",
                fontFamily: "var(--ff-body)",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "var(--ts-meta)", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Visibility
            </label>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px",
                background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: "10px", color: "var(--text)", fontSize: "var(--ts-body)",
                outline: "none", boxSizing: "border-box", cursor: "pointer",
              }}
            >
              <option value="Public">Public</option>
              <option value="Private">Private</option>
              <option value="Restricted">Restricted</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                flex: 1, background: "var(--surface-2)", color: "var(--text-2)",
                border: "1px solid var(--border)", borderRadius: "12px",
                padding: "10px 20px", fontWeight: 600, fontSize: "var(--ts-body)",
                cursor: "pointer", fontFamily: "var(--ff-body)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createCommunity.isPending}
              style={{
                flex: 2, background: "var(--accent)", color: "#fff",
                border: "none", borderRadius: "12px",
                padding: "10px 20px", fontWeight: 600, fontSize: "var(--ts-body)",
                cursor: createCommunity.isPending ? "not-allowed" : "pointer",
                opacity: createCommunity.isPending ? 0.6 : 1,
                fontFamily: "var(--ff-body)",
              }}
            >
              {createCommunity.isPending ? "Creating…" : "Create Community"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
