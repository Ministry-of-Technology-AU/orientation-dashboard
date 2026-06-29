"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { DashboardFeature } from "@/lib/dashboard-progress";

function featureFromPath(pathname: string): DashboardFeature | null {
  if (pathname === "/home" || pathname.startsWith("/home/")) return "home";
  if (pathname === "/modules" || pathname.startsWith("/modules/")) return "modules";
  if (pathname === "/chat" || pathname.startsWith("/chat/")) return "chat";
  if (pathname === "/calendar" || pathname.startsWith("/calendar/")) return "calendar";
  if (pathname === "/explore" || pathname.startsWith("/explore/")) return "explore";
  return null;
}

export function DashboardProgressTracker() {
  const pathname = usePathname();
  const lastFeatureRef = useRef<DashboardFeature | null>(null);

  useEffect(() => {
    const feature = featureFromPath(pathname);
    if (!feature || feature === lastFeatureRef.current) return;
    lastFeatureRef.current = feature;

    fetch("/api/dashboard/progress", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "visitFeature", feature }),
      keepalive: true,
    }).catch((error) => {
      console.error("Failed to record dashboard feature visit:", error);
    });
  }, [pathname]);

  return null;
}
