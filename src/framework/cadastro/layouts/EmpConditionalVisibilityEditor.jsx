import React, { useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

const ALWAYS = "__always__";
const EMPTY = "__empty__";
const getFieldValueKey = (field) => field?.id || field?.name || "";
const getOptionValue = (option) => String(option?.id ?? option?.value ?? option?.label ?? option?.nome ?? "");
const getOptionLabel = (option) => String(option?.nome ?? option?.label ?? option?.value ?? option?.id ?? "");

export default function EmpConditionalVisibilityEditor({
  selectedField,
  fields = [],
  visibilityRules = {},
  onChange,
  disabled = false,
  hideLabel = false,
  selectContentClassName = "",
  selectPortalContainer = null,
  selectPortalled = true,
  selectModal = true,
  onSelectOpenChange,
}) {
  const selectedId = selectedField?.id;
  const savedRule = selectedId ? visibilityRules[selectedId] : null;
  const defaultRule = selectedField?.defaultVisibilityRule || null;
  const rule = savedRule || defaultRule;

  const conditionFields = useMemo(() => fields.filter((field) => field && field.id !== selectedId && field.type === "select" && ["manual", "native"].includes(field.optionsMode) && Array.isArray(field.options) && field.options.length > 0), [fields, selectedId]);
  const sourceField = !rule?.always ? conditionFields.find((field) => getFieldValueKey(field) === rule?.sourceFieldId) || null : null;
  const sourceValue = sourceField ? getFieldValueKey(sourceField) : ALWAYS;
  const valueOptions = (sourceField?.options || []).map((option) => ({ value: getOptionValue(option), label: getOptionLabel(option) })).filter((option) => option.value);

  const setSource = (nextSource) => {
    if (!selectedId) return;
    if (nextSource === ALWAYS) { onChange?.(selectedId, defaultRule ? { always: true } : null); return; }
    const nextField = conditionFields.find((field) => getFieldValueKey(field) === nextSource);
    const nextOptions = (nextField?.options || []).map((option) => ({ value: getOptionValue(option), label: getOptionLabel(option) })).filter((option) => option.value);
    onChange?.(selectedId, { sourceFieldId: getFieldValueKey(nextField), sourceFieldName: nextField?.name, value: nextOptions[0]?.value || "" });
  };

  const setValue = (value) => {
    if (!selectedId || !sourceField) return;
    onChange?.(selectedId, { sourceFieldId: getFieldValueKey(sourceField), sourceFieldName: sourceField.name, value: value === EMPTY ? "" : value });
  };

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 text-[12px] text-[#1a1f26]">
      {!hideLabel && <span className="shrink-0">Exibir se:</span>}
      <Select
        modal={selectModal}
        value={sourceValue}
        onValueChange={setSource}
        disabled={!selectedId || disabled}
        onOpenChange={onSelectOpenChange}
      >
        <SelectTrigger className="emp-layout-config-select h-7 w-40 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          className={selectContentClassName}
          container={selectPortalContainer}
          portalled={selectPortalled}
        >
          <SelectItem value={ALWAYS} className="text-xs">
            Sempre
          </SelectItem>
          {conditionFields.map((field) => (
            <SelectItem key={getFieldValueKey(field)} value={getFieldValueKey(field)} className="text-xs">
              {field.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {sourceField && (
        <Select
          modal={selectModal}
          value={rule?.value || EMPTY}
          onValueChange={setValue}
          disabled={!selectedId || disabled}
          onOpenChange={onSelectOpenChange}
        >
          <SelectTrigger className="emp-layout-config-select h-7 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            className={selectContentClassName}
            container={selectPortalContainer}
            portalled={selectPortalled}
          >
            {valueOptions.map((option) => (
              <SelectItem key={option.value || EMPTY} value={option.value || EMPTY} className="text-xs">
                {option.label || option.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}