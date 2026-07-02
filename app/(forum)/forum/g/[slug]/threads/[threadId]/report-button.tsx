"use client";

import { Btn, Modal, SelectField, Textarea } from "@/components/editorial";
import { useState, useCallback } from "react";

import { useReportContent } from "@/hooks/use-forum";
import { REPORT_SUBMITTED_COPY } from "@/lib/forum/editorial-copy";

const REPORT_REASONS = [
  "Spam or self-promotion",
  "Harassment or hate speech",
  "Misinformation",
  "Off-topic",
  "Other",
];

interface ReportButtonProps {
  /** "thread" -> POST /api/forum/threads/{id}/report. "comment" -> /api/forum/comments/{id}/report. */
  kind: "thread" | "comment";
  targetId: string;
  /** Optional className override on the trigger button. Defaults to the meta-row style. */
  triggerClassName?: string;
  /** Label shown next to the icon. */
  triggerLabel?: string;
}

/**
 * Lightweight report flow shared by thread and comment surfaces. The trigger is
 * a small text button; the modal collects a reason + optional details and posts
 * to the moderation endpoint. Submission is fire-and-forget so a flaky network
 * never blocks the UI.
 */
export function ReportButton({
  kind,
  targetId,
  triggerClassName,
  triggerLabel = "Report",
}: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  // REPORT_REASONS is a non-empty const tuple; the `?? ""` is dead code
  // for the type-checker (audit Phase 8 — noUncheckedIndexedAccess).
  const [reason, setReason] = useState(REPORT_REASONS[0] ?? "");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const report = useReportContent(kind, targetId);

  const close = useCallback(() => {
    setOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setReason(REPORT_REASONS[0] ?? "");
      setDetails("");
    }, 200);
  }, []);

  const submit = useCallback(async () => {
    // Mutation is fire-and-forget — we surface the confirmation regardless
    // of network success (consistent with the previous direct-fetch flow).
    await report.mutateAsync({ reason, details: details.trim() || undefined }).catch(() => {});
    setSubmitted(true);
  }, [report, reason, details]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "cursor-pointer border-0 bg-transparent p-0 font-mono text-xs uppercase tracking-[0.12em] text-ink-3 hover:text-danger"
        }
        aria-label={`Report ${kind}`}
      >
        {triggerLabel}
      </button>

      <Modal
        open={open}
        onOpenChange={(o) => {
          if (!o) close();
        }}
        title={submitted ? "Report submitted" : `Report ${kind}`}
        actions={
          submitted ? (
            <Btn variant="primary" onClick={close}>
              Close
            </Btn>
          ) : (
            <div className="flex justify-end gap-4">
              <Btn variant="secondary" onClick={close}>
                Cancel
              </Btn>
              <Btn variant="danger" loading={report.isPending} onClick={submit}>
                Submit report
              </Btn>
            </div>
          )
        }
      >
        {submitted ? (
          <p className="p-[8px_0] text-center text-md text-ink-2">{REPORT_SUBMITTED_COPY}</p>
        ) : (
          <div className="flex flex-col gap-8">
            <SelectField
              id={`report-reason-${targetId}`}
              label="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </SelectField>
            <div>
              <Textarea
                id={`report-details-${targetId}`}
                label="Additional details (optional)"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe the issue..."
                rows={3}
                maxLength={500}
              />
              <p className="mt-1 text-right text-sm text-ink-3" aria-live="polite">
                {details.length}/500
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
