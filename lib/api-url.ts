// Server components bypass Next.js rewrites and must call backends directly.
// In dev (npm run dev) nginx is on localhost:80; in prod INTERNAL_API_URL is
// injected by compose.yaml. No other fallback — a missing env var in prod
// should throw, not silently resolve to a Docker hostname.
export const SERVER_API =
  process.env.INTERNAL_API_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost" : "");
export const CLIENT_API = process.env.NEXT_PUBLIC_API_URL ?? "";
