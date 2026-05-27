"use client";

import { useState, useCallback } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Modal, Btn } from "@/components/editorial";
import { Icon } from "@/components/editorial/icon";

interface ThreadActionsProps {
  threadId: string;
  threadUrl?: string;
  /**
   * DOM id of an element to scroll/focus when the user clicks Reply.
   * Defaults to `reply-input` (matches the composer in `comment-form.tsx`).
   */
  replyTargetId?: string;
  /**
   * Hide the inline Reply CTA. Used by thread-row cards on the index page where
   * Reply would either navigate (redundant with the comments link) or no-op.
   */
  showReply?: boolean;
}

const REPORT_REASONS = [
  "Spam or self-promotion",
  "Harassment or hate speech",
  "Misinformation",
  "Off-topic",
  "Other",
];

export function ThreadActions({ threadId, threadUrl, replyTargetId = "reply-input", showReply = true }: ThreadActionsProps) {
  const [copied, setCopied] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const focusComposer = useCallback(() => {
    const el = document.getElementById(replyTargetId) as HTMLTextAreaElement | null;
    if (!el) return;
    // `scrollIntoView` first so the textarea is in view before the keyboard pops up on mobile.
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.focus({ preventScroll: true });
  }, [replyTargetId]);

  const handleShare = useCallback(async () => {
    const url = threadUrl
      ? new URL(threadUrl, window.location.origin).toString()
      : window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [threadUrl]);

  const handleReportSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      await fetch(`/api/forum/threads/${threadId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, details: details.trim() || undefined }),
        credentials: "include",
      });
    } catch {
      // no-op — fire-and-forget
    }
    setSubmitting(false);
    setSubmitted(true);
  }, [threadId, reason, details]);

  const handleReportClose = useCallback(() => {
    setReportOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setReason(REPORT_REASONS[0]);
      setDetails("");
    }, 200);
  }, []);

  return (
    <>
      {showReply && (
        <>
          <button
            type="button"
            onClick={focusComposer}
            className="ed-thread-action ed-thread-action-primary"
            aria-label="Reply to thread"
          >
            <Icon name="forum" size={13} strokeWidth={2} aria-hidden />
            Reply
          </button>
          <span className="flex-1" aria-hidden="true" />
        </>
      )}

      {copied && (
        <span className="font-mono text-xs uppercase tracking-[0.12em] text-success" role="status">
          Link copied
        </span>
      )}

      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          className="ed-thread-action ed-thread-action-icon"
          aria-label="More thread actions"
        >
          <Icon name="more" size={16} strokeWidth={2} aria-hidden />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="ed-menu"
          >
            <DropdownMenu.Item onSelect={handleShare} className="ed-menu-item">
              <Icon name="link" size={14} strokeWidth={2} aria-hidden /> Copy link
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={(e) => {
                e.preventDefault();
                setReportOpen(true);
              }}
              className="ed-menu-item ed-menu-item-danger"
            >
              <Icon name="flag" size={14} strokeWidth={2} aria-hidden /> Report
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <Modal
        open={reportOpen}
        onOpenChange={(o) => { if (!o) handleReportClose(); }}
        title={submitted ? "Report submitted" : "Report thread"}
        actions={
          submitted ? (
            <Btn variant="primary" onClick={handleReportClose}>
              Close
            </Btn>
          ) : (
            <div className="flex gap-4 justify-end">
              <Btn variant="secondary" onClick={handleReportClose}>
                Cancel
              </Btn>
              <Btn variant="danger" loading={submitting} onClick={handleReportSubmit}>
                Submit report
              </Btn>
            </div>
          )
        }
      >
        {submitted ? (
          <div className="flex flex-col items-center gap-6 p-[8px_0]">
            <div className="w-24 h-24 bg-red-soft flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p className="text-md text-ink-2 text-center m-0">
              Thanks for the report. Our moderators will review it shortly.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div>
              <label htmlFor="report-reason" className="block text-base font-semibold text-ink-2 mb-3">
                Reason
              </label>
              <select
                id="report-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full py-4 px-6 bg-paper-2 text-ink text-base outline-none border-ink"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="report-details" className="block text-base font-semibold text-ink-2 mb-3">
                Additional details <span className="font-normal text-ink-3">(optional)</span>
              </label>
              <textarea
                id="report-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe the issue..."
                rows={3}
                maxLength={500}
                className="w-full py-4 px-6 bg-paper-2 text-ink text-base outline-none leading-[1.5] border-ink resize-y box-border font-body"
              />
              <p className="text-sm text-ink-3 text-right mt-1" aria-live="polite">
                {details.length}/500
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
