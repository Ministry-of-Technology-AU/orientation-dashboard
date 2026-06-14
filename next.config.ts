import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  // 1. Output a standalone directory for lightweight production deployments.
  // Next.js will copy only the necessary files/dependencies, reducing deployment size.
  output: "standalone",

  // 2. Next.js image remote hosts
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },

  // 3. Skip type-checking during production build.
  // Type-checking is extremely memory-heavy and often triggers Out-Of-Memory (OOM) failures.
  typescript: {
    ignoreBuildErrors: true,
  },

  // 4. Disable production browser source maps.
  // Ensures source map generation does not consume extra memory or bloat the bundle.
  productionBrowserSourceMaps: false,

  // 5. Run Webpack compilation inside the main process rather than spawning separate workers.
  // Slightly slower build times, but vastly reduces peak memory consumption.
  experimental: {
    webpackBuildWorker: false,
  },
};

export default process.env.ANALYZE === "true"
  ? withBundleAnalyzer({ enabled: true })(nextConfig)
  : nextConfig;
