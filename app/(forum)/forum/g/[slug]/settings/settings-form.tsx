"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useUpdateCommunity,
  useUploadCommunityImage,
  useDeleteCommunity,
} from "@/hooks/use-community";
import { useMe } from "@/hooks/use-identity";
import { getErrorMessage } from "@/lib/error-messages";
import {
  Btn,
  Alert,
  Input,
  Textarea,
  SelectField,
  UserInitials,
  ConfirmDeleteDialog,
} from "@/components/editorial";
import { CommunityVisibility } from "@/types/forum";
import { parseEnum } from "@/lib/parse-enum";

interface Props {
  communityId: string;
  ownerId: string;
  slug: string;
  initialName: string;
  initialDescription: string;
  initialImageUrl: string;
  initialVisibility: CommunityVisibility;
  initialRules: string;
}

export function CommunitySettingsForm({
  communityId,
  ownerId,
  slug,
  initialName,
  initialDescription,
  initialImageUrl,
  initialVisibility,
  initialRules,
}: Props) {
  const router = useRouter();
  const { data: me } = useMe();
  const isOwner = !!me && me.id === ownerId;
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [visibility, setVisibility] = useState<CommunityVisibility>(initialVisibility);
  const [rules, setRules] = useState(initialRules);
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
        rules: rules.trim() || undefined,
      },
      {
        onSuccess: (updated) => {
          if (updated?.slug && updated.slug !== slug) {
            router.push(`/forum/g/${updated.slug}/settings`);
          }
        },
      },
    );
  }

  const saving = updateCommunity.isPending;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
      {updateCommunity.isError && (
        <Alert variant="danger">
          {getErrorMessage(updateCommunity.error)}
        </Alert>
      )}
      {updateCommunity.isSuccess && <Alert variant="success">Settings saved.</Alert>}

      {/* Profile image */}
      <div className="flex items-center gap-8 border-ink bg-paper-2 p-8">
        <UserInitials
          name={name}
          avatarUrl={imageUrl}
          size="lg"
          className="h-[56px] w-[56px] border-ink text-xl"
        />
        <div className="flex flex-1 flex-col gap-3">
          <span className="text-base font-medium text-ink-2">Community image</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleImageChange}
          />
          <div className="flex items-center gap-4">
            <Btn
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadImage.isPending}
              loading={uploadImage.isPending}
            >
              {uploadImage.isPending ? "Uploading…" : "Choose image"}
            </Btn>
            {imageUrl && (
              <Btn type="button" variant="ghost" size="sm" onClick={() => setImageUrl("")}>
                Remove
              </Btn>
            )}
          </div>
          {uploadImage.isError && (
            <span className="text-sm text-red">
              {getErrorMessage(uploadImage.error, "Upload failed.")}
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
        onChange={(e) => setVisibility(parseEnum(CommunityVisibility, e.target.value, visibility))}
      >
        <option value={CommunityVisibility.Public}>Public</option>
        <option value={CommunityVisibility.Private}>Private</option>
        <option value={CommunityVisibility.Restricted}>Restricted</option>
      </SelectField>

      <Textarea
        label="Rules"
        hint={`${rules.length}/10000 · Markdown supported`}
        value={rules}
        onChange={(e) => setRules(e.target.value)}
        maxLength={10000}
        rows={8}
        placeholder="The ground rules for this community. Plain text or Markdown."
      />

      <div>
        <Btn type="submit" disabled={saving || !name.trim()} variant="primary">
          {saving ? "Saving…" : "Save changes"}
        </Btn>
      </div>

      {isOwner && (
        <div className="border-ink-t mt-4 flex flex-col gap-6 pt-12">
          <div>
            <p className="m-0 mb-1 text-base font-semibold text-red">Danger zone</p>
            <p className="m-0 text-base text-ink-3">
              Permanently delete this community and all its threads. This cannot be undone.
            </p>
          </div>
          <Btn type="button" variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
            Delete community
          </Btn>
          {deleteCommunity.isError && (
            <span className="text-base text-red">
              {getErrorMessage(deleteCommunity.error)}
            </span>
          )}
          <ConfirmDeleteDialog
            open={confirmDelete}
            onOpenChange={setConfirmDelete}
            title="Delete community?"
            body="Permanently delete this community and all its threads. This cannot be undone."
            confirmLabel="Delete community"
            isPending={deleteCommunity.isPending}
            onConfirm={() =>
              deleteCommunity.mutate(communityId, {
                onSuccess: () => router.push("/forum"),
              })
            }
            requireText={{ expectedText: name, label: `Type "${name}" to confirm` }}
          />
        </div>
      )}
    </form>
  );
}
