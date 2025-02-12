import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeToken, isAdmin } from "@/utils/auth.utils";

export function adminAuthMiddleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const decoded = decodeToken(token);
  if (!decoded || !isAdmin(decoded.user)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
