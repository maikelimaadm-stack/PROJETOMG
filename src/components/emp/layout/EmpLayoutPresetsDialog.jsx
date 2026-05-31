import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import {
  DEFAULT_PRESET_ID,
  getLayoutPresetMetrics,
} from "@/components/emp/layout/empFormLayoutStore";
import EmpLayoutPresetFormDialog from "@/components/emp/layout/EmpLayoutPresetFormDialog";
import EmpBubbleCounter from "@/components/emp/shared/EmpBubbleCounter";
import EmpToolbarIcon from "@/components/emp/toolbars/EmpToolbarIcon";
import EmpToolbarInfoBar from "@/components/emp/toolbars/EmpToolbarInfoBar";
import { EMP_TOOLBAR_BTN } from "@/components/emp/toolbars/empToolbarStyles";

const LABELED_BTN_CLASS = "emp-toolbar-btn-labeled w-auto px-2 gap-1.5 text-[12px] font-medium";

const ToolbarBtn = ({ children, className = "", ...props }) => (
  <button type="button" className={`${EMP_TOOLBAR_BTN} ${className}`} {...props}>
    {children}
  </button>
);

const titleCase = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/(^|\s)([a-záàâãéèêíóôõúç])/g, (match) => match.toUpperCase());

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR");
};

const getRowBgClass = (index, selected) => {
  if (selected) return "emp-row-selected";
  return index % 2 === 0 ? "emp-row-even" : "emp-row-odd";
};

export default function EmpLayoutPresetsDialog({
  open,
  onOpenChange,
  presets = [],
  activePresetId,
  defaultConfig,
  onCreatePreset,
  onRenamePreset,
  onDeletePreset,
}) {
  const [selectedPresetId, setSelectedPresetId] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState(null);
  const [draftName, setDraftName] = useState("");
  const [draftSourcePresetId, setDraftSourcePresetId] = useState(DEFAULT_PRESET_ID);
  const [notice, setNotice] = useState("");

  const selectedPreset = presets.find((preset) => preset.id === selectedPresetId) || null;
  const canEditSelected = !!selectedPreset && !selectedPreset.isSystem;
  const canDeleteSelected = canEditSelected;

  useEffect(() => {
    if (!open) return;
    setSelectedPresetId(activePresetId || DEFAULT_PRESET_ID);
    setFormOpen(false);
    setFormMode(null);
    setDraftName("");
    setDraftSourcePresetId(activePresetId || DEFAULT_PRESET_ID);
    setNotice("");
  }, [open, activePresetId]);

  const presetRows = useMemo(
    () =>
      presets.map((preset) => {
        const config = preset.isSystem || !preset.config ? defaultConfig : preset.config;
        const metrics = getLayoutPresetMetrics(config, defaultConfig);
        return { preset, metrics };
      }),
    [presets, defaultConfig]
  );

  const resetForm = () => {
    setFormOpen(false);
    setFormMode(null);
    setDraftName("");
    setDraftSourcePresetId(activePresetId || DEFAULT_PRESET_ID);
  };

  const handleNovo = () => {
    setFormMode("new");
    setFormOpen(true);
    setDraftName("");
    setDraftSourcePresetId(activePresetId || DEFAULT_PRESET_ID);
    setNotice("");
  };

  const handleEditar = () => {
    if (!canEditSelected) return;
    setFormMode("edit");
    setFormOpen(true);
    setDraftName(selectedPreset.name);
    setDraftSourcePresetId(selectedPreset.id);
    setNotice("");
  };

  const handleCancelar = () => {
    resetForm();
    setNotice("");
  };

  const handleSalvar = () => {
    const name = draftName.trim();
    if (!name) {
      setNotice("Informe um nome para o layout.");
      return;
    }

    const duplicate = presets.some(
      (preset) =>
        !preset.isSystem &&
        preset.name.toLowerCase() === name.toLowerCase() &&
        (formMode !== "edit" || preset.id !== selectedPresetId)
    );
    if (duplicate) {
      setNotice("Já existe um layout com esse nome.");
      return;
    }

    if (formMode === "new") {
      onCreatePreset?.({ name, sourcePresetId: draftSourcePresetId });
      setNotice("Layout criado com sucesso.");
      resetForm();
      return;
    }

    if (formMode === "edit" && selectedPresetId) {
      onRenamePreset?.({ presetId: selectedPresetId, name });
      setNotice("Layout atualizado com sucesso.");
      resetForm();
    }
  };

  const handleExcluir = () => {
    if (!canDeleteSelected) return;
    onDeletePreset?.(selectedPresetId);
    setSelectedPresetId(activePresetId || DEFAULT_PRESET_ID);
    setNotice("Layout excluído com sucesso.");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="cadastro-emp-scope emp-layout-presets-dialog max-w-[920px] gap-0 overflow-visible rounded-none border border-[#cfd8e3] p-0 [&>button:last-child]:hidden">
          <DialogTitle className="sr-only">Layouts personalizados</DialogTitle>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="emp-layout-presets-close-icon"
            title="Fechar"
            aria-label="Fechar"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>

          <div className="emp-toolbar flex items-center gap-1.5 border-b border-sky-100 bg-white px-2 py-1.5">
            <ToolbarBtn onClick={handleNovo} className={`${LABELED_BTN_CLASS} emp-toolbar-btn-new`} title="Novo layout">
              <EmpToolbarIcon icon={Plus} strokeWidth={2.5} />
              <span>Novo</span>
            </ToolbarBtn>
            <ToolbarBtn onClick={handleEditar} className={LABELED_BTN_CLASS} disabled={!canEditSelected} title="Editar">
              <EmpToolbarIcon icon={Pencil} />
              <span>Editar</span>
            </ToolbarBtn>
            <ToolbarBtn
              onClick={handleExcluir}
              className={`${LABELED_BTN_CLASS} emp-toolbar-btn-delete`}
              disabled={!canDeleteSelected}
              title="Excluir"
            >
              <EmpToolbarIcon icon={Trash2} />
              <span>Excluir</span>
            </ToolbarBtn>

            <div className="ml-auto flex items-center gap-1.5">
              <EmpBubbleCounter value={String(presets.length)} title="Total de layouts" className="emp-toolbar-bubble-counter" />
            </div>
          </div>

          <EmpToolbarInfoBar
            badgeLabel="Layouts"
            title="Gerenciamento de layouts personalizados"
            operationLabel="CONSULTA"
          />

          <div className="max-h-[520px] overflow-hidden bg-white p-1.5">
            <Card className="emp-table-shell overflow-hidden border border-[#c5ced8] bg-white shadow-none">
              <CardContent className="p-0">
                <div className="max-h-[480px] overflow-auto">
                  <Table className="emp-table-pro w-full border-separate border-spacing-0 table-fixed select-none">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="emp-th h-[26px] w-[40%] border-r border-b border-[#c5ced8] bg-white px-2 text-left text-xs font-semibold text-[#1a1f26]">
                          Nome
                        </TableHead>
                        <TableHead className="emp-th h-[26px] w-[15%] border-r border-b border-[#c5ced8] bg-white px-2 text-center text-xs font-semibold text-[#1a1f26]">
                          Painéis
                        </TableHead>
                        <TableHead className="emp-th h-[26px] w-[15%] border-r border-b border-[#c5ced8] bg-white px-2 text-center text-xs font-semibold text-[#1a1f26]">
                          Campos
                        </TableHead>
                        <TableHead className="emp-th h-[26px] border-b border-[#c5ced8] bg-white px-2 text-left text-xs font-semibold text-[#1a1f26]">
                          Atualizado
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {presetRows.map(({ preset, metrics }, index) => {
                        const selected = preset.id === selectedPresetId;
                        const rowClass = getRowBgClass(index, selected);

                        return (
                          <TableRow
                            key={preset.id}
                            className={`${rowClass} cursor-pointer transition-colors hover:brightness-[0.98]`}
                            onClick={() => setSelectedPresetId(preset.id)}
                          >
                            <TableCell className={`emp-td h-[26px] border-r border-b border-[#c5ced8] px-2 py-0 align-middle text-xs ${rowClass} ${selected ? "font-semibold" : ""}`}>
                              <span className="block truncate text-[#1a1f26]">
                                {titleCase(preset.name)}
                                {preset.isSystem ? " (sistema)" : ""}
                              </span>
                            </TableCell>
                            <TableCell className={`emp-td h-[26px] border-r border-b border-[#c5ced8] px-2 py-0 text-center align-middle text-xs text-[#1a1f26] ${rowClass}`}>
                              {metrics.panelCount}
                            </TableCell>
                            <TableCell className={`emp-td h-[26px] border-r border-b border-[#c5ced8] px-2 py-0 text-center align-middle text-xs text-[#1a1f26] ${rowClass}`}>
                              {metrics.fieldCount}
                            </TableCell>
                            <TableCell className={`emp-td h-[26px] border-b border-[#c5ced8] px-2 py-0 align-middle text-xs text-[#5b6b80] ${rowClass}`}>
                              {formatDate(preset.updatedAt)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {notice ? <div className="mt-1 px-1 text-xs text-[#5b6b80]">{notice}</div> : null}
          </div>
        </DialogContent>
      </Dialog>

      <EmpLayoutPresetFormDialog
        open={formOpen}
        mode={formMode || "new"}
        name={draftName}
        sourcePresetId={draftSourcePresetId}
        sourceOptions={presets}
        onNameChange={setDraftName}
        onSourcePresetIdChange={setDraftSourcePresetId}
        onSave={handleSalvar}
        onCancel={handleCancelar}
        onClose={handleCancelar}
      />
    </>
  );
}
