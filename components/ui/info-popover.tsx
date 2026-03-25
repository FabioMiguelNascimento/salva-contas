"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";

interface InfoPopoverProps {
  content: string;
  className?: string;
}

export function InfoPopover({ content, className }: InfoPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 w-6 p-0 hover:bg-gray-100 ${className}`}
          aria-label="Informações"
        >
          <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" side="top">
        <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
      </PopoverContent>
    </Popover>
  );
}
