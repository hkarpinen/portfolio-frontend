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
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "24px", color: "var(--text)", margin: 0 }}>
          Create Community
        </h1>
        <p style={{ color: "var(--text-3)", marginTop: "6px", fontSize: "14px" }}>
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
              fontSize: "13px", color: "var(--danger)",
              background: "var(--danger-s)", border: "1px solid var(--danger)",
              borderRadius: "10px", padding: "10px 14px",
            }}>
              {createCommunity.error instanceof ApiError ? createCommunity.error.message : "An unexpected error occurred."}
            </div>
          )}

          {/* Image upload */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" style={{ width: "52px", height: "52px", borderRadius: "12px", objectFit: "cover", border: "1px solid var(--border)", flexShrink: 0 }} />
            ) : (
              <div style={{
                width: "52px", height: "52px", borderRadius: "12px",
                background: "var(--surface-3)", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px", color: "var(--text-3)",
              }}>🖼</div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadImage.isPending}
                  style={{
                    padding: "6px 12px", borderRadius: "8px",
                    background: "var(--surface-2)", color: "var(--text-2)",
                    border: "1px solid var(--border)", fontSize: "12px", fontWeight: "500",
                    cursor: uploadImage.isPending ? "not-allowed" : "pointer",
                    opacity: uploadImage.isPending ? 0.6 : 1,
                  }}
                >
                  {uploadImage.isPending ? "Uploading…" : "Add image"}
                </button>
                {imageUrl && (
                  <button type="button" onClick={() => setImageUrl("")} style={{ padding: "6px 10px", borderRadius: "8px", background: "transparent", color: "var(--text-3)", border: "1px solid var(--border)", fontSize: "12px", cursor: "pointer" }}>
                    Remove
                  </button>
                )}
              </div>
              {uploadImage.isError && (
                <span style={{ fontSize: "11px", color: "var(--danger)" }}>
                  {uploadImage.error instanceof ApiError ? uploadImage.error.message : "Upload failed."}
                </span>
              )}
              <span style={{ fontSize: "11px", color: "var(--text-3)" }}>Optional · JPEG, PNG, WebP or GIF · max 5 MB</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
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
                borderRadius: "10px", color: "var(--text)", fontSize: "14px",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
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
                borderRadius: "10px", color: "var(--text)", fontSize: "14px",
                outline: "none", boxSizing: "border-box",
                resize: "vertical", lineHeight: "1.6",
                fontFamily: "var(--ff-body)",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Visibility
            </label>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px",
                background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: "10px", color: "var(--text)", fontSize: "14px",
                outline: "none", boxSizing: "border-box", cursor: "pointer",
              }}
            >
              <option value="Public">Public</option>
              <option value="Private">Private</option>
              <option value="Restricted">Restricted</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={createCommunity.isPending}
            style={{
              background: "var(--accent)", color: "#fff",
              border: "none", borderRadius: "12px",
              padding: "10px 20px", fontWeight: 600, fontSize: "14px",
              cursor: createCommunity.isPending ? "not-allowed" : "pointer",
              opacity: createCommunity.isPending ? 0.6 : 1,
              fontFamily: "var(--ff-body)",
            }}
          >
            {createCommunity.isPending ? "Creating…" : "Create Community"}
          </button>
        </form>
      </div>
    </div>
  );
}
