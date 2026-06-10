import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/ui/collapsible";
import { Textarea } from "@/shared/ui/textarea";
import EmpAutocomplete from "@/framework/cadastro/formularios/EmpAutocomplete";
import EmpFormDateControl from "@/framework/cadastro/formularios/EmpFormDateControl";
import ToggleSwitch from "@/shared/components/ToggleSwitch";
import EmpCustomMarker from "@/framework/cadastro/formularios/EmpCustomMarker";
import { cn } from "@/shared/utils/utils";
import { DEFAULT_FIELD_LAYOUT_CONFIG, normalizeFieldLayoutConfig } from "@/framework/cadastro/layouts/empFormLayoutStore";
import { getPanelCardsForRender, groupCardsIntoRows } from "@/framework/cadastro/layouts/empFormLayoutCards";
import { getCachedCardRows } from "@/framework/cadastro-engine/layout/layoutCache.js";
import { useContainerWidth } from "@/framework/cadastro-engine/render/useContainerWidth.js";
import { useCardCollapsibleEnabled } from "@/framework/cadastro-engine/render/useCardCollapsibleEnabled.js";
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

function DefaultControl({ field, value, onChange, readOnly, mgPrototype = false }) {
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

  if (["select", "autocomplete", "relation", "lookup"].includes(field.type)) {
    const isLookup =
      field.type === "relation" ||
      field.type === "lookup" ||
      Boolean(field.relation_entity || field.options_source_entity);
    return (
      <EmpAutocomplete
        variant={isLookup ? "lookup" : "select"}
        items={field.options || []}
        value={value || ""}
        onChange={(nextValue) => onChange(field.name, nextValue || "")}
        displayField={field.displayField || "nome"}
        searchFields={field.searchFields || [field.displayField || "nome", "cnpj", "cpf", "codigo"]}
        subtextField={field.subtextField || "subtext"}
        renderSubtext={isLookup ? field.renderSubtext : undefined}
        disabled={readOnly || field.readOnly}
        readOnly={readOnly || field.readOnly}
        className={cn("w-full min-w-0 emp-autocomplete", mgPrototype && "mg-prototype-autocomplete")}
        inputClassName="emp-form-input border-0 shadow-none focus-visible:ring-0 bg-white"
        placeholder={isLookup ? field.placeholder || "Digite para pesquisar..." : field.placeholder || "SELECIONE"}
        uppercaseDisplay={!isLookup}
        createNewLabel={isLookup ? field.createNewLabel : undefined}
        onCreateNew={isLookup ? field.onCreateNew : undefined}
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
        variant={mgPrototype ? "mg" : "default"}
      />
    );
  }

  if (field.type === "time") {
    return (
      <EmpFormDateControl
        type="time"
        value={value || ""}
        onChange={(e) => onChange(field.name, e.target.value)}
        readOnly={readOnly || field.readOnly}
        disabled={readOnly || field.readOnly}
        variant={mgPrototype ? "mg" : "default"}
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
function FieldFrameCorp({
  field,
  error,
  children,
  fieldSizes = {},
  rowBalance = null,
  narrowLayout = false,
  className = "",
}) {
  const bare = isBareControlField(field);
  const textareaField = field?.type === "textarea";
  const loteStyle = isCustomField(field);
  const preset = resolveFieldWidthTypePreset(field, fieldSizes);
  const typeClass = `emp-form-field-corp--type-${preset.type.toLowerCase().replace(/_/g, "-")}`;
  const balanced = rowBalance?.[field.id];
  const mediaInline = isInlineMediaField(field);

  const widthStyle = narrowLayout
    ? undefined
    : balanced
      ? {
          flex: balanced.flex,
          minWidth: balanced.minWidth ?? `${preset.min}px`,
          maxWidth: balanced.maxWidth,
          width: "auto",
        }
      : {
          flex: `${preset.grow} 1 ${preset.min}px`,
          minWidth: `${preset.min}px`,
          maxWidth: "100%",
          width: "auto",
        };

  const mgPrototype =
    className.includes("mg-prototype-field") || className === "mg-prototype-field";

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
        field?.wide && "emp-form-field-corp--wide",
        bare && "emp-form-field-corp--bare",
        mgPrototype && "mg-prototype-field",
        className
      )}
      style={widthStyle}
    >
      <label
        className={cn(
          mgPrototype ? "fg-label" : "emp-form-field-label-top",
          mgPrototype && field.required && "required"
        )}
      >
        {field.label}
        {!mgPrototype && field.required ? (
          <span className="emp-form-required-mark ml-0.5">*</span>
        ) : null}
      </label>
      <div
        className={cn(
          "emp-form-field-control",
          error && "erp-field-invalid emp-form-field-error"
        )}
      >
        {loteStyle && !bare && <EmpCustomMarker variant="lote" />}
        {children}
      </div>
      <div className="emp-form-field-message-slot" aria-hidden={!field.required || !error}>
        <span
          className={cn(
            "emp-form-field-error-message",
            (!field.required || !error) && "emp-form-field-error-message--hidden"
          )}
        >
          Campo obrigatório
        </span>
      </div>
    </div>
  );
}

function FormCardSection({ card, panelId, recordKey, collapsibleEnabled, children }) {
  const showHeader = Boolean(card.label?.trim());
  const collapsible = collapsibleEnabled && card.collapsible !== false && showHeader;
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(true);
  }, [recordKey, card.id, panelId]);

  if (!showHeader) {
    return <div className="emp-form-card emp-form-card--virtual">{children}</div>;
  }

  if (!collapsible) {
    return (
      <section className="emp-form-card erp-card p-4">
        <h3 className="emp-form-card-title mb-3 text-sm font-semibold">{card.label}</h3>
        <div className="emp-form-card-body grid grid-cols-1 gap-3">{children}</div>
      </section>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="emp-form-card emp-form-card--collapsible">
      <section>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="emp-form-card-title emp-form-card-title--collapsible flex w-full items-center justify-between gap-2 border-0 p-0 text-left"
          >
            <span className="min-w-0 flex-1 truncate">{card.label}</span>
            <span className="emp-form-card-collapse-btn erp-field-select-chevron-btn shrink-0" aria-hidden="true">
              <ChevronDown
                className={cn("emp-form-card-chevron h-[14px] w-[14px] text-[#1a1f26] transition-transform duration-150", !open && "-rotate-90")}
              />
            </span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent forceMount={false}>
          {open ? <div className="emp-form-card-body">{children}</div> : null}
        </CollapsibleContent>
      </section>
    </Collapsible>
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
  recordKey = null,
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
  const collapsibleEnabled = useCardCollapsibleEnabled();
  const narrowLayout = containerWidthPx > 0 && containerWidthPx <= 1024;

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

  const mgPrototype =
    fieldClassName.includes("mg-prototype-field") || fieldClassName === "mg-prototype-field";

  const renderFieldControl = (field, configuredField, value, fieldReadOnly) => {
    if (typeof field.render !== "function") {
      return (
        <DefaultControl
          field={configuredField}
          value={value}
          onChange={onChange}
          readOnly={fieldReadOnly}
          mgPrototype={mgPrototype}
        />
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
      <DefaultControl
        field={configuredField}
        value={value}
        onChange={onChange}
        readOnly={fieldReadOnly}
        mgPrototype={mgPrototype}
      />
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
        narrowLayout={narrowLayout}
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
            <FormCardSection
              card={card}
              panelId={activePanel?.id}
              recordKey={recordKey}
              collapsibleEnabled={collapsibleEnabled}
            >
              <div className="emp-form-card-rows">
                {layoutRows.map((layoutRow) => {
                  const rowFields = (layoutRow.fieldIds || [])
                    .map((fieldId) => fields.find((field) => field.id === fieldId))
                    .filter(Boolean)
                    .filter(isFieldVisible);
                  if (rowFields.length === 0) return null;
                  const rowDensityClass =
                    rowFields.length <= 1
                      ? "emp-form-card-row-grid--single"
                      : "emp-form-card-row-grid--pair";

                  return (
                    <div key={layoutRow.id} className="emp-form-card-row">
                      <div
                        className={cn(
                          "emp-form-card-row-grid emp-form-card-row-grid--flex",
                          rowDensityClass
                        )}
                      >
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
      style={{ width: "100%" }}
    >
      <div
        className={cn(
          "emp-form-cards-layout cad-form-cards-layout",
          mgPrototype && "mg-prototype-cards-layout"
        )}
      >
        {cardSections}
      </div>
    </div>
  );
}
