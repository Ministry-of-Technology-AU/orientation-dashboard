import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import HomePageClient from "@/components/dashboard/home-page-client";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  let isOnboarded = false;
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    isOnboarded = user?.isOnboarded ?? false;
  } catch (error) {
    console.error("Error fetching user in HomePage:", error);
  }

  return <HomePageClient isOnboarded={isOnboarded} />;
}

