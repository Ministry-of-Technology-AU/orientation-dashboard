"use client";

import { TempLoader } from "@/components/temp-loader";

export default function TestLoaderPage() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#ffffffff",
      color: "#3b82f6"
    }}>
      <TempLoader />
    </div>
  );
}
