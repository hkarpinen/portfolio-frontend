import { ArrowLink, EmptyState, Icon, SectionHeader } from "@/components/editorial";
import Link from "next/link";
import { fetchModQueueServer } from "@/lib/api/forum";
import { getCookieHeader } from "@/lib/server-cookies";
import { timeAgo, pluralize } from "@/lib/utils";
import { ModQueueActions } from "./mod-queue-actions";

export const dynamic = "force-dynamic";

export default async function ModQueuePage({ params }: { params: { slug: string } }) {
  const cookieHeader = await getCookieHeader();
  const queue = await fetchModQueueServer(params.slug, cookieHeader);
  const items = queue?.items ?? [];

  return (
    <div className="page-enter flex flex-col gap-8">
      <ArrowLink href={`/forum/g/${params.slug}`} direction="left" className="ed-label-muted">
        g/{params.slug}
      </ArrowLink>

      <SectionHeader
        kicker={`Mod queue · ${items.length} ${pluralize("item", items.length)}`}
        title="Mod <em>queue</em>"
        subtitle="Reported items waiting for review."
      />

      {items.length === 0 ? (
        <EmptyState
          glyph={<Icon name="check" size={24} strokeWidth={1.5} />}
          title="Queue is empty"
          body="Reported content awaiting review will appear here."
        />
      ) : (
        <ol className="m-0 flex list-none flex-col gap-4 p-0" aria-label="Reported items">
          {items.map((item) => {
            // Both Thread- and Comment-type reports link to the surrounding
            // thread — the backend now ships `targetThreadId` for both so
            // moderators can land in context regardless of report target.
            const threadHref = item.targetThreadId
              ? `/forum/g/${params.slug}/threads/${item.targetThreadId}`
              : null;
            return (
              <li
                key={item.queueItemId}
                className="border-ink bg-paper px-8 py-7 shadow-card"
                aria-label={`${item.targetType} report by ${item.reporterName ?? "Anonymous"}`}
              >
                {/* Meta row — who reported, when, what target type */}
                <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-ink-3">
                  <span className="font-mono uppercase tracking-[0.08em]">{item.targetType}</span>
                  <span aria-hidden="true">·</span>
                  <span>Reported by {item.reporterName ?? "Anonymous"}</span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={item.reportedAt}>{timeAgo(item.reportedAt)}</time>
                </div>

                {/* Target — clickable when we know the thread */}
                <p className="m-0 font-serif text-md font-bold leading-[1.4] text-ink">
                  {threadHref ? (
                    <Link href={threadHref} className="row-hover text-ink no-underline">
                      {item.targetTitle ?? "(untitled)"}
                    </Link>
                  ) : (
                    <span>{item.targetTitle ?? "(no preview)"}</span>
                  )}
                  {item.targetAuthorName && (
                    <span className="ml-3 text-base font-normal text-ink-3">
                      by {item.targetAuthorName}
                    </span>
                  )}
                </p>

                {/* Reason + details */}
                <p className="ed-label-muted mt-3">
                  <span className="font-semibold text-ink-2">Reason:</span> {item.reason}
                </p>
                {item.details && <p className="mt-2 text-base text-ink-2">{item.details}</p>}

                {/* Resolution actions */}
                <div className="mt-5">
                  <ModQueueActions
                    slug={params.slug}
                    reportId={item.queueItemId}
                    reportTitle={item.targetTitle ?? `${item.targetType.toLowerCase()}`}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
