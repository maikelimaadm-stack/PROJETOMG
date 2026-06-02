import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { Check, X } from "lucide-react";
import ToggleSwitch from "@/shared/components/ToggleSwitch";
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

const LAYOUT_OPTIONS = [
  {
    mode: "vertical",
    title: "Modelo vertical",
    description: "Painéis em abas e campos um abaixo do outro.",
  },
  {
    mode: "compact",
    title: "Modelo compacto",
    description: "Painéis em abas, campos menores e mais densos.",
  },
  {
    mode: "details",
    title: "Modelo de detalhes",
    description: "Painéis em lista cinza, recolhíveis ao clicar.",
  },
  {
    mode: "detailsCompact",
    title: "Modelo detalhes + compacto",
    description: "Painéis em lista recolhível e campos compactos, incluindo o Principal.",
  },
];

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

  const setMode = (mode) => {
    setDraft((prev) => normalizeFieldLayoutConfig({ ...prev, mode }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
        className={`${EMP_CONFIG_DIALOG_CONTENT} max-w-[560px]`}
      >
        <DialogTitle className="sr-only">Configurar layout de campos</DialogTitle>

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
            title="Configurar layout de campos"
            operationLabel="Configuração"
            className="!border-b-[0.5px]"
          />

          <div className={EMP_CONFIG_DIALOG_TABLE_WRAP}>
            <Card className={EMP_CONFIG_DIALOG_TABLE_SHELL}>
              <CardContent className="p-0">
                <div className="border-b-[0.5px] border-[#dce3eb] px-2 py-1 text-xs text-[#5b6b80]">
                  Escolha como os painéis e campos serão exibidos.
                </div>

                <div className="max-h-[70vh] overflow-y-auto p-2">
                  <div className="space-y-2">
                    {LAYOUT_OPTIONS.map((option) => {
                      const active = draft.mode === option.mode;
                      return (
                        <button
                          key={option.mode}
                          type="button"
                          onClick={() => setMode(option.mode)}
                          className={`flex w-full cursor-pointer items-center gap-3 rounded-md border-[0.5px] p-2 text-left transition-colors hover:brightness-[0.98] ${active ? "bg-[#ecfdf3] border-[#21c45d]" : "border-[#dce3eb] bg-white"}`}
                        >
                          <span onClick={(event) => event.stopPropagation()} className="flex shrink-0 items-center">
                            <ToggleSwitch
                              checked={active}
                              onChange={(checked) => checked && setMode(option.mode)}
                              className="emp-form-toggle-switch"
                              checkedClassName="emp-form-toggle-switch-on"
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-semibold text-[#1a1f26]">{option.title}</span>
                            <span className="block text-[11px] text-[#5b6b80]">{option.description}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {["compact", "detailsCompact"].includes(draft.mode) && (
                    <div className="mt-2 rounded-md border-[0.5px] border-[#dce3eb] bg-white p-2">
                      <label className="mb-2 block text-xs font-semibold text-[#1a1f26]">
                        Quantidade de colunas por linha (1 a 6)
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.from({ length: 6 }, (_, index) => index + 1).map((count) => (
                          <button
                            key={count}
                            type="button"
                            onClick={() => setDraft((prev) => ({ ...prev, columns: count }))}
                            className={`h-[24px] min-w-[36px] rounded-[5px] px-2 text-xs font-medium transition-colors ${
                              draft.columns === count
                                ? "emp-toolbar-btn emp-toolbar-btn-new text-white"
                                : "emp-toolbar-btn bg-[#eaf2ff] text-[#334155] hover:bg-[#dde9fb]"
                            }`}
                          >
                            {count}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          </EmpSplitToolbarLayout>
        </div>
      </DialogContent>
    </Dialog>
  );
}
