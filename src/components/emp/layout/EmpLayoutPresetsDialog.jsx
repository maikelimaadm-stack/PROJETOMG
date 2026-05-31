import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Copy, Plus, Trash2, X } from "lucide-react";
import {
  DEFAULT_PRESET_ID,
  getLayoutPresetMetrics,
} from "@/components/emp/layout/empFormLayoutStore";
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

export default function EmpLayoutPresetsDialog({
  open,
  onOpenChange,
  presets = [],
  activePresetId,
  currentConfig,
  defaultConfig,
  onApplyPreset,
  onCreatePreset,
  onDuplicatePreset,
  onDeletePreset,
  onSaveCurrentPreset,
}) {
  const [newName, setNewName] = useState("");
  const [sourcePresetId, setSourcePresetId] = useState(DEFAULT_PRESET_ID);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!open) return;
    setNewName("");
    setSourcePresetId(activePresetId || DEFAULT_PRESET_ID);
    setNotice("");
  }, [open, activePresetId]);

  const sourceOptions = useMemo(() => presets, [presets]);

  const presetRows = useMemo(
    () =>
      presets.map((preset) => {
        const config = preset.isSystem || !preset.config ? defaultConfig : preset.config;
        const metrics = getLayoutPresetMetrics(config, defaultConfig);
        return { preset, metrics };
      }),
    [presets, defaultConfig]
  );

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) {
      setNotice("Informe um nome para o layout.");
      return;
    }
    if (presets.some((preset) => !preset.isSystem && preset.name.toLowerCase() === name.toLowerCase())) {
      setNotice("Já existe um layout com esse nome.");
      return;
    }
    onCreatePreset?.({ name, sourcePresetId });
    setNewName("");
    setNotice("Layout criado com sucesso.");
  };

  const handleDuplicate = (preset) => {
    onDuplicatePreset?.({ name: `${preset.name} (cópia)`, sourcePresetId: preset.id });
    setNotice("Layout duplicado com sucesso.");
  };

  const handleSave = () => {
    onSaveCurrentPreset?.(currentConfig);
    setNotice("Layout salvo com sucesso.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="cadastro-emp-scope emp-layout-presets-dialog max-w-[920px] gap-0 overflow-hidden rounded-none border border-[#cfd8e3] p-0">
        <DialogTitle className="sr-only">Layouts personalizados</DialogTitle>

        <div className="emp-toolbar relative flex items-center gap-1.5 border-b border-sky-100 bg-white px-2 py-1.5">
          <ToolbarBtn onClick={handleCreate} className={`${LABELED_BTN_CLASS} emp-toolbar-btn-new`} title="Criar layout">
            <EmpToolbarIcon icon={Plus} strokeWidth={2.5} />
            <span>Criar layout</span>
          </ToolbarBtn>
          <ToolbarBtn onClick={handleSave} className={LABELED_BTN_CLASS} title="Salvar">
            <EmpToolbarIcon icon={Check} strokeWidth={2.5} />
            <span>Salvar</span>
          </ToolbarBtn>
          <div className="ml-auto flex items-center gap-1.5 pr-8">
            <EmpBubbleCounter value={String(presets.length)} title="Total de layouts" className="emp-toolbar-bubble-counter" />
          </div>
          <ToolbarBtn
            onClick={() => onOpenChange(false)}
            className="absolute right-2 top-1/2 -translate-y-1/2"
            title="Fechar"
          >
            <EmpToolbarIcon icon={X} />
          </ToolbarBtn>
        </div>

        <EmpToolbarInfoBar
          badgeLabel="Layouts"
          title="Gerenciamento de layouts personalizados"
          operationLabel="Configuração"
        />

        <div className="max-h-[520px] overflow-auto bg-white p-2">
          <div className="emp-layout-presets-section mb-3">
            <div className="mb-1 flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-[#1a1f26]">Novo layout</span>
            </div>
            <div className="emp-table-shell overflow-hidden border border-[#c5ced8] bg-white">
              <Table className="emp-table-pro w-full border-separate border-spacing-0 table-fixed">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="emp-th h-[26px] w-[38%] border-r border-b border-[#c5ced8] bg-white px-2 text-xs font-semibold text-[#1a1f26]">
                      Nome
                    </TableHead>
                    <TableHead className="emp-th h-[26px] border-b border-[#c5ced8] bg-white px-2 text-xs font-semibold text-[#1a1f26]">
                      Origem
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-transparent">
                    <TableCell className="emp-td h-[30px] border-r border-b border-[#c5ced8] px-2 py-0 align-middle">
                      <Input
                        value={newName}
                        onChange={(event) => setNewName(event.target.value)}
                        placeholder="Ex.: Layout comercial"
                        className="h-6 rounded-[5px] border-[#dce3eb] text-xs shadow-none focus-visible:ring-0"
                      />
                    </TableCell>
                    <TableCell className="emp-td h-[30px] border-b border-[#c5ced8] px-2 py-0 align-middle">
                      <select
                        value={sourcePresetId}
                        onChange={(event) => setSourcePresetId(event.target.value)}
                        className="emp-layout-config-select h-6 w-full rounded-[5px] border border-[#dce3eb] bg-white px-2 text-xs text-[#1a1f26]"
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
            </div>
          </div>

          <div className="emp-layout-presets-section">
            <div className="mb-1 flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-[#1a1f26]">Layouts em uso</span>
              <span className="text-xs text-[#5b6b80]">{presets.length} registro(s)</span>
            </div>
            <div className="emp-table-shell overflow-hidden border border-[#c5ced8] bg-white">
              <Table className="emp-table-pro w-full border-separate border-spacing-0 table-fixed">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="emp-th h-[26px] w-[34%] border-r border-b border-[#c5ced8] bg-white px-2 text-xs font-semibold text-[#1a1f26]">
                      Nome
                    </TableHead>
                    <TableHead className="emp-th h-[26px] w-[12%] border-r border-b border-[#c5ced8] bg-white px-2 text-center text-xs font-semibold text-[#1a1f26]">
                      Painéis
                    </TableHead>
                    <TableHead className="emp-th h-[26px] w-[12%] border-r border-b border-[#c5ced8] bg-white px-2 text-center text-xs font-semibold text-[#1a1f26]">
                      Campos
                    </TableHead>
                    <TableHead className="emp-th h-[26px] w-[22%] border-r border-b border-[#c5ced8] bg-white px-2 text-xs font-semibold text-[#1a1f26]">
                      Atualizado
                    </TableHead>
                    <TableHead className="emp-th h-[26px] border-b border-[#c5ced8] bg-white px-2 text-center text-xs font-semibold text-[#1a1f26]">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {presetRows.map(({ preset, metrics }) => {
                    const active = preset.id === activePresetId;
                    return (
                      <TableRow
                        key={preset.id}
                        className={`hover:bg-[#f8fafc] ${active ? "bg-[#f3fbf6]" : "bg-white"}`}
                      >
                        <TableCell className="emp-td h-[30px] border-r border-b border-[#c5ced8] px-2 py-0 align-middle text-xs text-[#1a1f26]">
                          <span className={`block truncate ${active ? "font-semibold" : ""}`}>
                            {titleCase(preset.name)}
                            {preset.isSystem ? " (sistema)" : ""}
                          </span>
                        </TableCell>
                        <TableCell className="emp-td h-[30px] border-r border-b border-[#c5ced8] px-2 py-0 text-center align-middle text-xs text-[#1a1f26]">
                          {metrics.panelCount}
                        </TableCell>
                        <TableCell className="emp-td h-[30px] border-r border-b border-[#c5ced8] px-2 py-0 text-center align-middle text-xs text-[#1a1f26]">
                          {metrics.fieldCount}
                        </TableCell>
                        <TableCell className="emp-td h-[30px] border-r border-b border-[#c5ced8] px-2 py-0 align-middle text-xs text-[#5b6b80]">
                          {formatDate(preset.updatedAt)}
                        </TableCell>
                        <TableCell className="emp-td h-[30px] border-b border-[#c5ced8] px-1 py-0 align-middle">
                          <div className="flex items-center justify-center gap-1">
                            <ToolbarBtn
                              onClick={() => onApplyPreset?.(preset.id)}
                              title="Aplicar layout"
                            >
                              <EmpToolbarIcon icon={Check} strokeWidth={2.5} />
                            </ToolbarBtn>
                            {!preset.isSystem ? (
                              <>
                                <ToolbarBtn onClick={() => handleDuplicate(preset)} title="Duplicar layout">
                                  <EmpToolbarIcon icon={Copy} />
                                </ToolbarBtn>
                                <ToolbarBtn
                                  onClick={() => onDeletePreset?.(preset.id)}
                                  className="emp-toolbar-btn-delete"
                                  title="Excluir layout"
                                >
                                  <EmpToolbarIcon icon={Trash2} />
                                </ToolbarBtn>
                              </>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {notice ? <div className="mt-2 px-1 text-xs text-[#5b6b80]">{notice}</div> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
