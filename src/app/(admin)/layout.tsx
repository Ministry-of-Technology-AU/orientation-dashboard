import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/home");

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:block m-3 mr-0 shrink-0 relative z-10">
        <div className="bg-blue-tint/80 backdrop-blur-sm rounded-2xl h-full w-15 flex flex-col">
          <AdminSidebar orientation="vertical" />
        </div>
      </div>

      {/* Page content */}
      <div className="flex flex-1 overflow-hidden min-w-0 pb-16 md:pb-0">
        {children}
      </div>

      {/* Mobile bottom dock */}
      <div className="md:hidden fixed bottom-3 inset-x-3 z-40">
        <div className="bg-blue-tint/90 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg flex items-center justify-around">
          <AdminSidebar orientation="horizontal" />
        </div>
      </div>
    </div>
  );
}
