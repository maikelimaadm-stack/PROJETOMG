import React, { useEffect, useRef } from "react";
import { ChevronUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ToggleSwitch from "@/components/common/ToggleSwitch";
import EmpConditionalVisibilityEditor from "./EmpConditionalVisibilityEditor";

const AGGREGATION_OPTIONS = [
  { value: "sum", label: "Soma" },
  { value: "avg", label: "Média" },
  { value: "max", label: "Maior" },
  { value: "min", label: "Menor" },
];

const isInsideFloatingLayer = (target) => {
  if (!target || typeof target.closest !== "function") return false;
  if (target.closest('[role="listbox"], [role="option"], [data-radix-popper-content-wrapper]')) {
    return true;
  }
  const portaledLayers = document.querySelectorAll('[data-radix-select-content], [data-radix-popper-content-wrapper]');
  for (const layer of portaledLayers) {
    if (layer.contains(target)) return true;
  }
  return false;
};

export default function EmpLayoutFieldSettingsPopover({
  field,
  anchorRect,
  open,
  onClose,
  isEditing,
  isFieldRequired,
  fixedVisibleFieldIds = [],
  draftHiddenFieldIds = [],
  draftLockedFieldIds = [],
  draftAggregationConfig = {},
  draftVisibilityRules = {},
  fields = [],
  onToggleHidden,
  onToggleLocked,
  onToggleAggregation,
  onAggregationTypeChange,
  onVisibilityRuleChange,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event) => {
      const target = event.target;
      if (panelRef.current?.contains(target)) return;
      if (isInsideFloatingLayer(target)) return;
      onClose?.();
    };
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (document.querySelector('[data-radix-select-content][data-state="open"]')) return;
      onClose?.();
    };
    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !field || !anchorRect) return null;

  const required = isFieldRequired(field);
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
  const panelWidth = 420;
  const left = Math.min(Math.max(8, anchorRect.left), viewportWidth - panelWidth - 8);
  const top = anchorRect.bottom + 6;

  return (
    <div
      ref={panelRef}
      className="emp-layout-field-settings-popover fixed z-[200] w-[420px] max-w-[calc(100vw-16px)] overflow-hidden rounded-sm border border-[#cfd8e3] bg-white shadow-lg"
      style={{ top, left }}
      role="dialog"
      aria-label={`Configurações de ${field.label}`}
    >
      <div className="flex h-9 items-center justify-between bg-[#455a64] px-3 text-white">
        <span className="truncate text-sm font-semibold">{field.label}</span>
        <button
          type="button"
          className="inline-flex h-6 w-6 items-center justify-center rounded-sm text-white hover:bg-white/10"
          title="Fechar"
          onClick={onClose}
        >
          <ChevronUp className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-3 px-4 py-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <label className="flex items-center justify-between gap-2 text-[12px] text-[#1a1f26]">
            <span>Oculto</span>
            <ToggleSwitch
              checked={draftHiddenFieldIds.includes(field.id)}
              disabled={!isEditing || required || fixedVisibleFieldIds.includes(field.id)}
              onChange={(checked) => onToggleHidden?.(field.id, checked)}
              className="emp-form-toggle-switch"
              checkedClassName="emp-form-toggle-switch-on"
            />
          </label>
          <label className="flex items-center justify-between gap-2 text-[12px] text-[#1a1f26]">
            <span>Bloqueado</span>
            <ToggleSwitch
              checked={draftLockedFieldIds.includes(field.id)}
              disabled={!isEditing || required}
              onChange={(checked) => onToggleLocked?.(field.id, checked)}
              className="emp-form-toggle-switch"
              checkedClassName="emp-form-toggle-switch-on"
            />
          </label>
          <label className="flex items-center justify-between gap-2 text-[12px] text-[#1a1f26]">
            <span>Totalizar</span>
            <ToggleSwitch
              checked={!!draftAggregationConfig[field.id]?.enabled}
              disabled={!isEditing || !field?.totalizable}
              onChange={(checked) => onToggleAggregation?.(field.id, checked)}
              className="emp-form-toggle-switch"
              checkedClassName="emp-form-toggle-switch-on"
            />
          </label>
          <div className="flex flex-col gap-1 text-[12px] text-[#1a1f26]">
            <span>Tipo de totalização</span>
            <Select
              value={draftAggregationConfig[field.id]?.type || "sum"}
              onValueChange={(value) => onAggregationTypeChange?.(field.id, value)}
              disabled={!isEditing || !draftAggregationConfig[field.id]?.enabled}
            >
              <SelectTrigger className="emp-layout-config-select h-7 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[250]">
                {AGGREGATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="border-t border-[#e2e8f0] pt-3">
          <EmpConditionalVisibilityEditor
            selectedField={field}
            fields={fields}
            visibilityRules={draftVisibilityRules}
            onChange={onVisibilityRuleChange}
            disabled={!isEditing}
            selectContentClassName="z-[250]"
          />
        </div>
      </div>
    </div>
  );
}
