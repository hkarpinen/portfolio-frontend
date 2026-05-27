"use client";

import * as RadixTabs from "@radix-ui/react-tabs";
import { CommunitySettingsForm } from "./settings-form";
import { CommunityMembersTab } from "./members-tab";
import { tabTriggerBody } from "@/lib/tab-styles";

interface Props {
  communityId: string;
  ownerId: string;
  slug: string;
  initialName: string;
  initialDescription: string;
  initialImageUrl: string;
  initialVisibility: string;
}


export function SettingsTabs({
  communityId,
  ownerId,
  slug,
  initialName,
  initialDescription,
  initialImageUrl,
  initialVisibility,
}: Props) {
  return (
    <RadixTabs.Root defaultValue="general">
      {/* Tab bar */}
      <RadixTabs.List className="flex border-ink-b">
        <RadixTabs.Trigger value="general" style={tabTriggerBody}>
          General
        </RadixTabs.Trigger>
        <RadixTabs.Trigger value="members" style={tabTriggerBody}>
          Members
        </RadixTabs.Trigger>
      </RadixTabs.List>

      <div className="bg-paper p-12 shadow-stamp border-ink">
        <RadixTabs.Content value="general">
          <CommunitySettingsForm
            communityId={communityId}
            ownerId={ownerId}
            slug={slug}
            initialName={initialName}
            initialDescription={initialDescription}
            initialImageUrl={initialImageUrl}
            initialVisibility={initialVisibility}
          />
        </RadixTabs.Content>
        <RadixTabs.Content value="members">
          <CommunityMembersTab communityId={communityId} />
        </RadixTabs.Content>
      </div>

      <style>{`
        [data-radix-tabs-trigger][data-state="active"] {
          color: var(--text) !important;
          border-bottom-color: var(--red) !important;
        }
      `}</style>
    </RadixTabs.Root>
  );
}
