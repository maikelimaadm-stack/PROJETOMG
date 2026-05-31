import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import EmpAutocomplete from "@/components/emp/shared/EmpAutocomplete";
import ToggleSwitch from "@/components/common/ToggleSwitch";
import EmpCustomMarker from "@/components/emp/shared/EmpCustomMarker";

const isCustomField = (field) => field?.origem === "customizado" || String(field?.id || "").startsWith("custom:");

const isBareControlField = (field) => field?.type === "checkbox" || field?.type === "switch";

const isImageField = (field) => field?.type === "image" || field?.type === "file" || field?.type === "imagem";

const getFieldControlClass = (field, error, className) => {
  if (isImageField(field)) {
    return `emp-form-field-control emp-form-image-control relative h-8 min-h-8 w-full max-w-[248px] ${error ? "emp-form-field-error" : ""} ${className}`.trim();
  }

  const heightClass = field.wide ? "min-h-6" : "h-6";
  const widthClass = field.medium ? "w-64 max-w-full" : field.compact ? "w-44 max-w-full" : "w-full";
  return `emp-form-field-control relative ${heightClass} ${widthClass} ${error ? "emp-form-field-error" : ""} ${className}`.trim();
};

function EmpFormToggle({ checked, onChange, disabled }) {
  return (
    <ToggleSwitch
      checked={!!checked}
      onChange={onChange}
      disabled={disabled}
      className="emp-form-toggle-switch"
      checkedClassName="emp-form-toggle-switch-on"
    />
  );
}

function DefaultControl({ field, value, onChange, readOnly }) {
  const inputClass = "h-[22px] text-xs border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent px-1";

  if (field.type === "textarea") {
    return <Textarea value={value || ""} onChange={(e) => onChange(field.name, e.target.value)} readOnly={readOnly || field.readOnly} placeholder={field.placeholder} className="text-xs uppercase bg-transparent px-1" rows={field.rows || 2} />;
  }

  if (["select", "autocomplete", "relation"].includes(field.type)) {
    return <EmpAutocomplete items={field.options || []} value={value || ""} onChange={(nextValue) => onChange(field.name, nextValue || "")} placeholder={field.placeholder || "BUSCAR..."} displayField={field.displayField || "nome"} searchFields={field.searchFields || [field.displayField || "nome"]} disabled={readOnly || field.readOnly} readOnly={readOnly || field.readOnly} className="w-full" inputClassName="border-0 shadow-none focus-visible:ring-0 bg-transparent h-[22px] text-xs px-1" />;
  }

  if (field.type === "checkbox") {
    return <EmpFormToggle checked={!!value} onChange={(checked) => onChange(field.name, checked)} disabled={readOnly || field.readOnly} />;
  }

  return <Input type={field.type === "datetime" ? "datetime-local" : field.type || "text"} value={value || ""} onChange={(e) => onChange(field.name, e.target.value)} readOnly={readOnly || field.readOnly} placeholder={field.placeholder} className={`${inputClass} ${field.uppercase ? "uppercase" : ""}`} />;
}

const normalizeConditionText = (value) => String(value ?? "").trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
const getOptionValue = (option) => String(option?.id ?? option?.value ?? option?.label ?? option?.nome ?? "");
const getOptionLabel = (option) => String(option?.nome ?? option?.label ?? option?.value ?? option?.id ?? "");
const conditionMatches = (current, expected, sourceField) => {
  const expectedText = normalizeConditionText(expected);
  const currentValues = new Set([normalizeConditionText(current)]);
  (sourceField?.options || []).forEach((option) => {
    const optionValue = getOptionValue(option);
    const optionLabel = getOptionLabel(option);
    if (normalizeConditionText(optionValue) === normalizeConditionText(current) || normalizeConditionText(optionLabel) === normalizeConditionText(current)) {
      currentValues.add(normalizeConditionText(optionValue));
      currentValues.add(normalizeConditionText(optionLabel));
    }
  });
  return currentValues.has(expectedText);
};

function FieldFrame({ field, error, children, className = "" }) {
  const bare = isBareControlField(field);

  return (
    <div data-field={field.dataField || field.name} className={`grid grid-cols-[170px_minmax(0,1fr)] items-center gap-1 ${field.wide ? "md:col-span-2" : ""}`}>
      <label className="text-[12px] text-[#1a1f26] text-right leading-none">{field.label}:{field.required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {bare ? (
        <div className="emp-form-field-bare flex h-6 items-center">{children}</div>
      ) : (
        <div className={getFieldControlClass(field, error, className)}>
          {isCustomField(field) && <EmpCustomMarker />}
          {children}
        </div>
      )}
    </div>
  );
}

export default function EmpDynamicFormRenderer({ panels = [], fields = [], layout = {}, hiddenFieldIds = [], lockedFieldIds = [], requiredFieldIds = [], visibilityRules = {}, activePanelId, values = {}, errors = {}, onChange, readOnly = false, context = {}, fieldClassName = "" }) {
  const activePanel = panels.find((panel) => panel.id === activePanelId) || panels[0];
  const activeFieldIds = layout?.[activePanel?.id] || [];

  const visibleFields = activeFieldIds
    .map((fieldId) => fields.find((field) => field.id === fieldId))
    .filter(Boolean)
    .filter((field) => field.visible !== false && !hiddenFieldIds.includes(field.id))
    .filter((field) => {
      const rule = visibilityRules[field.id] || field.defaultVisibilityRule;
      if (rule?.always) return true;
      if (rule?.sourceFieldName) {
        const sourceField = fields.find((item) => item.id === rule.sourceFieldId);
        if (sourceField?.type !== "select" || !["manual", "native"].includes(sourceField?.optionsMode)) return true;
        const current = values[rule.sourceFieldName] ?? values.campos_personalizados?.[rule.sourceFieldName];
        return conditionMatches(current, rule.value, sourceField);
      }
      return typeof field.showWhen === "function" ? field.showWhen(values, context) : true;
    });

  if (!activePanel) return null;

  return (
    <div className="emp-form-fields space-y-1">
      {visibleFields.length === 0 ? <div className="ml-[172px] text-xs text-slate-500">Nenhum campo configurado para este painel.</div> : visibleFields.map((field) => {
        const value = field.getValue ? field.getValue(values, context) : values[field.name];
        const error = errors[field.errorKey || field.name];
        const configuredField = { ...field, required: field.required || requiredFieldIds.includes(field.id) };
        const fieldReadOnly = readOnly || lockedFieldIds.includes(field.id);
        return <FieldFrame key={field.id} field={configuredField} error={error} className={fieldClassName}>{field.render ? field.render({ field: configuredField, value, values, errors, onChange, readOnly: fieldReadOnly, context }) : <DefaultControl field={configuredField} value={value} onChange={onChange} readOnly={fieldReadOnly} />}</FieldFrame>;
      })}
    </div>
  );
}