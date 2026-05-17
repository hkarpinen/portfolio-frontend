export default function ModLogPage({ params }: { params: { slug: string } }) {
  return (
    <div  className="page-enter flex flex-col gap-12">
      <div>
        <h1 className="font-serif font-extrabold text-2xl tracking-[-0.025em] text-ink mb-2">Moderation Log</h1>
        <p className="text-base text-ink-3">
          {params.slug}
        </p>
      </div>

      <div className="bg-paper py-24 px-12 text-center shadow-stamp" style={{ border: "1.5px solid var(--ink)" }}>
        <div className="w-24 h-24 bg-[rgba(178,42,26,0.10)] flex items-center justify-center" style={{ margin: "0 auto 12px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={1.75}>
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
          </svg>
        </div>
        <p className="text-md font-semibold font-serif text-ink mb-2">
          No moderation actions yet
        </p>
        <p className="text-base text-ink-3">
          Moderation actions will appear here.
        </p>
      </div>
    </div>
  );
}
