"use client";

import { Alert, Icon } from "@/components/editorial";
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
      if (!result.success) return; // stale/malformed shape -> fresh form
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

  // Back link + page head shared by demo and live forms.
  const Head = (
    <>
      <Link
        href={`/forum/g/${params.slug}`}
        className="back inline-flex items-center gap-2 no-underline"
      >
        <Icon name="arrowLeft" size={12} strokeWidth={2} aria-hidden /> g/{params.slug}
      </Link>
      <header className="page-head">
        <div className="titles">
          <div className="kicker" style={{ marginBottom: 8 }}>
            // FORUM · NEW
          </div>
          <h1>New thread</h1>
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
            Posting threads isn&apos;t available in the demo.{" "}
            <Link href="/identity/register" className="font-semibold text-accent no-underline">
              Create a free account
            </Link>{" "}
            to join the conversation.
          </p>
          <button type="button" className="btn" onClick={() => router.back()}>
            Go back
          </button>
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
    <div className="page-enter">
      {Head}

      <form className="form wide" onSubmit={handleSubmit}>
        {createThread.isError && (
          <Alert variant="danger">
            {getErrorMessage(createThread.error, "An unexpected error occurred.")}
          </Alert>
        )}

        {draftSaved && <Alert variant="success">Draft saved to this browser.</Alert>}

        <div className="field">
          <label htmlFor="thread-community">Community</label>
          <select
            id="thread-community"
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
          </select>
        </div>

        <div className="field">
          <label htmlFor="thread-title">Title</label>
          <input
            id="thread-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={TITLE_MAX}
            placeholder="What's your question or topic?"
          />
          <span className="hint">
            {title.length} / {TITLE_MAX} characters
          </span>
        </div>

        <div className="field">
          <label htmlFor="thread-body">Body</label>
          <textarea
            id="thread-body"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={10000}
            rows={12}
            placeholder="Markdown is supported…"
          />
          <span className="hint">Optional · supports markdown.</span>
        </div>

        <div className="field">
          <label htmlFor="thread-tags">Tags</label>
          <input
            id="thread-tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. question, help, cedar-place"
          />
          {/* TODO(handoff8): wire tags to backend — no tags field on ThreadRequest yet.
              Currently stored locally and visible in the UI only. */}
          <span className="hint">Comma-separated. Helps readers discover your post.</span>
        </div>

        {/* MARK AS DISCUSSION checkbox */}
        <label className="row" style={{ gap: 10, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={isDiscussion}
            onChange={(e) => setIsDiscussion(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: "var(--amber)", cursor: "pointer" }}
          />
          <span style={{ font: "600 0.72rem/1 var(--ff-mono)", color: "var(--text)" }}>
            Mark as discussion
          </span>
          <span className="hint">— sets flair to &ldquo;Discussion&rdquo;</span>
        </label>

        {/* FLAIR — kept alongside TAGS for backwards compatibility.
            Flair is enum-constrained; tags are free-form. */}
        <details className="group">
          <summary
            className="row"
            style={{
              cursor: "pointer",
              listStyle: "none",
              font: "600 0.62rem/1 var(--ff-mono)",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "var(--text-3)",
              gap: 6,
            }}
          >
            <span aria-hidden="true" className="transition-transform group-open:rotate-90">
              <Icon name="chevRight" size={10} strokeWidth={2.5} />
            </span>
            Advanced — flair
          </summary>
          <div className="field" style={{ marginTop: 14 }}>
            <label htmlFor="thread-flair">Flair</label>
            <select
              id="thread-flair"
              value={flair}
              onChange={(e) => setFlair(e.target.value)}
            >
              {FLAIR_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <span className="hint">Overridden by &lsquo;Mark as discussion&rsquo; when checked.</span>
          </div>
        </details>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={createThread.isPending}
          >
            {createThread.isPending ? "Posting…" : "$ post-thread"}{" "}
            <Icon name="arrowRight" size={14} strokeWidth={2} aria-hidden />
          </button>
          <button type="button" className="btn btn-lg" onClick={handleSaveDraft}>
            Save draft
          </button>
          <button type="button" className="btn btn-ghost btn-lg" onClick={() => router.back()}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
