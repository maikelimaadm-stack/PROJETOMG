import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X } from "lucide-react";
import { DEFAULT_FIELD_LAYOUT_CONFIG, normalizeFieldLayoutConfig } from "@/components/emp/layout/empFormLayoutStore";

const iconButtonClass = "rounded-md border-0 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-600 shadow-none h-7 w-7";

const LayoutPreview = ({ mode, columns }) => {
  if (mode === "stacked") {
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

  const cells = Array.from({ length: Math.max(columns, 3) * 2 }, (_, index) => index);
  return (
    <div
      className="emp-field-layout-preview emp-field-layout-preview-compact"
      style={{ gridTemplateColumns: `repeat(${Math.max(columns, 3)}, minmax(0, 1fr))` }}
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

  const handleReset = () => {
    setDraft({ ...DEFAULT_FIELD_LAYOUT_CONFIG });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(event) => event.preventDefault()}
        className="cadastro-emp-scope bg-white fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-1rem)] max-w-[520px] translate-x-[-50%] translate-y-[-50%] gap-0 overflow-hidden rounded-lg border border-slate-200 p-0 shadow-lg"
      >
        <DialogTitle className="sr-only">Configurar layout de campos</DialogTitle>

        <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2">
          <span className="inline-flex h-5 items-center rounded-sm border border-slate-300 px-1.5 text-[11px] font-bold text-slate-500">
            Campos
          </span>
          <span className="flex-1 truncate text-xs font-semibold text-slate-600">
            Configurar layout de campos
          </span>
          <Button type="button" onClick={() => onOpenChange(false)} title="Fechar" className={iconButtonClass}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 p-3 max-h-[70vh] overflow-y-auto">
          <p className="text-xs text-slate-500">
            Escolha como os campos das abas serão exibidos. O painel Principal permanece sempre no modelo vertical.
          </p>

          <RadioGroup
            value={draft.mode}
            onValueChange={(mode) => setDraft((prev) => normalizeFieldLayoutConfig({ ...prev, mode }))}
            className="space-y-3"
          >
            <label className="flex cursor-pointer gap-3 rounded-md border border-slate-200 p-3 hover:bg-slate-50">
              <RadioGroupItem value="stacked" className="mt-0.5" />
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <div className="text-xs font-semibold text-slate-700">Modelo vertical</div>
                  <div className="text-[11px] text-slate-500">Campos um abaixo do outro, com o nome à esquerda.</div>
                </div>
                <LayoutPreview mode="stacked" columns={1} />
              </div>
            </label>

            <label className="flex cursor-pointer gap-3 rounded-md border border-slate-200 p-3 hover:bg-slate-50">
              <RadioGroupItem value="compact" className="mt-0.5" />
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <div className="text-xs font-semibold text-slate-700">Modelo compacto</div>
                  <div className="text-[11px] text-slate-500">Campos menores e mais densos, com o nome acima, ideal para muitos campos.</div>
                </div>
                <LayoutPreview mode="compact" columns={draft.mode === "compact" ? draft.columns : 3} />
              </div>
            </label>
          </RadioGroup>

          {draft.mode === "compact" && (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Quantidade de colunas por linha (1 a 8)
              </label>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 8 }, (_, index) => index + 1).map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, columns: count }))}
                    className={`h-8 min-w-[44px] rounded-md border px-3 text-xs font-medium transition-colors ${
                      draft.columns === count
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-3 py-2">
          <Button type="button" variant="ghost" onClick={handleReset} className="h-8 rounded-md px-3 text-xs text-slate-600">
            Restaurar padrão
          </Button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-8 rounded-md px-3 text-xs">
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} className="h-8 rounded-md bg-emerald-600 px-3 text-xs hover:bg-emerald-700">
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
