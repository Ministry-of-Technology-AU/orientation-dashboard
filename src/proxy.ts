import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const STUDENT_ROUTES = ["/home", "/dashboard", "/modules", "/chat", "/calendar", "/explore", "/profile"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Protect student routes
  const isStudentRoute = STUDENT_ROUTES.some((r) => pathname.startsWith(r));
  if (isStudentRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Already logged in, don't let them see login page
  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/home", req.url));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
