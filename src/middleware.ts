import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage =
    req.nextUrl.pathname === "/login" ||
    req.nextUrl.pathname === "/register";
  const isPublicPage = req.nextUrl.pathname === "/";

  // Allow public pages and auth pages without session
  if (isPublicPage || isAuthPage) {
    // Redirect logged-in users away from auth pages
    if (isAuthPage && isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!isLoggedIn) {
    const callbackUrl = encodeURIComponent(req.nextUrl.pathname);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, req.url),
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (browser icon)
     * - api/auth (NextAuth API routes)
     * - api/register (public register endpoint)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth|api/auth/register).*)",
  ],
};
