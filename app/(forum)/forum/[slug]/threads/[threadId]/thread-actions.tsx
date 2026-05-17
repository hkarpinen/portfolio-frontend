"use client";

import { useState, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { Btn } from "@/components/editorial";

interface ThreadActionsProps {
  threadId: string;
  threadUrl?: string;
}

const REPORT_REASONS = [
  "Spam or self-promotion",
  "Harassment or hate speech",
  "Misinformation",
  "Off-topic",
  "Other",
];

export function ThreadActions({ threadId, threadUrl }: ThreadActionsProps) {
  const [copied, setCopied] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleShare = useCallback(async () => {
    const url = threadUrl ?? window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that block clipboard API
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [threadUrl]);

  const handleReportSubmit = useCallback(async () => {
    setSubmitting(true);
    // Fire-and-forget — swallow errors so UX isn't blocked if endpoint is unavailable
    try {
      await fetch(`/api/forum/threads/${threadId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, details: details.trim() || undefined }),
        credentials: "include",
      });
    } catch {
      // no-op
    }
    setSubmitting(false);
    setSubmitted(true);
  }, [threadId, reason, details]);

  const handleReportClose = useCallback(() => {
    setReportOpen(false);
    // Reset after close animation
    setTimeout(() => {
      setSubmitted(false);
      setReason(REPORT_REASONS[0]);
      setDetails("");
    }, 200);
  }, []);

  const btnStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    padding: "4px 10px",
    
    border: "none",
    background: "transparent",
    color: "var(--text-3)",
    fontSize: "var(--ts-label)",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 110ms, color 110ms",
  };

  return (
    <>
      <button
        type="button"
        style={btnStyle}
        onClick={handleShare}
        aria-label="Share thread"
        className="row-hover"
      >
        {copied ? (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--success, #22c55e)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span className="text-[var(--success,#22c55e)]">Copied!</span>
          </>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share
          </>
        )}
      </button>

      <button
        type="button"
        style={btnStyle}
        onClick={() => setReportOpen(true)}
        aria-label="Report thread"
        className="row-hover"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
        </svg>
        Report
      </button>

      <Modal
        open={reportOpen}
        onClose={handleReportClose}
        title={submitted ? "Report submitted" : "Report thread"}
        footer={
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
            <div className="w-24 h-24 bg-[rgba(178,42,26,0.10)] flex items-center justify-center">
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
              <label className="block text-base font-semibold text-ink-2 mb-3">
                Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full py-4 px-6 bg-paper-2 text-ink text-base outline-none" style={{ border: "1.5px solid var(--ink)" }}
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-base font-semibold text-ink-2 mb-3">
                Additional details <span className="font-normal text-ink-3">(optional)</span>
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe the issue..."
                rows={3}
                maxLength={500}
                className="w-full py-4 px-6 bg-paper-2 text-ink text-base outline-none leading-[1.5]" style={{ border: "1.5px solid var(--ink)", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
              />
              <p className="text-sm text-ink-3 text-right" style={{ margin: "4px 0 0" }}>
                {details.length}/500
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
