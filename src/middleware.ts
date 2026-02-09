import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const portal = request.cookies.get("immogest_portal")?.value;
  const userId = request.cookies.get("immogest_user_id")?.value;

  // Public routes -- always accessible
  if (
    pathname === "/" ||
    pathname.startsWith("/connexion") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/change-password") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Admin routes -- require admin portal cookie
  if (pathname.startsWith("/admin")) {
    if (!portal || !userId || portal !== "admin") {
      return NextResponse.redirect(new URL("/connexion/admin", request.url));
    }
    return NextResponse.next();
  }

  // Client routes -- require client portal cookie
  if (pathname.startsWith("/client")) {
    if (!portal || !userId || portal !== "client") {
      return NextResponse.redirect(new URL("/connexion/client", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
