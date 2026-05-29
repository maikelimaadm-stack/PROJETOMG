import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Stub - layout configurator simplificado
export default function LayoutConfiguratorDialog({
  open,
  onOpenChange,
  inline = false,
  panels = [],
  fields = [],
  layout = {},
  hiddenFieldIds = [],
  lockedFieldIds = [],
  requiredFieldIds = [],
  aggregationConfig = {},
  visibilityRules = {},
  defaultConfig,
  onSave,
}) {
  const handleReset = () => {
    if (defaultConfig) onSave(defaultConfig);
    onOpenChange(false);
  };

  const content = (
    <div className="h-full flex flex-col bg-white p-4">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h2 className="text-sm font-semibold text-slate-700">Configuração do Layout</h2>
        <Button type="button" variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-7 w-7">
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
        Configuração de layout não disponível nesta versão.
      </div>
      <div className="flex gap-2 pt-2 border-t">
        <Button type="button" variant="outline" size="sm" onClick={handleReset} className="text-xs">
          Restaurar padrão
        </Button>
        <Button type="button" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
          Fechar
        </Button>
      </div>
    </div>
  );

  if (inline) return content;

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-lg h-96 rounded shadow-lg">{content}</div>
    </div>
  );
}