import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Plus, Trash2 } from "lucide-react";
import { DEFAULT_PRESET_ID } from "@/components/emp/layout/empFormLayoutStore";

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
    setNotice("");
  };

  const handleDuplicate = (preset) => {
    const baseName = `${preset.name} (cópia)`;
    onDuplicatePreset?.({ name: baseName, sourcePresetId: preset.id });
  };

  const handleSaveCurrent = () => {
    if (activePresetId === DEFAULT_PRESET_ID) {
      setNotice("Selecione ou crie um layout personalizado para salvar a configuração.");
      return;
    }
    onSaveCurrentPreset?.(currentConfig);
    setNotice("Layout salvo com sucesso.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="cadastro-emp-scope max-w-[760px] gap-0 overflow-hidden rounded-none border border-[#cfd8e3] p-0">
        <DialogTitle className="sr-only">Layouts personalizados</DialogTitle>
        <div className="border-b border-[#dce3eb] bg-white px-4 py-3">
          <div className="text-sm font-semibold text-[#1a1f26]">Layouts personalizados</div>
          <div className="text-xs text-[#5b6b80]">
            Crie, duplique e salve configurações de layout do formulário de empresas.
          </div>
        </div>

        <div className="max-h-[420px] overflow-auto bg-white p-4">
          <div className="mb-4 space-y-2">
            {presets.map((preset) => {
              const active = preset.id === activePresetId;
              return (
                <div
                  key={preset.id}
                  className={`flex items-center gap-2 rounded-[5px] border px-3 py-2 ${
                    active ? "border-[#21c45d] bg-[#f3fbf6]" : "border-[#dce3eb] bg-white"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-[#1a1f26]">
                      {titleCase(preset.name)}
                      {preset.isSystem ? " (sistema)" : ""}
                    </div>
                    {preset.updatedAt ? (
                      <div className="text-[11px] text-[#5b6b80]">
                        Atualizado em {new Date(preset.updatedAt).toLocaleString("pt-BR")}
                      </div>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-7 rounded-[5px] border-[#dce3eb] px-2 text-xs shadow-none"
                    onClick={() => onApplyPreset?.(preset.id)}
                  >
                    Aplicar
                  </Button>
                  {!preset.isSystem ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-7 w-7 rounded-[5px] border-[#dce3eb] p-0 shadow-none"
                        title="Duplicar layout"
                        onClick={() => handleDuplicate(preset)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-7 w-7 rounded-[5px] border-[#dce3eb] p-0 text-red-600 shadow-none"
                        title="Excluir layout"
                        onClick={() => onDeletePreset?.(preset.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="rounded-[5px] border border-[#dce3eb] bg-[#f8fafc] p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#5b6b80]">Novo layout</div>
            <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-2">
              <label className="text-right text-xs text-[#1a1f26]">Nome:</label>
              <Input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Ex.: Layout comercial"
                className="h-7 rounded-[5px] border-[#dce3eb] text-xs shadow-none"
              />
              <label className="text-right text-xs text-[#1a1f26]">Origem:</label>
              <select
                value={sourcePresetId}
                onChange={(event) => setSourcePresetId(event.target.value)}
                className="emp-layout-config-select h-7 rounded-[5px] border border-[#dce3eb] bg-white px-2 text-xs text-[#1a1f26]"
              >
                {sourceOptions.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.isSystem ? "Padrão do sistema" : titleCase(preset.name)}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button
                type="button"
                className="h-7 rounded-[5px] bg-[#21c45d] px-3 text-xs text-white hover:bg-[#1aad51]"
                onClick={handleCreate}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Criar layout
              </Button>
            </div>
          </div>

          {notice ? <div className="mt-3 text-xs text-[#5b6b80]">{notice}</div> : null}
        </div>

        <div className="flex items-center justify-between border-t border-[#dce3eb] bg-white px-4 py-3">
          <div className="text-xs text-[#5b6b80]">
            Layouts personalizados: {customPresets.length}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-7 rounded-[5px] border-[#dce3eb] px-3 text-xs shadow-none"
              onClick={handleSaveCurrent}
            >
              Salvar layout atual
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-7 rounded-[5px] border-[#dce3eb] px-3 text-xs shadow-none"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
