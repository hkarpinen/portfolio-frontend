"use client";

import * as RadixTabs from "@radix-ui/react-tabs";
import Link from "next/link";
import { ThreadCard } from "@/components/editorial/thread-card";
import { CommunityAvatar } from "@/components/editorial/community-avatar";
import { JoinButton } from "./join-button";
import { Icon } from "@/components/editorial/icon";
import type { CommunitySummaryResponse, ThreadSummaryResponse } from "@/types/forum";


interface ForumTabsProps {
  communities: CommunitySummaryResponse[];
  feedThreads: ThreadSummaryResponse[];
  hotThreads: ThreadSummaryResponse[];
  communitySlugMap: Record<string, string>; // communityId -> slug
}


export function ForumTabs({
  communities,
  feedThreads,
  hotThreads,
  communitySlugMap,
}: ForumTabsProps) {
  return (
    <RadixTabs.Root defaultValue="Feed" className="flex flex-col gap-8">
      {/* Tab bar */}
      <RadixTabs.List className="ed-tabs-list">
        {(["Feed", "Hot", "Communities"] as const).map((label) => (
          <RadixTabs.Trigger
            key={label}
            value={label}
            className="ed-tab"
          >
            {label}
            {label === "Communities" && (
              <span className="ed-tab-count">
                {communities.length}
              </span>
            )}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>

      {/* Communities tab */}
      <RadixTabs.Content value="Communities">
        <div className="flex flex-col gap-5">
          {communities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 px-12 bg-paper gap-6 border-ink">
              <div className="w-[56px] h-[56px] bg-red-soft flex items-center justify-center">
                <Icon name="community" size={24} strokeWidth={1.5} />
              </div>
              <p className="font-serif font-bold text-md text-ink">No communities yet</p>
              <p className="text-base text-ink-3">Be the first to create one</p>
              <Link href="/forum/new" className="text-base font-semibold text-red no-underline">Create the first one →</Link>
            </div>
          ) : (
            communities.map((community) => (
              <Link
                key={community.communityId}
                href={`/forum/g/${community.slug}`}
                className="no-underline"
              >
                <div
                  className="community-card py-[16px] px-[18px] bg-paper flex items-center gap-6 border-ink"
                  style={{transition: "transform 200ms var(--ease-spring), box-shadow 200ms" }}
                >
                  <CommunityAvatar community={community} size={44} />
                  <div className="flex-1 min-w-0">
                    <p className="font-serif font-bold text-md text-ink m-0 overflow-hidden text-ellipsis whitespace-nowrap">
                      {community.name}
                    </p>
                    {community.description && (
                      <p className="text-base text-ink-2 mt-1 leading-[1.4] line-clamp-1">
                        {community.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-ink m-0">{community.memberCount.toLocaleString()}</p>
                    <p className="text-sm text-ink-3 mt-1">members</p>
                  </div>
                  <JoinButton communityId={community.communityId} />
                </div>
              </Link>
            ))
          )}
        </div>
      </RadixTabs.Content>

      {/* Feed tab */}
      <RadixTabs.Content value="Feed">
        <div className="flex flex-col gap-5">
          {feedThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 px-12 bg-paper gap-6 border-ink">
              <div className="w-[56px] h-[56px] bg-red-soft flex items-center justify-center">
                <Icon name="feed" size={24} strokeWidth={1.5} />
              </div>
              <p className="font-serif font-bold text-md text-ink">No threads yet</p>
              <p className="text-base text-ink-3">Join a community to see threads here</p>
            </div>
          ) : (
            feedThreads.map((thread) => (
              <ThreadCard
                key={thread.threadId}
                thread={thread}
                slug={communitySlugMap[thread.communityId] ?? ""}
                showCommunity
              />
            ))
          )}
        </div>
      </RadixTabs.Content>

      {/* Hot tab */}
      <RadixTabs.Content value="Hot">
        <div className="flex flex-col gap-5">
          {hotThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 px-12 bg-paper gap-6 border-ink">
              <div className="w-[56px] h-[56px] bg-red-soft flex items-center justify-center">
                <Icon name="trendUp" size={24} strokeWidth={1.5} />
              </div>
              <p className="font-serif font-bold text-md text-ink">Nothing trending yet</p>
              <p className="text-base text-ink-3">Hot threads will appear here</p>
            </div>
          ) : (
            hotThreads.map((thread) => (
              <ThreadCard
                key={thread.threadId}
                thread={thread}
                slug={communitySlugMap[thread.communityId] ?? ""}
                showCommunity
              />
            ))
          )}
        </div>
      </RadixTabs.Content>

    </RadixTabs.Root>
  );
}

