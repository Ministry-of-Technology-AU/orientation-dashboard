import { cn } from "@/lib/utils";
import type { Club, ClubType } from "@/mock-data/clubs";

const typeLabel: Record<ClubType, string> = {
  club: "Club",
  society: "Society",
  ministry: "Ministry",
};

export function ClubCard({
  club,
  selected,
  onClick,
}: {
  club: Club;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left bg-white rounded-2xl shadow-sm border transition-all overflow-hidden",
        selected
          ? "border-[#0A3864] ring-1 ring-[#0A3864]/20"
          : "border-gray-100 hover:border-gray-300 hover:shadow-md"
      )}
    >
      {/* Cover image placeholder */}
      <div className="w-full aspect-[4/3] bg-gray-200 rounded-t-2xl" />

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center justify-between gap-1 mb-1">
          <p className="text-sm font-semibold text-gray-900 truncate">{club.name}</p>
          <span className="text-[10px] text-gray-400 shrink-0">{typeLabel[club.type]}</span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">
          {club.description.split("\n")[0]}
        </p>
      </div>
    </button>
  );
}
