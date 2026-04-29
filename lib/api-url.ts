// SERVER_API is used by server components which bypass Next.js rewrites.
// In dev this points at nginx (localhost:80). In prod INTERNAL_API_URL is the
// internal Docker hostname injected by compose.yaml.
// CLIENT_API is empty in dev — browser fetches use relative paths that
// Next.js rewrites proxy to the correct backend ports.
// In prod INTERNAL_API_URL is injected by compose.yaml. In dev, server
// components call nginx directly on localhost:80.
const DEV_SERVER_API = "http://localhost";
export const SERVER_API = process.env.INTERNAL_API_URL ?? DEV_SERVER_API;

// Empty in dev — browser fetches use relative paths proxied by Next.js rewrites.
export const CLIENT_API = process.env.NEXT_PUBLIC_API_URL ?? "";
