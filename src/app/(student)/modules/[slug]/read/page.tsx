"use server";

import { notFound } from "next/navigation";
import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";
import { getModuleBySlug } from "@/mock-data/modules";
import { ArrowLeft } from "lucide-react";
import { ModuleReadClient } from "@/components/modules/module-read-client";
import type { TocHeading } from "@/components/modules/module-toc";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseModulesStatus, getEntry } from "@/lib/module-progress";

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
  const wordCount = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;

  // Read persisted progress so a returning reader isn't re-tracked.
  const session = await auth();
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { modulesStatus: true },
      })
    : null;
  const entry = getEntry(parseModulesStatus(user?.modulesStatus), module.id);

  if (!content) {
    return (
      <main className="flex-1 overflow-y-auto min-w-0 relative bg-neutral-50/50">
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
      </main>
    );
  }

  return (
    <ModuleReadClient
      module={module}
      content={content}
      headings={headings}
      moduleId={module.id}
      alreadyRead={!!entry.isRead}
      wordCount={wordCount}
      initialProgress={{
        readSeconds: entry.readSeconds ?? 0,
        seenSections: entry.seenSections ?? [],
        readPercent: entry.readPercent ?? 0,
        reachedEnd: entry.reachedEnd ?? false,
      }}
    />
  );
}
