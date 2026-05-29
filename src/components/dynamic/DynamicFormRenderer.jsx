import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AutocompleteGenerico from "@/components/financeiro/AutocompleteGenerico";

const FL = ({ label, required, error, children, dataField, wide = false, compact = false, medium = false }) => (
  <div data-field={dataField} className={`grid grid-cols-[190px_minmax(0,1fr)] items-center gap-1 ${wide ? "md:col-span-2" : ""}`}>
    <label className="text-[12px] text-slate-600 text-right leading-none">
      {label}:{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <div className={`${wide ? "min-h-6" : "h-6"} ${medium ? "w-64 max-w-full" : compact ? "w-44 max-w-full" : "w-full"} border ${error ? "border-red-500 bg-red-50" : "border-slate-300 bg-white"} rounded-[1.5px] focus-within:border-green-500 transition-colors overflow-hidden [&_input]:h-[22px] [&_input]:border-0 [&_input]:rounded-none [&_input]:shadow-none [&_input]:focus-visible:ring-0 [&_button]:h-[22px] [&_button]:border-0 [&_button]:rounded-none [&_button]:shadow-none [&_textarea]:min-h-[48px] [&_textarea]:rounded-none [&_textarea]:border-0 [&_textarea]:shadow-none [&_textarea]:focus-visible:ring-0`}>
      {children}
    </div>
  </div>
);

export default function DynamicFormRenderer({
  panels = [],
  fields = [],
  layout = {},
  hiddenFieldIds = [],
  lockedFieldIds = [],
  requiredFieldIds = [],
  visibilityRules = {},
  activePanelId,
  values = {},
  errors = {},
  onChange,
  readOnly = false,
  fieldClassName = "",
}) {
  const panel = panels.find((p) => p.id === activePanelId);
  if (!panel) return null;

  const panelFieldIds = layout[panel.id] || [];
  const inputClass = "h-[22px] text-xs border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent px-1";

  const renderField = (field) => {
    if (!field) return null;
    const value = values[field.name] ?? "";
    const error = errors[field.errorKey || field.name];
    const isRequired = field.required || requiredFieldIds.includes(field.id);
    const isReadOnly = readOnly || lockedFieldIds.includes(field.id);

    // Custom render
    if (field.render) {
      return (
        <FL key={field.id} label={field.label} required={isRequired} error={error} dataField={field.errorKey || field.name} wide={field.wide} compact={field.compact} medium={field.medium}>
          {field.render({ value, onChange, readOnly: isReadOnly })}
        </FL>
      );
    }

    // Date
    if (field.type === "date") {
      return (
        <FL key={field.id} label={field.label} required={isRequired} error={error} dataField={field.errorKey || field.name} compact={field.compact}>
          <Input type="date" value={value} onChange={(e) => onChange(field.name, e.target.value)} readOnly={isReadOnly} className={inputClass} />
        </FL>
      );
    }

    // Number
    if (field.type === "number") {
      return (
        <FL key={field.id} label={field.label} required={isRequired} error={error} dataField={field.errorKey || field.name} compact={field.compact}>
          <Input type="number" value={value} onChange={(e) => onChange(field.name, e.target.value)} readOnly={isReadOnly || field.readOnly} className={inputClass} />
        </FL>
      );
    }

    // Textarea
    if (field.type === "textarea") {
      return (
        <FL key={field.id} label={field.label} required={isRequired} error={error} dataField={field.errorKey || field.name} wide={field.wide}>
          <Textarea value={value} onChange={(e) => onChange(field.name, e.target.value)} readOnly={isReadOnly} placeholder={field.placeholder || ""} className="text-xs border-0 shadow-none focus-visible:ring-0 bg-transparent px-1 uppercase" rows={2} />
        </FL>
      );
    }

    // Select (native)
    if (field.type === "select" && field.optionsMode === "native") {
      return (
        <FL key={field.id} label={field.label} required={isRequired} error={error} dataField={field.errorKey || field.name} compact={field.compact}>
          <AutocompleteGenerico
            items={field.options || []}
            value={value}
            onChange={(v) => onChange(field.name, v)}
            placeholder={field.placeholder || "SELECIONE..."}
            displayField={field.displayField || "nome"}
            searchFields={field.searchFields || ["nome"]}
            className="w-full"
            inputClassName={inputClass}
            disabled={isReadOnly}
            readOnly={isReadOnly}
          />
        </FL>
      );
    }

    // Autocomplete
    if (field.type === "autocomplete" || field.type === "select") {
      return (
        <FL key={field.id} label={field.label} required={isRequired} error={error} dataField={field.errorKey || field.name} compact={field.compact}>
          <AutocompleteGenerico
            items={field.options || []}
            value={value}
            onChange={(v) => onChange(field.name, v)}
            placeholder={field.placeholder || "BUSCAR..."}
            displayField={field.displayField || "nome"}
            searchFields={field.searchFields || ["nome"]}
            className="w-full"
            inputClassName={inputClass}
            disabled={isReadOnly}
            readOnly={isReadOnly}
          />
        </FL>
      );
    }

    // Default text
    return (
      <FL key={field.id} label={field.label} required={isRequired} error={error} dataField={field.errorKey || field.name} wide={field.wide} compact={field.compact}>
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(field.name, field.uppercase ? e.target.value.toUpperCase() : e.target.value)}
          readOnly={isReadOnly}
          placeholder={field.placeholder || ""}
          className={`${inputClass} ${field.uppercase ? "uppercase" : ""}`}
        />
      </FL>
    );
  };

  const visibleFieldIds = panelFieldIds.filter((id) => {
    if (hiddenFieldIds.includes(id)) return false;
    const field = fields.find((f) => f.id === id);
    if (!field) return false;
    if (field.showWhen && !field.showWhen(values)) return false;
    // Check visibilityRules
    const rule = visibilityRules[id] || field.defaultVisibilityRule;
    if (rule) {
      const sourceVal = String(values[rule.sourceFieldName || rule.sourceFieldId] || "").trim().toUpperCase();
      const ruleVal = String(rule.value || "").trim().toUpperCase();
      if (sourceVal !== ruleVal) return false;
    }
    return true;
  });

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 ${fieldClassName}`}>
      {visibleFieldIds.map((id) => {
        const field = fields.find((f) => f.id === id);
        return renderField(field);
      })}
    </div>
  );
}