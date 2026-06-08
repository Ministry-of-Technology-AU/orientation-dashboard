"use client";

import { useState } from "react";
import { mockModules } from "@/mock-data/modules";
import type { MockModule, ModuleStatus } from "@/mock-data/modules";
import { ModuleCard } from "@/components/modules/module-card";
import { ModuleModalContent } from "@/components/modules/module-modal";
import { Dialog, DialogContent } from "@/components/motion-primitives/dialog";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useWebHaptics } from "web-haptics/react";

const TABS: { label: string; value: ModuleStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Complete", value: "completed" },
  { label: "In Progress", value: "in_progress" },
  { label: "Yet To Start", value: "not_started" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 22,
    },
  },
} as const;

export default function ModulesPage() {
  const [filter, setFilter] = useState<ModuleStatus | "all">("all");
  const [selected, setSelected] = useState<MockModule | null>(null);
  const haptic = useWebHaptics();

  const filtered = filter === "all" ? mockModules : mockModules.filter((m) => m.status === filter);

  const handleFilterChange = (val: ModuleStatus | "all") => {
    haptic.trigger("selection");
    setFilter(val);
  };

  const handleCardClick = (module: MockModule) => {
    haptic.trigger("medium");
    setSelected(module);
  };

  return (
    <>
      <main className="flex-1 overflow-y-auto px-7 py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Modules</h1>
          <p className="text-sm text-gray-500 mb-6">Complete all mandatory modules to unlock your journey milestones.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex items-center gap-2 mb-5 flex-wrap"
        >
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleFilterChange(tab.value)}
              className={cn(
                "rounded-full border px-3.5 py-1 text-xs font-medium transition-all duration-200 active:scale-95 cursor-pointer",
                filter === tab.value
                  ? "bg-primary-blue text-white border-primary-blue shadow-sm"
                  : "border-gray-300 text-gray-600 hover:border-primary-blue/40 hover:text-primary-blue"
              )}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        <motion.div
          key={filter} // trigger re-animation on tab change
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-3"
        >
          {filtered.map((module) => (
            <motion.div key={module.id} variants={itemVariants}>
              <ModuleCard module={module} onClick={handleCardClick} />
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <motion.p
              variants={itemVariants}
              className="text-sm text-gray-400 text-center py-10"
            >
              No modules in this category.
            </motion.p>
          )}
        </motion.div>
      </main>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="bg-white rounded-2xl w-full max-w-[520px] max-h-[88vh] flex flex-col overflow-hidden border border-primary-blue/8 p-0">
          {selected && (
            <ModuleModalContent module={selected} onClose={() => setSelected(null)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
