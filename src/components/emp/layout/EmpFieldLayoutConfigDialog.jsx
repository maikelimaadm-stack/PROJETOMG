import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, X } from "lucide-react";
import { normalizeFieldLayoutConfig } from "@/components/emp/layout/empFormLayoutStore";
import {
  EMP_CONFIG_DIALOG_CLOSE_BUTTON,
  EMP_CONFIG_DIALOG_CLOSE_ROW,
  EMP_CONFIG_DIALOG_CONTENT,
  EMP_CONFIG_DIALOG_SHELL,
  EMP_CONFIG_DIALOG_TABLE_SHELL,
  EMP_CONFIG_DIALOG_TABLE_WRAP,
  EMP_CONFIG_DIALOG_TOOLBAR,
  EMP_CONFIG_DIALOG_TOOLBAR_LABELED_BTN,
} from "@/components/emp/dialogs/empConfigDialogStyles";
import EmpToolbarIcon from "@/components/emp/toolbars/EmpToolbarIcon";
import EmpToolbarInfoBar from "@/components/emp/toolbars/EmpToolbarInfoBar";
import { EMP_TOOLBAR_BTN } from "@/components/emp/toolbars/empToolbarStyles";

const ToolbarBtn = ({ children, className = "", ...props }) => (
  <button type="button" className={`${EMP_TOOLBAR_BTN} ${className}`} {...props}>
    {children}
  </button>
);

const LayoutPreview = ({ mode, columns }) => {
  if (mode === "vertical") {
    return (
      <div className="emp-field-layout-preview emp-field-layout-preview-stacked">
        {[1, 2, 3].map((row) => (
          <div key={row} className="emp-field-layout-preview-row">
            <span className="emp-field-layout-preview-label" />
            <span className="emp-field-layout-preview-control" />
          </div>
        ))}
      </div>
    );
  }

  if (mode === "details" || mode === "detailsCompact") {
    return (
      <div className="emp-field-layout-preview emp-field-layout-preview-details">
        {[1, 2, 3].map((panel) => (
          <div key={panel} className="emp-field-layout-preview-detail-panel">
            <span className="emp-field-layout-preview-detail-title" />
            {mode === "detailsCompact" ? (
              <div className="emp-field-layout-preview-detail-compact-grid">
                <span className="emp-field-layout-preview-detail-line" />
                <span className="emp-field-layout-preview-detail-line" />
                <span className="emp-field-layout-preview-detail-line emp-field-layout-preview-detail-line-short" />
                <span className="emp-field-layout-preview-detail-line" />
              </div>
            ) : (
              <>
                <span className="emp-field-layout-preview-detail-line" />
                <span className="emp-field-layout-preview-detail-line emp-field-layout-preview-detail-line-short" />
              </>
            )}
          </div>
        ))}
      </div>
    );
  }

  const previewColumns = 2;
  const cells = Array.from({ length: previewColumns * 2 }, (_, index) => index);
  return (
    <div
      className="emp-field-layout-preview emp-field-layout-preview-compact"
      style={{ gridTemplateColumns: `repeat(${previewColumns}, minmax(0, 1fr))` }}
    >
      {cells.map((cell) => (
        <div key={cell} className="emp-field-layout-preview-cell">
          <span className="emp-field-layout-preview-label-top emp-field-layout-preview-label-compact" />
          <span className="emp-field-layout-preview-control emp-field-layout-preview-control-compact" />
        </div>
      ))}
    </div>
  );
};

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
        className={`${EMP_CONFIG_DIALOG_CONTENT} max-w-[560px]`}
      >
        <DialogTitle className="sr-only">Configurar layout de campos</DialogTitle>

        <div className={EMP_CONFIG_DIALOG_SHELL}>
          <div className={EMP_CONFIG_DIALOG_CLOSE_ROW}>
            <button type="button" onClick={() => onOpenChange(false)} className={EMP_CONFIG_DIALOG_CLOSE_BUTTON} title="Fechar" aria-label="Fechar">
              <X className="h-3.5 w-3.5" strokeWidth={2.25} />
            </button>
          </div>

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
                  <RadioGroup
                    value={draft.mode}
                    onValueChange={(mode) => setDraft((prev) => normalizeFieldLayoutConfig({ ...prev, mode }))}
                    className="space-y-2"
                  >
                    <label className={`flex cursor-pointer gap-3 rounded-md border-[0.5px] p-2 transition-colors hover:brightness-[0.98] ${draft.mode === "vertical" ? "bg-[#ecfdf3] border-[#21c45d]" : "border-[#dce3eb] bg-white"}`}>
                      <RadioGroupItem value="vertical" className="mt-0.5 border-[#21c45d] text-[#21c45d] [&_svg]:fill-[#21c45d] [&_svg]:text-[#21c45d]" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div>
                          <div className="text-xs font-semibold text-[#1a1f26]">Modelo vertical</div>
                          <div className="text-[11px] text-[#5b6b80]">Painéis em abas e campos um abaixo do outro.</div>
                        </div>
                        <LayoutPreview mode="vertical" columns={1} />
                      </div>
                    </label>

                    <label className={`flex cursor-pointer gap-3 rounded-md border-[0.5px] p-2 transition-colors hover:brightness-[0.98] ${draft.mode === "compact" ? "bg-[#ecfdf3] border-[#21c45d]" : "border-[#dce3eb] bg-white"}`}>
                      <RadioGroupItem value="compact" className="mt-0.5 border-[#21c45d] text-[#21c45d] [&_svg]:fill-[#21c45d] [&_svg]:text-[#21c45d]" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div>
                          <div className="text-xs font-semibold text-[#1a1f26]">Modelo compacto</div>
                          <div className="text-[11px] text-[#5b6b80]">Painéis em abas, campos menores e mais densos.</div>
                        </div>
                        <LayoutPreview mode="compact" columns={2} />
                      </div>
                    </label>

                    <label className={`flex cursor-pointer gap-3 rounded-md border-[0.5px] p-2 transition-colors hover:brightness-[0.98] ${draft.mode === "details" ? "bg-[#ecfdf3] border-[#21c45d]" : "border-[#dce3eb] bg-white"}`}>
                      <RadioGroupItem value="details" className="mt-0.5 border-[#21c45d] text-[#21c45d] [&_svg]:fill-[#21c45d] [&_svg]:text-[#21c45d]" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div>
                          <div className="text-xs font-semibold text-[#1a1f26]">Modelo de detalhes</div>
                          <div className="text-[11px] text-[#5b6b80]">Painéis em lista cinza, recolhíveis ao clicar.</div>
                        </div>
                        <LayoutPreview mode="details" columns={1} />
                      </div>
                    </label>

                    <label className={`flex cursor-pointer gap-3 rounded-md border-[0.5px] p-2 transition-colors hover:brightness-[0.98] ${draft.mode === "detailsCompact" ? "bg-[#ecfdf3] border-[#21c45d]" : "border-[#dce3eb] bg-white"}`}>
                      <RadioGroupItem value="detailsCompact" className="mt-0.5 border-[#21c45d] text-[#21c45d] [&_svg]:fill-[#21c45d] [&_svg]:text-[#21c45d]" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div>
                          <div className="text-xs font-semibold text-[#1a1f26]">Modelo detalhes + compacto</div>
                          <div className="text-[11px] text-[#5b6b80]">Painéis em lista recolhível e campos compactos, incluindo o Principal.</div>
                        </div>
                        <LayoutPreview mode="detailsCompact" columns={draft.columns} />
                      </div>
                    </label>
                  </RadioGroup>

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
        </div>
      </DialogContent>
    </Dialog>
  );
}
