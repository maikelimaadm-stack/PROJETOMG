import React from "react";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import EmpAutocomplete from "@/framework/cadastro/formularios/EmpAutocomplete";
import ToggleSwitch from "@/shared/components/ToggleSwitch";
import EmpCustomMarker from "@/framework/cadastro/formularios/EmpCustomMarker";
import { DEFAULT_FIELD_LAYOUT_CONFIG, normalizeFieldLayoutConfig } from "@/framework/cadastro/layouts/empFormLayoutStore";

const STACKED_TEXT_WIDTH = "w-full max-w-[480px]";
const COMPACT_TEXT_WIDTH = "w-full max-w-[220px]";

const isCustomField = (field) => field?.origem === "customizado" || String(field?.id || "").startsWith("custom:");

const isBareControlField = (field) => field?.type === "checkbox" || field?.type === "switch";

const isImageField = (field) => field?.type === "image" || field?.type === "file" || field?.type === "imagem";

const isTextLikeField = (field) =>
  field?.type === "textarea" ||
  field?.wide ||
  (!field?.compact && !field?.medium && !isBareControlField(field) && !isImageField(field));

const shouldSpanFullRow = (field, gridMode = false) => {
  if (!gridMode) return false;
  return field?.type === "textarea" || field?.type === "option_list" || isImageField(field);
};

const getFieldControlClass = (field, error, className, layoutMode = "stacked") => {
  const loteStyle = isCustomField(field);

  if (isImageField(field)) {
    return `emp-form-field-control ${loteStyle ? "emp-form-field-control-lote" : ""} emp-form-image-control relative h-[100px] min-h-[100px] w-[100px] max-w-[100px] shrink-0 ${error ? "emp-form-field-error" : ""} ${className}`.trim();
  }

  const heightClass = field.type === "textarea" ? "min-h-[var(--emp-form-textarea-min-height)]" : "min-h-[var(--emp-form-control-height)]";

  let widthClass = "w-full";

  if (layoutMode === "compact") {
    if (field.compact) widthClass = "w-40 max-w-full";
    else if (field.medium) widthClass = "w-52 max-w-full";
    else if (isTextLikeField(field)) widthClass = COMPACT_TEXT_WIDTH;
    else widthClass = COMPACT_TEXT_WIDTH;
  } else if (isTextLikeField(field)) {
    widthClass = STACKED_TEXT_WIDTH;
  } else if (field.medium) {
    widthClass = "w-64 max-w-full";
  } else if (field.compact) {
    widthClass = "w-44 max-w-full";
  }

  return `emp-form-field-control ${loteStyle ? "emp-form-field-control-lote" : ""} relative ${heightClass} ${widthClass} ${error ? "emp-form-field-error" : ""} ${className}`.trim();
};

function EmpFormToggle({ checked, onChange, disabled, loteStyle = false }) {
  return (
    <div className="emp-form-field-bare flex min-h-[var(--emp-form-control-height)] items-center">
      <ToggleSwitch
        checked={!!checked}
        onChange={onChange}
        disabled={disabled}
        className="emp-form-toggle-switch"
        checkedClassName="emp-form-toggle-switch-on"
        variant={loteStyle ? "lote" : "default"}
      />
    </div>
  );
}

function DefaultControl({ field, value, onChange, readOnly }) {
  const loteStyle = isCustomField(field);
  const inputClass = `emp-form-input w-full min-w-0 border-0 shadow-none focus-visible:ring-0 bg-white ${field.uppercase !== false ? "uppercase" : ""}`.trim();

  if (field.type === "textarea") {
    return <Textarea value={value || ""} onChange={(e) => onChange(field.name, e.target.value)} readOnly={readOnly || field.readOnly} placeholder={field.placeholder} className="emp-form-input w-full bg-white px-2 uppercase" rows={field.rows || 2} />;
  }

  if (["select", "autocomplete", "relation"].includes(field.type)) {
    return <EmpAutocomplete items={field.options || []} value={value || ""} onChange={(nextValue) => onChange(field.name, nextValue || "")} placeholder={field.placeholder || "BUSCAR..."} displayField={field.displayField || "nome"} searchFields={field.searchFields || [field.displayField || "nome"]} disabled={readOnly || field.readOnly} readOnly={readOnly || field.readOnly} className="w-full emp-autocomplete" inputClassName="emp-form-input border-0 shadow-none focus-visible:ring-0 bg-white uppercase" />;
  }

  if (field.type === "checkbox") {
    return (
      <EmpFormToggle
        checked={!!value}
        onChange={(checked) => onChange(field.name, checked)}
        disabled={readOnly || field.readOnly}
        loteStyle={isCustomField(field)}
      />
    );
  }

  return <Input type={field.type === "datetime" ? "datetime-local" : field.type || "text"} value={value || ""} onChange={(e) => onChange(field.name, e.target.value)} readOnly={readOnly || field.readOnly} placeholder={field.placeholder} className={inputClass} />;
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

function FieldFrameStacked({ field, error, children, className = "" }) {
  const bare = isBareControlField(field);
  const imageField = isImageField(field);
  const loteStyle = isCustomField(field);

  return (
    <div
      data-field={field.dataField || field.name}
      className={`grid grid-cols-[170px_minmax(0,1fr)] gap-1 ${imageField ? "items-start" : "items-center"}`}
    >
      <label className={`text-[12px] font-bold text-[#1a1f26] text-right leading-none ${imageField ? "pt-2" : ""}`}>
        {field.label}:{field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {bare ? (
        <div className="emp-form-field-bare flex min-h-[var(--emp-form-control-height)] items-center">{children}</div>
      ) : (
        <div className={getFieldControlClass(field, error, className, "stacked")}>
          {loteStyle && <EmpCustomMarker variant="lote" />}
          {children}
        </div>
      )}
    </div>
  );
}

function FieldFrameGrid({ field, error, children, className = "", spanFull = false }) {
  const bare = isBareControlField(field);
  const imageField = isImageField(field);
  const loteStyle = isCustomField(field);

  return (
    <div
      data-field={field.dataField || field.name}
      className={`emp-form-field-column ${spanFull ? "emp-form-field-span-full" : ""} ${imageField ? "emp-form-field-column-image items-start" : ""} emp-form-field-column-compact`}
    >
      <label className="emp-form-field-label-top text-[12px] font-bold leading-none text-[#1a1f26]">
        {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {bare ? (
        <div className="emp-form-field-bare flex min-h-[var(--emp-form-control-height)] items-center">{children}</div>
      ) : (
        <div className={getFieldControlClass(field, error, className, "compact")}>
          {loteStyle && <EmpCustomMarker variant="lote" />}
          {children}
        </div>
      )}
    </div>
  );
}

export default function EmpDynamicFormRenderer({
  panels = [],
  fields = [],
  layout = {},
  hiddenFieldIds = [],
  lockedFieldIds = [],
  requiredFieldIds = [],
  visibilityRules = {},
  fieldLayoutConfig = DEFAULT_FIELD_LAYOUT_CONFIG,
  activePanelId,
  values = {},
  errors = {},
  onChange,
  readOnly = false,
  context = {},
  fieldClassName = "",
}) {
  const activePanel = panels.find((panel) => panel.id === activePanelId) || panels[0];
  const activeFieldIds = layout?.[activePanel?.id] || [];
  const normalizedFieldLayout = normalizeFieldLayoutConfig(fieldLayoutConfig);
  const isPrincipalPanel = activePanel?.id === "principal";
  const layoutMode = isPrincipalPanel && normalizedFieldLayout.mode !== "detailsCompact" ? "stacked" : ["compact", "detailsCompact"].includes(normalizedFieldLayout.mode) ? "compact" : "stacked";
  const useCompactMode = layoutMode === "compact";
  const columnCount = normalizedFieldLayout.columns;

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

  const renderField = (field) => {
    const value = field.getValue ? field.getValue(values, context) : values[field.name];
    const error = errors[field.errorKey || field.name];
    const configuredField = { ...field, required: field.required || requiredFieldIds.includes(field.id) };
    const fieldReadOnly = readOnly || lockedFieldIds.includes(field.id);
    const control = field.render
      ? field.render({ field: configuredField, value, values, errors, onChange, readOnly: fieldReadOnly, context })
      : <DefaultControl field={configuredField} value={value} onChange={onChange} readOnly={fieldReadOnly} />;

    if (useCompactMode) {
      return (
        <FieldFrameGrid
          key={field.id}
          field={configuredField}
          error={error}
          className={fieldClassName}
          spanFull={shouldSpanFullRow(configuredField, true)}
        >
          {control}
        </FieldFrameGrid>
      );
    }

    return (
      <FieldFrameStacked key={field.id} field={configuredField} error={error} className={fieldClassName}>
        {control}
      </FieldFrameStacked>
    );
  };

  if (visibleFields.length === 0) {
    return null;
  }

  const hasCustomFields = visibleFields.some(isCustomField);

  return (
    <div
      className={`emp-form-fields ${useCompactMode ? "emp-form-fields-compact" : ""} ${hasCustomFields ? "emp-form-fields-custom" : ""}`}
      style={useCompactMode ? { "--emp-form-field-columns": columnCount } : undefined}
    >
      {visibleFields.map(renderField)}
    </div>
  );
}
