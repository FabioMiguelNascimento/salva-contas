import { Button } from "@/components/ui/button";

interface Props {
  currentPage: number;
  totalPages: number;
  disabled?: boolean;
  onPageChange: (newPage: number) => void;
}

export function PaginationControls({ currentPage, totalPages, onPageChange, disabled }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        Página {currentPage} de {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
