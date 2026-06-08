"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Menu, X, ArrowUp } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { ModuleToc, type TocHeading } from "./module-toc";
import type { MockModule } from "@/mock-data/modules";
import type { Components } from "react-markdown";
import { cn } from "@/lib/utils";

function slugify(text: string): string {
  return text
    .replace(/[*_`#]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function HeadingWithId({ level, children }: { level: 1 | 2 | 3 | 4; children: React.ReactNode }) {
  const text = typeof children === "string"
    ? children
    : Array.isArray(children)
    ? children.map((c) => (typeof c === "string" ? c : "")).join("")
    : "";
  const id = slugify(text);
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4";
  return <Tag id={id}>{children}</Tag>;
}

const mdComponents: Components = {
  h1: ({ children }) => <HeadingWithId level={1}>{children}</HeadingWithId>,
  h2: ({ children }) => <HeadingWithId level={2}>{children}</HeadingWithId>,
  h3: ({ children }) => <HeadingWithId level={3}>{children}</HeadingWithId>,
  h4: ({ children }) => <HeadingWithId level={4}>{children}</HeadingWithId>,
  table: ({ children }) => (
    <div className="overflow-x-auto my-5 rounded-xl border border-primary-blue/10 shadow-sm">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-primary-blue/7">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-primary-blue/8">{children}</tbody>
  ),
  tr: ({ children }) => (
    <tr className="even:bg-primary-blue/3 hover:bg-primary-blue/5 transition-colors">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2.5 text-left text-xs font-bold text-primary-blue whitespace-nowrap border-b border-primary-blue/12">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2.5 text-sm text-primary-blue/70 align-top leading-relaxed border-r border-primary-blue/6 last:border-r-0">
      {children}
    </td>
  ),
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt}
      className="max-w-full h-auto rounded-xl my-6 mx-auto shadow-sm border border-primary-blue/8"
      loading="lazy"
    />
  ),
  code: ({ children }) => (
    <code className="bg-primary-blue/6 text-primary-blue px-1.5 py-0.5 rounded font-mono text-[13px] break-words">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="bg-primary-blue/4 text-primary-blue p-4 rounded-xl font-mono text-xs overflow-x-auto my-4 border border-primary-blue/8 max-w-full">
      {children}
    </pre>
  ),
};

export function ModuleReadClient({
  module,
  content,
  headings,
}: {
  module: MockModule;
  content: string;
  headings: TocHeading[];
}) {
  const haptic = useWebHaptics();
  const mainRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: mainRef });
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length > 0) {
      setActiveId(headings[0].id);
    }
  }, [headings]);

  useEffect(() => {
    const scroller = mainRef.current;
    if (!scroller) return;

    let isShown = false;
    const handleScroll = () => {
      const show = scroller.scrollTop > 300;
      if (show !== isShown) {
        isShown = show;
        setShowBackToTop(show);
      }
    };

    scroller.addEventListener("scroll", handleScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const scroller = mainRef.current;
    if (!scroller || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        root: scroller,
        rootMargin: "-90px 0px -75% 0px",
      }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id: string) => {
    haptic.trigger("selection");
    setIsTocOpen(false);
    setActiveId(id);

    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      
      // Visual flash highlight
      el.classList.add("heading-highlight");
      setTimeout(() => {
        el.classList.remove("heading-highlight");
      }, 1800);
    }
  };

  const scrollToTop = () => {
    haptic.trigger("medium");
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleToc = () => {
    haptic.trigger("light");
    setIsTocOpen(!isTocOpen);
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden relative">
      {/* Top sticky bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-primary-blue/8 px-6 py-4 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href="/modules"
            onClick={() => haptic.trigger("light")}
            className="flex items-center gap-2 text-sm font-medium text-primary-blue/50 hover:text-primary-blue transition-colors active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="h-4 w-px bg-primary-blue/15 shrink-0" />
          <p className="text-sm font-semibold text-primary-blue truncate">{module.title}</p>
        </div>

        {/* Action icons / Mobile TOC trigger */}
        {headings.length > 0 && (
          <button
            onClick={toggleToc}
            className="xl:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary-blue/6 text-primary-blue hover:bg-primary-blue/10 transition-all active:scale-95 cursor-pointer"
          >
            <Menu className="w-3.5 h-3.5" />
            Outline
          </button>
        )}

        {/* Scroll Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-100">
          <motion.div
            className="h-full bg-primary-red origin-left w-full"
            style={{ scaleX: scrollYProgress }}
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto min-w-0 relative h-full"
        >
          <div
            className="flex flex-col items-center py-8 md:py-12 xl:grid xl:items-stretch"
            style={{ gridTemplateColumns: "1fr min(44rem) 1fr" }}
          >
            {/* Left gutter — TOC sits here on desktop, right-aligned so it hugs the article */}
            <div className="hidden xl:block relative">
              <div className="sticky top-10 flex justify-end pr-10">
                <div className="w-44">
                  {/* We map the custom click scrolling to make sure it scroll-margin flashes */}
                  <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
                    <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-primary-blue/30 mb-3 px-1">
                      On this page
                    </p>
                    <nav className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-px bg-primary-blue/10" />
                      <ul className="space-y-px pl-4 relative">
                        {headings.map(({ text, id }) => {
                          const isActive = activeId === id;
                          return (
                            <li key={id} className="relative py-1">
                              {isActive && (
                                <motion.div
                                  layoutId="active-toc-line"
                                  className="absolute left-[-16px] top-0 bottom-0 w-0.5 bg-primary-blue rounded-full"
                                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                              )}
                              <a
                                href={`#${id}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  scrollToHeading(id);
                                }}
                                className={cn(
                                  "block leading-snug transition-colors duration-150 text-[11px]",
                                  isActive
                                    ? "text-primary-blue font-semibold"
                                    : "text-primary-blue/40 hover:text-primary-blue/65"
                                )}
                              >
                                {text}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>

            {/* Center column — article content */}
            <motion.article 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
              className="module-content px-4 xl:px-0 w-full max-w-3xl xl:max-w-none overflow-hidden break-words"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {content}
              </ReactMarkdown>
            </motion.article>

            {/* Right gutter — empty balance column */}
            <div className="hidden xl:block" />
          </div>
        </main>
      </div>

      {/* Mobile Drawer (TOC overlay) for small/tablet screens */}
      <AnimatePresence>
        {isTocOpen && (
          <div className="fixed inset-0 z-40 xl:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.38 }}
              exit={{ opacity: 0 }}
              onClick={toggleToc}
              className="absolute inset-0 bg-[#0A3864]"
            />

            {/* Content Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="absolute right-0 top-0 bottom-0 w-72 max-w-[80vw] bg-white shadow-2xl p-6 flex flex-col z-10 border-l border-primary-blue/10"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold text-primary-blue/30 uppercase tracking-widest">
                  Table of Contents
                </span>
                <button
                  onClick={toggleToc}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-primary-blue/40 hover:text-primary-blue hover:bg-primary-blue/6 transition-colors active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2">
                <nav className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-primary-blue/10" />
                  <ul className="space-y-2 pl-4 relative">
                    {headings.map(({ text, id }) => {
                      const isActive = activeId === id;
                      return (
                        <li key={id} className="relative py-1">
                          {isActive && (
                            <motion.div
                              layoutId="active-toc-line-mobile"
                              className="absolute left-[-16px] top-0 bottom-0 w-0.5 bg-primary-blue rounded-full"
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                          <a
                            href={`#${id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              scrollToHeading(id);
                            }}
                            className={cn(
                              "block leading-snug transition-colors duration-150 text-[12px]",
                              isActive
                                ? "text-primary-blue font-bold"
                                : "text-primary-blue/60 hover:text-primary-blue font-medium"
                            )}
                          >
                            {text}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Back-to-Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-30 flex items-center justify-center gap-1.5 bg-primary-blue text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg hover:bg-primary-blue/90 transition-all active:scale-95 cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Back to top</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
