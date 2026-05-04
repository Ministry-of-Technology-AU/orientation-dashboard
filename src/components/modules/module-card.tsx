import Link from "next/link";
import type { MockModule } from "@/mock-data/modules";
import { ModuleStatusBadge } from "./module-status-badge";
import { ModuleIcon } from "./module-icon";

export function ModuleCard({ module }: { module: MockModule }) {
  return (
    <Link href={`/modules/${module.slug}`}>
      <div className="bg-white rounded-2xl p-4 flex gap-4 items-start hover:shadow-md transition-shadow cursor-pointer">
        <ModuleIcon name={module.iconName} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900 leading-snug">{module.title}</h3>
            <ModuleStatusBadge status={module.status} className="shrink-0 mt-0.5" />
          </div>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{module.description}</p>
        </div>
      </div>
    </Link>
  );
}
