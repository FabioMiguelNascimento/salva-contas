"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { DynamicIcon } from "@/components/dynamic-icon";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export const CATEGORY_ICONS = [
  "tag", "utensils", "car", "home", "shopping-cart",
  "heart-pulse", "graduation-cap", "zap", "gamepad-2", "plane",
  "palette", "dumbbell", "baby", "dog", "landmark",
  "credit-card", "wallet", "trending-up", "piggy-bank", "gift",
  "book-open", "shirt", "smartphone", "coffee", "train",
  "bus", "bolt", "shield-check", "chart-bar", "receipt",
  "music", "camera", "film", "trophy",
];

const ICON_LABELS = CATEGORY_ICONS.map((icon) => icon.replace(/-/g, " "));

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  disabled?: boolean;
}

export function IconPicker({
  value,
  onChange,
  disabled = false,
}: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deferredTerm, setDeferredTerm] = useState("");
  const selectedIcon = value || "tag";

  useEffect(() => {
    const timer = setTimeout(() => setDeferredTerm(searchTerm), 120);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredIcons = useMemo(() => {
    if (!deferredTerm.trim()) return CATEGORY_ICONS;
    const term = deferredTerm.toLowerCase();
    return CATEGORY_ICONS.map((icon, i) => ({ icon, label: ICON_LABELS[i] }))
      .filter(({ icon, label }) =>
        icon.includes(term) || label.includes(term) || label.includes(term.replace(/\s/g, "")),
      )
      .map(({ icon }) => icon);
  }, [deferredTerm]);

  const handleSelect = useCallback(
    (iconName: string) => {
      onChange(iconName);
      setOpen(false);
      setSearchTerm("");
    },
    [onChange],
  );

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearchTerm("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled}
          aria-label="Selecionar ícone"
        >
          <DynamicIcon name={selectedIcon} className="size-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[256px] p-0 shadow-xl flex flex-col overflow-hidden"
        align="start"
        sideOffset={8}
        collisionPadding={12}
      >
        <div className="shrink-0 border-b border-border/60 px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/60">
            Ícone
          </p>
        </div>

        <div className="shrink-0 px-3 py-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar ícone..."
              className="h-8 rounded-lg border border-border/50 bg-muted/30 pl-9 pr-8 text-sm placeholder:text-muted-foreground/50 focus-visible:border-ring/40 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring/20"
            />
            {searchTerm && (
              <button
                type="button"
                className="absolute right-1.5 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => setSearchTerm("")}
                aria-label="Limpar busca"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        <ScrollArea className="h-48 px-3 pb-3">
          {filteredIcons.length > 0 ? (
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {filteredIcons.map((iconName) => {
                const isActive = selectedIcon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    title={iconName.replace(/-/g, " ")}
                    aria-label={`Selecionar ícone ${iconName}`}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-100 hover:bg-accent hover:text-accent-foreground",
                      isActive && "text-accent-foreground border",
                    )}
                    onClick={() => handleSelect(iconName)}
                  >
                    <DynamicIcon name={iconName} className="size-4" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-6">
              <Search className="size-4 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground/60">Nenhum ícone encontrado</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
