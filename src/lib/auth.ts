import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Comma-separated list of emails explicitly granted access (set AUTH_ALLOWED_EMAILS in env)
const ALLOWED_EMAILS = (process.env.AUTH_ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

function isAllowedEmail(email: string): boolean {
  const e = email.toLowerCase();
  if (ALLOWED_EMAILS.includes(e)) return true;
  return (
    e.endsWith("@ashoka.edu.in") &&
    (e.includes("_ug2026") || e.includes("_ug25") || e.includes("_ug2023"))
  );
}

const { handlers, auth: nextAuth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      return isAllowedEmail(user.email ?? "");
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id || "mock-user-id";
        token.role = isAdminEmail(user.email ?? "") ? "admin" : "student";
      }
      // Capture the Google ID token on first sign-in (account is only present then)
      if (account?.id_token) {
        token.googleIdToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      // Expose the ID token for server-side use in API routes
      session.googleIdToken = token.googleIdToken as string | undefined;
      return session;
    },
  },
});

const auth = Object.assign(
  function auth(...args: any[]) {
    // If arguments are passed, we are wrapping a middleware/route handler.
    if (args.length > 0) {
      return (nextAuth as any)(...args);
    }
    // Otherwise, return the real session (null if not signed in).
    return nextAuth();
  },
  nextAuth
);

export { handlers, auth, signIn, signOut };

