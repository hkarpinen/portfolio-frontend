"use client";

import { Icon } from "@/components/editorial";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCreateCommunity, useUploadCommunityImage } from "@/hooks/use-community";
import { useIsDemo } from "@/hooks/use-demo";
import { getErrorMessage } from "@/lib/error-messages";

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

  // Back link + page head shared by demo and live forms.
  const Head = (
    <>
      <Link href="/forum" className="back inline-flex items-center gap-2 no-underline">
        <Icon name="arrowLeft" size={12} strokeWidth={2} aria-hidden /> Forum
      </Link>
      <header className="page-head">
        <div className="titles">
          <div className="kicker" style={{ marginBottom: 8 }}>
            // FORUM · NEW
          </div>
          <h1>New community</h1>
        </div>
      </header>
    </>
  );

  if (isDemo) {
    return (
      <div className="page-enter">
        {Head}
        <div className="card flex flex-col items-start gap-4">
          <p className="deck">
            Creating communities is not available in the demo.{" "}
            <a href="/identity/register" className="font-medium text-accent no-underline">
              Create a free account
            </a>{" "}
            to get started.
          </p>
          <button type="button" className="btn" onClick={() => router.back()}>
            Go back
          </button>
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
      {
        name,
        description: description.trim() || undefined,
        privacy,
        imageUrl: imageUrl || undefined,
      },
      {
        onSuccess: (created) => {
          router.push(`/forum/g/${created.slug}`);
        },
      },
    );
  }

  return (
    <div className="page-enter">
      {Head}

      <form className="form wide" onSubmit={handleSubmit}>
        {createCommunity.isError && (
          <div className="badge red" style={{ display: "block", padding: "10px 14px" }}>
            {getErrorMessage(createCommunity.error, "An unexpected error occurred.")}
          </div>
        )}

        {/* Image upload */}
        <div className="row" style={{ gap: 16 }}>
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
            className="flex shrink-0 cursor-pointer items-center justify-center overflow-hidden disabled:cursor-not-allowed"
            style={{
              width: 72,
              height: 72,
              background: "var(--raised)",
              border: imageUrl ? "1px solid var(--amber)" : "1px dashed var(--border-hi)",
            }}
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span style={{ color: "var(--text-4)" }}>
                <Icon name="image" size={24} strokeWidth={1.5} />
              </span>
            )}
          </button>
          <div className="flex flex-col gap-2">
            <span style={{ font: "600 0.72rem/1 var(--ff-mono)", color: "var(--text)" }}>
              Community image
            </span>
            {imageUrl && (
              <button
                type="button"
                className="btn btn-ghost btn-sm self-start"
                onClick={() => setImageUrl("")}
              >
                Remove
              </button>
            )}
            {uploadImage.isError && (
              <span className="hint" style={{ color: "var(--red)" }}>
                {getErrorMessage(uploadImage.error, "Upload failed.")}
              </span>
            )}
            <span className="hint">Optional · JPEG, PNG, WebP or GIF · max 5 MB</span>
          </div>
        </div>

        <div className="field">
          <label htmlFor="community-name">Name</label>
          <input
            id="community-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={1}
            maxLength={64}
            placeholder="Community Name"
          />
          <span className="hint">Lowercase letters, numbers, underscores only.</span>
        </div>

        <div className="field">
          <label htmlFor="community-description">
            Description (optional · {description.length}/1000)
          </label>
          <textarea
            id="community-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="What's this community about?"
          />
        </div>

        <div className="field">
          <label htmlFor="community-visibility">Visibility</label>
          <select
            id="community-visibility"
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
          >
            <option value="Public">Public</option>
            <option value="Private">Private</option>
            <option value="Restricted">Restricted</option>
          </select>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={createCommunity.isPending}
          >
            {createCommunity.isPending ? "Creating…" : "$ create-community"}{" "}
            <Icon name="arrowRight" size={14} strokeWidth={2} aria-hidden />
          </button>
          <button type="button" className="btn btn-lg" onClick={() => router.back()}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
