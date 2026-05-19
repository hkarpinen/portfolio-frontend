export default function ModQueuePage({ params }: { params: { slug: string } }) {
  return (
    <div  className="page-enter flex flex-col gap-12">
      <div>
        <h1 className="font-serif font-extrabold text-2xl tracking-[-0.025em] text-ink mb-2">Mod Queue</h1>
        <p className="text-base text-ink-3">
          r/{params.slug}
        </p>
      </div>

      <div className="bg-paper py-24 px-12 text-center shadow-stamp border-ink">
        <div className="w-24 h-24 bg-green-soft flex items-center justify-center" style={{ margin: "0 auto 12px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth={1.75}>
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <p className="text-md font-semibold font-serif text-ink mb-2">
          Queue is empty
        </p>
        <p className="text-base text-ink-3">
          Reported content awaiting review will appear here.
        </p>
      </div>
    </div>
  );
}
