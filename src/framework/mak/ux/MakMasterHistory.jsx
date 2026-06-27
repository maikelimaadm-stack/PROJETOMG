import React, { useEffect } from "react";
import { History, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import MakEmptyState from "./MakEmptyState";
import {
  useMakHistoryData,
  MAK_HISTORY_EMPTY_BACKEND_MESSAGE,
  MAK_HISTORY_EMPTY_RECORD_MESSAGE,
  dispatchMakHistoryEvent,
  MAK_HISTORY_EVENTS,
} from "@/framework/mak/history";

/**
 * Histórico mestre — Foundation History Engine.
 * Backend de leitura isolado em adapter; UI permanece estável.
 */
export default function MakMasterHistory({
  open = false,
  onOpenChange,
  moduleId = "cadastro",
  entityName = null,
  recordId = null,
  moduleLabel = "Registro",
  recordCode = null,
  recordTitle = null,
  backendAdapter = null,
}) {
  const subtitle = [recordCode, recordTitle].filter(Boolean).join(" — ");
  const { entries, backendPending, isLoading, isError, error } = useMakHistoryData({
    moduleId,
    entityName,
    recordId,
    recordCode,
    enabled: open,
    backendAdapter,
  });

  useEffect(() => {
    if (!open) {
      dispatchMakHistoryEvent(moduleId, MAK_HISTORY_EVENTS.CLOSED);
    }
  }, [moduleId, open]);

  const emptyTitle = backendPending
    ? "Integração backend pendente"
    : isError
      ? "Não foi possível carregar o histórico"
      : "Nenhum histórico";

  const emptyDescription = backendPending
    ? MAK_HISTORY_EMPTY_BACKEND_MESSAGE
    : isError
      ? error?.message || "Tente novamente mais tarde."
      : MAK_HISTORY_EMPTY_RECORD_MESSAGE;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mak-master-history sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-4 w-4" aria-hidden="true" />
            Histórico — {moduleLabel}
          </DialogTitle>
          {subtitle ? (
            <DialogDescription>{subtitle}</DialogDescription>
          ) : (
            <DialogDescription>Alterações e eventos do registro selecionado.</DialogDescription>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Carregando histórico...
          </div>
        ) : entries.length > 0 ? (
          <ul className="mak-master-history__list max-h-72 space-y-2 overflow-y-auto py-1">
            {entries.map((entry, index) => (
              <li
                key={entry.id ?? `${entry.action}-${entry.timestamp}-${index}`}
                className="rounded border border-slate-200 px-3 py-2 text-xs"
              >
                <div className="font-medium uppercase text-slate-700">{entry.action}</div>
                {entry.summary ? <div className="mt-1 text-slate-600">{entry.summary}</div> : null}
                <div className="mt-1 text-slate-400">
                  {[entry.userName, entry.timestamp].filter(Boolean).join(" — ")}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <MakEmptyState
            title={emptyTitle}
            description={emptyDescription}
            className="mak-master-history__empty"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
