import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req: any) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  if (pathname.startsWith("/login")) {
    if (isLoggedIn) return NextResponse.redirect(new URL("/home", req.url));
    return NextResponse.next();
  }
  if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url));

  // Admin-only routes — redirect non-admins to /home
  if (pathname.startsWith("/admin")) {
    const role = req.auth?.user?.role;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/home", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)).*)"],
};
