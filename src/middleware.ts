import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/login")) {
    if (isLoggedIn) return Response.redirect(new URL("/home", req.url));
    return;
  }

  if (!isLoggedIn) return Response.redirect(new URL("/login", req.url));
});

export const config = {
  // Run on every route except NextAuth's own API routes, static files, and images
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)).*)"],
};
