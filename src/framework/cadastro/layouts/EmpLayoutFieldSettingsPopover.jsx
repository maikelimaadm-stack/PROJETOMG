import React, { useCallback, useEffect, useRef } from "react";
import { ChevronUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import ToggleSwitch from "@/shared/components/ToggleSwitch";
import EmpConditionalVisibilityEditor from "./EmpConditionalVisibilityEditor";
import EmpLayoutFieldDefaultValueEditor from "./EmpLayoutFieldDefaultValueEditor";

const AGGREGATION_OPTIONS = [
  { value: "sum", label: "Soma" },
  { value: "avg", label: "Média" },
  { value: "max", label: "Maior" },
  { value: "min", label: "Menor" },
];

const POPOVER_SELECTOR = ".emp-layout-field-settings-popover";
const LABEL_COL = "110px";

const isInsidePopover = (target) => {
  if (!target || typeof target.closest !== "function") return false;
  return !!target.closest(POPOVER_SELECTOR);
};

const ToggleInline = ({ label, checked, disabled, onChange }) => (
  <label className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[12px] text-[#1a1f26]">
    <span>{label}:</span>
    <ToggleSwitch
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      className="emp-form-toggle-switch shrink-0"
      checkedClassName="emp-form-toggle-switch-on"
    />
  </label>
);

const FormRow = ({ label, children }) => (
  <div
    className="emp-layout-field-settings-row grid items-center gap-2 text-[12px] text-[#1a1f26]"
    style={{ gridTemplateColumns: `${LABEL_COL} minmax(0, 1fr)` }}
  >
    <span className="text-right leading-none">{label}</span>
    <div className="min-w-0">{children}</div>
  </div>
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
  draftRequiredFieldIds = [],
  draftClearOnDuplicateFieldIds = [],
  draftAggregationConfig = {},
  draftVisibilityRules = {},
  draftFieldDefaultValues = {},
  fields = [],
  onToggleHidden,
  onToggleLocked,
  onToggleRequired,
  onToggleClearOnDuplicate,
  onToggleAggregation,
  onAggregationTypeChange,
  onVisibilityRuleChange,
  onDefaultValueChange,
}) {
  const openSelectCountRef = useRef(0);

  const trackSelectOpenChange = useCallback((nextOpen) => {
    openSelectCountRef.current = Math.max(0, openSelectCountRef.current + (nextOpen ? 1 : -1));
  }, []);

  useEffect(() => {
    if (!open) {
      openSelectCountRef.current = 0;
      return;
    }

    const handlePointerDown = (event) => {
      if (openSelectCountRef.current > 0) return;
      if (isInsidePopover(event.target)) return;
      onClose?.();
    };

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (openSelectCountRef.current > 0) return;
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

  const nativeRequired = !!field?.required;
  const configuredRequired = draftRequiredFieldIds.includes(field.id);
  const required = isFieldRequired(field);
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
  const panelWidth = Math.min(720, viewportWidth - 16);
  const left = Math.min(Math.max(8, anchorRect.left), Math.max(8, viewportWidth - panelWidth - 8));
  const top = Math.min(anchorRect.bottom + 6, (typeof window !== "undefined" ? window.innerHeight : 800) - 16);

  return (
    <div
      className="emp-layout-field-settings-popover fixed z-[200] w-[720px] max-w-[calc(100vw-16px)] max-h-[min(80dvh,calc(100dvh-32px))] overflow-y-auto border border-[#cfd8e3] bg-white shadow-lg"
      style={{ top, left, width: panelWidth }}
      role="dialog"
      aria-label={`Configurações de ${field.label}`}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="overflow-hidden rounded-[var(--emp-control-radius)] bg-white">
        <div
          className={`flex h-7 items-center justify-between border-b border-[#e2e8f0] px-2.5 text-white ${
            required ? "emp-layout-config-field-required" : "emp-layout-config-field-optional"
          }`}
        >
          <span className="truncate text-xs font-semibold">{field.label}</span>
          <button
            type="button"
            className="emp-layout-field-settings-close inline-flex h-5 w-5 items-center justify-center rounded-sm text-white hover:bg-white/10"
            title="Fechar"
            onClick={onClose}
          >
            <ChevronUp className="emp-layout-field-settings-close-icon h-3.5 w-3.5 shrink-0 text-white" strokeWidth={2} />
          </button>
        </div>
        <div className="space-y-2.5 px-4 py-3">
          <div className="emp-layout-field-settings-toggles flex flex-nowrap items-center gap-x-3 overflow-x-auto pb-0.5">
            <ToggleInline
              label="Bloqueado"
              checked={draftLockedFieldIds.includes(field.id)}
              disabled={!isEditing || required}
              onChange={(checked) => onToggleLocked?.(field.id, checked)}
            />
            <ToggleInline
              label="Limpar ao Duplicar"
              checked={draftClearOnDuplicateFieldIds.includes(field.id)}
              disabled={!isEditing || fixedVisibleFieldIds.includes(field.id)}
              onChange={(checked) => onToggleClearOnDuplicate?.(field.id, checked)}
            />
            <ToggleInline
              label="Oculto"
              checked={draftHiddenFieldIds.includes(field.id)}
              disabled={!isEditing || required || fixedVisibleFieldIds.includes(field.id)}
              onChange={(checked) => onToggleHidden?.(field.id, checked)}
            />
            <ToggleInline
              label="Obrigatório"
              checked={nativeRequired || configuredRequired}
              disabled={!isEditing || nativeRequired}
              onChange={(checked) => onToggleRequired?.(field.id, checked)}
            />
            <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[12px] text-[#1a1f26]">
              <span>Totalizar:</span>
              <ToggleSwitch
                checked={!!draftAggregationConfig[field.id]?.enabled}
                disabled={!isEditing || !field?.totalizable}
                onChange={(checked) => onToggleAggregation?.(field.id, checked)}
                className="emp-form-toggle-switch shrink-0"
                checkedClassName="emp-form-toggle-switch-on"
              />
              <Select
                value={draftAggregationConfig[field.id]?.type || "sum"}
                onValueChange={(value) => onAggregationTypeChange?.(field.id, value)}
                disabled={!isEditing || !draftAggregationConfig[field.id]?.enabled}
                onOpenChange={trackSelectOpenChange}
              >
                <SelectTrigger className="emp-layout-config-select emp-layout-config-aggregation-select h-7 w-[92px] shrink-0 px-2 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent portalled={false} className="z-[250]">
                  {AGGREGATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </span>
          </div>

          <FormRow label="Valor padrão:">
            <EmpLayoutFieldDefaultValueEditor
              field={field}
              value={draftFieldDefaultValues[field.id]}
              disabled={!isEditing}
              onChange={(value) => onDefaultValueChange?.(field.id, value)}
              selectPortalled={false}
              onSelectOpenChange={trackSelectOpenChange}
            />
          </FormRow>

          <FormRow label="Exibir se:">
            <EmpConditionalVisibilityEditor
              selectedField={field}
              fields={fields}
              visibilityRules={draftVisibilityRules}
              onChange={onVisibilityRuleChange}
              disabled={!isEditing}
              hideLabel
              selectContentClassName="z-[250]"
              selectPortalled={false}
              onSelectOpenChange={trackSelectOpenChange}
            />
          </FormRow>
        </div>
      </div>
    </div>
  );
}
