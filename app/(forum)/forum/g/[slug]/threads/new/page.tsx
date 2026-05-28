"use client";

import {
  Alert,
  Btn,
  Icon,
  Input,
  SectionHeader,
  SelectField,
  Textarea,
} from "@/components/editorial";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useCreateThread } from "@/hooks/use-forum";
import { useCommunities } from "@/hooks/use-community";
import { useIsDemo } from "@/hooks/use-demo";
import { getErrorMessage } from "@/lib/error-messages";

// FLAIR dropdown is kept alongside the new TAGS field.
// Flair maps to the backend's thread categorisation (enum-constrained).
// Tags are free-form comma-separated labels for discoverability.
// We keep both: FLAIR is hidden from immediate view via a visually-collapsed
// section so power users can still set it without cluttering the default form.
// TODO(handoff8): decide whether to merge flair into tags at the backend level.
const FLAIR_OPTIONS = ["None", "Discussion", "Article", "Show & Tell", "Question", "Announcement"];
const TITLE_MAX = 200;
const DRAFT_KEY = (slug: string) => `forum_draft_${slug}`;

// Schema-validate localStorage drafts on read. Hand-edited or stale-shape
// drafts fall through to a fresh form instead of crashing on `draft.foo`.
const DraftSchema = z.object({
  title: z.string(),
  content: z.string(),
  tags: z.string(),
  isDiscussion: z.boolean(),
  flair: z.string(),
  communitySlug: z.string(),
  savedAt: z.string(),
});
type Draft = z.infer<typeof DraftSchema>;

export default function NewThreadPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const isDemo = useIsDemo();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isDiscussion, setIsDiscussion] = useState(false);
  const [flair, setFlair] = useState("None");
  const [communitySlug, setCommunitySlug] = useState(params.slug);
  const [draftSaved, setDraftSaved] = useState(false);
  const createThread = useCreateThread();
  const { data: communitiesPage } = useCommunities(1, 50);
  const communities = communitiesPage?.items ?? [];

  // Restore draft from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY(params.slug));
      if (!raw) return;
      const result = DraftSchema.safeParse(JSON.parse(raw));
      if (!result.success) return; // stale/malformed shape → fresh form
      const draft = result.data;
      setTitle(draft.title);
      setContent(draft.content);
      setTags(draft.tags);
      setIsDiscussion(draft.isDiscussion);
      setFlair(draft.flair);
      setCommunitySlug(draft.communitySlug);
    } catch {
      // localStorage / JSON.parse failure — ignore.
    }
  }, [params.slug]);

  function handleSaveDraft() {
    try {
      const draft: Draft = {
        title,
        content,
        tags,
        isDiscussion,
        flair,
        communitySlug,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_KEY(params.slug), JSON.stringify(draft));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2500);
    } catch {
      // localStorage may be unavailable (private browsing, storage full)
    }
    // TODO(handoff8): wire SAVE DRAFT to a backend /api/forum/drafts endpoint
    //                 so drafts persist across devices and sessions.
  }

  if (isDemo) {
    return (
      <div className="page-enter flex max-w-[680px] flex-col gap-8">
        <Link
          href={`/forum/g/${params.slug}`}
          className="ed-label-muted no-underline hover:text-red"
        >
          ← g/{params.slug}
        </Link>
        <SectionHeader kicker="New thread" title="Start a <em>thread</em>" />
        <div className="ed-card flex flex-col items-start gap-4">
          <p className="ed-deck">
            Posting threads isn&apos;t available in the demo.{" "}
            <Link href="/register" className="font-semibold text-red">
              Create a free account
            </Link>{" "}
            to join the conversation.
          </p>
          <Btn type="button" variant="secondary" size="lg" onClick={() => router.back()}>
            Go back
          </Btn>
        </div>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Derive effective flair: if MARK AS DISCUSSION is checked, override flair to "Discussion"
    const effectiveFlair = isDiscussion ? "Discussion" : flair !== "None" ? flair : undefined;
    createThread.mutate(
      { communitySlug, title, content, flair: effectiveFlair },
      {
        onSuccess: (thread) => {
          // Clear draft on successful post
          try {
            localStorage.removeItem(DRAFT_KEY(params.slug));
          } catch {
            /* ignore */
          }
          router.refresh();
          router.push(`/forum/g/${communitySlug}/threads/${thread.threadId}`);
        },
      },
    );
  }

  return (
    <div className="page-enter flex max-w-[680px] flex-col gap-8">
      <Link href={`/forum/g/${params.slug}`} className="ed-label-muted no-underline hover:text-red">
        ← g/{params.slug}
      </Link>

      <SectionHeader
        kicker="New thread"
        title="Start a <em>thread</em>"
        subtitle={`Posting to g/${params.slug}. Read the rules first — they're in the sidebar.`}
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {createThread.isError && (
          <Alert variant="danger">
            {getErrorMessage(createThread.error, "An unexpected error occurred.")}
          </Alert>
        )}

        {draftSaved && <Alert variant="success">Draft saved to this browser.</Alert>}

        <SelectField
          label="Community"
          value={communitySlug}
          onChange={(e) => setCommunitySlug(e.target.value)}
          required
        >
          {communities.length === 0 && <option value={params.slug}>{params.slug}</option>}
          {communities.map((c) => (
            <option key={c.communityId} value={c.slug}>
              {c.name}
            </option>
          ))}
        </SelectField>

        <Input
          label="Title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={TITLE_MAX}
          placeholder="Short and clear. Questions get more replies."
          hint={`${title.length} / ${TITLE_MAX} characters`}
        />

        <Textarea
          label="Body"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={10000}
          placeholder="Supports markdown."
          rows={8}
          hint="Optional · supports markdown."
        />

        <Input
          label="Tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g. question, help, cedar-place"
          hint="Comma-separated. Helps readers discover your post."
          // TODO(handoff8): wire tags to backend — no tags field on ThreadRequest yet.
          //                 Currently stored locally and visible in the UI only.
        />

        {/* MARK AS DISCUSSION checkbox */}
        <label className="group flex cursor-pointer select-none items-center gap-3">
          <input
            type="checkbox"
            checked={isDiscussion}
            onChange={(e) => setIsDiscussion(e.target.checked)}
            className="h-9 w-9 cursor-pointer accent-[var(--red)]"
          />
          <span className="text-base font-semibold text-ink transition-colors group-hover:text-red">
            Mark as discussion
          </span>
          <span className="text-sm text-ink-3">— sets flair to &ldquo;Discussion&rdquo;</span>
        </label>

        {/* FLAIR — kept alongside TAGS for backwards compatibility.
            Flair is enum-constrained; tags are free-form.
            Hidden behind a details element to reduce visual noise for most users. */}
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-ink-3 transition-colors hover:text-ink">
            <svg
              aria-hidden="true"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform group-open:rotate-90"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            Advanced — flair
          </summary>
          <div className="mt-4">
            <SelectField
              label="Flair"
              value={flair}
              onChange={(e) => setFlair(e.target.value)}
              hint="Overridden by 'Mark as discussion' when checked."
            >
              {FLAIR_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </SelectField>
          </div>
        </details>

        <div className="flex flex-wrap gap-3">
          <Btn
            type="submit"
            variant="primary"
            size="lg"
            disabled={createThread.isPending}
            iconRight={<Icon name="arrowRight" size={16} />}
          >
            {createThread.isPending ? "Posting…" : "Post thread"}
          </Btn>
          <Btn type="button" variant="secondary" size="lg" onClick={handleSaveDraft}>
            Save draft
          </Btn>
          <Btn type="button" variant="ghost" size="lg" onClick={() => router.back()}>
            Cancel
          </Btn>
        </div>
      </form>
    </div>
  );
}
