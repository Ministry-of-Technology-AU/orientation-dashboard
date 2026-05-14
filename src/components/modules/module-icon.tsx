import {
  BookOpen,
  Shield,
  ShieldCheck,
  Briefcase,
  FileText,
  HeartHandshake,
  GraduationCap,
  Building2,
  Library,
  Monitor,
  Home,
  MapPin,
  LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "book-open": BookOpen,
  "shield": Shield,
  "shield-check": ShieldCheck,
  "briefcase": Briefcase,
  "file-text": FileText,
  "heart-handshake": HeartHandshake,
  "graduation-cap": GraduationCap,
  "building-2": Building2,
  "library": Library,
  "monitor": Monitor,
  "home": Home,
  "map-pin": MapPin,
};

export function ModuleIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] ?? FileText;
  return (
    <div className="w-12 h-12 rounded-xl border-2 border-[#A61017]/20 flex items-center justify-center shrink-0">
      <Icon className={className ?? "w-6 h-6 text-[#A61017]"} strokeWidth={1.5} />
    </div>
  );
}
