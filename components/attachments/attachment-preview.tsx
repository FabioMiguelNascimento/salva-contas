"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { attachmentsService, type Attachment } from "@/services/attachments.service";
import { FileText, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface AttachmentPreviewProps {
  attachment: Attachment;
}

export function AttachmentPreview({ attachment }: AttachmentPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const fileUrl = attachmentsService.getFileUrl(attachment.storageUrl);

  const handleClick = () => {
    if (attachment.type === "image") {
      setIsOpen(true);
    } else {
      // Para PDFs, abrir em nova aba
      window.open(fileUrl, "_blank");
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted hover:bg-muted/80 transition-colors cursor-pointer group"
      >
        {attachment.type === "image" ? (
          <Image
            src={fileUrl}
            alt={attachment.originalName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="h-16 w-16 text-red-500" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
            Clique para {attachment.type === "image" ? "ampliar" : "abrir"}
          </span>
        </div>
      </button>

      {/* Modal de preview para imagens */}
      {attachment.type === "image" && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-4xl w-full p-0">
            <div className="relative w-full h-[80vh]">
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <Image
                src={fileUrl}
                alt={attachment.originalName}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
            <div className="p-4 border-t">
              <p className="font-medium">{attachment.originalName}</p>
              {attachment.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {attachment.description}
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
