"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/text-utils";
import { cn } from "@/lib/utils";

export interface UserInitialsProps {
  name?: string | null;
  email?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  bgClass?: string;
  textClass?: string;
}

export default function UserInitials({ name, email, size = "md", className, bgClass, textClass }: UserInitialsProps) {
  const initials = getInitials(name, email);
  const sizeClass = size === "sm" ? "size-6" : size === "lg" ? "size-10" : "size-8";

  const defaultBg = bgClass ?? "bg-primary";
  const defaultText = textClass ?? "text-primary-foreground";

  const rootClass = cn(sizeClass, defaultBg, className);
  const fallbackClass = cn("bg-transparent", defaultText);

  return (
    <Avatar className={rootClass}>
      <AvatarFallback className={fallbackClass}>{initials}</AvatarFallback>
    </Avatar>
  );
}
