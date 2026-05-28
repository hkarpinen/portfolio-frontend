import { SearchClient } from "./search-client";

export const dynamic = "force-dynamic";

/**
 * Server component (audit §3.3). Only the search input + results list
 * need React state and an effect; the heading and subtitle are pure JSX
 * and now stay off the JS bundle. The page route segment itself remains
 * dynamic so the search box still renders on every navigation.
 */
export default function SearchPage() {
  return (
    <div className="page-enter flex flex-col gap-12">
      <div>
        <h1 className="m-0 font-serif text-4xl font-bold leading-none tracking-snug text-ink">
          Search
        </h1>
        <p className="mt-2 text-md text-ink-3">Find threads and communities</p>
      </div>

      <SearchClient />
    </div>
  );
}
