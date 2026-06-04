import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { Check, X } from "lucide-react";
import { normalizeFieldLayoutConfig } from "@/framework/cadastro/layouts/empFormLayoutStore";
import {
  EMP_CONFIG_DIALOG_CLOSE_BUTTON,
  EMP_CONFIG_DIALOG_CLOSE_ROW,
  EMP_CONFIG_DIALOG_CONTENT,
  EMP_CONFIG_DIALOG_SHELL,
  EMP_CONFIG_DIALOG_TABLE_SHELL,
  EMP_CONFIG_DIALOG_TABLE_WRAP,
  EMP_CONFIG_DIALOG_TOOLBAR,
  EMP_CONFIG_DIALOG_TOOLBAR_LABELED_BTN,
} from "@/framework/cadastro/styles/empConfigDialogStyles";
import EmpToolbarIcon from "@/framework/cadastro/toolbars/EmpToolbarIcon";
import EmpToolbarInfoBar from "@/framework/cadastro/toolbars/EmpToolbarInfoBar";
import { EMP_TOOLBAR_BTN } from "@/framework/cadastro/toolbars/empToolbarStyles";
import EmpSplitToolbarLayout from "@/framework/cadastro/layouts/EmpSplitToolbarLayout";

const ToolbarBtn = ({ children, className = "", ...props }) => (
  <button type="button" className={`${EMP_TOOLBAR_BTN} ${className}`} {...props}>
    {children}
  </button>
);

export default function EmpFieldLayoutConfigDialog({
  open,
  onOpenChange,
  fieldLayoutConfig,
  onSave,
}) {
  const [draft, setDraft] = useState(() => normalizeFieldLayoutConfig(fieldLayoutConfig));

  useEffect(() => {
    if (!open) return;
    setDraft(normalizeFieldLayoutConfig(fieldLayoutConfig));
  }, [open, fieldLayoutConfig]);

  const handleSave = () => {
    onSave?.(normalizeFieldLayoutConfig(draft));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
        className={`${EMP_CONFIG_DIALOG_CONTENT} max-w-[520px]`}
      >
        <DialogTitle className="sr-only">Layout corporativo de campos</DialogTitle>

        <div className={EMP_CONFIG_DIALOG_SHELL}>
          <div className={EMP_CONFIG_DIALOG_CLOSE_ROW}>
            <button type="button" onClick={() => onOpenChange(false)} className={EMP_CONFIG_DIALOG_CLOSE_BUTTON} title="Fechar" aria-label="Fechar">
              <X className="h-3.5 w-3.5" strokeWidth={2.25} />
            </button>
          </div>

          <EmpSplitToolbarLayout
            toolbar={
              <div className={EMP_CONFIG_DIALOG_TOOLBAR}>
                <ToolbarBtn onClick={handleSave} className={`${EMP_CONFIG_DIALOG_TOOLBAR_LABELED_BTN} emp-toolbar-btn-new`} title="Salvar">
                  <EmpToolbarIcon icon={Check} strokeWidth={2.5} />
                  <span>Salvar</span>
                </ToolbarBtn>
                <ToolbarBtn onClick={() => onOpenChange(false)} className={EMP_CONFIG_DIALOG_TOOLBAR_LABELED_BTN} title="Cancelar">
                  <EmpToolbarIcon icon={X} />
                  <span>Cancelar</span>
                </ToolbarBtn>
              </div>
            }
          >
            <EmpToolbarInfoBar
              badgeLabel="Campos"
              title="Layout corporativo"
              operationLabel="Padrão único"
              className="!border-b-[0.5px]"
            />

            <div className={EMP_CONFIG_DIALOG_TABLE_WRAP}>
              <Card className={EMP_CONFIG_DIALOG_TABLE_SHELL}>
                <CardContent className="p-3 text-xs leading-relaxed text-[#334155]">
                  <p className="mb-2 font-semibold text-[#1a1f26]">Formulário corporativo (V3)</p>
                  <ul className="list-disc space-y-1 pl-4">
                    <li>Abas e painéis com cards configuráveis</li>
                    <li>Labels acima dos campos e alta densidade</li>
                    <li>Grid de 12 colunas com tamanhos XS a XL por campo</li>
                    <li>Cards, ordem e larguras em <strong>Layout do formulário</strong></li>
                  </ul>
                  <p className="mt-3 text-[11px] text-[#5b6b80]">
                    Os modos vertical, compacto e detalhes (SGG) foram substituídos por este padrão único.
                  </p>
                </CardContent>
              </Card>
            </div>
          </EmpSplitToolbarLayout>
        </div>
      </DialogContent>
    </Dialog>
  );
}
