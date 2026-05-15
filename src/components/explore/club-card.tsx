import { cn } from "@/lib/utils";
import type { Club, ClubType } from "@/mock-data/clubs";
import { Heart, X } from "lucide-react";

const typeLabel: Record<ClubType, string> = {
  club: "Club",
  society: "Society",
  ministry: "Ministry",
};

export function ClubCard({
  club,
  selected,
  swipeStatus,
  onClick,
}: {
  club: Club;
  selected?: boolean;
  swipeStatus?: "liked" | "dismissed";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left bg-white rounded-2xl shadow-sm border transition-all overflow-hidden relative",
        selected
          ? "border-blue-500 ring-2 ring-blue-500/20"
          : "border-gray-100 hover:border-gray-300 hover:shadow-md",
        swipeStatus === "dismissed" && "opacity-60 grayscale-[0.5]"
      )}
    >
      {/* Cover image placeholder */}
      <div className="w-full aspect-[4/3] bg-gray-200 rounded-t-2xl relative">
        {swipeStatus === 'liked' && (
           <div className="absolute top-2 right-2 bg-rose-500 text-white p-1 rounded-full shadow-md">
              <Heart className="w-3 h-3 fill-current" />
           </div>
        )}
      </div>

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
