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
    <div className="page-enter max-w-[520px] flex flex-col gap-12" >
      {/* Back link */}
      <Link
        href={`/forum/${params.slug}`}
        className="text-base text-ink-3 no-underline inline-flex items-center gap-2"
      >
        ← {community.name}
      </Link>

      <div>
        <h1 className="font-serif font-bold text-4xl leading-none tracking-snug text-ink m-0">
          Community Settings
        </h1>
        <p className="text-ink-3 mt-2 text-base">
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
