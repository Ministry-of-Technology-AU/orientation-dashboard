"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, HelpCircle, Calendar, Compass, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, href: "/dashboard", label: "Dashboard" },
  { icon: BookOpen, href: "/modules", label: "Modules" },
  { icon: HelpCircle, href: "/chat", label: "Chat" },
  { icon: Calendar, href: "/calendar", label: "Calendar" },
  { icon: Compass, href: "/explore", label: "Explore" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col items-center py-5 px-2 h-full gap-1">
      <div className="mb-4 p-2">
        <div className="w-9 h-9 rounded-full bg-[#c8d9ec] flex items-center justify-center">
          <User className="w-5 h-5 text-[#0A3864]" />
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ icon: Icon, href, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                isActive
                  ? "bg-[#A61017] text-white shadow-sm"
                  : "text-[#0A3864]/50 hover:bg-[#0A3864]/10 hover:text-[#0A3864]"
              )}
            >
              <Icon className="w-[18px] h-[18px]" />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
