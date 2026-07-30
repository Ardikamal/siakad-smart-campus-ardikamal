import { NextResponse, type NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * Runs before every request to a protected path. Next.js middleware
 * executes on the Edge runtime, so we verify the JWT directly here
 * (jose works on Edge) rather than importing anything Node-only.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  const isAdminRoute = pathname.startsWith("/admin");
  const isMahasiswaRoute = pathname.startsWith("/mahasiswa");
  const isLoginRoute = pathname === "/login";

  // Not logged in but hitting a protected area -> bounce to login.
  if ((isAdminRoute || isMahasiswaRoute) && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in but role doesn't match the area they're trying to reach.
  if (isAdminRoute && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isMahasiswaRoute && session?.role !== "MAHASISWA") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Already logged in and visiting /login -> send them straight to their dashboard.
  if (isLoginRoute && session) {
    const target = session.role === "ADMIN" ? "/admin/dashboard" : "/mahasiswa/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/mahasiswa/:path*", "/login"],
};
