import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  DEFAULT_PRESET_ID,
  getLayoutPresetMetrics,
} from "@/components/emp/layout/empFormLayoutStore";
import EmpBubbleCounter from "@/components/emp/shared/EmpBubbleCounter";
import EmpToolbarIcon from "@/components/emp/toolbars/EmpToolbarIcon";
import EmpToolbarInfoBar from "@/components/emp/toolbars/EmpToolbarInfoBar";
import { EMP_TOOLBAR_BTN } from "@/components/emp/toolbars/empToolbarStyles";

const LABELED_BTN_CLASS = "emp-toolbar-btn-labeled w-auto px-2 gap-1.5 text-[12px] font-medium";
const EMPTY_SOURCE_ID = "__empty__";

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

const getOriginLabel = (preset, presets) => {
  if (preset?.isSystem) return "Padrão do sistema";
  if (preset?.sourcePresetId) {
    const source = presets.find((item) => item.id === preset.sourcePresetId);
    if (source) return source.isSystem ? "Padrão do sistema" : titleCase(source.name);
  }
  return "—";
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
  const [inlineMode, setInlineMode] = useState(null);
  const [draftName, setDraftName] = useState("");
  const [draftSourcePresetId, setDraftSourcePresetId] = useState(EMPTY_SOURCE_ID);
  const [notice, setNotice] = useState("");

  const isInlineEditing = inlineMode === "new" || inlineMode === "edit";
  const selectedPreset = presets.find((preset) => preset.id === selectedPresetId) || null;
  const canEditSelected = !!selectedPreset && !selectedPreset.isSystem && inlineMode !== "new";
  const canDeleteSelected = canEditSelected && inlineMode !== "edit";

  useEffect(() => {
    if (!open) return;
    setSelectedPresetId(activePresetId || DEFAULT_PRESET_ID);
    setInlineMode(null);
    setDraftName("");
    setDraftSourcePresetId(EMPTY_SOURCE_ID);
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

  const sourceOptions = useMemo(() => presets, [presets]);

  const resetInline = () => {
    setInlineMode(null);
    setDraftName("");
    setDraftSourcePresetId(EMPTY_SOURCE_ID);
  };

  const handleNovo = () => {
    if (inlineMode === "new") return;
    setInlineMode("new");
    setDraftName("");
    setDraftSourcePresetId(EMPTY_SOURCE_ID);
    setNotice("");
  };

  const handleEditar = () => {
    if (!canEditSelected) return;
    setInlineMode("edit");
    setDraftName(selectedPreset.name);
    setNotice("");
  };

  const handleCancelar = () => {
    resetInline();
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
        (inlineMode !== "edit" || preset.id !== selectedPresetId)
    );
    if (duplicate) {
      setNotice("Já existe um layout com esse nome.");
      return;
    }

    if (inlineMode === "new") {
      const sourcePresetId = draftSourcePresetId === EMPTY_SOURCE_ID ? "" : draftSourcePresetId;
      onCreatePreset?.({ name, sourcePresetId });
      setNotice("Layout criado com sucesso.");
      resetInline();
      return;
    }

    if (inlineMode === "edit" && selectedPresetId) {
      onRenamePreset?.({ presetId: selectedPresetId, name });
      setNotice("Layout atualizado com sucesso.");
      resetInline();
    }
  };

  const handleExcluir = () => {
    if (!canDeleteSelected) return;
    onDeletePreset?.(selectedPresetId);
    setSelectedPresetId(activePresetId || DEFAULT_PRESET_ID);
    setNotice("Layout excluído com sucesso.");
  };

  const renderOriginSelect = (value, onChange, disabled = false) => (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      onClick={(event) => event.stopPropagation()}
      className="emp-layout-config-select h-6 w-full min-w-0 rounded-[5px] border border-[#dce3eb] bg-white px-1 text-xs text-[#1a1f26] disabled:bg-[#f8fafc] disabled:text-[#5b6b80]"
    >
      <option value={EMPTY_SOURCE_ID}>—</option>
      {sourceOptions.map((preset) => (
        <option key={preset.id} value={preset.id}>
          {preset.isSystem ? "Padrão do sistema" : titleCase(preset.name)}
        </option>
      ))}
    </select>
  );

  return (
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
          <X className="h-3 w-3" strokeWidth={2} />
        </button>

        <div className="emp-toolbar flex items-center gap-1.5 border-b border-sky-100 bg-white px-2 py-1.5">
          {!isInlineEditing ? (
            <>
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
            </>
          ) : (
            <>
              <ToolbarBtn onClick={handleSalvar} className={LABELED_BTN_CLASS} title="Salvar">
                <EmpToolbarIcon icon={Check} strokeWidth={2.5} />
                <span>Salvar</span>
              </ToolbarBtn>
              <ToolbarBtn onClick={handleCancelar} className={LABELED_BTN_CLASS} title="Cancelar">
                <EmpToolbarIcon icon={X} />
                <span>Cancelar</span>
              </ToolbarBtn>
            </>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            <EmpBubbleCounter value={String(presets.length)} title="Total de layouts" className="emp-toolbar-bubble-counter" />
          </div>
        </div>

        <EmpToolbarInfoBar
          badgeLabel="Layouts"
          title="Gerenciamento de layouts personalizados"
          operationLabel={isInlineEditing ? (inlineMode === "new" ? "NOVO REGISTRO" : "EDIÇÃO DE REGISTRO") : "CONSULTA"}
        />

        <div className="max-h-[520px] overflow-hidden bg-white p-1">
          <Card className="emp-table-shell overflow-hidden border border-[#c5ced8] bg-white shadow-none">
            <CardContent className="p-0">
              <div className="max-h-[480px] overflow-auto">
                <Table className="emp-table-pro w-full border-separate border-spacing-0 table-fixed select-none">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="emp-th h-[26px] w-[30%] border-r border-b border-[#c5ced8] bg-white px-1 text-left text-xs font-semibold text-[#1a1f26]">
                        Nome
                      </TableHead>
                      <TableHead className="emp-th h-[26px] w-[26%] border-r border-b border-[#c5ced8] bg-white px-1 text-left text-xs font-semibold text-[#1a1f26]">
                        Origem
                      </TableHead>
                      <TableHead className="emp-th h-[26px] w-[12%] border-r border-b border-[#c5ced8] bg-white px-1 text-center text-xs font-semibold text-[#1a1f26]">
                        Painéis
                      </TableHead>
                      <TableHead className="emp-th h-[26px] w-[12%] border-r border-b border-[#c5ced8] bg-white px-1 text-center text-xs font-semibold text-[#1a1f26]">
                        Campos
                      </TableHead>
                      <TableHead className="emp-th h-[26px] border-b border-[#c5ced8] bg-white px-1 text-left text-xs font-semibold text-[#1a1f26]">
                        Atualizado
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inlineMode === "new" ? (
                      <TableRow className="emp-row-selected hover:bg-transparent">
                        <TableCell className="emp-td h-[26px] border-r border-b border-[#c5ced8] px-1 py-0 align-middle">
                          <Input
                            value={draftName}
                            onChange={(event) => setDraftName(event.target.value)}
                            placeholder="Nome do layout"
                            autoFocus
                            onClick={(event) => event.stopPropagation()}
                            className="h-6 rounded-[5px] border-[#dce3eb] px-1 text-xs shadow-none focus-visible:ring-0"
                          />
                        </TableCell>
                        <TableCell className="emp-td h-[26px] border-r border-b border-[#c5ced8] px-1 py-0 align-middle">
                          {renderOriginSelect(draftSourcePresetId, (event) => setDraftSourcePresetId(event.target.value))}
                        </TableCell>
                        <TableCell className="emp-td h-[26px] border-r border-b border-[#c5ced8] px-1 py-0 text-center align-middle text-xs text-[#5b6b80]">
                          0
                        </TableCell>
                        <TableCell className="emp-td h-[26px] border-r border-b border-[#c5ced8] px-1 py-0 text-center align-middle text-xs text-[#5b6b80]">
                          0
                        </TableCell>
                        <TableCell className="emp-td h-[26px] border-b border-[#c5ced8] px-1 py-0 align-middle text-xs text-[#5b6b80]">
                          —
                        </TableCell>
                      </TableRow>
                    ) : null}

                    {presetRows.map(({ preset, metrics }, index) => {
                      const rowIndex = inlineMode === "new" ? index + 1 : index;
                      const selected = preset.id === selectedPresetId;
                      const isEditingRow = inlineMode === "edit" && selected;
                      const rowClass = getRowBgClass(rowIndex, selected || isEditingRow);

                      return (
                        <TableRow
                          key={preset.id}
                          className={`${rowClass} cursor-pointer transition-colors hover:brightness-[0.98]`}
                          onClick={() => {
                            if (inlineMode === "new") return;
                            setSelectedPresetId(preset.id);
                          }}
                        >
                          <TableCell className={`emp-td h-[26px] border-r border-b border-[#c5ced8] px-1 py-0 align-middle text-xs ${rowClass}`}>
                            {isEditingRow ? (
                              <Input
                                value={draftName}
                                onChange={(event) => setDraftName(event.target.value)}
                                autoFocus
                                onClick={(event) => event.stopPropagation()}
                                className="h-6 rounded-[5px] border-[#dce3eb] px-1 text-xs shadow-none focus-visible:ring-0"
                              />
                            ) : (
                              <span className={`block truncate text-[#1a1f26] ${selected ? "font-semibold" : ""}`}>
                                {titleCase(preset.name)}
                                {preset.isSystem ? " (sistema)" : ""}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className={`emp-td h-[26px] border-r border-b border-[#c5ced8] px-1 py-0 align-middle text-xs text-[#5b6b80] ${rowClass}`}>
                            {getOriginLabel(preset, presets)}
                          </TableCell>
                          <TableCell className={`emp-td h-[26px] border-r border-b border-[#c5ced8] px-1 py-0 text-center align-middle text-xs text-[#1a1f26] ${rowClass}`}>
                            {metrics.panelCount}
                          </TableCell>
                          <TableCell className={`emp-td h-[26px] border-r border-b border-[#c5ced8] px-1 py-0 text-center align-middle text-xs text-[#1a1f26] ${rowClass}`}>
                            {metrics.fieldCount}
                          </TableCell>
                          <TableCell className={`emp-td h-[26px] border-b border-[#c5ced8] px-1 py-0 align-middle text-xs text-[#5b6b80] ${rowClass}`}>
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

          {notice ? <div className="mt-1 px-0.5 text-xs text-[#5b6b80]">{notice}</div> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
