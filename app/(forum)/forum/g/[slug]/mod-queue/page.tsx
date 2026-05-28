import { EmptyState, Icon, SectionHeader } from "@/components/editorial";
import Link from "next/link";

export default function ModQueuePage({ params }: { params: { slug: string } }) {
  return (
    <div className="page-enter flex flex-col gap-8">
      <Link href={`/forum/g/${params.slug}`} className="ed-label-muted no-underline hover:text-red">
        ← g/{params.slug}
      </Link>

      <SectionHeader
        kicker="Mod queue"
        title="Mod <em>queue</em>"
        subtitle="Reported items waiting for review."
      />

      <EmptyState
        glyph={<Icon name="check" size={24} strokeWidth={1.5} />}
        title="Queue is empty"
        body="Reported content awaiting review will appear here."
      />
    </div>
  );
}
