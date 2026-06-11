import { ArrowLink, EmptyState, Icon, SectionHeader } from "@/components/editorial";

export default function ModLogPage({ params }: { params: { slug: string } }) {
  return (
    <div className="page-enter flex flex-col gap-8">
      <ArrowLink href={`/forum/g/${params.slug}`} direction="left" className="ed-label-muted">
        g/{params.slug}
      </ArrowLink>

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
