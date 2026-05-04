import { X, Heart, ExternalLink, Mail } from "lucide-react";
import type { Club } from "@/mock-data/clubs";

interface Props {
  club: Club | null;
  isLiked: boolean;
  onDismiss: (id: string) => void;
  onLike: (id: string) => void;
  onUnlike: (id: string) => void;
}

export function ClubDetailPanel({ club, isLiked, onDismiss, onLike, onUnlike }: Props) {
  if (!club) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-2">
        <p className="text-sm text-gray-400">Select a club to see details</p>
      </div>
    );
  }

  const paragraphs = club.description.split("\n").filter(Boolean);

  return (
    <div className="flex flex-col h-full">
      {/* Cover image */}
      <div className="w-full aspect-[4/3] bg-gray-200 rounded-2xl shrink-0 mb-4" />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <h2 className="text-xl font-bold text-gray-900 mb-3">{club.name}</h2>
        <div className="flex flex-col gap-3 mb-4">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-sm text-gray-600 leading-relaxed">{p}</p>
          ))}
        </div>

        {/* Links */}
        <div className="flex items-center gap-3 mb-4">
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
      <div className="flex gap-3 pt-3 shrink-0 border-t border-gray-100">
        <button
          onClick={() => onDismiss(club.id)}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl py-3 text-sm font-medium transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <button
          onClick={() => (isLiked ? onUnlike(club.id) : onLike(club.id))}
          className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-rose-50 border border-gray-200 hover:border-rose-200 text-gray-600 rounded-2xl py-3 text-sm font-medium transition-colors"
        >
          <Heart
            className="w-4 h-4 transition-colors"
            style={{ color: isLiked ? "#A61017" : undefined, fill: isLiked ? "#A61017" : "none" }}
          />
        </button>
      </div>
    </div>
  );
}
