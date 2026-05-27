import Link from "next/link";
import { EmptyState } from "@/components/editorial/empty-state";
import { Icon } from "@/components/editorial/icon";
import { SectionHeader } from "@/components/editorial/section-header";

export default function ModQueuePage({ params }: { params: { slug: string } }) {
  return (
    <div className="page-enter flex flex-col gap-8">
      <Link href={`/forum/g/${params.slug}`} className="ed-label-muted no-underline hover:text-red">← g/{params.slug}</Link>

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
