// Server components run inside Docker and must reach nginx by container name.
// Client components run in the browser where nginx is at the public URL.
export const SERVER_API = process.env.INTERNAL_API_URL ?? "http://nginx";
export const CLIENT_API = process.env.NEXT_PUBLIC_API_URL ?? "";
