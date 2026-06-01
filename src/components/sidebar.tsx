"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Home, LayoutDashboard, BookOpen, HelpCircle, Calendar, Compass, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { TourStep } from "@/components/guided-tour";
import { handleSignOut } from "@/app/actions";
import { useWebHaptics } from "web-haptics/react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  {
    icon: Home,
    href: "/home",
    label: "Home",
    tourId: "nav-home",
    tourTitle: "Home",
    tourContent: "Your orientation dashboard — welcome message from SLO, key guides, and everything you need to settle in.",
    tourOrder: 2,
  },
  {
    icon: LayoutDashboard,
    href: "/dashboard",
    label: "Dashboard",
    tourId: "nav-dashboard",
    tourTitle: "Dashboard",
    tourContent: "Track your points, module progress, time activity, and today's events at a glance.",
    tourOrder: 3,
  },
  {
    icon: BookOpen,
    href: "/modules",
    label: "Modules",
    tourId: "nav-modules",
    tourTitle: "Learning Modules",
    tourContent: "Work through orientation modules at your own pace. Complete them to earn points and unlock rewards.",
    tourOrder: 4,
  },
  {
    icon: HelpCircle,
    href: "/chat",
    label: "Chat",
    tourId: "nav-chat",
    tourTitle: "Bijlee AI Chat",
    tourContent: "Got a question about Ashoka? Ask Bijlee — your AI guide is available 24/7 for anything from hostel rules to course registration.",
    tourOrder: 5,
  },
  {
    icon: Calendar,
    href: "/calendar",
    label: "Calendar",
    tourId: "nav-calendar",
    tourTitle: "Events Calendar",
    tourContent: "Stay on top of orientation events, deadlines, and campus activities. Never miss what's happening.",
    tourOrder: 6,
  },
  {
    icon: Compass,
    href: "/explore",
    label: "Explore",
    tourId: "nav-explore",
    tourTitle: "Explore Campus",
    tourContent: "Discover clubs, societies, facilities, and hidden gems around campus. Find your people.",
    tourOrder: 7,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const haptic = useWebHaptics();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="flex flex-col items-center py-5 px-2 h-full gap-1">
      <TourStep
        id="nav-profile"
        title="Your Profile"
        content="View and edit your profile, track your achievements, and personalise your Ashoka journey."
        order={1}
        position="right"
        className="mb-4"
      >
        <div ref={ref} className="relative">
          <button
            onClick={() => {
              haptic.trigger("light");
              setOpen((v) => !v);
            }}
            title="Profile"
          >
            <div className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
              pathname === "/profile" || open
                ? "bg-primary-red shadow-sm"
                : "bg-[#c8d9ec] hover:bg-primary-blue/20"
            )}>
              <User className={cn("w-5 h-5", pathname === "/profile" || open ? "text-white" : "text-primary-blue")} />
            </div>
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: -6 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: -6 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute left-full top-0 ml-3 z-50 bg-white rounded-xl shadow-lg border border-primary-blue/8 py-1.5 w-40 overflow-hidden"
              >
                <Link
                  href="/profile"
                  onClick={() => {
                    haptic.trigger("selection");
                    setOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-primary-blue hover:bg-primary-blue/5 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-primary-blue/50" />
                  My Profile
                </Link>
                <div className="my-1 h-px bg-primary-blue/6" />
                <form action={handleSignOut}>
                  <button
                    type="submit"
                    onClick={() => haptic.trigger("medium")}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-primary-red hover:bg-primary-red/5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </TourStep>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ icon: Icon, href, label, tourId, tourTitle, tourContent, tourOrder }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <TourStep
              key={href}
              id={tourId}
              title={tourTitle}
              content={tourContent}
              order={tourOrder}
              position="right"
            >
              <Link
                href={href}
                title={label}
                onClick={() => haptic.trigger("selection")}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative z-0",
                  isActive
                    ? "text-white shadow-sm"
                    : "text-primary-blue/50 hover:bg-primary-blue/10 hover:text-primary-blue"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeSidebarTab"
                    className="absolute inset-0 bg-primary-red rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="w-4.5 h-4.5" />
              </Link>
            </TourStep>
          );
        })}
      </nav>
    </div>
  );
}
