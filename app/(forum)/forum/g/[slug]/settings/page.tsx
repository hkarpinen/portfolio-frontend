import { ArrowLink, SectionHeader } from "@/components/editorial";
import { notFound } from "next/navigation";
import { fetchCommunityBySlugServer } from "@/lib/api/communities";
import { getCookieHeader } from "@/lib/server-cookies";

import { SettingsTabs } from "./settings-tabs";
import { CommunityVisibility, type CommunitySummaryResponse } from "@/types/forum";
import { parseEnum } from "@/lib/parse-enum";

export const dynamic = "force-dynamic";

export default async function CommunitySettingsPage({ params }: { params: { slug: string } }) {
  const community: CommunitySummaryResponse | null = await fetchCommunityBySlugServer(
    params.slug,
    await getCookieHeader(),
  );
  if (!community) notFound();

  return (
    <div className="page-enter flex max-w-[680px] flex-col gap-8">
      <ArrowLink href={`/forum/g/${params.slug}`} direction="left" className="ed-label-muted">
        g/{params.slug}
      </ArrowLink>

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
        initialVisibility={parseEnum(
          CommunityVisibility,
          community.visibility,
          CommunityVisibility.Public,
        )}
        initialRules={community.rules ?? ""}
      />
    </div>
  );
}
