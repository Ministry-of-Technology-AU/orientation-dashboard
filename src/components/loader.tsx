"use client";

import React, { memo } from "react";
import Script from "next/script";

interface LoaderProps {
  /** Size in px. Defaults to 80. */
  size?: number;
  /** Speed of rotation. Defaults to 0.9. */
  speed?: number | string;
  /** Color of the spiral. Defaults to 'var(--color-primary-red, #A61017)'. */
  color?: string;
  className?: string;
}

// Compact, elegant Loader using l-spiral from ldrs
export const Loader = memo(function Loader({
  size = 64,
  speed = 0.9,
  color = "var(--color-primary-red, #A61017)",
  className = "",
}: LoaderProps) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Load the l-spiral custom element script from CDN */}
      <Script
        src="https://cdn.jsdelivr.net/npm/ldrs/dist/auto/spiral.js"
        type="module"
        strategy="afterInteractive"
      />
      {/* @ts-ignore */}
      <l-spiral
        size={size}
        speed={speed}
        color={color}
      />
    </div>
  );
});

// PageLoader — premium, immersive full-page wrapper
export const PageLoader = memo(function PageLoader() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fade-in duration-300">
      <Loader size={80} speed={1.1} />
      <div className="flex flex-col items-center gap-1.5 text-center">
        <span className="text-sm font-semibold tracking-wider uppercase text-primary-blue/60 dark:text-white/60 animate-pulse">
          Made by TechMin and SLO
        </span>
        <span className="text-[11px] font-medium tracking-normal text-muted-foreground/50">
          Preparing your orientation experience...
        </span>
      </div>
    </div>
  );
});
