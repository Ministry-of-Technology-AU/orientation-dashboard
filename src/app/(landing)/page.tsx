import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LandingClient from "@/components/landing/landing-client";

export default async function LandingPage() {
  let shouldRedirect = false;
  try {
    const session = await auth();
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isOnboarded: true },
      });
      
      if (user?.isOnboarded) {
        shouldRedirect = true;
      }
    }
  } catch (error) {
    console.error("Error in LandingPage:", error);
  }

  if (shouldRedirect) {
    redirect("/home");
  }

  return <LandingClient />;
}

