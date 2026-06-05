import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import HomePageClient from "@/components/dashboard/home-page-client";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  const isOnboarded = user?.isOnboarded ?? false;

  return <HomePageClient isOnboarded={isOnboarded} />;
}
