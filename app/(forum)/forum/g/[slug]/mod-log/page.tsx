import { EmptyState, Icon, SectionHeader } from "@/components/editorial";
import Link from "next/link";

export default function ModLogPage({ params }: { params: { slug: string } }) {
  return (
    <div className="page-enter flex flex-col gap-8">
      <Link href={`/forum/g/${params.slug}`} className="ed-label-muted no-underline hover:text-red">
        ← g/{params.slug}
      </Link>

      <SectionHeader
        kicker="Moderation · Log"
        title="Mod <em>log</em>"
        subtitle={`A record of all moderation actions taken in g/${params.slug}.`}
      />

      <EmptyState
        glyph={<Icon name="check" size={24} strokeWidth={1.5} />}
        title="No actions yet"
        body="Moderation actions will appear here as moderators review and act on reported content."
      />
    </div>
  );
}
