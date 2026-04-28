"use client";

import { useState } from "react";
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

export function SettingsTabs({
  communityId,
  ownerId,
  slug,
  initialName,
  initialDescription,
  initialImageUrl,
  initialVisibility,
}: Props) {
  const [tab, setTab] = useState<"general" | "members">("general");

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "10px 16px", background: "none", border: "none",
    fontWeight: 600, fontSize: "14px",
    color: active ? "var(--text)" : "var(--text-3)",
    borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
    marginBottom: "-1px",
    cursor: "pointer", fontFamily: "var(--ff-body)",
    transition: "color 110ms",
  });

  return (
    <>
      {/* Tabs */}
      <div style={{ borderBottom: "1px solid var(--border)", display: "flex" }}>
        <button style={tabStyle(tab === "general")} onClick={() => setTab("general")}>
          General
        </button>
        <button style={tabStyle(tab === "members")} onClick={() => setTab("members")}>
          Members
        </button>
      </div>

      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow-sm)",
      }}>
        {tab === "general" ? (
          <CommunitySettingsForm
            communityId={communityId}
            ownerId={ownerId}
            slug={slug}
            initialName={initialName}
            initialDescription={initialDescription}
            initialImageUrl={initialImageUrl}
            initialVisibility={initialVisibility}
          />
        ) : (
          <CommunityMembersTab communityId={communityId} />
        )}
      </div>
    </>
  );
}
