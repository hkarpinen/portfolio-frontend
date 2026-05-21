import { createReadStream, existsSync, statSync } from "fs";
import path from "path";
import { Readable } from "stream";
import { NextRequest, NextResponse } from "next/server";

// In dev, uploads are bind-mounted from infra/uploads/ into the backend
// containers and written there. UPLOADS_DIR points at that local folder so
// Next.js can serve them without nginx.
// In prod this route is never reached — nginx serves /uploads/* directly.
const UPLOADS_DIR =
  process.env.UPLOADS_DIR ??
  path.resolve(process.cwd(), "../infra/uploads");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const relative = slug.join("/");

  // Prevent path traversal
  const resolved = path.resolve(UPLOADS_DIR, relative);
  if (!resolved.startsWith(path.resolve(UPLOADS_DIR))) {
    return new NextResponse(null, { status: 403 });
  }

  if (!existsSync(resolved)) {
    return new NextResponse(null, { status: 404 });
  }

  const stat = statSync(resolved);
  if (!stat.isFile()) {
    return new NextResponse(null, { status: 404 });
  }

  const ext = path.extname(resolved).toLowerCase();
  const contentType = MIME[ext] ?? "application/octet-stream";

  const stream = createReadStream(resolved);
  return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(stat.size),
      "Cache-Control": "public, max-age=3600",
    },
  });
}
