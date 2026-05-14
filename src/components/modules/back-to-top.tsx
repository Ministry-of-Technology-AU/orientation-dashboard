"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const scroller = document.querySelector("main");
    if (!scroller) return;
    const onScroll = () => setVisible(scroller.scrollTop > 300);
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-8 right-8 z-50 flex items-center gap-2 bg-primary-blue text-white text-xs font-semibold px-3.5 py-2 rounded-full shadow-lg hover:bg-primary-blue/90 transition-all duration-200"
    >
      <ArrowUp className="w-3.5 h-3.5" />
      Back to top
    </button>
  );
}
