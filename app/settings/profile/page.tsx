"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";
import { identityKeys, forumKeys } from "@/lib/query-keys";
import { Btn } from "@/components/editorial";
import pageStyles from "./page.module.css";

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

const TABS = ["Profile", "Security", "Notifications", "Connections"] as const;
type Tab = (typeof TABS)[number];

const TAB_HREFS: Record<Tab, string> = {
  Profile: "/settings/profile",
  Security: "/settings/security",
  Notifications: "/settings/notifications",
  Connections: "/settings/connections",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "38px",
  padding: "0 12px",
  background: "transparent",
  border: "none",
  borderBottom: "1.5px solid var(--ink-3)",
  color: "var(--ink)",
  fontFamily: "var(--ff-body)",
  fontSize: "0.938rem",
  outline: "none",
  transition: "border-color 150ms",
  borderRadius: 0,
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "var(--paper-2)",
  border: "1.5px solid var(--ink-3)",
  color: "var(--ink)",
  fontFamily: "var(--ff-body)",
  fontSize: "0.938rem",
  outline: "none",
  resize: "vertical",
  transition: "border-color 150ms",
  borderRadius: 0,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "var(--ts-label)",
  fontWeight: 500,
  color: "var(--text-2)",
  letterSpacing: "0.02em",
  marginBottom: "6px",
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: "var(--ts-meta)",
  fontWeight: 700,
  color: "var(--text-3)",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

const cardStyle: React.CSSProperties = {
  background: "var(--paper-2)",
  border: "1.5px solid var(--ink)",
  padding: "20px",
  boxShadow: "var(--shadow-stamp)",
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
              borderColor: "var(--ink)",
              boxShadow: "0 0 0 3px rgba(178,42,26,0.08)",
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
              borderColor: "var(--ink)",
              boxShadow: "0 0 0 3px rgba(178,42,26,0.08)",
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
  const queryClient = useQueryClient();
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
      queryClient.invalidateQueries({ queryKey: identityKeys.me() });
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
      queryClient.invalidateQueries({ queryKey: forumKeys.all });
      router.refresh();
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
    <div className="page-enter max-w-[860px] mx-auto py-16 px-12" >
      {/* Header */}
      <div className="mb-[28px]">
        <h1 className="font-serif text-4xl leading-none tracking-snug font-bold text-ink">
          Settings
        </h1>
        <p className="text-base text-ink-3 mt-2">
          Manage your account, security, and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-[28px] flex gap-2" style={{ borderBottom: "1.5px solid var(--ink)" }}>
        {TABS.map((tab) => {
          const active = tab === "Profile";
          return (
            <a
              key={tab}
              href={TAB_HREFS[tab]}
              className="py-5 px-8 text-md mb-[-1px] no-underline" style={{ fontWeight: active ? 600 : 400, color: active ? "var(--red)" : "var(--ink-3)", borderBottom: active ? "3px solid var(--red)" : "2px solid transparent", transition: "color 150ms" }}
            >
              {tab}
            </a>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center py-24 px-10" style={{ ...cardStyle }}>
          <p className="text-ink-3 text-md">Loading...</p>
        </div>
      ) : (
        <div className="sidebar-grid gap-10" >
          {/* Left column — forms */}
          <div className="flex flex-col gap-10">
            {/* Account form */}
            <div style={cardStyle}>
              <p className="mb-8" style={{ ...sectionLabelStyle }}>Account</p>
              <form onSubmit={identityForm.handleSubmit(onIdentitySubmit)} className="flex flex-col gap-8">
                {identityError && (
                  <div className="bg-[rgba(178,42,26,0.10)] py-[10px] px-[14px] text-base text-red" style={{ border: "1px solid oklch(62% 0.21 22 / 0.3)" }}>
                    {identityError}
                  </div>
                )}
                {identitySaved && (
                  <div className="bg-[rgba(61,107,43,0.10)] py-[10px] px-[14px] text-base text-green" style={{ border: "1px solid oklch(68% 0.18 152 / 0.3)" }}>
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
                    <p className="text-red text-base mt-2">
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
              <p className="mb-2" style={{ ...sectionLabelStyle }}>Forum Profile</p>
              <p className="text-base text-ink-3 mb-8">
                Visible on your forum posts and profile.
              </p>
              <form onSubmit={forumForm.handleSubmit(onForumSubmit)} className="flex flex-col gap-8">
                {forumError && (
                  <div className="bg-[rgba(178,42,26,0.10)] py-[10px] px-[14px] text-base text-red" style={{ border: "1px solid oklch(62% 0.21 22 / 0.3)" }}>
                    {forumError}
                  </div>
                )}
                {forumSaved && (
                  <div className="bg-[rgba(61,107,43,0.10)] py-[10px] px-[14px] text-base text-green" style={{ border: "1px solid oklch(68% 0.18 152 / 0.3)" }}>
                    Forum profile updated.
                  </div>
                )}
                <div>
                  <label style={labelStyle}>
                    Bio{" "}
                    <span className="text-ink-3 font-normal">(optional)</span>
                  </label>
                  <FocusTextarea
                    {...forumForm.register("bio")}
                    placeholder="Tell the forum a bit about yourself"
                    rows={4}
                  />
                  {forumForm.formState.errors.bio && (
                    <p className="text-red text-base mt-2">
                      {forumForm.formState.errors.bio.message}
                    </p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>
                    Signature{" "}
                    <span className="text-ink-3 font-normal">(optional)</span>
                  </label>
                  <FocusTextarea
                    {...forumForm.register("signature")}
                    placeholder="Appears beneath your forum posts"
                    rows={2}
                  />
                  {forumForm.formState.errors.signature && (
                    <p className="text-red text-base mt-2">
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
          <div className="flex flex-col items-center gap-8" style={{ ...cardStyle }}>
            <p style={sectionLabelStyle}>Avatar</p>

            {/* Avatar circle */}
            <div className="relative w-40 h-40">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Your avatar"
                  className="w-40 h-40 object-cover" style={{ border: "2px solid var(--ink)" }}
                />
              ) : (
                <div
                  className="w-40 h-40 bg-paper-3 flex items-center justify-center text-2xl text-ink-3" style={{ border: "2px solid var(--ink)" }}
                >
                  ?
                </div>
              )}
              {/* Edit overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={pageStyles.avatarEditOverlay}
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
              className="hidden"
            />

            {/* Upload / Remove buttons */}
            <div className="flex flex-col gap-4 w-full">
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
              <p className="text-red text-base text-center">{avatarError}</p>
            )}
            <p className="text-sm text-ink-3 text-center">
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
  className,
  disabled,
  type,
  form,
  style,
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Btn variant="primary" fullWidth className={className} disabled={disabled} type={type as "button"|"submit"|"reset"} form={form} style={style}>
      {children}
    </Btn>
  );
}

function SecondaryButton({
  children,
  className,
  disabled,
  type,
  form,
  style,
  onClick,
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Btn variant="secondary" className={className} disabled={disabled} type={type as "button"|"submit"|"reset"} form={form} style={style} onClick={onClick as ((e: React.MouseEvent) => void) | undefined}>
      {children}
    </Btn>
  );
}
