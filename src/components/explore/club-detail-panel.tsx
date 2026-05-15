import { X, Heart, ExternalLink, Mail } from "lucide-react";
import type { Club } from "@/mock-data/clubs";

interface Props {
  club: Club;
  isLiked: boolean;
  onDismiss: (id: string) => void;
  onLike: (id: string) => void;
  onUnlike: (id: string) => void;
}

export function ClubDetailPanel({ club, isLiked, onDismiss, onLike, onUnlike }: Props) {
  const paragraphs = club.description.split("\n").filter(Boolean);

  return (
    <>
      {/* Cover image */}
      <div className="w-full aspect-[4/3] bg-gray-200 rounded-2xl shrink-0 mb-4" />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-2 flex flex-col items-center text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-3">{club.name}</h2>
        <div className="flex flex-col gap-3 mb-4">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-sm text-gray-600 leading-relaxed">{p}</p>
          ))}
        </div>

        {/* Links */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <a
            href={`mailto:${club.contactEmail}`}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#0A3864] transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            {club.contactEmail}
          </a>
          {club.instagramUrl && (
            <a
              href={club.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#A61017] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Instagram
            </a>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-4 shrink-0 border-t border-gray-200/50 mt-2">
        <button
          onClick={() => onDismiss(club.id)}
          className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-xl py-3 text-sm font-medium transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>
        <button
          onClick={() => isLiked ? onUnlike(club.id) : onLike(club.id)}
          className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-rose-50 border border-gray-200 hover:border-rose-200 text-gray-600 rounded-xl py-3 text-sm font-medium transition-colors shadow-sm"
        >
          <Heart
            className="w-5 h-5 transition-colors"
            style={{ color: isLiked ? "#A61017" : undefined, fill: isLiked ? "#A61017" : "none" }}
          />
        </button>
      </div>
    </>
  );
}
