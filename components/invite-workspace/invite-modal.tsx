"use client";

import React from "react";
import { createPortal } from "react-dom";

type InviteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
};

export function InviteModal({ open, onOpenChange, children, className = "" }: InviteModalProps) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div data-invite-modal className={`fixed inset-0 z-[9999] flex items-center justify-center ${className}`} role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative bg-background rounded-lg p-6 w-[min(95vw,520px)] shadow-lg z-[10000]">{children}</div>
    </div>,
    document.body
  );
}
