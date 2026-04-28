/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  // In dev (`npm run dev`), Next.js proxies backend paths to the services
  // exposed via compose.dev.yaml:
  //   /api/{identity,forum,bills}/* → direct to each backend container
  //   /uploads/*                    → nginx (serves avatars from the shared volume)
  // In production everything is same-origin behind nginx, so these rewrites
  // are no-ops.
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    return [
      {
        source: "/api/identity/:path*",
        destination: "http://localhost:8081/api/identity/:path*",
      },
      {
        source: "/api/forum/:path*",
        destination: "http://localhost:8082/api/forum/:path*",
      },
      {
        source: "/api/bills/:path*",
        destination: "http://localhost:8083/api/bills/:path*",
      },
      {
        source: "/api/notifications/:path*",
        destination: "http://localhost:8084/api/notifications/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "http://localhost/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
