"use client";

import { DynamicIcon } from "@/components/dynamic-icon";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useFinance } from "@/hooks/use-finance";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

interface CategorySelectProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CategorySelect({
  value,
  onValueChange,
  placeholder = "Selecione uma categoria",
  disabled = false,
}: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const { categories } = useFinance();

  const selectedCategory = categories.find((cat) => cat.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          {selectedCategory ? (
            <span className="flex items-center gap-2 truncate">
              <DynamicIcon
                name={selectedCategory.icon ?? "tag"}
                className="h-4 w-4 shrink-0 text-muted-foreground"
              />
              <span className="truncate">{selectedCategory.name}</span>
             </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        side="bottom"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onWheel={(e) => e.stopPropagation()}
      >
        <Command>
          <CommandInput placeholder="Buscar categoria..." />
          <CommandList
            className="max-h-48 overflow-y-auto"
            onWheel={(e) => e.stopPropagation()}
          >
            <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={() => {
                    onValueChange(category.id);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <DynamicIcon
                    name={category.icon ?? "tag"}
                    className="h-4 w-4 text-muted-foreground"
                  />
                  <span className="flex-1 truncate">{category.name}</span>
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0",
                      value === category.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}   
