import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Check, ChevronRight, Pencil, Plus, X } from "lucide-react";
import { DEFAULT_PRESET_ID } from "@/components/emp/layout/empFormLayoutStore";

const titleCase = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/(^|\s)([a-záàâãéèêíóôõúç])/g, (match) => match.toUpperCase());

const getOperationBadge = (mode) => {
  if (mode === "edit") return { Icon: Pencil, label: "Edição" };
  return { Icon: Plus, label: "Novo" };
};

const IconActionBtn = ({ icon: Icon, title, onClick, className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    className={`emp-layout-presets-icon-action inline-flex h-5 w-5 items-center justify-center border-0 bg-transparent p-0 text-[#5b6b80] hover:text-[#1a1f26] ${className}`.trim()}
  >
    <Icon className="h-3.5 w-3.5" strokeWidth={2} />
  </button>
);

export default function EmpLayoutPresetFormDialog({
  open,
  mode = "new",
  name = "",
  sourcePresetId = DEFAULT_PRESET_ID,
  sourceOptions = [],
  onNameChange,
  onSourcePresetIdChange,
  onSave,
  onCancel,
  onClose,
}) {
  if (!open) return null;

  const isEdit = mode === "edit";
  const title = isEdit ? "Editar layout" : "Novo layout";
  const { Icon, label } = getOperationBadge(mode);

  return (
    <div className="emp-layout-preset-form-layer fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/80" aria-hidden="true" />

      <div className="relative flex h-full items-center justify-center p-3">
        <div
          className="cadastro-emp-scope emp-layout-presets-dialog emp-layout-preset-form-dialog relative w-[460px] max-w-[calc(100vw-24px)] gap-0 overflow-visible rounded-none border border-[#cfd8e3] bg-white shadow-lg"
          role="dialog"
          aria-label={title}
        >
          <button
            type="button"
            onClick={onClose}
            className="emp-layout-presets-close-icon"
            title="Fechar"
            aria-label="Fechar"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>

          <div className="emp-toolbar-info-bar flex h-6 items-center gap-2 border-b border-[#dce3eb] px-2">
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              <span className="shrink-0 text-xs font-semibold text-[#1a1f26]">Layout</span>
              <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" strokeWidth={2} aria-hidden="true" />
              <span className="min-w-0 truncate text-xs font-semibold text-[#1a1f26]">{title}</span>
              <IconActionBtn icon={Check} title="Salvar" onClick={onSave} className="ml-0.5 text-[#1a1f26]" />
              <IconActionBtn icon={X} title="Cancelar" onClick={onCancel} />
            </div>
            <span className="emp-toolbar-operation-label ml-auto inline-flex shrink-0 items-center gap-1 text-[12px] font-normal text-[#5b6b80] whitespace-nowrap">
              <Icon className="h-3 w-3 shrink-0 text-[#5b6b80]" strokeWidth={2} aria-hidden="true" />
              {label}
            </span>
          </div>

          <div className="bg-white p-1.5">
            <Card className="emp-table-shell overflow-hidden border border-[#c5ced8] bg-white shadow-none">
              <CardContent className="p-0">
                <Table className="emp-table-pro w-full border-separate border-spacing-0 table-fixed">
                  <TableBody>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="emp-th h-[26px] w-[110px] border-r border-b border-[#c5ced8] bg-white px-2 text-left text-xs font-semibold text-[#1a1f26]">
                        Nome
                      </TableHead>
                      <TableCell className="emp-td h-[26px] border-b border-[#c5ced8] px-2 py-0 align-middle">
                        <Input
                          value={name}
                          onChange={(event) => onNameChange?.(event.target.value)}
                          placeholder="Ex.: Layout comercial"
                          autoFocus
                          className="h-6 rounded-[5px] border-[#dce3eb] text-xs shadow-none focus-visible:ring-0"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="emp-th h-[26px] w-[110px] border-r border-[#c5ced8] bg-white px-2 text-left text-xs font-semibold text-[#1a1f26]">
                        Origem
                      </TableHead>
                      <TableCell className="emp-td h-[26px] px-2 py-0 align-middle">
                        <select
                          value={sourcePresetId}
                          onChange={(event) => onSourcePresetIdChange?.(event.target.value)}
                          disabled={isEdit}
                          className="emp-layout-config-select h-6 w-full rounded-[5px] border border-[#dce3eb] bg-white px-2 text-xs text-[#1a1f26] disabled:bg-[#f8fafc] disabled:text-[#5b6b80]"
                        >
                          {sourceOptions.map((preset) => (
                            <option key={preset.id} value={preset.id}>
                              {preset.isSystem ? "Padrão do sistema" : titleCase(preset.name)}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
