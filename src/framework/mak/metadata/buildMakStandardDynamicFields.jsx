import React from "react";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import EmpAutocomplete from "@/framework/cadastro/formularios/EmpAutocomplete";
import EmpFormImageField from "@/framework/cadastro/formularios/EmpFormImageField";
import { MakCmdSelect } from "@/framework/mak/layout";

const labelFromId = (id) =>
  String(id || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const inputTypeForField = (type) => {
  if (type === "number") return "number";
  if (type === "email") return "email";
  if (type === "url") return "url";
  if (type === "tel" || type === "phone" || type === "telefone" || type === "whatsapp") return "tel";
  return "text";
};

const renderSelectControl = ({
  def,
  formData,
  handleChange,
  isReadOnly,
  inputClass,
  hideToolbar,
  value,
  name,
}) => {
  const { label, options = [], required = false } = def;
  const items = options.map((option) =>
    typeof option === "string"
      ? { id: option, nome: option.toUpperCase() }
      : { id: option.id ?? option.value, nome: String(option.nome ?? option.label ?? option.id).toUpperCase() }
  );

  if (hideToolbar) {
    return (
      <MakCmdSelect
        label={label}
        required={required}
        value={value || ""}
        options={items.map((item) => ({
          value: item.id,
          label: String(item.nome || item.id).replace(/\b\w/g, (char) => char.toLowerCase()),
        }))}
        onChange={(next) => handleChange(name, next || "")}
        disabled={isReadOnly}
      />
    );
  }

  return (
    <EmpAutocomplete
      variant="select"
      items={items}
      value={value || ""}
      onChange={(next) => handleChange(name, next || "")}
      placeholder="SELECIONE"
      displayField="nome"
      searchFields={["nome"]}
      disabled={isReadOnly}
      readOnly={isReadOnly}
      className="w-full h-full"
      inputClassName={`${inputClass} border-0 shadow-none focus-visible:ring-0 bg-white uppercase`}
    />
  );
};

/**
 * Constrói dynamicFields declarativos para módulos simples (produtos, marcas, etc.).
 * Cobre os tipos nativos usados no Cadastro de Empresas.
 */
export function buildMakStandardDynamicFields(fieldDefinitions = []) {
  return function buildFields({
    formData,
    handleChange,
    isReadOnly,
    inputClass,
    initialData,
    hideToolbar,
    uploadingImage = false,
    handleImageUpload,
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
        displayField = "nome",
        searchFields = ["nome"],
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
              className={`${inputClass} min-h-[72px]${uppercase ? " uppercase" : ""}`}
              placeholder={placeholder ?? label.toUpperCase()}
            />
          ),
        };
      }

      if ((type === "select" || type === "autocomplete") && options.length) {
        return {
          id,
          name,
          label,
          type: type === "autocomplete" ? "autocomplete" : "select",
          required,
          errorKey: name,
          compact,
          options,
          displayField,
          searchFields,
          render: () =>
            renderSelectControl({
              def: { ...def, label, options, required },
              formData,
              handleChange,
              isReadOnly: fieldReadOnly,
              inputClass,
              hideToolbar,
              value,
              name,
            }),
        };
      }

      if (type === "image" || type === "imagem") {
        return {
          id,
          name,
          label,
          type: "image",
          compact,
          render: () => (
            <EmpFormImageField
              value={value}
              readOnly={fieldReadOnly}
              uploading={uploadingImage}
              onUpload={handleImageUpload}
              onClear={() => handleChange(name, "")}
              alt={label}
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

      const maskedTypes = new Set(["cpf_cnpj", "cpf", "cnpj", "cep", "tel", "phone", "telefone", "whatsapp", "email"]);
      if (maskedTypes.has(type) || type === "number") {
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
          render: () =>
            hideToolbar ? (
              <input
                type={inputTypeForField(type)}
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
                placeholder={placeholder ?? label.toUpperCase()}
              />
            ) : (
              <Input
                type={inputTypeForField(type)}
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
                className={`${inputClass}${uppercase ? " uppercase" : ""}`}
                placeholder={placeholder ?? label.toUpperCase()}
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
        render: () =>
          hideToolbar ? (
            <input
              type={inputTypeForField(type)}
              value={value ?? ""}
              onChange={(event) => handleChange(name, event.target.value)}
              readOnly={fieldReadOnly}
              placeholder={placeholder ?? label.toUpperCase()}
              className={uppercase ? "uppercase" : undefined}
            />
          ) : (
            <Input
              type={inputTypeForField(type)}
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
              className={`${inputClass}${uppercase ? " uppercase" : ""}`}
              placeholder={placeholder ?? label.toUpperCase()}
            />
          ),
      };
    });
  };
}

export default buildMakStandardDynamicFields;
