import { cn } from "@/lib/utils";
import type { Club, ClubType } from "@/mock-data/clubs";
import { Heart } from "lucide-react";

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
          ? "border-primary-blue ring-2 ring-primary-blue/15"
          : "border-primary-blue/8 hover:border-primary-blue/20 hover:shadow-md",
        swipeStatus === "dismissed" && "opacity-60 grayscale-[0.5]"
      )}
    >
      {/* Cover image placeholder */}
      <div 
        className="w-full aspect-4/3 rounded-t-2xl relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, hsl(${(club.name.charCodeAt(0) * 13) % 360}, 80%, 45%), hsl(${(club.name.charCodeAt(club.name.length - 1) * 27) % 360}, 80%, 30%))`
        }}
      >
        <div className="absolute inset-0 bg-black/10" />
        {swipeStatus === 'liked' && (
           <div className="absolute top-3 right-3 bg-primary-red text-white p-1.5 rounded-full shadow-md z-10 animate-in zoom-in duration-200">
              <Heart className="w-3 h-3 fill-current" />
           </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center justify-between gap-1 mb-1">
          <p className="text-sm font-semibold text-primary-blue truncate">{club.name}</p>
          <span className="text-[10px] text-primary-blue/40 shrink-0">{typeLabel[club.type]}</span>
        </div>
        <p className="text-xs text-primary-blue/50 leading-relaxed line-clamp-4">
          {club.description.split("\n")[0]}
        </p>
      </div>
    </button>
  );
}
