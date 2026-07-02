"use client";

import * as RadixTabs from "@radix-ui/react-tabs";
import { CommunitySettingsForm } from "./settings-form";
import { CommunityMembersTab } from "./members-tab";
import type { CommunityVisibility } from "@/types/forum";

interface Props {
  communityId: string;
  ownerId: string;
  slug: string;
  initialName: string;
  initialDescription: string;
  initialImageUrl: string;
  initialVisibility: CommunityVisibility;
  initialRules: string;
}

export function SettingsTabs({
  communityId,
  ownerId,
  slug,
  initialName,
  initialDescription,
  initialImageUrl,
  initialVisibility,
  initialRules,
}: Props) {
  return (
    <RadixTabs.Root defaultValue="general">
      {/* Tab bar */}
      <RadixTabs.List className="tabs">
        <RadixTabs.Trigger value="general">General</RadixTabs.Trigger>
        <RadixTabs.Trigger value="members">Members</RadixTabs.Trigger>
      </RadixTabs.List>

      <div className="ed-card">
        <RadixTabs.Content value="general">
          <CommunitySettingsForm
            communityId={communityId}
            ownerId={ownerId}
            slug={slug}
            initialName={initialName}
            initialDescription={initialDescription}
            initialImageUrl={initialImageUrl}
            initialVisibility={initialVisibility}
            initialRules={initialRules}
          />
        </RadixTabs.Content>
        <RadixTabs.Content value="members">
          <CommunityMembersTab communityId={communityId} />
        </RadixTabs.Content>
      </div>
    </RadixTabs.Root>
  );
}
