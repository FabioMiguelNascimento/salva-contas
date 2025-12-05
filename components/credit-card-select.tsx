"use client";

import { CardFlagIcon } from "@/components/credit-cards/card-flag-icon";
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
import { formatCardNumber } from "@/lib/credit-cards/constants";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, CreditCard } from "lucide-react";
import { useState } from "react";

interface CreditCardSelectProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
}

export function CreditCardSelect({
  value,
  onValueChange,
  placeholder = "Selecione um cartão",
  disabled = false,
  allowClear = true,
}: CreditCardSelectProps) {
  const [open, setOpen] = useState(false);
  const { creditCards } = useFinance();

  // Filter only active cards
  const activeCards = creditCards.filter((card) => card.status === "active");
  const selectedCard = creditCards.find((card) => card.id === value);

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
          {selectedCard ? (
            <span className="flex items-center gap-2 truncate">
              <CardFlagIcon
                flag={selectedCard.flag}
                className="h-4 w-auto shrink-0"
              />
              <span className="truncate">{selectedCard.name}</span>
              {selectedCard.lastFourDigits && (
                <span className="text-xs text-muted-foreground">
                  {formatCardNumber(selectedCard.lastFourDigits)}
                </span>
              )}
            </span>
          ) : (
            <span className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              {placeholder}
            </span>
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
          <CommandInput placeholder="Buscar cartão..." />
          <CommandList
            className="max-h-48 overflow-y-auto"
            onWheel={(e) => e.stopPropagation()}
          >
            <CommandEmpty>Nenhum cartão encontrado.</CommandEmpty>
            <CommandGroup>
              {allowClear && (
                <CommandItem
                  value="__clear__"
                  onSelect={() => {
                    onValueChange(null);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <CreditCard className="h-4 w-4" />
                  <span className="flex-1">Nenhum (não usar cartão)</span>
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0",
                      value === null ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              )}
              {activeCards.map((card) => (
                <CommandItem
                  key={card.id}
                  value={card.name}
                  onSelect={() => {
                    onValueChange(card.id);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <CardFlagIcon flag={card.flag} className="h-4 w-auto" />
                  <span className="flex-1 truncate">{card.name}</span>
                  {card.lastFourDigits && (
                    <span className="text-xs text-muted-foreground">
                      {formatCardNumber(card.lastFourDigits)}
                    </span>
                  )}
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0",
                      value === card.id ? "opacity-100" : "opacity-0"
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
