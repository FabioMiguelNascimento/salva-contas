"use client";

import { ShareButton } from "@/components/share-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ExternalLink, FileText, Image as ImageIcon, Maximize2, Minimize2, X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface AttachmentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attachmentUrl?: string | null;
  attachmentOriginalName?: string | null;
  attachmentMimeType?: string | null;
}

export function AttachmentViewer({
  open,
  onOpenChange,
  attachmentUrl,
  attachmentOriginalName,
  attachmentMimeType,
}: AttachmentViewerProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [maximized, setMaximized] = useState(false);

  const isImage = attachmentMimeType?.startsWith("image/");
  const isPdf = attachmentMimeType === "application/pdf";
  const fileName = attachmentOriginalName || "Anexo";
  const fileKindLabel = isImage ? "Imagem" : isPdf ? "PDF" : "Arquivo";

  useEffect(() => {
    setImageLoaded(false);
  }, [attachmentUrl]);

  useEffect(() => {
    if (!open) setMaximized(false);
  }, [open]);

  const handleOpenInNewTab = () => {
    if (!attachmentUrl) return;
    window.open(attachmentUrl, "_blank", "noopener,noreferrer");
  };

  if (!attachmentUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex flex-col overflow-hidden bg-white p-0 shadow-2xl transition-all duration-200",
          maximized
            ? "w-[100vw] h-[100dvh] !max-w-[100vw] rounded-none border-0" 
            : "w-[95vw] sm:!max-w-[90vw] lg:!max-w-5xl h-[85vh] rounded-2xl border border-slate-200"
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-5 border-b border-slate-100">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              {isImage ? <ImageIcon className="size-3.5 text-slate-500" /> : <FileText className="size-3.5 text-slate-500" />}
            </div>
            <span className="truncate text-sm font-medium text-slate-900" title={fileName}>
              {fileName}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMaximized((prev) => !prev)}
              className="size-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              {maximized ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="size-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                <X className="size-4" />
              </Button>
            </DialogClose>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-slate-50/50">
          {isImage && (
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={4}
              centerOnInit
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <div className="relative h-full w-full">
                  
                  <div className="absolute bottom-4 right-4 z-10 flex gap-1 rounded-lg border border-slate-200 bg-white/80 p-1 shadow-sm backdrop-blur-sm">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600" onClick={() => zoomOut()}>
                      <ZoomOut className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600" onClick={() => resetTransform()}>
                      <RotateCcw className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600" onClick={() => zoomIn()}>
                      <ZoomIn className="size-4" />
                    </Button>
                  </div>

                  <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                    {!imageLoaded && (
                      <Skeleton className="absolute inset-0 m-auto h-[60vh] w-[40vw] rounded-xl bg-slate-200/50" />
                    )}
                    <img
                      src={attachmentUrl}
                      alt={fileName}
                      className={cn(
                        "max-h-full max-w-full rounded-md object-contain transition-opacity duration-300",
                        imageLoaded ? "opacity-100" : "opacity-0"
                      )}
                      onLoad={() => setImageLoaded(true)}
                    />
                  </TransformComponent>
                </div>
              )}
            </TransformWrapper>
          )}

          {isPdf && <iframe src={attachmentUrl} className="h-full w-full bg-white" title={fileName} />}
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-white px-4 py-3 sm:px-5">
          <Button variant="ghost" size="sm" onClick={handleOpenInNewTab} className="h-7 text-xs text-slate-500 hover:bg-slate-100">
            <ExternalLink className="mr-2 size-3" /> Abrir original
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}