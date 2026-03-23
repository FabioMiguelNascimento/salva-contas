"use client";

import AiAdvisorCard from "@/components/ai-advisor/AiAdvisorCard";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useFinance } from "@/hooks/use-finance";

interface AiAdvisorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AiAdvisorSheet({ open, onOpenChange }: AiAdvisorSheetProps) {
  const { filters } = useFinance();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full h-dvh sm:w-[96vw] sm:max-w-[860px] p-0 gap-0">
        <SheetHeader className="border-b border-border bg-white/95 px-3 py-4 sm:px-4">
          <SheetTitle>Boletinho</SheetTitle>
          <SheetDescription>
            Converse com o Boletinho e visualize graficos e tabelas dentro do chat.
          </SheetDescription>
        </SheetHeader>
        <SheetBody className="flex-1 min-h-0 p-2 sm:p-3">
          <AiAdvisorCard month={filters.month} year={filters.year} />
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}