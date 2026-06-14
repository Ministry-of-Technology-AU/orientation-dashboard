import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import HomePageClient from "@/components/dashboard/home-page-client";
import { getGuidesMeta } from "@/lib/notion";
import type { GuideMeta } from "@/lib/notion";

// Revalidate this page every 60 seconds (ISR) so new/removed guides
// are picked up automatically without a full redeploy.
export const revalidate = 60;

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user onboarding status
  let isOnboarded = false;
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    isOnboarded = user?.isOnboarded ?? false;
  } catch (error) {
    console.error("Error fetching user in HomePage:", error);
  }

  // Fetch guide metadata from Notion (single API call)
  // Falls back to empty array on error so the page still renders
  let guides: GuideMeta[] = [];
  try {
    guides = await getGuidesMeta();
  } catch (error) {
    console.error("Error fetching guides from Notion:", error);
  }

  return <HomePageClient isOnboarded={isOnboarded} guides={guides} userName={session.user.name ?? null} />;
}
