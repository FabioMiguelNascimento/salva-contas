"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Upload } from "lucide-react"

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
  return (
    <div className={cn("mt-4 space-y-4", className)}>
      <Label className="text-sm font-semibold text-muted-foreground">Arraste o arquivo ou clique para procurar</Label>

      <label
        htmlFor={id}
        className={cn(
          "flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/40 text-center",
          file && "border-emerald-400 bg-emerald-50 text-emerald-600"
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

        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm">{file ? file.name : "JPG, PNG ou PDF até 10MB"}</p>
        <p className="text-xs text-muted-foreground">Capturamos automaticamente valores, datas e categorias.</p>
      </label>
    </div>
  )
}

export default AttachmentUploader
