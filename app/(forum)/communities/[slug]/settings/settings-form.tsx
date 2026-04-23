"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUpdateCommunity } from "@/hooks/use-forum";
import { ApiError } from "@/lib/api-client";

interface Props {
  communityId: string;
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
  slug,
  initialName,
  initialDescription,
  initialImageUrl,
  initialVisibility,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [visibility, setVisibility] = useState(initialVisibility);
  const updateCommunity = useUpdateCommunity(communityId);

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
        privacy: visibility,
      },
      {
        onSuccess: () => {
          const newSlug = encodeURIComponent(name.trim());
          if (newSlug !== slug) {
            router.push(`/communities/${newSlug}/settings`);
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
        <div style={{ flex: 1 }}>
          <Field label="Image URL" hint="Paste a direct link to an image (PNG, JPG, WebP)">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.png"
              style={iStyle}
              onFocus={e => focusFn(e.currentTarget)}
              onBlur={e => blurFn(e.currentTarget)}
            />
          </Field>
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
        <button
          type="submit"
          disabled={saving || !name.trim()}
          style={{
            padding: "9px 22px", borderRadius: "12px",
            background: saving || !name.trim() ? "var(--surface-3)" : "var(--accent)",
            color: saving || !name.trim() ? "var(--text-3)" : "#fff",
            border: "none", cursor: saving || !name.trim() ? "not-allowed" : "pointer",
            fontSize: "13px", fontWeight: "600", fontFamily: "var(--ff-display)",
            transition: "background 110ms",
          }}
          onMouseEnter={e => { if (!saving && name.trim()) (e.currentTarget as HTMLElement).style.background = "var(--accent-hi)"; }}
          onMouseLeave={e => { if (!saving && name.trim()) (e.currentTarget as HTMLElement).style.background = "var(--accent)"; }}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
