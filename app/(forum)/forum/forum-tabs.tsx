"use client";

import { CommunityAvatar, Icon, ThreadCard } from "@/components/editorial";
import * as RadixTabs from "@radix-ui/react-tabs";
import Link from "next/link";

import { JoinButton } from "./join-button";

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
          <RadixTabs.Trigger key={label} value={label} className="ed-tab">
            {label}
            {label === "Communities" && <span className="ed-tab-count">{communities.length}</span>}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>

      {/* Communities tab */}
      <RadixTabs.Content value="Communities">
        <div className="flex flex-col gap-5">
          {communities.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-6 border-ink bg-paper px-12 py-32">
              <div className="flex h-[56px] w-[56px] items-center justify-center bg-red-soft">
                <Icon name="community" size={24} strokeWidth={1.5} />
              </div>
              <p className="font-serif text-md font-bold text-ink">No communities yet</p>
              <p className="text-base text-ink-3">Be the first to create one</p>
              <Link href="/forum/new" className="text-base font-semibold text-red no-underline">
                Create the first one →
              </Link>
            </div>
          ) : (
            communities.map((community) => (
              <Link
                key={community.communityId}
                href={`/forum/g/${community.slug}`}
                className="no-underline"
              >
                <div
                  className="community-card flex items-center gap-6 border-ink bg-paper px-[18px] py-[16px]"
                  style={{ transition: "transform 200ms var(--ease-spring), box-shadow 200ms" }}
                >
                  <CommunityAvatar community={community} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="m-0 overflow-hidden text-ellipsis whitespace-nowrap font-serif text-md font-bold text-ink">
                      {community.name}
                    </p>
                    {community.description && (
                      <p className="mt-1 line-clamp-1 text-base leading-[1.4] text-ink-2">
                        {community.description}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="m-0 text-base font-bold text-ink">
                      {community.memberCount.toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-ink-3">members</p>
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
            <div className="flex flex-col items-center justify-center gap-6 border-ink bg-paper px-12 py-32">
              <div className="flex h-[56px] w-[56px] items-center justify-center bg-red-soft">
                <Icon name="feed" size={24} strokeWidth={1.5} />
              </div>
              <p className="font-serif text-md font-bold text-ink">No threads yet</p>
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
            <div className="flex flex-col items-center justify-center gap-6 border-ink bg-paper px-12 py-32">
              <div className="flex h-[56px] w-[56px] items-center justify-center bg-red-soft">
                <Icon name="trendUp" size={24} strokeWidth={1.5} />
              </div>
              <p className="font-serif text-md font-bold text-ink">Nothing trending yet</p>
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
