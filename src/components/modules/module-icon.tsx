import {
  BookOpen,
  Shield,
  Briefcase,
  FileText,
  HeartHandshake,
  GraduationCap,
  LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "book-open": BookOpen,
  "shield": Shield,
  "briefcase": Briefcase,
  "file-text": FileText,
  "heart-handshake": HeartHandshake,
  "graduation-cap": GraduationCap,
};

export function ModuleIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] ?? FileText;
  return (
    <div className="w-12 h-12 rounded-xl border-2 border-[#A61017]/20 flex items-center justify-center shrink-0">
      <Icon className={className ?? "w-6 h-6 text-[#A61017]"} strokeWidth={1.5} />
    </div>
  );
}
