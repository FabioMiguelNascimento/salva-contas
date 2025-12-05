"use client";

import type { LucideProps } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name: string;
  fallback?: keyof typeof LucideIcons;
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

const iconMap = LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>;

export function DynamicIcon({
  name,
  fallback = "Tag",
  ...props
}: DynamicIconProps) {
  const pascalName = toPascalCase(name);
  const IconComponent = iconMap[pascalName];

  if (IconComponent) {
    return <IconComponent {...props} />;
  }

  const DirectIcon = iconMap[name];
  if (DirectIcon) {
    return <DirectIcon {...props} />;
  }

  const FallbackIcon = iconMap[fallback];
  return FallbackIcon ? <FallbackIcon {...props} /> : null;
}
