import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Add custom middleware logic here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Protect all routes under /dashboard and /api (except auth endpoints)
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/:path*",
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}; 