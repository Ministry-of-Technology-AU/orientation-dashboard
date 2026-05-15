import { X, Heart, ExternalLink, Mail, Info } from "lucide-react";
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

  // Generate a predictable gradient based on club name length/chars
  const hue1 = (club.name.charCodeAt(0) * 13) % 360;
  const hue2 = (club.name.charCodeAt(club.name.length - 1) * 27) % 360;

  return (
    <>
      {/* Immersive Background / Image Placeholder */}
      <div 
        className="absolute inset-0 z-0 bg-neutral-900"
        style={{
          background: `linear-gradient(135deg, hsl(${hue1}, 80%, 30%), hsl(${hue2}, 80%, 15%))`
        }}
      >
        {/* Subtle noise/texture overlay could go here */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full w-full justify-end p-6 pb-28">
        <div className="flex gap-2 flex-wrap mb-3">
          {club.interestTags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/90 text-xs font-semibold tracking-wide uppercase">
              {tag}
            </span>
          ))}
        </div>

        <h2 className="text-4xl font-black text-white mb-2 tracking-tight leading-none drop-shadow-md">
          {club.name}
        </h2>
        
        <div className="flex items-center gap-4 mb-4">
          <a
            href={`mailto:${club.contactEmail}`}
            className="flex items-center gap-1.5 text-xs font-medium text-white/70 hover:text-white transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email Us
          </a>
          {club.instagramUrl && (
            <a
              href={club.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-white/70 hover:text-rose-400 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Instagram
            </a>
          )}
        </div>

        {/* Scrollable Description inside the card */}
        <div className="overflow-y-auto max-h-[160px] pr-3 custom-scrollbar mb-2 space-y-3">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-sm text-white/80 leading-relaxed font-medium">
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-6 px-8">
        <button
          onClick={() => onDismiss(club.id)}
          className="w-16 h-16 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white rounded-full transition-all active:scale-90 shadow-xl"
        >
          <X className="w-8 h-8" />
        </button>
        <button
          onClick={() => isLiked ? onUnlike(club.id) : onLike(club.id)}
          className="w-16 h-16 flex items-center justify-center bg-rose-500 hover:bg-rose-400 border border-rose-400 text-white rounded-full transition-all active:scale-90 shadow-xl shadow-rose-500/30"
        >
          <Heart
            className="w-8 h-8"
            style={{ fill: "currentColor" }}
          />
        </button>
      </div>
    </>
  );
}
