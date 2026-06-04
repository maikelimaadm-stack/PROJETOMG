import React, { useState } from "react";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { FieldEngine } from "../field/FieldEngine.js";
import CadAutocomplete from "../design-system/CadAutocomplete.jsx";
import CadOptionListControl from "../design-system/CadOptionListControl.jsx";
import CadFormImageField from "../design-system/CadFormImageField.jsx";
import CadToggle from "../design-system/CadToggle.jsx";
import { AnexosApi } from "@/apis/anexos/AnexosApi";

const splitDateTimeValue = (value) => {
  if (!value) return { date: "", time: "" };
  const [date, time = ""] = String(value).split("T");
  return { date: date || "", time: time.slice(0, 5) || "" };
};

const formatMaskedNumber = (value, campo) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!campo?.usar_mascara || !campo?.mascaras_text) return digits;
  const mask = String(campo.mascaras_text).split("\n")[0] || "";
  let result = "";
  let di = 0;
  for (let i = 0; i < mask.length && di < digits.length; i += 1) {
    if (mask[i] === "#") {
      result += digits[di];
      di += 1;
    } else {
      result += mask[i];
    }
  }
  return result;
};

/**
 * Renderizador universal de campos personalizados (CADCPS).
 */
export function useCustomFieldRenderer({
  formData,
  isReadOnly,
  onCustomChange,
  relatedOptions = {},
  onUploadError,
  inputClassName = "cad-form-input border-0 shadow-none focus-visible:ring-0 bg-white uppercase",
}) {
  const [uploadingFields, setUploadingFields] = useState({});
  const readOnlyClass = isReadOnly ? "cursor-default" : "";
  const personalizados = formData?.campos_personalizados || {};

  const handleCustomDateTimeChange = (fieldName, part, nextValue) => {
    const current = splitDateTimeValue(personalizados[fieldName]);
    const horaAtual = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const next = {
      ...current,
      [part]: nextValue,
      ...(part === "date" && nextValue && !current.time ? { time: horaAtual } : {}),
    };
    onCustomChange(fieldName, next.date ? `${next.date}T${next.time || "00:00"}` : "");
  };

  const renderCampoPersonalizado = (campo) => {
    const value = personalizados[campo.field_name] || "";
    const campoOptions = FieldEngine.getOptionsCampo(campo, relatedOptions);
    const fieldReadOnly = campo.read_only || isReadOnly;
    const tipoCanon = String(campo.tipo_cadcps || campo.tipo || "text").toLowerCase();

    if (campo.tipo === "checkbox" || tipoCanon === "sim_nao") {
      const checked = value === true || value === "true" || value === "1" || value === "sim";
      return (
        <div className="cad-form-field-bare flex min-h-[var(--cad-form-control-height,var(--emp-form-control-height,26px))] items-center">
          <CadToggle
            checked={checked}
            onChange={(next) => onCustomChange(campo.field_name, next)}
            disabled={fieldReadOnly}
          />
        </div>
      );
    }

    if (campo.tipo === "textarea" || tipoCanon === "observacao") {
      return (
        <Textarea
          value={value}
          onChange={(e) => onCustomChange(campo.field_name, e.target.value)}
          placeholder={(campo.placeholder || campo.label || "").toUpperCase()}
          readOnly={fieldReadOnly}
          className={`${inputClassName} text-xs uppercase bg-white px-2 ${readOnlyClass}`}
          rows={campo.rows || 2}
        />
      );
    }

    if (campo.tipo === "calculado" || tipoCanon === "formula") {
      const calculatedValue = FieldEngine.calcularCampo(formData, campo);
      const places = Math.min(6, Math.max(0, Number(campo.decimal_places ?? 2)));
      return (
        <Input
          value={Number(calculatedValue || 0).toLocaleString(
            "pt-BR",
            campo.usar_decimal
              ? { minimumFractionDigits: places, maximumFractionDigits: places }
              : { maximumFractionDigits: 2 }
          )}
          readOnly
          placeholder="CALCULADO"
          className={`${inputClassName} ${readOnlyClass}`}
        />
      );
    }

    if (campo.tipo === "option_list" || tipoCanon === "lista_multipla") {
      const options = campoOptions.map((option) => ({
        value: String(option.value || option.label || "").toUpperCase(),
        label: String(option.label || option.value || "").toUpperCase(),
      }));
      return (
        <CadOptionListControl
          options={options}
          value={value}
          onChange={(nextValue) => onCustomChange(campo.field_name, nextValue)}
          disabled={fieldReadOnly}
          placeholder={(campo.placeholder || "SELECIONE UMA OU MAIS OPÇÕES").toUpperCase()}
        />
      );
    }

    if (campo.tipo === "select" || campo.tipo === "relation" || ["lista", "relacao"].includes(tipoCanon)) {
      const options = campoOptions
        .map((option) => ({
          id: String(option.value || option.label || ""),
          nome: String(option.label || option.value || "").toUpperCase(),
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }));
      return (
        <CadAutocomplete
          items={options}
          value={value}
          onChange={(nextValue) => onCustomChange(campo.field_name, nextValue || "")}
          placeholder={(campo.placeholder || "BUSCAR OPÇÃO...").toUpperCase()}
          displayField="nome"
          searchFields={["nome"]}
          disabled={fieldReadOnly}
          readOnly={fieldReadOnly}
          className="w-full"
          inputClassName={inputClassName}
        />
      );
    }

    if (campo.tipo === "time" || tipoCanon === "hora") {
      return (
        <Input
          type="time"
          value={value}
          onChange={(e) => onCustomChange(campo.field_name, e.target.value)}
          readOnly={fieldReadOnly}
          className={`${inputClassName} ${readOnlyClass}`}
        />
      );
    }

    if (["datetime", "datetime-local", "data_hora", "datahora"].includes(campo.tipo) || tipoCanon === "data_hora") {
      const dateTimeValue = splitDateTimeValue(value);
      return (
        <div className="grid grid-cols-2 gap-1">
          <Input
            type="date"
            value={dateTimeValue.date}
            onChange={(e) => handleCustomDateTimeChange(campo.field_name, "date", e.target.value)}
            readOnly={fieldReadOnly}
            className={`${inputClassName} ${readOnlyClass}`}
          />
          <Input
            type="time"
            value={dateTimeValue.time}
            onChange={(e) => handleCustomDateTimeChange(campo.field_name, "time", e.target.value)}
            readOnly={fieldReadOnly}
            className={`${inputClassName} ${readOnlyClass}`}
          />
        </div>
      );
    }

    if ((campo.tipo === "number" && tipoCanon === "inteiro") || tipoCanon === "inteiro") {
      return (
        <Input
          type="number"
          step="1"
          inputMode="numeric"
          value={value}
          onChange={(e) => onCustomChange(campo.field_name, e.target.value.replace(/\D/g, ""))}
          placeholder={(campo.placeholder || campo.label || "").toUpperCase()}
          readOnly={fieldReadOnly}
          className={`${inputClassName} ${readOnlyClass}`}
        />
      );
    }

    if (
      (campo.tipo === "number" && campo.usar_mascara) ||
      ["decimal", "moeda", "percentual"].includes(tipoCanon)
    ) {
      return (
        <Input
          type="text"
          inputMode="numeric"
          value={formatMaskedNumber(value, campo)}
          onChange={(e) => onCustomChange(campo.field_name, formatMaskedNumber(e.target.value, campo))}
          placeholder={(campo.placeholder || campo.label || "").toUpperCase()}
          readOnly={fieldReadOnly}
          className={`${inputClassName} ${readOnlyClass}`}
        />
      );
    }

    if (tipoCanon === "email") {
      return (
        <Input
          type="email"
          value={value}
          onChange={(e) => onCustomChange(campo.field_name, e.target.value)}
          placeholder={(campo.placeholder || campo.label || "").toUpperCase()}
          readOnly={fieldReadOnly}
          className={`${inputClassName} ${readOnlyClass}`}
        />
      );
    }

    if (tipoCanon === "url") {
      return (
        <Input
          type="url"
          value={value}
          onChange={(e) => onCustomChange(campo.field_name, e.target.value)}
          placeholder={(campo.placeholder || "HTTPS://...").toUpperCase()}
          readOnly={fieldReadOnly}
          className={`${inputClassName} ${readOnlyClass}`}
        />
      );
    }

    if (["imagem", "image", "file", "arquivo", "assinatura"].includes(campo.tipo) || ["imagem", "arquivo", "assinatura"].includes(tipoCanon)) {
      const uploading = Boolean(uploadingFields[campo.field_name]);
      return (
        <CadFormImageField
          value={value}
          readOnly={fieldReadOnly}
          uploading={uploading}
          onUpload={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const fieldName = campo.field_name;
            setUploadingFields((previous) => ({ ...previous, [fieldName]: true }));
            AnexosApi.uploadFile(file)
              .then(({ file_url }) => onCustomChange(fieldName, file_url))
              .catch(() => onUploadError?.())
              .finally(() => {
                setUploadingFields((previous) => ({ ...previous, [fieldName]: false }));
              });
          }}
          onClear={() => onCustomChange(campo.field_name, "")}
          alt={campo.label || "Arquivo"}
        />
      );
    }

    if (tipoCanon === "data" || campo.tipo === "date") {
      return (
        <Input
          type="date"
          value={value}
          onChange={(e) => onCustomChange(campo.field_name, e.target.value)}
          readOnly={fieldReadOnly}
          className={`${inputClassName} ${readOnlyClass}`}
        />
      );
    }

    return (
      <Input
        type={campo.tipo === "number" ? "number" : "text"}
        value={value}
        onChange={(e) => onCustomChange(campo.field_name, e.target.value)}
        placeholder={(campo.placeholder || campo.label || "").toUpperCase()}
        readOnly={fieldReadOnly}
        className={`${inputClassName} ${campo.uppercase ? "uppercase" : ""} ${readOnlyClass}`}
      />
    );
  };

  return { renderCampoPersonalizado };
}

export default useCustomFieldRenderer;
