import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchCommunityBySlugServer } from "@/lib/api/communities";
import { fetchThreadsServer } from "@/lib/api/forum";
import { getSession } from "@/lib/auth/session";
import { CommunityAvatar } from "@/components/editorial/community-avatar";
import { ThreadCard } from "@/components/editorial/thread-card";
import { Icon } from "@/components/editorial/icon";
import type { CommunityDetailResponse, ThreadSummaryResponse } from "@/types/forum";

export const dynamic = 'force-dynamic';

async function getThreads(communityId: string): Promise<ThreadSummaryResponse[]> {
  const page = await fetchThreadsServer({ communityId, pageSize: 30 });
  return page?.items ?? [];
}

export default async function CommunityPage({
  params,
}: {
  params: { slug: string };
}) {
  const community = await fetchCommunityBySlugServer(params.slug);
  if (!community) notFound();
  const [threads, session] = await Promise.all([
    getThreads(community.communityId),
    getSession(),
  ]);
  const isAuthed = !!session;

  // bannerColor removed — editorial design uses flat paper backgrounds

  return (
    <div className="page-enter flex flex-col gap-10" >
      {/* Banner card */}
      <div className="bg-paper-2 p-[clamp(20px,_4vw,_32px)_clamp(18px,_4vw,_36px)_24px] shadow-card border-ink">
        {/* Breadcrumb */}
        <div className="relative flex gap-[5px] items-center mb-[18px] text-base text-ink-3">
          <Link href="/forum" className="text-red text-base no-underline font-body">Forum</Link>
          <span>/</span>
          <span className="text-ink-2 font-medium">{community.name}</span>
        </div>

        {/* Identity row */}
        <div className="relative flex flex-col gap-[14px]">
          <div className="flex items-center gap-[18px]">
            <CommunityAvatar community={community} size={60} radius="var(--r-xl)" />
            <div className="flex-1 min-w-0">
              <h1 className="font-serif font-extrabold text-4xl tracking-snug leading-none text-ink m-0">
                {community.name}
              </h1>
              {community.description && (
                <p className="text-base text-ink-2 mt-2 leading-[1.4]">{community.description}</p>
              )}
              <div className="flex gap-8 mt-4">
                <span className="text-base text-ink-3">
                  <strong className="text-ink font-bold">{community.memberCount.toLocaleString()}</strong> members
                </span>
                <span className="text-base text-ink-3">
                  <strong className="text-ink font-bold">{community.threadCount.toLocaleString()}</strong> posts
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <Link
              href={`/forum/${params.slug}/settings`}
              className="bg-paper-2 text-ink-2 py-[7px] px-[14px] text-base font-semibold no-underline border-ink"
            >
              Mod tools
            </Link>
            <Link
              href={`/forum/${params.slug}/threads/new`}
              className="bg-red text-white py-[7px] px-[14px] text-base font-semibold no-underline"
            >
              + Post here
            </Link>
          </div>
        </div>
      </div>

      {/* Thread list */}
      <div className="flex flex-col gap-5">
        <span className="text-sm font-bold text-ink-3 uppercase tracking-[0.1em]">Threads</span>
        {threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[56px] px-[24px] bg-paper shadow-card gap-6 border-ink">
            <div className="w-[56px] h-[56px] bg-red-soft flex items-center justify-center">
              <Icon name="forum" size={24} strokeWidth={1.75} />
            </div>
            <p className="font-serif font-bold text-md text-ink">No threads yet</p>
            <p className="text-base text-ink-3">Start the first discussion</p>
            <Link href={`/forum/${params.slug}/threads/new`} className="text-base font-semibold text-red no-underline">
              Create a thread →
            </Link>
          </div>
        ) : (
          threads.map((thread) => (
            <ThreadCard
              key={thread.threadId}
              thread={thread}
              slug={params.slug}
              showCommunity={false}
            />
          ))
        )}
      </div>
    </div>
  );
}
