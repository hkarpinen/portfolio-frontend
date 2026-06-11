"use client";

import { Btn } from "@/components/editorial";
import { useResolveReport, type ResolveAction } from "@/hooks/use-forum";
import { getErrorMessage } from "@/lib/error-messages";

/**
 * The three resolution buttons for a single mod-queue item. On success the
 * page (RSC) is re-fetched so the resolved report drops out of the queue.
 */
export function ModQueueActions({
  slug,
  reportId,
  reportTitle,
}: {
  slug: string;
  reportId: string;
  /** Human label for aria-only purposes ("…by user X"); not displayed. */
  reportTitle: string;
}) {
  const resolve = useResolveReport(slug);
  const pendingAction = resolve.isPending ? (resolve.variables?.action ?? null) : null;
  const disabled = resolve.isPending;

  const fire = (action: ResolveAction) => () => resolve.mutate({ reportId, action });
  const labelFor = (action: ResolveAction, idle: string, busy: string) =>
    pendingAction === action ? busy : idle;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Btn
          variant="secondary"
          size="sm"
          onClick={fire("approve")}
          disabled={disabled}
          aria-label={`Approve report on ${reportTitle}`}
        >
          {labelFor("approve", "Approve", "Approving…")}
        </Btn>
        <Btn
          variant="danger"
          size="sm"
          onClick={fire("remove")}
          disabled={disabled}
          aria-label={`Remove reported ${reportTitle}`}
        >
          {labelFor("remove", "Remove", "Removing…")}
        </Btn>
        <Btn
          variant="ghost"
          size="sm"
          onClick={fire("dismiss")}
          disabled={disabled}
          aria-label={`Dismiss report on ${reportTitle}`}
        >
          {labelFor("dismiss", "Dismiss", "Dismissing…")}
        </Btn>
      </div>
      {resolve.isError && (
        <p className="text-sm text-red" role="alert">
          {getErrorMessage(resolve.error, "Resolution failed. Try again.")}
        </p>
      )}
    </div>
  );
}
