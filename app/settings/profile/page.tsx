"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";

const identitySchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(50),
});

const forumSchema = z.object({
  bio: z.string().max(500).optional(),
  signature: z.string().max(200).optional(),
});

type IdentityForm = z.infer<typeof identitySchema>;
type ForumForm = z.infer<typeof forumSchema>;

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ACCEPTED_MIME = ["image/png", "image/jpeg", "image/webp", "image/gif"];

const TABS = ["Profile", "Security", "Notifications"] as const;
type Tab = (typeof TABS)[number];

const TAB_HREFS: Record<Tab, string> = {
  Profile: "/settings/profile",
  Security: "/settings/security",
  Notifications: "/settings/notifications",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "38px",
  padding: "0 12px",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  color: "var(--text)",
  fontFamily: "var(--ff-body)",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 150ms, box-shadow 150ms",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  color: "var(--text)",
  fontFamily: "var(--ff-body)",
  fontSize: "14px",
  outline: "none",
  resize: "vertical",
  transition: "border-color 150ms, box-shadow 150ms",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 500,
  color: "var(--text-2)",
  letterSpacing: "0.02em",
  marginBottom: "6px",
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 700,
  color: "var(--text-3)",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

const cardStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "var(--shadow-sm)",
};

function FocusInput({
  style,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      style={{
        ...inputStyle,
        ...style,
        ...(focused
          ? {
              borderColor: "var(--accent)",
              boxShadow: "0 0 0 3px var(--accent-subtle)",
            }
          : {}),
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    />
  );
}

function FocusTextarea({
  style,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      style={{
        ...textareaStyle,
        ...style,
        ...(focused
          ? {
              borderColor: "var(--accent)",
              boxShadow: "0 0 0 3px var(--accent-subtle)",
            }
          : {}),
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    />
  );
}

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [identitySaved, setIdentitySaved] = useState(false);
  const [forumSaved, setForumSaved] = useState(false);
  const [identityError, setIdentityError] = useState<string | null>(null);
  const [forumError, setForumError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const identityForm = useForm<IdentityForm>({ resolver: zodResolver(identitySchema) });
  const forumForm = useForm<ForumForm>({ resolver: zodResolver(forumSchema) });

  useEffect(() => {
    Promise.all([
      api.get<{ displayName?: string; avatarUrl?: string | null }>("/api/identity/me"),
      api.get<{ bio?: string | null; signature?: string | null }>("/api/forum/profiles/me"),
    ])
      .then(([identity, forum]) => {
        identityForm.reset({ displayName: identity.displayName ?? "" });
        forumForm.reset({ bio: forum.bio ?? "", signature: forum.signature ?? "" });
        setAvatarUrl(identity.avatarUrl ?? null);
      })
      .catch(() => { /* swallow; form will stay empty */ })
      .finally(() => setLoading(false));
  }, [identityForm, forumForm]);

  const onIdentitySubmit = async (data: IdentityForm) => {
    setIdentityError(null);
    setIdentitySaved(false);
    try {
      await api.put("/api/identity/me", { displayName: data.displayName, avatarUrl });
      setIdentitySaved(true);
      router.refresh();
    } catch (err) {
      setIdentityError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  };

  const onForumSubmit = async (data: ForumForm) => {
    setForumError(null);
    setForumSaved(false);
    try {
      await api.put("/api/forum/profiles/me", { bio: data.bio ?? null, signature: data.signature ?? null });
      setForumSaved(true);
    } catch (err) {
      setForumError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);

    if (!ACCEPTED_MIME.includes(file.type)) {
      setAvatarError("Unsupported image type. Use PNG, JPEG, WebP, or GIF.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("File exceeds the 5 MB limit.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await api.upload<{ avatarUrl: string }>("/api/identity/me/avatar", formData);
      setAvatarUrl(result.avatarUrl);
      router.refresh();
    } catch (err) {
      setAvatarError(err instanceof ApiError ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="page-enter" style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "var(--ff-display)", fontSize: "22px", fontWeight: 700, color: "var(--text)" }}>
          Settings
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-3)", marginTop: "4px" }}>
          Manage your account, security, and preferences
        </p>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid var(--border)", marginBottom: "28px", display: "flex", gap: "4px" }}>
        {TABS.map((tab) => {
          const active = tab === "Profile";
          return (
            <a
              key={tab}
              href={TAB_HREFS[tab]}
              style={{
                padding: "10px 16px",
                fontSize: "14px",
                fontWeight: active ? 600 : 400,
                color: active ? "var(--text)" : "var(--text-3)",
                borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                marginBottom: "-1px",
                textDecoration: "none",
                transition: "color 150ms",
              }}
            >
              {tab}
            </a>
          );
        })}
      </div>

      {loading ? (
        <div style={{ ...cardStyle, textAlign: "center", padding: "48px 20px" }}>
          <p style={{ color: "var(--text-3)", fontSize: "14px" }}>Loading...</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "20px", alignItems: "start" }}>
          {/* Left column — forms */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Account form */}
            <div style={cardStyle}>
              <p style={{ ...sectionLabelStyle, marginBottom: "16px" }}>Account</p>
              <form onSubmit={identityForm.handleSubmit(onIdentitySubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {identityError && (
                  <div style={{ background: "var(--danger-s)", border: "1px solid oklch(62% 0.21 22 / 0.3)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "var(--danger)" }}>
                    {identityError}
                  </div>
                )}
                {identitySaved && (
                  <div style={{ background: "var(--success-s)", border: "1px solid oklch(68% 0.18 152 / 0.3)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "var(--success)" }}>
                    Account updated.
                  </div>
                )}
                <div>
                  <label style={labelStyle}>Display Name</label>
                  <FocusInput
                    type="text"
                    {...identityForm.register("displayName")}
                    placeholder="Your display name"
                  />
                  {identityForm.formState.errors.displayName && (
                    <p style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                      {identityForm.formState.errors.displayName.message}
                    </p>
                  )}
                </div>
                <PrimaryButton type="submit" disabled={identityForm.formState.isSubmitting}>
                  {identityForm.formState.isSubmitting ? "Saving…" : "Save Account"}
                </PrimaryButton>
              </form>
            </div>

            {/* Forum profile form */}
            <div style={cardStyle}>
              <p style={{ ...sectionLabelStyle, marginBottom: "4px" }}>Forum Profile</p>
              <p style={{ fontSize: "12px", color: "var(--text-3)", marginBottom: "16px" }}>
                Visible on your forum posts and profile.
              </p>
              <form onSubmit={forumForm.handleSubmit(onForumSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {forumError && (
                  <div style={{ background: "var(--danger-s)", border: "1px solid oklch(62% 0.21 22 / 0.3)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "var(--danger)" }}>
                    {forumError}
                  </div>
                )}
                {forumSaved && (
                  <div style={{ background: "var(--success-s)", border: "1px solid oklch(68% 0.18 152 / 0.3)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "var(--success)" }}>
                    Forum profile updated.
                  </div>
                )}
                <div>
                  <label style={labelStyle}>
                    Bio{" "}
                    <span style={{ color: "var(--text-3)", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <FocusTextarea
                    {...forumForm.register("bio")}
                    placeholder="Tell the forum a bit about yourself"
                    rows={4}
                  />
                  {forumForm.formState.errors.bio && (
                    <p style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                      {forumForm.formState.errors.bio.message}
                    </p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>
                    Signature{" "}
                    <span style={{ color: "var(--text-3)", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <FocusTextarea
                    {...forumForm.register("signature")}
                    placeholder="Appears beneath your forum posts"
                    rows={2}
                  />
                  {forumForm.formState.errors.signature && (
                    <p style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                      {forumForm.formState.errors.signature.message}
                    </p>
                  )}
                </div>
                <PrimaryButton type="submit" disabled={forumForm.formState.isSubmitting}>
                  {forumForm.formState.isSubmitting ? "Saving…" : "Save Forum Profile"}
                </PrimaryButton>
              </form>
            </div>
          </div>

          {/* Right column — avatar card */}
          <div style={{ ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <p style={sectionLabelStyle}>Avatar</p>

            {/* Avatar circle */}
            <div style={{ position: "relative", width: "80px", height: "80px" }}>
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Your avatar"
                  style={{ width: "80px", height: "80px", borderRadius: "9999px", objectFit: "cover", border: "2px solid var(--border)" }}
                />
              ) : (
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "9999px",
                    background: "var(--surface-3)",
                    border: "2px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    color: "var(--text-3)",
                  }}
                >
                  ?
                </div>
              )}
              {/* Edit overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "9999px",
                  background: "oklch(0% 0 0 / 0.45)",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  transition: "opacity 150ms",
                  cursor: "pointer",
                  border: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
              >
                Edit
              </button>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_MIME.join(",")}
              onChange={onAvatarChange}
              disabled={uploading}
              style={{ display: "none" }}
            />

            {/* Upload / Remove buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
              <SecondaryButton
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Uploading…" : "Upload photo"}
              </SecondaryButton>
              {avatarUrl && (
                <SecondaryButton
                  type="button"
                  onClick={() => setAvatarUrl(null)}
                  disabled={uploading}
                >
                  Remove
                </SecondaryButton>
              )}
            </div>

            {avatarError && (
              <p style={{ color: "var(--danger)", fontSize: "12px", textAlign: "center" }}>{avatarError}</p>
            )}
            <p style={{ fontSize: "11px", color: "var(--text-3)", textAlign: "center" }}>
              PNG, JPEG, WebP or GIF · up to 5 MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Shared button primitives ──────────────────────────────────────────────── */

function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <button
      style={{
        background: hovered ? "var(--accent-hi)" : "var(--accent)",
        color: "#fff",
        border: "none",
        borderRadius: "12px",
        padding: "0 18px",
        height: "38px",
        fontSize: "14px",
        fontWeight: 600,
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.5 : 1,
        transform: pressed ? "scale(0.97)" : "scale(1)",
        transition: "background 150ms, transform 100ms",
        width: "100%",
        fontFamily: "var(--ff-body)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      {...props}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      style={{
        background: hovered ? "var(--surface-3)" : "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        color: "var(--text-2)",
        padding: "0 14px",
        height: "34px",
        fontSize: "13px",
        fontWeight: 500,
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.5 : 1,
        transition: "background 150ms",
        width: "100%",
        fontFamily: "var(--ff-body)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...props}
    >
      {children}
    </button>
  );
}
