"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SummaryCardsGridProps {
  children: ReactNode;
  className?: string;
}

export function SummaryCardsGrid({ children, className }: SummaryCardsGridProps) {
  return (
    <section className={cn("grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4", className)}>
      {children}
    </section>
  );
}
