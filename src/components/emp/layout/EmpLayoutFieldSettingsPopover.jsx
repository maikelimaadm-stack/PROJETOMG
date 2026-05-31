import React, { useCallback, useEffect, useRef, useState } from "react";
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
  return !!target.closest(
    '[role="listbox"], [role="option"], [data-radix-popper-content-wrapper], [data-radix-select-viewport]'
  );
};

const ToggleRow = ({ label, checked, disabled, onChange }) => (
  <label className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] text-[#1a1f26]">
    <span>{label}</span>
    <ToggleSwitch
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      className="emp-form-toggle-switch"
      checkedClassName="emp-form-toggle-switch-on"
    />
  </label>
);

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
  draftClearOnDuplicateFieldIds = [],
  draftAggregationConfig = {},
  draftVisibilityRules = {},
  fields = [],
  onToggleHidden,
  onToggleLocked,
  onToggleClearOnDuplicate,
  onToggleAggregation,
  onAggregationTypeChange,
  onVisibilityRuleChange,
}) {
  const panelRef = useRef(null);
  const [panelEl, setPanelEl] = useState(null);
  const ignoreCloseUntilRef = useRef(0);

  const setPanelNode = useCallback((node) => {
    panelRef.current = node;
    setPanelEl(node);
  }, []);

  const scheduleIgnoreClose = useCallback(() => {
    ignoreCloseUntilRef.current = Date.now() + 280;
  }, []);

  useEffect(() => {
    if (!open) return;

    const shouldClose = (target) => {
      if (!target) return false;
      if (Date.now() < ignoreCloseUntilRef.current) return false;
      if (panelRef.current?.contains(target)) return false;
      if (isInsideFloatingLayer(target)) return false;
      return true;
    };

    const handlePointerDown = (event) => {
      if (!shouldClose(event.target)) return;
      onClose?.();
    };

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      const openListbox = panelRef.current?.querySelector('[role="listbox"][data-state="open"]');
      if (openListbox) return;
      onClose?.();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !field || !anchorRect) return null;

  const required = isFieldRequired(field);
  const panelWidth = 560;
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
  const left = Math.min(Math.max(8, anchorRect.left), viewportWidth - panelWidth - 8);
  const top = anchorRect.bottom + 6;

  return (
    <div
      ref={setPanelNode}
      className="emp-layout-field-settings-popover fixed z-[200] w-[560px] max-w-[calc(100vw-16px)] overflow-visible border border-[#cfd8e3] bg-white shadow-lg"
      style={{ top, left }}
      role="dialog"
      aria-label={`Configurações de ${field.label}`}
      onPointerDownCapture={scheduleIgnoreClose}
    >
      <div className="overflow-hidden rounded-[var(--emp-control-radius)] bg-white">
        <div className="flex h-9 items-center justify-between border-b border-[#e2e8f0] bg-white px-3">
          <span className="truncate text-sm font-semibold text-[#1a1f26]">{field.label}</span>
          <button
            type="button"
            className="inline-flex h-6 w-6 items-center justify-center rounded-sm text-[#455a64] hover:bg-slate-100"
            title="Fechar"
            onClick={onClose}
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <ToggleRow
              label="Oculto"
              checked={draftHiddenFieldIds.includes(field.id)}
              disabled={!isEditing || required || fixedVisibleFieldIds.includes(field.id)}
              onChange={(checked) => onToggleHidden?.(field.id, checked)}
            />
            <ToggleRow
              label="Bloqueado"
              checked={draftLockedFieldIds.includes(field.id)}
              disabled={!isEditing || required}
              onChange={(checked) => onToggleLocked?.(field.id, checked)}
            />
            <ToggleRow
              label="Totalizar"
              checked={!!draftAggregationConfig[field.id]?.enabled}
              disabled={!isEditing || !field?.totalizable}
              onChange={(checked) => onToggleAggregation?.(field.id, checked)}
            />
            <ToggleRow
              label="Limpar ao Duplicar"
              checked={draftClearOnDuplicateFieldIds.includes(field.id)}
              disabled={!isEditing || fixedVisibleFieldIds.includes(field.id)}
              onChange={(checked) => onToggleClearOnDuplicate?.(field.id, checked)}
            />
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[#1a1f26]">
            <span className="shrink-0">Tipo de totalização</span>
            <Select
              modal={false}
              value={draftAggregationConfig[field.id]?.type || "sum"}
              onValueChange={(value) => onAggregationTypeChange?.(field.id, value)}
              disabled={!isEditing || !draftAggregationConfig[field.id]?.enabled}
              onOpenChange={(nextOpen) => {
                if (nextOpen) scheduleIgnoreClose();
              }}
            >
              <SelectTrigger className="emp-layout-config-select h-7 w-40 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent container={panelEl} className="z-[250]">
                {AGGREGATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="border-t border-[#e2e8f0] pt-3">
            <EmpConditionalVisibilityEditor
              selectedField={field}
              fields={fields}
              visibilityRules={draftVisibilityRules}
              onChange={onVisibilityRuleChange}
              disabled={!isEditing}
              selectContentClassName="z-[250]"
              selectPortalContainer={panelEl}
              selectModal={false}
              onSelectOpenChange={(nextOpen) => {
                if (nextOpen) scheduleIgnoreClose();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
