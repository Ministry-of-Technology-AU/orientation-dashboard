import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminFaqClient } from "./faq-client";

export default async function AdminFaqPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/home");

  return (
    <div className="flex flex-1 overflow-hidden min-w-0">
      <AdminFaqClient />
    </div>
  );
}
