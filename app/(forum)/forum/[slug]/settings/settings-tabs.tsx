"use client";

import * as RadixTabs from "@radix-ui/react-tabs";
import { CommunitySettingsForm } from "./settings-form";
import { CommunityMembersTab } from "./members-tab";

interface Props {
  communityId: string;
  ownerId: string;
  slug: string;
  initialName: string;
  initialDescription: string;
  initialImageUrl: string;
  initialVisibility: string;
}

const tabTriggerStyle: React.CSSProperties = {
  padding: "10px 16px", background: "none", border: "none",
  fontWeight: 600, fontSize: "var(--ts-body)",
  color: "var(--text-3)",
  borderBottom: "2px solid transparent",
  marginBottom: "-1px",
  cursor: "pointer", fontFamily: "var(--ff-body)",
  transition: "color 110ms",
};

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
      <RadixTabs.List className="flex" style={{ borderBottom: "1.5px solid var(--ink)" }}>
        <RadixTabs.Trigger value="general" style={tabTriggerStyle}>
          General
        </RadixTabs.Trigger>
        <RadixTabs.Trigger value="members" style={tabTriggerStyle}>
          Members
        </RadixTabs.Trigger>
      </RadixTabs.List>

      <div className="bg-paper p-12 shadow-stamp" style={{ border: "1.5px solid var(--ink)" }}>
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
