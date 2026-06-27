import React from "react";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import EmpAutocomplete from "@/framework/cadastro/formularios/EmpAutocomplete";

const labelFromId = (id) =>
  String(id || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

/**
 * Constrói dynamicFields declarativos para módulos simples (produtos, marcas, etc.).
 * Campos complexos devem usar buildDynamicFields dedicado no runtime do módulo.
 */
export function buildMakStandardDynamicFields(fieldDefinitions = []) {
  return function buildFields({
    formData,
    handleChange,
    isReadOnly,
    inputClass,
    initialData,
    hideToolbar,
  }) {
    return fieldDefinitions.map((def) => {
      const {
        id,
        name = id,
        label = labelFromId(id),
        type = "text",
        required = false,
        readOnly = false,
        uppercase = false,
        wide = false,
        compact = false,
        medium = false,
        placeholder,
        options = [],
        autoCode = false,
      } = def;

      const fieldReadOnly = readOnly || isReadOnly;
      const value = formData?.[name] ?? "";

      if (type === "textarea") {
        return {
          id,
          name,
          label,
          type,
          required,
          errorKey: name,
          wide,
          render: () => (
            <Textarea
              value={value}
              onChange={(event) => handleChange(name, event.target.value)}
              readOnly={fieldReadOnly}
              className={`${inputClass} min-h-[72px] uppercase`}
              placeholder={placeholder ?? label.toUpperCase()}
            />
          ),
        };
      }

      if (type === "select" && options.length) {
        const items = options.map((option) =>
          typeof option === "string"
            ? { id: option, nome: option.toUpperCase() }
            : { id: option.id, nome: String(option.nome ?? option.label ?? option.id).toUpperCase() }
        );
        return {
          id,
          name,
          label,
          type: "select",
          required,
          errorKey: name,
          compact,
          render: () => (
            <EmpAutocomplete
              variant="select"
              items={items}
              value={value || ""}
              onChange={(next) => handleChange(name, next || "")}
              placeholder="SELECIONE"
              displayField="nome"
              searchFields={["nome"]}
              disabled={fieldReadOnly}
              readOnly={fieldReadOnly}
              className="w-full h-full"
              inputClassName={`${inputClass} border-0 shadow-none focus-visible:ring-0 bg-white uppercase`}
            />
          ),
        };
      }

      if (autoCode || id === "codigo") {
        return {
          id,
          name,
          label,
          type: "text",
          readOnly: true,
          compact,
          render: () =>
            hideToolbar ? (
              <input
                type="text"
                value={initialData?._isPersisting ? "Gerando..." : value || "Automático"}
                readOnly
              />
            ) : (
              <Input
                value={initialData?._isPersisting ? "Gerando..." : value || "Automático"}
                readOnly
                className={inputClass}
              />
            ),
        };
      }

      return {
        id,
        name,
        label,
        type,
        required,
        errorKey: name,
        wide,
        medium,
        compact,
        uppercase,
        placeholder: placeholder ?? label.toUpperCase(),
        render: () => (
          <Input
            type={type === "number" ? "number" : "text"}
            value={value ?? ""}
            onChange={(event) =>
              handleChange(
                name,
                type === "number" && event.target.value !== ""
                  ? Number(event.target.value)
                  : event.target.value
              )
            }
            readOnly={fieldReadOnly}
            className={`${inputClass} uppercase`}
            placeholder={placeholder ?? label.toUpperCase()}
          />
        ),
      };
    });
  };
}

export default buildMakStandardDynamicFields;
