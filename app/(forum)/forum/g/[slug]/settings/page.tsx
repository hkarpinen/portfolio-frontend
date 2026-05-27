import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchCommunityBySlugServer } from "@/lib/api/communities";
import { getCookieHeader } from "@/lib/server-cookies";
import { SectionHeader } from "@/components/editorial/section-header";
import { SettingsTabs } from "./settings-tabs";
import type { CommunityDetailResponse } from "@/types/forum";

export const dynamic = "force-dynamic";

export default async function CommunitySettingsPage({ params }: { params: { slug: string } }) {
  const community: CommunityDetailResponse | null = await fetchCommunityBySlugServer(params.slug, await getCookieHeader());
  if (!community) notFound();

  return (
    <div className="page-enter max-w-[680px] flex flex-col gap-8">
      <Link href={`/forum/g/${params.slug}`} className="ed-label-muted no-underline hover:text-red">← g/{params.slug}</Link>

      <SectionHeader
        kicker="Community · Settings"
        title="Community <em>settings</em>"
        subtitle={`Manage profile, description, and visibility for g/${params.slug}.`}
      />

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
