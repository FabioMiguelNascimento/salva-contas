"use client"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ClipboardPaste, Upload, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export type AttachmentUploaderProps = {
  id?: string
  file: File | null
  accept?: string
  onFileChange: (file: File | null) => void
  className?: string
}

export function AttachmentUploader({
  id = "file",
  file,
  accept = "image/*,.pdf",
  onFileChange,
  className,
}: AttachmentUploaderProps) {
  const [isPasting, setIsPasting] = useState(false)
  const dropRef = useRef<HTMLLabelElement>(null)

  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const items = Array.from(e.clipboardData?.items ?? [])
      const fileItem = items.find(
        (item) => item.kind === "file" && (item.type.startsWith("image/") || item.type === "application/pdf")
      )
      if (!fileItem) return
      const pasted = fileItem.getAsFile()
      if (!pasted) return
      const ext = pasted.type.split("/")[1] ?? "png"
      const namedFile = new File([pasted], pasted.name || `colado.${ext}`, { type: pasted.type })
      setIsPasting(true)
      onFileChange(namedFile)
      setTimeout(() => setIsPasting(false), 600)
    }

    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [onFileChange])

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    const dropped = e.dataTransfer.files?.[0] ?? null
    if (dropped) onFileChange(dropped)
  }

  return (
    <label
      ref={dropRef}
      htmlFor={id}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={cn(
        "flex min-h-[100px] cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-input bg-muted/30 px-4 py-5 text-center transition-colors hover:bg-muted/50",
        file && "border-primary/40 bg-primary/5",
        isPasting && "border-primary bg-primary/10",
        className
      )}
    >
      <Input
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null
          onFileChange(f)
        }}
      />

      {file ? (
        <>
          <Upload className="h-5 w-5 text-primary" />
          <p className="max-w-[220px] truncate text-sm font-medium text-primary">{file.name}</p>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onFileChange(null) }}
            className="flex items-center gap-1 text-xs text-muted-foreground underline hover:text-destructive"
          >
            <X className="h-3 w-3" /> Remover
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 text-muted-foreground/60">
            <Upload className="h-5 w-5" />
            <ClipboardPaste className="h-5 w-5" />
          </div>
          <p className="text-sm text-muted-foreground">
            Arraste, clique ou cole <span className="font-medium">Ctrl+V</span>
          </p>
          <p className="text-xs text-muted-foreground/60">Imagens e PDFs</p>
        </>
      )}
    </label>
  )
}

export default AttachmentUploader