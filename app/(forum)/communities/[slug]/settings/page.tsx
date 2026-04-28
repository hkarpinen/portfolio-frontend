import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchCommunityBySlugServer } from "@/lib/api/communities";
import { getCookieHeader } from "@/lib/server-cookies";
import { CommunitySettingsForm } from "./settings-form";
import { SettingsTabs } from "./settings-tabs";
import type { CommunityDetailResponse } from "@/types/forum";

export const dynamic = "force-dynamic";

export default async function CommunitySettingsPage({ params }: { params: { slug: string } }) {
  const community: CommunityDetailResponse | null = await fetchCommunityBySlugServer(params.slug, await getCookieHeader());
  if (!community) notFound();

  return (
    <div className="page-enter" style={{ maxWidth: "560px", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Back link */}
      <Link
        href={`/communities/${params.slug}`}
        style={{ fontSize: "13px", color: "var(--text-3)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
      >
        ← {community.name}
      </Link>

      <div>
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 700, fontSize: "24px", color: "var(--text)", margin: 0 }}>
          Community Settings
        </h1>
        <p style={{ color: "var(--text-3)", marginTop: "4px", fontSize: "13px" }}>
          Manage profile, description, and visibility for {community.name}.
        </p>
      </div>

      {/* Tabs */}
      <SettingsTabs
        communityId={community.communityId}
        ownerId={community.ownerId ?? ""}
        slug={params.slug}
        initialName={community.name}
        initialDescription={community.description ?? ""}
        initialImageUrl={community.imageUrl ?? ""}
        initialVisibility={community.visibility ?? ""}
      />
    </div>
  );
}
