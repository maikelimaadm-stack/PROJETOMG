import React from "react";
import { History } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import MakEmptyState from "./MakEmptyState";

/**
 * Placeholder de histórico mestre — preparado para integração com API de auditoria.
 */
export default function MakMasterHistory({
  open = false,
  onOpenChange,
  moduleLabel = "Registro",
  recordCode = null,
  recordTitle = null,
}) {
  const subtitle = [recordCode, recordTitle].filter(Boolean).join(" — ");

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
        <MakEmptyState
          title="Histórico em desenvolvimento"
          description="A trilha de auditoria será disponibilizada em uma próxima versão do MAK Framework."
          className="mak-master-history__empty"
        />
      </DialogContent>
    </Dialog>
  );
}
