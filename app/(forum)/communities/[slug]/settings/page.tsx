import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SERVER_API } from "@/lib/api-url";
import { CommunitySettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

interface Community {
  communityId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  visibility: string;
  ownerId: string;
}

async function getCommunity(slug: string, cookieHeader: string): Promise<Community | null> {
  try {
    const res = await fetch(`${SERVER_API}/api/forum/communities/by-name/${encodeURIComponent(slug)}`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function CommunitySettingsPage({ params }: { params: { slug: string } }) {
  const cookieStore = cookies();
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");

  const community = await getCommunity(params.slug, cookieHeader);
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
      <div style={{ borderBottom: "1px solid var(--border)", display: "flex" }}>
        <button
          style={{
            padding: "10px 16px", background: "none", border: "none",
            fontWeight: 600, fontSize: "14px", color: "var(--text)",
            borderBottom: "2px solid var(--accent)", marginBottom: "-1px",
            cursor: "pointer", fontFamily: "var(--ff-body)",
          }}
        >
          General
        </button>
      </div>

      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow-sm)",
      }}>
        <CommunitySettingsForm
          communityId={community.communityId}
          slug={params.slug}
          initialName={community.name}
          initialDescription={community.description ?? ""}
          initialImageUrl={community.imageUrl ?? ""}
          initialVisibility={community.visibility}
        />
      </div>
    </div>
  );
}
