import { Sidebar } from "@/components/sidebar";
import { TourProvider } from "@/components/guided-tour";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Ensure user exists in database and fetch flags
  let dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: session.user.id,
        name: session.user.name || "Ashokan Student",
        email: session.user.email || "",
      },
    });
  }

  return (
    <TourProvider
      autoStart
      ranOnce
      storageKey="orientation-hub-tour-v1"
      initialTourComplete={dbUser.isTourComplete}
      initialOnboarded={dbUser.isOnboarded}
    >
      <div className="flex flex-col md:flex-row h-screen overflow-hidden">
        {/* Desktop Collapsed Sidebar */}
        <div className="hidden md:block m-3 mr-0 shrink-0">
          <div className="bg-blue-tint/80 backdrop-blur-sm rounded-2xl h-full w-15 flex flex-col">
            <Sidebar orientation="vertical" />
          </div>
        </div>

        {/* Content fills the rest */}
        <div className="flex flex-1 overflow-hidden min-w-0 pb-16 md:pb-0">
          {children}
        </div>

        {/* Mobile Bottom Dock */}
        <div className="md:hidden fixed bottom-3 inset-x-3 z-40">
          <div className="bg-blue-tint/90 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg flex items-center justify-around">
            <Sidebar orientation="horizontal" />
          </div>
        </div>
      </div>
    </TourProvider>
  );
}

