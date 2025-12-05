"use client";

import type { LucideProps } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name: string;
  fallback?: keyof typeof LucideIcons;
}

// Converte nome do ícone para PascalCase (ex: "shopping-cart" -> "ShoppingCart")
function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

export function DynamicIcon({
  name,
  fallback = "Tag",
  ...props
}: DynamicIconProps) {
  const pascalName = toPascalCase(name);
  const IconComponent = (LucideIcons as Record<string, React.ComponentType<LucideProps>>)[pascalName];

  if (IconComponent) {
    return <IconComponent {...props} />;
  }

  // Tenta o nome original (caso já esteja em PascalCase)
  const DirectIcon = (LucideIcons as Record<string, React.ComponentType<LucideProps>>)[name];
  if (DirectIcon) {
    return <DirectIcon {...props} />;
  }

  // Fallback
  const FallbackIcon = (LucideIcons as Record<string, React.ComponentType<LucideProps>>)[fallback];
  return FallbackIcon ? <FallbackIcon {...props} /> : null;
}
