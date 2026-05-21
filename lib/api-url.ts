// SERVER_API is used by server components which bypass Next.js rewrites.
// In dev we point back at the Next.js dev server itself (localhost:3000) so
// the rewrites in next.config.mjs handle routing to each backend port —
// the same way browser fetches work. In prod INTERNAL_API_URL is the
// internal Docker hostname injected by compose.yaml.
// CLIENT_API is empty in dev — browser fetches use relative paths that
// Next.js rewrites proxy to the correct backend ports.
const DEV_SERVER_API = "http://localhost:3000";
export const SERVER_API = process.env.INTERNAL_API_URL ?? DEV_SERVER_API;

// Empty in dev — browser fetches use relative paths proxied by Next.js rewrites.
export const CLIENT_API = process.env.NEXT_PUBLIC_API_URL ?? "";
