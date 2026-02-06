"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAttachments } from "@/hooks/use-attachments";
import { cn } from "@/lib/utils";
import { attachmentsService } from "@/services/attachments.service";
import {
    FileText,
    Image as ImageIcon,
    Paperclip,
    Trash2,
    Upload
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface AttachmentsManagerProps {
  transactionId?: string;
  subscriptionId?: string;
  className?: string;
}

export function AttachmentsManager({
  transactionId,
  subscriptionId,
  className,
}: AttachmentsManagerProps) {
  const {
    attachments,
    isUploading,
    isLoading,
    uploadAttachment,
    loadAttachments,
    deleteAttachment,
  } = useAttachments(transactionId, subscriptionId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (transactionId || subscriptionId) {
      loadAttachments();
    }
  }, [transactionId, subscriptionId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamanho (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("O arquivo deve ter no máximo 10MB");
        return;
      }

      // Validar tipo
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Tipo de arquivo não permitido. Use PDF ou imagens.");
        return;
      }

      setSelectedFile(file);
      setIsDialogOpen(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadAttachment(selectedFile, description);
      setSelectedFile(null);
      setDescription("");
      setIsDialogOpen(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const getFileIcon = (type: string) => {
    if (type === "pdf") {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    if (type === "image") {
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    }
    return <Paperclip className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paperclip className="h-5 w-5" />
          Anexos
        </CardTitle>
        <CardDescription>
          PDFs e imagens de boletos, comprovantes, etc.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Upload Button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full"
              variant="outline"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Enviando..." : "Adicionar Anexo"}
            </Button>
          </div>

          {/* Attachments List */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando anexos...
            </div>
          ) : attachments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum anexo adicionado
            </div>
          ) : (
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {getFileIcon(attachment.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <a
                      href={attachmentsService.getFileUrl(attachment.storageUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-sm hover:underline truncate block"
                    >
                      {attachment.originalName}
                    </a>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(attachment.fileSize)}</span>
                      {attachment.description && (
                        <>
                          <span>•</span>
                          <span className="truncate">{attachment.description}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteAttachment(attachment.id)}
                    className="flex-shrink-0 h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Upload Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Anexo</DialogTitle>
            <DialogDescription>
              Adicione uma descrição opcional para o arquivo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedFile && (
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                {getFileIcon(
                  selectedFile.type === "application/pdf" ? "pdf" : "image"
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input
                id="description"
                placeholder="Ex: Boleto de março de 2026"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedFile(null);
                setDescription("");
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? "Enviando..." : "Enviar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
