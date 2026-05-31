import React from "react";
import { Input } from "@/components/ui/input";
import { DEFAULT_PRESET_ID } from "@/components/emp/layout/empFormLayoutStore";

const titleCase = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/(^|\s)([a-záàâãéèêíóôõúç])/g, (match) => match.toUpperCase());

export default function EmpLayoutPresetFormDialog({
  open,
  mode = "new",
  name = "",
  sourcePresetId = DEFAULT_PRESET_ID,
  sourceOptions = [],
  onNameChange,
  onSourcePresetIdChange,
}) {
  if (!open) return null;

  const isEdit = mode === "edit";

  return (
    <div className="emp-layout-preset-form-layer fixed inset-0 z-[70] flex items-center justify-center pointer-events-none">
      <div
        className="emp-layout-preset-form-popup pointer-events-auto w-[420px] max-w-[calc(100vw-24px)] overflow-hidden border border-[#cfd8e3] bg-white shadow-lg"
        role="dialog"
        aria-label={isEdit ? "Editar layout" : "Novo layout"}
      >
        <div className="border-b border-[#dce3eb] bg-[#f8fafc] px-3 py-2">
          <span className="text-xs font-semibold text-[#1a1f26]">
            {isEdit ? "Editar layout" : "Novo layout"}
          </span>
        </div>

        <div className="space-y-3 bg-white p-3">
          <label className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-2 text-xs text-[#1a1f26]">
            <span className="text-right">Nome:</span>
            <Input
              value={name}
              onChange={(event) => onNameChange?.(event.target.value)}
              placeholder="Ex.: Layout comercial"
              autoFocus
              className="h-7 rounded-[5px] border-[#dce3eb] text-xs shadow-none focus-visible:ring-0"
            />
          </label>

          <label className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-2 text-xs text-[#1a1f26]">
            <span className="text-right">Origem:</span>
            <select
              value={sourcePresetId}
              onChange={(event) => onSourcePresetIdChange?.(event.target.value)}
              disabled={isEdit}
              className="emp-layout-config-select h-7 w-full rounded-[5px] border border-[#dce3eb] bg-white px-2 text-xs text-[#1a1f26] disabled:bg-[#f8fafc] disabled:text-[#5b6b80]"
            >
              {sourceOptions.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.isSystem ? "Padrão do sistema" : titleCase(preset.name)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
