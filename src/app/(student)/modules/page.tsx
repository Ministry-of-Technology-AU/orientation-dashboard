"use client";

import { useState } from "react";
import { mockModules } from "@/mock-data/modules";
import type { MockModule, ModuleStatus } from "@/mock-data/modules";
import { ModuleCard } from "@/components/modules/module-card";
import { ModuleModal } from "@/components/modules/module-modal";
import { cn } from "@/lib/utils";

const TABS: { label: string; value: ModuleStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Complete", value: "completed" },
  { label: "In Progress", value: "in_progress" },
  { label: "Yet To Start", value: "not_started" },
];

export default function ModulesPage() {
  const [filter, setFilter] = useState<ModuleStatus | "all">("all");
  const [selected, setSelected] = useState<MockModule | null>(null);
  const filtered = filter === "all" ? mockModules : mockModules.filter((m) => m.status === filter);

  return (
    <>
      <main className="flex-1 overflow-y-auto px-7 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Modules</h1>
        <p className="text-sm text-gray-500 mb-6">Complete all mandatory modules to unlock your journey milestones.</p>

        <div className="flex items-center gap-2 mb-5 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                "rounded-full border px-3.5 py-1 text-xs font-medium transition-colors",
                filter === tab.value
                  ? "bg-primary-blue text-white border-primary-blue"
                  : "border-gray-300 text-gray-600 hover:border-primary-blue/40 hover:text-primary-blue"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {filtered.map((module) => (
            <ModuleCard key={module.id} module={module} onClick={setSelected} />
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-10">No modules in this category.</p>
          )}
        </div>
      </main>

      {selected && (
        <ModuleModal module={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
