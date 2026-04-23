import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/settings/:path*",
    "/dashboard/:path*",
    "/households/:path*",
    "/income/:path*",
    "/communities/new",
    "/communities/:slug/threads/new",
    "/search/:path*",
    "/profile/:path*",
  ],
};
