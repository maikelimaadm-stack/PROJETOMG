import React, { useMemo, useState } from "react";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import EmpAutocomplete from "@/framework/cadastro/formularios/EmpAutocomplete";
import EmpFormDateControl from "@/framework/cadastro/formularios/EmpFormDateControl";
import ToggleSwitch from "@/shared/components/ToggleSwitch";
import EmpCustomMarker from "@/framework/cadastro/formularios/EmpCustomMarker";
import { cn } from "@/shared/utils/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { DEFAULT_FIELD_LAYOUT_CONFIG, normalizeFieldLayoutConfig } from "@/framework/cadastro/layouts/empFormLayoutStore";
import { getPanelCardsForRender, groupCardsIntoRows } from "@/framework/cadastro/layouts/empFormLayoutCards";
import { getCachedCardRows } from "@/framework/cadastro-engine/layout/layoutCache.js";
import { useContainerWidth } from "@/framework/cadastro-engine/render/useContainerWidth.js";
import { resolveFieldWidthTypePreset } from "@/framework/cadastro/layouts/empFormFieldWidthPresets";
import { isInlineMediaField } from "@/framework/cadastro/layouts/empFormFieldLayoutGroups";

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
        className="emp-form-input emp-form-textarea-corp w-full min-h-0 border-0 bg-white uppercase"
        rows={field.rows || 3}
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

/** Layout corporativo: min-width por tipo + flex-grow (preenche a linha). */
function FieldFrameCorp({ field, error, children, fieldSizes = {}, rowBalance = null, className = "" }) {
  const bare = isBareControlField(field);
  const textareaField = field?.type === "textarea";
  const loteStyle = isCustomField(field);
  const preset = resolveFieldWidthTypePreset(field, fieldSizes);
  const typeClass = `emp-form-field-corp--type-${preset.type.toLowerCase().replace(/_/g, "-")}`;
  const balanced = rowBalance?.[field.id];
  const mediaInline = isInlineMediaField(field);

  const widthStyle = balanced
    ? {
        flex: balanced.flex,
        flexGrow: balanced.flexGrow ?? 1,
        flexShrink: balanced.flexShrink ?? 1,
        flexBasis: balanced.flexBasis || balanced.minWidth,
        minWidth: balanced.minWidth,
        maxWidth: balanced.maxWidth ?? "none",
        width: "auto",
      }
    : {
        flex: `1 1 ${preset.min}px`,
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: `${preset.min}px`,
        minWidth: `${preset.min}px`,
        maxWidth: "none",
        width: "auto",
      };

  return (
    <div
      data-field={field.dataField || field.name}
      data-width-type={preset.type}
      className={cn(
        "emp-form-field-corp",
        "emp-form-field-corp--balanced-grow",
        typeClass,
        mediaInline && "emp-form-field-corp--media-inline",
        textareaField && "emp-form-field-corp--textarea",
        bare && "emp-form-field-corp--bare",
        className
      )}
      style={widthStyle}
    >
      <label className="emp-form-field-label-top">
        {field.label}
        {field.required ? <span className="text-red-500 ml-0.5">*</span> : null}
      </label>
      <div className={cn("emp-form-field-control", error && "erp-field-invalid")}>
        {loteStyle && !bare && <EmpCustomMarker variant="lote" />}
        {children}
      </div>
    </div>
  );
}

function FormCardSection({ card, children, defaultCollapsed = false }) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const showHeader = Boolean(card.label?.trim());

  if (!showHeader) {
    return <div className="emp-form-card emp-form-card--virtual">{children}</div>;
  }

  return (
    <section className={cn("emp-form-card", collapsed && "emp-form-card--collapsed")}>
      <button
        type="button"
        className="emp-form-card-title"
        onClick={() => card.collapsible !== false && setCollapsed((prev) => !prev)}
        aria-expanded={!collapsed}
        disabled={card.collapsible === false}
      >
        {card.collapsible !== false ? (
          collapsed ? <ChevronRight className="h-3.5 w-3.5 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0" />
        ) : null}
        <span>{card.label}</span>
      </button>
      {!collapsed && <div className="emp-form-card-body">{children}</div>}
    </section>
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
  fieldSizes = {},
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
  const normalizedFieldLayout = normalizeFieldLayoutConfig(fieldLayoutConfig);
  const { ref: containerRef, width: containerWidthPx } = useContainerWidth();

  const cards = useMemo(
    () =>
      activePanel
        ? getPanelCardsForRender({
            layout,
            panelId: activePanel.id,
            defaultLayout,
          })
        : [],
    [activePanel, layout, defaultLayout]
  );

  const isFieldVisible = (field) => {
    if (!field || field.visible === false || hiddenFieldIds.includes(field.id)) return false;
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
  };

  if (!activePanel) {
    return (
      <div className="emp-form-fields emp-form-fields-corp emp-form-fields-empty px-2 py-3 text-xs text-slate-500">
        Aba de formulário indisponível. Verifique a configuração de layout.
      </div>
    );
  }

  const renderFieldControl = (field, configuredField, value, fieldReadOnly) => {
    if (typeof field.render !== "function") {
      return (
        <DefaultControl field={configuredField} value={value} onChange={onChange} readOnly={fieldReadOnly} />
      );
    }
    try {
      const rendered = field.render({
        field: configuredField,
        value,
        values,
        errors,
        onChange,
        readOnly: fieldReadOnly,
        context,
      });
      if (rendered !== null && rendered !== undefined) return rendered;
    } catch (error) {
      console.error("[EmpDynamicFormRenderer] Erro ao renderizar campo", field.id, error);
    }
    return (
      <DefaultControl field={configuredField} value={value} onChange={onChange} readOnly={fieldReadOnly} />
    );
  };

  const renderField = (field, rowBalance = null) => {
    const value = field.getValue ? field.getValue(values, context) : values[field.name];
    const error = errors[field.errorKey || field.name];
    const configuredField = { ...field, required: field.required || requiredFieldIds.includes(field.id) };
    const fieldReadOnly = readOnly || lockedFieldIds.includes(field.id);
    const control = renderFieldControl(field, configuredField, value, fieldReadOnly);
    return (
      <FieldFrameCorp
        key={field.id}
        field={configuredField}
        error={error}
        fieldSizes={fieldSizes}
        rowBalance={rowBalance}
        className={fieldClassName}
      >
        {control}
      </FieldFrameCorp>
    );
  };

  const cardHasCustomField = (card) =>
    getCachedCardRows(card, fieldSizes, fields, containerWidthPx)
      .flatMap((row) => row.fieldIds || [])
      .some((fieldId) => {
        const field = fields.find((item) => item.id === fieldId);
        return field && isCustomField(field);
      });

  const hasCustomFields = cards.some(cardHasCustomField);

  const cardRows = groupCardsIntoRows(cards);
  const cardSections = cardRows.map((row, rowIndex) => (
    <div key={`row-${rowIndex}`} className="emp-form-cards-row">
      {row.map((card) => {
        const layoutRows = getCachedCardRows(card, fieldSizes, fields, containerWidthPx);
        const hasVisibleInCard = layoutRows.some((layoutRow) =>
          (layoutRow.fieldIds || []).some((fieldId) => {
            const field = fields.find((item) => item.id === fieldId);
            return field && isFieldVisible(field);
          })
        );
        if (!hasVisibleInCard) return null;

        return (
          <div
            key={card.id}
            className="emp-form-card-slot"
            style={{ gridColumn: `span ${card.colSpan || 12} / span ${card.colSpan || 12}` }}
          >
            <FormCardSection card={card}>
              <div className="emp-form-card-rows">
                {layoutRows.map((layoutRow) => {
                  const rowFields = (layoutRow.fieldIds || [])
                    .map((fieldId) => fields.find((field) => field.id === fieldId))
                    .filter(Boolean)
                    .filter(isFieldVisible);
                  if (rowFields.length === 0) return null;
                  return (
                    <div key={layoutRow.id} className="emp-form-card-row">
                      <div className="emp-form-card-row-grid emp-form-card-row-grid--flex">
                        {rowFields.map((field) => renderField(field, layoutRow.fieldBalance))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </FormCardSection>
          </div>
        );
      })}
    </div>
  ));

  const hasVisibleFields = cards.some((card) =>
    getCachedCardRows(card, fieldSizes, fields, containerWidthPx).some((layoutRow) =>
      (layoutRow.fieldIds || []).some((fieldId) => {
        const field = fields.find((item) => item.id === fieldId);
        return field && isFieldVisible(field);
      })
    )
  );

  if (!hasVisibleFields) {
    return (
      <div className="emp-form-fields emp-form-fields-corp emp-form-fields-empty px-2 py-3 text-xs text-slate-500">
        Nenhum campo visível nesta aba. Ajuste o layout em Configuração de layout.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "emp-form-fields emp-form-fields-corp cad-form-fields cad-form-fields-corp",
        hasCustomFields && "emp-form-fields-custom cad-form-fields-custom"
      )}
      style={{ containerType: "inline-size" }}
    >
      <div className="emp-form-cards-layout cad-form-cards-layout">{cardSections}</div>
    </div>
  );
}
