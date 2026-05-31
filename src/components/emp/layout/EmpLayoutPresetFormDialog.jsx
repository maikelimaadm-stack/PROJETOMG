import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { X } from "lucide-react";
import { DEFAULT_PRESET_ID } from "@/components/emp/layout/empFormLayoutStore";
import EmpToolbarInfoBar from "@/components/emp/toolbars/EmpToolbarInfoBar";

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
  onClose,
}) {
  if (!open) return null;

  const isEdit = mode === "edit";

  return (
    <div className="emp-layout-preset-form-layer fixed inset-0 z-[70] flex items-center justify-center pointer-events-none">
      <div
        className="cadastro-emp-scope emp-layout-presets-dialog emp-layout-preset-form-dialog relative pointer-events-auto w-[460px] max-w-[calc(100vw-24px)] gap-0 overflow-visible rounded-none border border-[#cfd8e3] bg-white shadow-lg"
        role="dialog"
        aria-label={isEdit ? "Editar layout" : "Novo layout"}
      >
        <button
          type="button"
          onClick={onClose}
          className="emp-layout-presets-close-tab"
          title="Fechar"
          aria-label="Fechar"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <EmpToolbarInfoBar
          badgeLabel="Layout"
          title={isEdit ? "Editar layout" : "Novo layout"}
          operationLabel={isEdit ? "EDIÇÃO DE LAYOUT" : "NOVO REGISTRO"}
        />

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
  );
}
