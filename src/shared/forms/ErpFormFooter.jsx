import React from "react";
import { cn } from "@/shared/utils/utils";
import { Button } from "@/shared/ui/button";

/**
 * Rodapé padrão de telas de lançamento.
 */
export default function ErpFormFooter({
  onSave,
  onSaveNew,
  onSaveClose,
  onCancel,
  saveDisabled,
  saveNewDisabled,
  saveCloseDisabled,
  cancelDisabled,
  className,
  children,
}) {
  return (
    <footer className={cn("erp-form-footer", className)}>
      <div className="erp-form-footer__actions">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={cancelDisabled} className="erp-form-footer__btn">
            Cancelar
          </Button>
        ) : null}
        {onSave ? (
          <Button type="button" onClick={onSave} disabled={saveDisabled} className="erp-form-footer__btn erp-form-footer__btn--primary">
            Salvar
          </Button>
        ) : null}
        {onSaveNew ? (
          <Button type="button" variant="secondary" onClick={onSaveNew} disabled={saveNewDisabled} className="erp-form-footer__btn">
            Salvar e Novo
          </Button>
        ) : null}
        {onSaveClose ? (
          <Button type="button" variant="secondary" onClick={onSaveClose} disabled={saveCloseDisabled} className="erp-form-footer__btn">
            Salvar e Fechar
          </Button>
        ) : null}
        {children}
      </div>
    </footer>
  );
}
