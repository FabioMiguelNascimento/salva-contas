"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

  // Global paste listener — grabs the first image/pdf item from clipboard
  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const items = Array.from(e.clipboardData?.items ?? [])
      const fileItem = items.find(
        (item) => item.kind === "file" && (item.type.startsWith("image/") || item.type === "application/pdf")
      )
      if (!fileItem) return
      const pasted = fileItem.getAsFile()
      if (!pasted) return
      // Give the file a readable name if it came without one
      const ext = pasted.type.split("/")[1] ?? "png"
      const namedFile = new File([pasted], pasted.name || `colado.${ext}`, { type: pasted.type })
      setIsPasting(true)
      onFileChange(namedFile)
      setTimeout(() => setIsPasting(false), 600)
    }

    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [onFileChange])

  // Drag-and-drop
  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    const dropped = e.dataTransfer.files?.[0] ?? null
    if (dropped) onFileChange(dropped)
  }

  return (
    <div className={cn("mt-4 space-y-4", className)}>
      <Label className="text-sm font-semibold text-muted-foreground">
        Arraste, cole (Ctrl+V) ou clique para procurar
      </Label>

      <label
        ref={dropRef}
        htmlFor={id}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          "flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/40 text-center transition-colors",
          file && "border-emerald-400 bg-emerald-50 text-emerald-600",
          isPasting && "border-blue-400 bg-blue-50 text-blue-600 scale-[1.01]"
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
            <Upload className="h-8 w-8" />
            <p className="mt-2 text-sm font-medium">{file.name}</p>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onFileChange(null) }}
              className="mt-1 flex items-center gap-1 text-xs underline opacity-70 hover:opacity-100"
            >
              <X className="h-3 w-3" /> Remover
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Upload className="h-7 w-7 text-muted-foreground" />
              <span className="text-muted-foreground/40 text-lg font-light">|</span>
              <ClipboardPaste className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">JPG, PNG ou PDF até 10MB</p>
            <p className="text-xs text-muted-foreground/70">
              Cole um print diretamente (Ctrl+V) ou arraste o arquivo
            </p>
          </>
        )}
      </label>
    </div>
  )
}

export default AttachmentUploader
