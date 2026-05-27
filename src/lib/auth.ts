import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Comma-separated list of emails explicitly granted access (set AUTH_ALLOWED_EMAILS in env)
const ALLOWED_EMAILS = (process.env.AUTH_ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAllowedEmail(email: string): boolean {
  const e = email.toLowerCase();
  if (ALLOWED_EMAILS.includes(e)) return true;
  return (
    e.endsWith("@ashoka.edu.in") &&
    (e.includes("_ug2026") || e.includes("_ug25") || e.includes("_ug2023"))
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
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
    async jwt({ token, user }) {
      if (user) {
        /*
        const dbUser = await prisma.user.upsert({
          where: { email: user.email! },
          update: { name: user.name ?? "", avatarUrl: user.image ?? null },
          create: {
            email: user.email!,
            name: user.name ?? "",
            avatarUrl: user.image ?? null,
            role: "student",
          },
        });
        token.id = dbUser.id;
        token.role = dbUser.role;
        */
        
        // Mocking user data for now to bypass database connection
        token.id = user.id || "mock-user-id";
        token.role = "student";
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },
});
