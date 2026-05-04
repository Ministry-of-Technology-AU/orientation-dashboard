"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { use } from "react";
import { mockModules, getModuleBySlug } from "@/mock-data/modules";
import type { ModuleStatus } from "@/mock-data/modules";
import { ModuleCard } from "@/components/modules/module-card";
import { GamePanelCard } from "@/components/modules/game-panel-card";
import { ModuleStatusBadge } from "@/components/modules/module-status-badge";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

const TABS: { label: string; value: ModuleStatus | "all" }[] = [
  { label: "Complete", value: "completed" },
  { label: "In Progress", value: "in_progress" },
  { label: "Yet To Start", value: "not_started" },
  { label: "All", value: "all" },
];

export default function ModuleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const module = getModuleBySlug(slug);
  if (!module) notFound();

  const [filter, setFilter] = useState<ModuleStatus | "all">("all");
  const otherModules = mockModules.filter((m) => m.slug !== slug);
  const filtered = filter === "all" ? otherModules : otherModules.filter((m) => m.status === filter);

  const gamesLocked = module.readPercent < 80;

  return (
    <div className="flex flex-1 overflow-hidden min-w-0">
      {/* ── Left: module info + other modules ── */}
      <div className="w-[360px] shrink-0 overflow-y-auto px-6 py-6 flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-3">{module.title}</h1>
          <p className="text-sm text-gray-500 leading-relaxed">{module.description}</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Other Modules</h2>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap mb-4">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={cn(
                  "rounded-full border px-3 py-0.5 text-[11px] font-medium transition-colors",
                  filter === tab.value
                    ? "bg-[#0A3864] text-white border-[#0A3864]"
                    : "border-gray-300 text-gray-500 hover:border-[#0A3864]/40"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {filtered.map((m) => (
              <ModuleCard key={m.id} module={m} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: banner + description + games ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4 min-w-0">
        {/* Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-[#0A3864] min-h-[220px] flex items-end">
          {/* Placeholder banner */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-8">
              <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Module Banner</p>
              <p className="text-white text-2xl font-bold leading-tight">{module.title}</p>
            </div>
          </div>
          {/* Gradient overlay for button */}
          <div className="relative z-10 w-full flex justify-end p-5">
            <button className="flex items-center gap-2 bg-white text-gray-900 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg hover:bg-gray-50 transition-colors">
              Go To Module
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Description + Games */}
        <div className="grid grid-cols-[1fr_1fr] gap-4">
          {/* Description */}
          <div className="bg-white rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Description</h3>
              <ModuleStatusBadge status={module.status} />
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{module.description}</p>
          </div>

          {/* Games */}
          <div className="flex flex-col gap-3">
            {module.games.map((game) => (
              <GamePanelCard
                key={game.id}
                game={game}
                moduleSlug={module.slug}
                locked={gamesLocked}
              />
            ))}
            {gamesLocked && (
              <p className="text-[11px] text-gray-400 text-center">
                Read 80% of the module to unlock games ({module.readPercent}% read)
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
