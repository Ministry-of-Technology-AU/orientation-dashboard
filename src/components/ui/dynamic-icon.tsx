import dynamic from 'next/dynamic';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import { FileText, LucideProps } from 'lucide-react';
import { useMemo } from 'react';

// Converts PascalCase or camelCase to kebab-case
// e.g., "CalendarIcon" -> "calendar", "FileText" -> "file-text"
function normalizeIconName(name: string): string {
  let cleanName = name.replace(/Icon$/i, "").trim();
  // Convert to kebab case
  cleanName = cleanName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  return cleanName;
}

interface DynamicIconProps extends LucideProps {
  name: string;
}

// Global cache to prevent React from unmounting/remounting the component on every render
// because calling dynamic() creates a strictly new component type reference in React.
const iconCache = new Map<string, React.ComponentType<LucideProps>>();

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const normalizedName = useMemo(() => normalizeIconName(name), [name]);

  if (!iconCache.has(normalizedName)) {
    // @ts-expect-error dynamicIconImports keys are strictly typed
    const importFn = dynamicIconImports[normalizedName];
    if (importFn) {
      iconCache.set(
        normalizedName,
        dynamic(importFn, {
          loading: () => <div className="w-5 h-5 animate-pulse bg-muted rounded-md" />,
        })
      );
    }
  }

  const IconComponent = iconCache.get(normalizedName);

  if (!IconComponent) {
    return <FileText {...props} />;
  }

  return <IconComponent {...props} />;
}
