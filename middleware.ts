import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/auth/signin" ||
    path === "/auth/signup" ||
    path === "/auth/forgot-password" ||
    path === "/privacy-policy" ||
    path === "/terms-of-service" ||
    path === "/"

  // Get the token from the cookies
  const token = request.cookies.get("next-auth.session-token")?.value || ""

  // If the path is not public and there's no token, redirect to signin
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }

  // If the path is signin or signup and there's a token, redirect to dashboard
  if (isPublicPath && token && (path === "/auth/signin" || path === "/auth/signup")) {
    return NextResponse.redirect(new URL("/feed", request.url))
  }

  return NextResponse.next()
}

// Configure the paths that should be processed by this middleware
export const config = {
  matcher: [
    "/",
    "/feed",
    "/connections",
    "/messages",
    "/jobs",
    "/events",
    "/profile/:path*",
    "/settings",
    "/auth/:path*",
    "/privacy-policy",
    "/terms-of-service",
  ],
}

