"use client";

import { useEffect, useState } from "react";

export interface TocHeading {
  level: number;
  text: string;
  id: string;
}

export function ModuleToc({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-10% 0px -80% 0px", threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="max-h-[calc(100vh-6rem)] overflow-y-auto">
        <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-primary-blue/30 mb-3 px-1">
          On this page
        </p>
        <nav className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-primary-blue/10" />
          <ul className="space-y-px pl-4">
            {headings.map(({ text, id }) => {
              const isActive = activeId === id;
              return (
                <li key={id}>
                  {isActive && (
                    <span className="absolute left-0 w-px bg-primary-red rounded-full transition-all duration-200"
                      style={{ height: "1.5rem" }}
                    />
                  )}
                  <a
                    href={`#${id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={[
                      "block py-1 leading-snug transition-colors duration-150 text-[11px]",
                      isActive
                        ? "text-primary-red font-semibold"
                        : "text-primary-blue/40 hover:text-primary-blue/65",
                    ].join(" ")}
                  >
                    {text}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
  );
}
