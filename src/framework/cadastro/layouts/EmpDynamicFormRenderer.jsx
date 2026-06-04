import React from "react";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import EmpAutocomplete from "@/framework/cadastro/formularios/EmpAutocomplete";
import EmpFormDateControl from "@/framework/cadastro/formularios/EmpFormDateControl";
import ToggleSwitch from "@/shared/components/ToggleSwitch";
import EmpCustomMarker from "@/framework/cadastro/formularios/EmpCustomMarker";
import { cn } from "@/shared/utils/utils";
import { DEFAULT_FIELD_LAYOUT_CONFIG, normalizeFieldLayoutConfig } from "@/framework/cadastro/layouts/empFormLayoutStore";
import { resolveFieldWidthToken, shouldFieldSpanFullRow } from "@/framework/cadastro/layouts/empFormFieldSizing";

const isCustomField = (field) => field?.origem === "customizado" || String(field?.id || "").startsWith("custom:");

const isBareControlField = (field) => field?.type === "checkbox" || field?.type === "switch";

const isImageField = (field) => field?.type === "image" || field?.type === "file" || field?.type === "imagem";

const isDateField = (field) =>
  ["date", "datetime", "datetime-local"].includes(String(field?.type || "").toLowerCase());

function EmpFormToggle({ checked, onChange, disabled, loteStyle = false }) {
  return (
    <ToggleSwitch
      checked={!!checked}
      onChange={onChange}
      disabled={disabled}
      className="emp-form-toggle-switch"
      checkedClassName="emp-form-toggle-switch-on"
      variant={loteStyle ? "lote" : "default"}
    />
  );
}

function DefaultControl({ field, value, onChange, readOnly }) {
  const loteStyle = isCustomField(field);
  const inputClass =
    "emp-form-input w-full min-w-0 border-0 shadow-none focus-visible:ring-0 bg-white uppercase".trim();

  if (field.type === "textarea") {
    return (
      <Textarea
        value={value || ""}
        onChange={(e) => onChange(field.name, e.target.value)}
        readOnly={readOnly || field.readOnly}
        className="emp-form-input w-full min-h-[var(--emp-form-textarea-min-height)] border-0 bg-white px-2 uppercase"
        rows={field.rows || 2}
      />
    );
  }

  if (["select", "autocomplete", "relation"].includes(field.type)) {
    return (
      <EmpAutocomplete
        items={field.options || []}
        value={value || ""}
        onChange={(nextValue) => onChange(field.name, nextValue || "")}
        displayField={field.displayField || "nome"}
        searchFields={field.searchFields || [field.displayField || "nome"]}
        disabled={readOnly || field.readOnly}
        readOnly={readOnly || field.readOnly}
        className="w-full min-w-0 emp-autocomplete"
        inputClassName="emp-form-input border-0 shadow-none focus-visible:ring-0 bg-white uppercase"
        showSearchButton
      />
    );
  }

  if (field.type === "checkbox" || field.type === "switch") {
    return (
      <EmpFormToggle
        checked={!!value}
        onChange={(checked) => onChange(field.name, checked)}
        disabled={readOnly || field.readOnly}
        loteStyle={loteStyle}
      />
    );
  }

  if (isDateField(field)) {
    return (
      <EmpFormDateControl
        type={field.type === "datetime" ? "datetime-local" : field.type || "date"}
        value={value || ""}
        onChange={(e) => onChange(field.name, e.target.value)}
        readOnly={readOnly || field.readOnly}
        disabled={readOnly || field.readOnly}
      />
    );
  }

  return (
    <Input
      type={field.type === "number" ? "number" : "text"}
      value={value || ""}
      onChange={(e) => onChange(field.name, e.target.value)}
      readOnly={readOnly || field.readOnly}
      className={inputClass}
    />
  );
}

const normalizeConditionText = (value) =>
  String(value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

const getOptionValue = (option) => String(option?.id ?? option?.value ?? option?.label ?? option?.nome ?? "");
const getOptionLabel = (option) => String(option?.nome ?? option?.label ?? option?.value ?? option?.id ?? "");

const conditionMatches = (current, expected, sourceField) => {
  const expectedText = normalizeConditionText(expected);
  const currentValues = new Set([normalizeConditionText(current)]);
  (sourceField?.options || []).forEach((option) => {
    const optionValue = getOptionValue(option);
    const optionLabel = getOptionLabel(option);
    if (
      normalizeConditionText(optionValue) === normalizeConditionText(current) ||
      normalizeConditionText(optionLabel) === normalizeConditionText(current)
    ) {
      currentValues.add(normalizeConditionText(optionValue));
      currentValues.add(normalizeConditionText(optionLabel));
    }
  });
  return currentValues.has(expectedText);
};

/** Layout SGG: label externa à esquerda, largura do controle conforme o tipo. */
function FieldFrameSgg({ field, error, children, spanFull = false, className = "" }) {
  const bare = isBareControlField(field);
  const imageField = isImageField(field);
  const loteStyle = isCustomField(field);
  const widthToken = resolveFieldWidthToken(field);
  const fullRow = spanFull || shouldFieldSpanFullRow(field);

  if (imageField) {
    return (
      <div
        data-field={field.dataField || field.name}
        className={cn("emp-form-field-inline emp-form-field--image", fullRow && "emp-form-field--full")}
      >
        <label className="emp-form-field-label-inline">
          {field.label}
          {field.required ? <span className="text-red-500 ml-0.5">*</span> : null}:
        </label>
        <div
          className={cn(
            "emp-form-field-control emp-form-image-control",
            error && "erp-field-invalid"
          )}
        >
          {loteStyle && <EmpCustomMarker variant="lote" />}
          {children}
        </div>
      </div>
    );
  }

  if (bare) {
    return (
      <div
        data-field={field.dataField || field.name}
        className={cn("emp-form-field-inline emp-form-field--toggle", `emp-form-field--${widthToken}`)}
      >
        <label className="emp-form-field-label-inline">
          {field.label}
          {field.required ? <span className="text-red-500 ml-0.5">*</span> : null}:
        </label>
        <div className="emp-form-field-bare flex min-h-[var(--emp-form-control-height)] items-center">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      data-field={field.dataField || field.name}
        className={cn(
        "emp-form-field-inline",
        `emp-form-field--${widthToken}`,
        fullRow && "emp-form-field--full",
        field.type === "textarea" && "emp-form-field--textarea-row",
        className
      )}
    >
      <label className="emp-form-field-label-inline">
        {field.label}
        {field.required ? <span className="text-red-500 ml-0.5">*</span> : null}:
      </label>
      <div className={cn("emp-form-field-control", error && "erp-field-invalid")}>
        {loteStyle && <EmpCustomMarker variant="lote" />}
        {children}
      </div>
    </div>
  );
}

export default function EmpDynamicFormRenderer({
  panels = [],
  fields = [],
  layout = {},
  defaultLayout = {},
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
  const configuredFieldIds = layout?.[activePanel?.id] || [];
  const activeFieldIds =
    configuredFieldIds.length > 0
      ? configuredFieldIds
      : defaultLayout?.[activePanel?.id] || [];
  const normalizedFieldLayout = normalizeFieldLayoutConfig(fieldLayoutConfig);
  const useCompactMode = ["compact", "detailsCompact"].includes(normalizedFieldLayout.mode);

  const visibleFields = activeFieldIds
    .map((fieldId) => fields.find((field) => field.id === fieldId))
    .filter(Boolean)
    .filter((field) => field.visible !== false && !hiddenFieldIds.includes(field.id))
    .filter((field) => {
      const rule = visibilityRules[field.id] || field.defaultVisibilityRule;
      if (rule?.always) return true;
      if (rule?.sourceFieldName) {
        const sourceField = fields.find((item) => item.id === rule.sourceFieldId);
        if (sourceField?.type !== "select" || !["manual", "native"].includes(sourceField?.optionsMode)) {
          return true;
        }
        const current = values[rule.sourceFieldName] ?? values.campos_personalizados?.[rule.sourceFieldName];
        return conditionMatches(current, rule.value, sourceField);
      }
      return typeof field.showWhen === "function" ? field.showWhen(values, context) : true;
    });

  if (!activePanel) {
    return (
      <div className="emp-form-fields emp-form-fields-sgg emp-form-fields-empty px-2 py-3 text-xs text-slate-500">
        Aba de formulário indisponível. Verifique a configuração de layout.
      </div>
    );
  }

  const renderField = (field) => {
    const value = field.getValue ? field.getValue(values, context) : values[field.name];
    const error = errors[field.errorKey || field.name];
    const configuredField = { ...field, required: field.required || requiredFieldIds.includes(field.id) };
    const fieldReadOnly = readOnly || lockedFieldIds.includes(field.id);
    const control = field.render
      ? field.render({ field: configuredField, value, values, errors, onChange, readOnly: fieldReadOnly, context })
      : (
        <DefaultControl field={configuredField} value={value} onChange={onChange} readOnly={fieldReadOnly} />
      );

    return (
      <FieldFrameSgg
        key={field.id}
        field={configuredField}
        error={error}
        spanFull={useCompactMode && shouldFieldSpanFullRow(configuredField)}
        className={fieldClassName}
      >
        {control}
      </FieldFrameSgg>
    );
  };

  const hasCustomFields = visibleFields.some(isCustomField);

  if (visibleFields.length === 0) {
    return (
      <div className="emp-form-fields emp-form-fields-sgg emp-form-fields-empty px-2 py-3 text-xs text-slate-500">
        Nenhum campo visível nesta aba. Ajuste o layout em Configuração de layout.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "emp-form-fields emp-form-fields-sgg",
        useCompactMode && "emp-form-fields-compact",
        hasCustomFields && "emp-form-fields-custom"
      )}
    >
      {visibleFields.map(renderField)}
    </div>
  );
}
