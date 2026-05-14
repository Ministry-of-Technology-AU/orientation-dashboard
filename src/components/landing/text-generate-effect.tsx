"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  words: string;
  className?: string;
  delay?: number;       // ms between each character
  startDelay?: number;  // ms before animation starts
}

export function TextGenerateEffect({ words, className, delay = 28, startDelay = 300 }: Props) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed(words.slice(0, i + 1));
        i++;
        if (i >= words.length) clearInterval(interval);
      }, delay);
      return () => clearInterval(interval);
    }, startDelay);

    return () => clearTimeout(timeout);
  }, [words, delay, startDelay]);

  return (
    <span className={cn("inline", className)}>
      {displayed}
      {displayed.length < words.length && (
        <span className="inline-block w-[2px] h-[1em] bg-current align-middle ml-0.5 animate-pulse" />
      )}
    </span>
  );
}
