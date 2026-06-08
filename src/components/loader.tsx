"use client";

import React, { useId, useMemo, memo } from "react";

// ---------------------------------------------------------------------------
// Path generation — pure math, no React dependency
// ---------------------------------------------------------------------------
function getPath(n = 10, cx = 20, cy = 20, A = 9, B = 9, D = 3, steps = 64) {
  const ell = (base: number) => {
    const br = (base * Math.PI) / 180;
    const ecx = cx + D * Math.cos(br);
    const ecy = cy + D * Math.sin(br);
    return Array.from({ length: steps + 1 }, (_, s) => {
      const t = (2 * Math.PI * s) / steps;
      const lx = A * Math.cos(t), ly = B * Math.sin(t);
      return [
        ecx + lx * Math.cos(br) - ly * Math.sin(br),
        ecy + lx * Math.sin(br) + ly * Math.cos(br),
      ];
    });
  };

  const loopPath = (pts: number[][], first: boolean) => {
    let d = first
      ? `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)} `
      : `L${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)} `;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i], p2 = pts[i + 1], p3 = i + 2 < pts.length ? pts[i + 2] : pts[i + 1];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)} `;
    }
    return d;
  };

  return (
    Array.from({ length: n }, (_, i) => loopPath(ell((360 * i) / n - 90), i === 0)).join("") + "z"
  );
}

// Pre-compute the default path once at module load time.
// The vast majority of usages use default params — this makes the first render instant.
const DEFAULT_PATH = getPath();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface LoaderProps {
  /** Size in px. Defaults to 240 (full-page). Use 80 for inline/compact usage. */
  size?: number;
  n?: number;
  cx?: number;
  cy?: number;
  A?: number;
  B?: number;
  D?: number;
  steps?: number;
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------
export const Loader = memo(function Loader({
  size = 240,
  n = 10,
  cx = 20,
  cy = 20,
  A = 9,
  B = 9,
  D = 3,
  steps = 64,
}: LoaderProps) {
  // useId() is SSR-safe and stable across renders; Math.random() is neither
  const rawId = useId();
  // Replace React's `:r0:` colon syntax — colons are invalid in CSS class names
  const id = useMemo(() => `ld-${rawId.replace(/:/g, "")}`, [rawId]);

  // Only recompute the expensive path when shape params actually change.
  // Falls back to the pre-computed default when all params are defaults.
  const isDefault = n === 10 && cx === 20 && cy === 20 && A === 9 && B === 9 && D === 3 && steps === 64;
  const d = useMemo(
    () => (isDefault ? DEFAULT_PATH : getPath(n, cx, cy, A, B, D, steps)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDefault, n, cx, cy, A, B, D, steps]
  );

  // Memoize the CSS string — only rebuilds when id or size changes
  const css = useMemo(() => `
    .${id}-c {
      --uib-size: ${size}px;
      --uib-color: var(--color-primary-red, var(--color-primary));
      --uib-speed: 10.92s;
      --uib-bg-opacity: 0.20;
      height: var(--uib-size);
      width: var(--uib-size);
      transform-origin: center;
      overflow: visible;
      /* Force GPU compositing — animation runs entirely on compositor thread */
      transform: translateZ(0);
      will-change: transform;
    }
    .${id}-car {
      fill: none;
      stroke: var(--uib-color);
      stroke-width: 0.56;
      stroke-dasharray: 2, 98;
      stroke-dashoffset: 0;
      stroke-linecap: round;
      animation: ${id}-travel var(--uib-speed) linear infinite;
      /* stroke-dashoffset is compositor-eligible — no layout/paint cost */
      will-change: stroke-dashoffset;
    }
    .${id}-track {
      fill: none;
      stroke-width: 0.56;
      stroke: var(--uib-color);
      opacity: var(--uib-bg-opacity);
    }
    @keyframes ${id}-travel {
      0%   { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: -100; }
    }
  `, [id, size]);

  // Memoize the dangerouslySetInnerHTML object reference — prevents React
  // from diffing/updating the <style> node unless the CSS string changed
  const styleHtml = useMemo(() => ({ __html: css }), [css]);

  return (
    <>
      <style dangerouslySetInnerHTML={styleHtml} />
      <svg
        className={`${id}-c`}
        viewBox="0 0 40 40"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Loading"
        role="img"
      >
        <path d={d} className={`${id}-track`} />
        <path d={d} pathLength={100} className={`${id}-car`} />
      </svg>
    </>
  );
});

// ---------------------------------------------------------------------------
// PageLoader — convenience full-page wrapper, also memoized
// ---------------------------------------------------------------------------
export const PageLoader = memo(function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <Loader size={240} />
    </div>
  );
});
