import React, { useState } from "react";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { FieldEngine } from "../field/FieldEngine.js";
import CadAutocomplete from "../design-system/CadAutocomplete.jsx";
import CadOptionListControl from "../design-system/CadOptionListControl.jsx";
import CadFormImageField from "../design-system/CadFormImageField.jsx";
import CadToggle from "../design-system/CadToggle.jsx";
import { AnexosApi } from "@/apis/anexos/AnexosApi";
import MgCmdSelect from "@/modules/empresas/layout/MgCmdSelect";
import MgDatePicker from "@/modules/empresas/layout/MgDatePicker";
import MgTimePicker from "@/modules/empresas/layout/MgTimePicker";
import MgLookup from "@/modules/empresas/layout/MgLookup";

const isMgDateTipo = (campo, tipoCanon) =>
  ["date", "datetime", "datetime-local", "data", "data_hora", "datahora"].includes(campo?.tipo) ||
  tipoCanon === "data" ||
  tipoCanon === "data_hora";

const isMgTimeTipo = (campo, tipoCanon) =>
  campo?.tipo === "time" || tipoCanon === "hora";

const isMgSelectTipo = (campo, tipoCanon) =>
  ["select", "relation", "lista", "relacao"].includes(campo?.tipo) ||
  ["lista", "relacao"].includes(tipoCanon);

const isMgCompositeTipo = (campo, tipoCanon) =>
  isMgDateTipo(campo, tipoCanon) ||
  isMgTimeTipo(campo, tipoCanon) ||
  isMgSelectTipo(campo, tipoCanon);

const splitDateTimeValue = (value) => {
  if (!value) return { date: "", time: "" };
  const [date, time = ""] = String(value).split("T");
  return { date: date || "", time: time.slice(0, 5) || "" };
};

const brDateToIso = (value) => {
  const parts = String(value || "").split("/");
  if (parts.length === 3 && parts[2].length === 4) {
    return `${parts[2]}-${String(parts[1]).padStart(2, "0")}-${String(parts[0]).padStart(2, "0")}`;
  }
  return value;
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
  mgPrototype = false,
}) {
  const [uploadingFields, setUploadingFields] = useState({});
  const readOnlyClass = isReadOnly ? "cursor-default" : "";
  const personalizados = formData?.campos_personalizados || {};

  const renderCampoPersonalizado = (campo, ctx = {}) => {
    const value = ctx.value ?? personalizados[campo.field_name] ?? "";
    const campoOptions = FieldEngine.getOptionsCampo(campo, relatedOptions);
    const fieldReadOnly = ctx.readOnly ?? (campo.read_only || isReadOnly);
    const tipoCanon = String(campo.tipo_cadcps || campo.tipo || "text").toLowerCase();
    const mgLabel = mgPrototype && isMgCompositeTipo(campo, tipoCanon) ? campo.label : undefined;
    const setFieldValue = (fieldName, nextValue) => {
      if (typeof ctx.onChange === "function") {
        ctx.onChange(fieldName, nextValue);
        return;
      }
      onCustomChange(fieldName, nextValue);
    };
    const handleCustomDateTimeChange = (fieldName, part, nextValue) => {
      const current = splitDateTimeValue(value);
      const horaAtual = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      const normalizedValue = part === "date" ? brDateToIso(nextValue) : nextValue;
      const next = {
        ...current,
        [part]: normalizedValue,
        ...(part === "date" && normalizedValue && !current.time ? { time: horaAtual } : {}),
      };
      setFieldValue(fieldName, next.date ? `${next.date}T${next.time || "00:00"}` : "");
    };

    if (campo.tipo === "checkbox" || tipoCanon === "sim_nao") {
      const checked = value === true || value === "true" || value === "1" || value === "sim";
      return (
        <div className="cad-form-field-bare flex min-h-[var(--cad-form-control-height,var(--emp-form-control-height,26px))] items-center">
          <CadToggle
            checked={checked}
            onChange={(next) => setFieldValue(campo.field_name, next)}
            disabled={fieldReadOnly}
          />
        </div>
      );
    }

    if (campo.tipo === "textarea" || tipoCanon === "observacao") {
      return (
        <Textarea
          value={value}
          onChange={(e) => setFieldValue(campo.field_name, e.target.value)}
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
          onChange={(nextValue) => setFieldValue(campo.field_name, nextValue)}
          disabled={fieldReadOnly}
          placeholder={(campo.placeholder || "SELECIONE UMA OU MAIS OPÇÕES").toUpperCase()}
        />
      );
    }

    if (campo.tipo === "select" || campo.tipo === "relation" || ["lista", "relacao"].includes(tipoCanon)) {
      const isLookup =
        campo.tipo === "relation" ||
        ["relacao"].includes(tipoCanon) ||
        Boolean(campo.relation_entity || campo.options_source_entity);
      const options = campoOptions
        .map((option) => ({
          id: String(option.value || option.label || ""),
          nome: String(option.label || option.value || "").toUpperCase(),
          subtext: option.subtext || option.description || "",
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }));

      if (mgPrototype) {
        if (isLookup) {
          return (
            <MgLookup
              label={mgLabel}
              required={campo.obrigatorio}
              value={value}
              items={options}
              onChange={(nextValue) => setFieldValue(campo.field_name, nextValue ?? "")}
              displayField="nome"
              searchFields={["nome", "subtext"]}
              readOnly={fieldReadOnly}
              disabled={fieldReadOnly}
            />
          );
        }

        return (
          <MgCmdSelect
            label={mgLabel}
            required={!!campo.obrigatorio}
            value={value}
            options={options.map((option) => ({
              value: option.id,
              label: option.nome,
            }))}
            onChange={(nextValue) => setFieldValue(campo.field_name, nextValue ?? "")}
            disabled={fieldReadOnly}
          />
        );
      }

      return (
        <CadAutocomplete
          variant={isLookup ? "lookup" : "select"}
          items={options}
          value={value}
          onChange={(nextValue) => setFieldValue(campo.field_name, nextValue || "")}
          placeholder={
            isLookup
              ? campo.placeholder || "Digite para pesquisar..."
              : campo.placeholder || "SELECIONE"
          }
          displayField="nome"
          searchFields={["nome", "subtext"]}
          disabled={fieldReadOnly}
          readOnly={fieldReadOnly}
          uppercaseDisplay={!isLookup}
          className="w-full"
          inputClassName={inputClassName}
        />
      );
    }

    if (campo.tipo === "time" || tipoCanon === "hora") {
      if (mgPrototype) {
        return (
          <MgTimePicker
            label={mgLabel}
            value={value}
            onChange={(e) => setFieldValue(campo.field_name, e.target.value)}
            readOnly={fieldReadOnly}
            disabled={fieldReadOnly}
          />
        );
      }

      return (
        <Input
          type="time"
          value={value}
          onChange={(e) => setFieldValue(campo.field_name, e.target.value)}
          readOnly={fieldReadOnly}
          className={`${inputClassName} ${readOnlyClass}`}
        />
      );
    }

    if (["datetime", "datetime-local", "data_hora", "datahora"].includes(campo.tipo) || tipoCanon === "data_hora") {
      const dateTimeValue = splitDateTimeValue(value);

      if (mgPrototype) {
        return (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <MgDatePicker
              label={mgLabel || "Data"}
              required={campo.obrigatorio}
              value={dateTimeValue.date}
              onChange={(e) => handleCustomDateTimeChange(campo.field_name, "date", e.target.value)}
              readOnly={fieldReadOnly}
              disabled={fieldReadOnly}
            />
            <MgTimePicker
              label="Hora"
              value={dateTimeValue.time}
              onChange={(e) => handleCustomDateTimeChange(campo.field_name, "time", e.target.value)}
              readOnly={fieldReadOnly}
              disabled={fieldReadOnly}
            />
          </div>
        );
      }

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
          onChange={(e) => setFieldValue(campo.field_name, e.target.value.replace(/\D/g, ""))}
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
          onChange={(e) => setFieldValue(campo.field_name, formatMaskedNumber(e.target.value, campo))}
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
          onChange={(e) => setFieldValue(campo.field_name, e.target.value)}
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
          onChange={(e) => setFieldValue(campo.field_name, e.target.value)}
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
              .then(({ file_url }) => setFieldValue(fieldName, file_url))
              .catch(() => onUploadError?.())
              .finally(() => {
                setUploadingFields((previous) => ({ ...previous, [fieldName]: false }));
              });
          }}
          onClear={() => setFieldValue(campo.field_name, "")}
          alt={campo.label || "Arquivo"}
        />
      );
    }

    const isSimpleDateField =
      ["date", "data"].includes(String(campo.tipo || "").toLowerCase()) ||
      ["date", "data"].includes(tipoCanon);

    if (isSimpleDateField) {
      if (mgPrototype) {
        return (
          <MgDatePicker
            label={mgLabel}
            required={campo.obrigatorio}
            value={value}
            onChange={(e) => setFieldValue(campo.field_name, brDateToIso(e.target.value))}
            readOnly={fieldReadOnly}
            disabled={fieldReadOnly}
          />
        );
      }

      return (
        <Input
          type="date"
          value={value}
          onChange={(e) => setFieldValue(campo.field_name, e.target.value)}
          readOnly={fieldReadOnly}
          className={`${inputClassName} ${readOnlyClass}`}
        />
      );
    }

    return (
      <Input
        type={campo.tipo === "number" ? "number" : "text"}
        value={value}
        onChange={(e) => setFieldValue(campo.field_name, e.target.value)}
        placeholder={(campo.placeholder || campo.label || "").toUpperCase()}
        readOnly={fieldReadOnly}
        className={`${inputClassName} ${campo.uppercase ? "uppercase" : ""} ${readOnlyClass}`}
      />
    );
  };

  return { renderCampoPersonalizado };
}

export default useCustomFieldRenderer;
