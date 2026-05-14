"use server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { getModuleBySlug } from "@/mock-data/modules";
import { ArrowLeft } from "lucide-react";
import { ModuleToc, type TocHeading } from "@/components/modules/module-toc";
import { BackToTop } from "@/components/modules/back-to-top";

function slugify(text: string): string {
  return text
    .replace(/[*_`#]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function extractHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = [];
  for (const line of markdown.split("\n")) {
    const m = line.match(/^(#{1,4})\s+(.+)$/);
    if (m) {
      const text = m[2].replace(/\*\*/g, "").replace(/[*_`]/g, "").trim();
      headings.push({ level: m[1].length, text, id: slugify(text) });
    }
  }
  return headings;
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
};

export default async function ModuleReadPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const module = getModuleBySlug(slug);
  if (!module) notFound();

  const mdPath = path.join(process.cwd(), "public", "modules", `${slug}.md`);
  let content: string | null = null;
  try {
    content = await fs.readFile(mdPath, "utf-8");
  } catch {
    // no markdown file for this module yet
  }

  const headings = content ? extractHeadings(content).filter((h) => h.level === 2) : [];

  return (
    <main className="flex-1 overflow-y-auto min-w-0 relative">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-primary-blue/8 px-8 py-4 flex items-center gap-4">
        <Link
          href="/modules"
          className="flex items-center gap-2 text-sm font-medium text-primary-blue/50 hover:text-primary-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to modules
        </Link>
        <div className="h-4 w-px bg-primary-blue/15" />
        <p className="text-sm font-semibold text-primary-blue truncate">{module.title}</p>
      </div>

      {content ? (
        <div
          className="grid py-10"
          style={{ gridTemplateColumns: "1fr min(44rem, 92%) 1fr" }}
        >
          {/* Left gutter — TOC sits here, right-aligned so it hugs the article */}
          <div className="hidden xl:block relative">
            <div className="sticky top-20 flex justify-end pr-10">
              <div className="w-44">
                <ModuleToc headings={headings} />
              </div>
            </div>
          </div>

          {/* Center column — article, naturally centered by the grid */}
          <article className="module-content px-4 xl:px-0">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {content}
            </ReactMarkdown>
          </article>

          {/* Right gutter — empty balance column */}
          <div />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-blue/6 flex items-center justify-center mb-4">
            <span className="text-2xl">📄</span>
          </div>
          <p className="text-base font-semibold text-primary-blue mb-2">Content coming soon</p>
          <p className="text-sm text-primary-blue/40 max-w-xs">
            The reading material for this module hasn&apos;t been uploaded yet. Check back closer to orientation.
          </p>
          <Link
            href="/modules"
            className="mt-6 text-sm font-medium text-primary-blue/50 hover:text-primary-blue transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to modules
          </Link>
        </div>
      )}

      <BackToTop />
    </main>
  );
}
