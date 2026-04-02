import { CheckCircle2 } from "lucide-react";

export function TransactionActions({
  requiresConfirmation,
  status,
  onCancel,
  handleConfirm,
  anyChanges,
}: {
  requiresConfirmation: boolean;
  status: "confirmed" | "cancelled" | "confirming" | string;
  onCancel: () => void;
  handleConfirm: () => void;
  anyChanges: boolean;
}) {
  if (!requiresConfirmation) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {status === "confirmed" ? (
        <div className="flex w-full items-center justify-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-5 w-5" />
          Alteração confirmada com sucesso!
        </div>
      ) : status === "cancelled" ? (
        <div className="flex w-full items-center justify-center gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          Alteração cancelada. Nenhuma mudança será realizada.
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={status === "confirming" || !anyChanges}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            {status === "confirming" ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Confirmando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Confirmar Alteração
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Cancelar
          </button>
        </>
      )}
    </div>
  );
}
