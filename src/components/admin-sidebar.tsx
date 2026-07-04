"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  HelpCircle,
  BookOpen,
  Users,
  BarChart2,
  Building2,
  User,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { handleSignOut } from "@/app/actions";
import { useWebHaptics } from "web-haptics/react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const adminNavItems = [
  { icon: LayoutDashboard, href: "/admin", label: "Overview", exact: true },
  { icon: HelpCircle,      href: "/admin/faq",       label: "FAQ" },
  { icon: BookOpen,        href: "/admin/modules",   label: "Modules" },
  { icon: Users,           href: "/admin/buddies",   label: "Buddies" },
  { icon: Building2,       href: "/admin/clubs",     label: "Clubs" },
  { icon: BarChart2,       href: "/admin/analytics", label: "Analytics" },
];

interface AdminSidebarProps {
  orientation?: "vertical" | "horizontal";
}

export function AdminSidebar({ orientation = "vertical" }: AdminSidebarProps) {
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

  const isVertical = orientation === "vertical";

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  const profileButton = (
    <div ref={ref} className={cn("relative", open && "z-50")}>
      <Tooltip open={open ? false : undefined}>
        <TooltipTrigger
          render={
            <button
              onClick={() => {
                haptic.trigger("light");
                setOpen((v) => !v);
              }}
              className="cursor-pointer active:scale-95 transition-transform"
            />
          }
        >
          <div
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
              open ? "bg-primary-red shadow-sm" : "bg-[#c8d9ec] hover:bg-primary-blue/20"
            )}
          >
            <User className={cn("w-5 h-5", open ? "text-white" : "text-primary-blue")} />
          </div>
        </TooltipTrigger>
        <TooltipContent side={isVertical ? "right" : "top"}>
          Account
        </TooltipContent>
      </Tooltip>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={isVertical ? { opacity: 0, scale: 0.95, x: -6 } : { opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={isVertical ? { opacity: 0, scale: 0.95, x: -6 } : { opacity: 0, scale: 0.95, y: 6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute z-50 bg-white rounded-xl shadow-lg border border-primary-blue/8 py-1.5 w-44 overflow-hidden",
              isVertical ? "left-full top-0 ml-3" : "bottom-full right-0 mb-3"
            )}
          >
            <div className="px-4 py-2 border-b border-primary-blue/6 mb-1">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-primary-blue/30">
                Admin
              </p>
            </div>
            <form action={handleSignOut}>
              <button
                type="submit"
                onClick={() => haptic.trigger("medium")}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-primary-red hover:bg-primary-red/5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex w-full items-center",
          isVertical ? "flex-col py-5 px-2 h-full gap-1" : "flex-row py-1 px-2 justify-between gap-1"
        )}
      >
        {isVertical && <div className="mb-4">{profileButton}</div>}

        <nav className={cn("flex gap-1", isVertical ? "flex-col flex-1" : "flex-row flex-1 justify-around")}>
          {adminNavItems.map(({ icon: Icon, href, label, exact }) => {
            const active = isActive(href, exact);
            return (
              <Tooltip key={href}>
                <TooltipTrigger
                  render={
                    <Link
                      href={href}
                      onClick={() => haptic.trigger("selection")}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all relative z-0 active:scale-95 cursor-pointer",
                        active
                          ? "text-white shadow-sm"
                          : "text-primary-blue/55 hover:bg-primary-blue/10 hover:text-primary-blue"
                      )}
                    />
                  }
                >
                  {active && (
                    <motion.span
                      layoutId={isVertical ? "activeAdminTabVertical" : "activeAdminTabHorizontal"}
                      className="absolute inset-0 bg-primary-red rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className="w-4.5 h-4.5" />
                </TooltipTrigger>
                <TooltipContent side={isVertical ? "right" : "top"}>
                  {label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {!isVertical && <div className="ml-2">{profileButton}</div>}
      </div>
    </TooltipProvider>
  );
}
