import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Copy, Plus, Trash2 } from "lucide-react";
import { DEFAULT_PRESET_ID } from "@/components/emp/layout/empFormLayoutStore";
import EmpToolbarIcon from "@/components/emp/toolbars/EmpToolbarIcon";
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

export default function EmpLayoutPresetsDialog({
  open,
  onOpenChange,
  presets = [],
  activePresetId,
  currentConfig,
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

  const customPresets = useMemo(() => presets.filter((preset) => !preset.isSystem), [presets]);
  const sourceOptions = useMemo(() => presets, [presets]);

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
    const baseName = `${preset.name} (cópia)`;
    onDuplicatePreset?.({ name: baseName, sourcePresetId: preset.id });
    setNotice("Layout duplicado com sucesso.");
  };

  const handleSaveCurrent = () => {
    onSaveCurrentPreset?.(currentConfig);
    setNotice(
      activePresetId === DEFAULT_PRESET_ID
        ? "Layout padrão salvo com sucesso."
        : "Layout personalizado salvo com sucesso."
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="cadastro-emp-scope emp-layout-presets-dialog max-w-[760px] gap-0 overflow-hidden rounded-none border border-[#cfd8e3] p-0">
        <DialogTitle className="sr-only">Layouts personalizados</DialogTitle>
        <div className="emp-toolbar-info-bar flex h-8 items-center gap-2 border-b border-[#dce3eb] px-3">
          <span className="text-xs font-semibold text-[#1a1f26]">Layouts personalizados</span>
          <span className="text-xs text-[#5b6b80]">Crie, duplique e salve configurações do formulário</span>
        </div>

        <div className="max-h-[420px] overflow-auto bg-white p-3">
          <div className="mb-3 space-y-2">
            {presets.map((preset) => {
              const active = preset.id === activePresetId;
              return (
                <div
                  key={preset.id}
                  className={`flex items-center gap-1.5 rounded-[5px] border px-2 py-1.5 ${
                    active ? "border-[#21c45d] bg-[#f3fbf6]" : "border-[#dce3eb] bg-white"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold text-[#1a1f26]">
                      {titleCase(preset.name)}
                      {preset.isSystem ? " (sistema)" : ""}
                    </div>
                    {preset.updatedAt ? (
                      <div className="text-[11px] text-[#5b6b80]">
                        Atualizado em {new Date(preset.updatedAt).toLocaleString("pt-BR")}
                      </div>
                    ) : null}
                  </div>
                  <ToolbarBtn
                    onClick={() => onApplyPreset?.(preset.id)}
                    className={LABELED_BTN_CLASS}
                    title="Aplicar layout"
                  >
                    Aplicar
                  </ToolbarBtn>
                  {!preset.isSystem ? (
                    <>
                      <ToolbarBtn
                        onClick={() => handleDuplicate(preset)}
                        title="Duplicar layout"
                      >
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
              );
            })}
          </div>

          <div className="rounded-[5px] border border-[#dce3eb] bg-[#f8fafc] p-3">
            <div className="mb-2 text-xs font-semibold text-[#1a1f26]">Novo layout</div>
            <div className="grid grid-cols-[110px_minmax(0,1fr)] items-center gap-2">
              <label className="text-right text-xs text-[#1a1f26]">Nome:</label>
              <Input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Ex.: Layout comercial"
                className="h-6 rounded-[5px] border-[#dce3eb] text-xs shadow-none focus-visible:ring-0"
              />
              <label className="text-right text-xs text-[#1a1f26]">Origem:</label>
              <select
                value={sourcePresetId}
                onChange={(event) => setSourcePresetId(event.target.value)}
                className="emp-layout-config-select h-6 rounded-[5px] border border-[#dce3eb] bg-white px-2 text-xs text-[#1a1f26]"
              >
                {sourceOptions.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.isSystem ? "Padrão do sistema" : titleCase(preset.name)}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-3 flex justify-end">
              <ToolbarBtn onClick={handleCreate} className={`${LABELED_BTN_CLASS} emp-toolbar-btn-new`} title="Criar layout">
                <EmpToolbarIcon icon={Plus} strokeWidth={2.5} />
                <span>Criar layout</span>
              </ToolbarBtn>
            </div>
          </div>

          {notice ? <div className="mt-3 text-xs text-[#5b6b80]">{notice}</div> : null}
        </div>

        <div className="emp-toolbar flex items-center justify-between border-t border-[#dce3eb] bg-white px-3 py-2">
          <div className="text-xs text-[#5b6b80]">Layouts personalizados: {customPresets.length}</div>
          <div className="flex items-center gap-1.5">
            <ToolbarBtn onClick={handleSaveCurrent} className={LABELED_BTN_CLASS} title="Salvar layout atual">
              <span>Salvar layout atual</span>
            </ToolbarBtn>
            <ToolbarBtn onClick={() => onOpenChange(false)} className={LABELED_BTN_CLASS} title="Fechar">
              <span>Fechar</span>
            </ToolbarBtn>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
