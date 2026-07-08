import { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight middleware that checks for session cookie existence.
 * Does NOT import auth.ts (which uses Prisma) to avoid Edge Runtime issues.
 *
 * The actual JWT validation happens server-side in auth.ts.
 */
export function middleware(request: NextRequest) {
  const sessionCookie =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  const isLoggedIn = !!sessionCookie;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isPublicPage = pathname === "/";
  const isApiAuth = pathname.startsWith("/api/auth");

  // Allow API auth routes and public files
  if (isApiAuth) {
    return NextResponse.next();
  }

  // Allow public pages and auth pages without session
  if (isPublicPage || isAuthPage) {
    // Redirect logged-in users away from auth pages
    if (isAuthPage && isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (browser icon)
     * - api/auth (NextAuth API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
