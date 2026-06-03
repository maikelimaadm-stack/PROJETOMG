import React, { useState } from "react";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import campoEngine from "@/framework/cadastro/fields/campoEngine";
import EmpAutocomplete from "@/framework/cadastro/formularios/EmpAutocomplete";
import EmpOptionListControl from "@/framework/cadastro/formularios/EmpOptionListControl";
import EmpFormImageField from "@/framework/cadastro/formularios/EmpFormImageField";
import { AnexosApi } from "@/apis/anexos/AnexosApi";
import { splitDateTimeValue, formatMaskedNumber } from "./formEmp.constants";

export function useFormEmpCustomFields({
  formData,
  isReadOnly,
  handleCustomChange,
  relatedOptions = {},
  onUploadError,
}) {
  const [uploadingFields, setUploadingFields] = useState({});
  const readOnlyClass = isReadOnly ? "cursor-default" : "";
  const customInputClass = "emp-form-input border-0 shadow-none focus-visible:ring-0 bg-white uppercase";

  const handleCustomDateTimeChange = (fieldName, part, nextValue) => {
    const current = splitDateTimeValue(formData.campos_personalizados?.[fieldName]);
    const horaAtual = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const next = {
      ...current,
      [part]: nextValue,
      ...(part === "date" && nextValue && !current.time ? { time: horaAtual } : {}),
    };
    handleCustomChange(fieldName, next.date ? `${next.date}T${next.time || "00:00"}` : "");
  };

  const renderCampoPersonalizado = (campo) => {
    const value = formData.campos_personalizados?.[campo.field_name] || "";
    const campoOptions = campoEngine.getOptionsCampo(campo, relatedOptions);
    const fieldReadOnly = campo.read_only || isReadOnly;

    if (campo.tipo === "textarea") {
      return (
        <Textarea
          value={value}
          onChange={(e) => handleCustomChange(campo.field_name, e.target.value)}
          placeholder={(campo.placeholder || campo.label || "").toUpperCase()}
          readOnly={fieldReadOnly}
          className={`emp-form-input text-xs uppercase bg-white px-2 ${readOnlyClass}`}
          rows={campo.rows || 2}
        />
      );
    }

    if (campo.tipo === "calculado") {
      const calculatedValue = campoEngine.calcularCampo(formData, campo);
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
          className={`${customInputClass} ${readOnlyClass}`}
        />
      );
    }

    if (campo.tipo === "option_list") {
      const options = campoOptions.map((option) => ({
        value: String(option.value || option.label || "").toUpperCase(),
        label: String(option.label || option.value || "").toUpperCase(),
      }));
      return (
        <EmpOptionListControl
          options={options}
          value={value}
          onChange={(nextValue) => handleCustomChange(campo.field_name, nextValue)}
          disabled={fieldReadOnly}
          placeholder={(campo.placeholder || "SELECIONE UMA OU MAIS OPÇÕES").toUpperCase()}
        />
      );
    }

    if (campo.tipo === "select" || campo.tipo === "relation") {
      const options = campoOptions
        .map((option) => ({
          id: String(option.value || option.label || ""),
          nome: String(option.label || option.value || "").toUpperCase(),
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }));
      return (
        <EmpAutocomplete
          items={options}
          value={value}
          onChange={(nextValue) => handleCustomChange(campo.field_name, nextValue || "")}
          placeholder={(campo.placeholder || "BUSCAR OPÇÃO...").toUpperCase()}
          displayField="nome"
          searchFields={["nome"]}
          disabled={fieldReadOnly}
          readOnly={fieldReadOnly}
          className="w-full"
          inputClassName="emp-form-input border-0 shadow-none focus-visible:ring-0 bg-white uppercase"
        />
      );
    }

    if (campo.tipo === "time") {
      return (
        <Input
          type="time"
          value={value}
          onChange={(e) => handleCustomChange(campo.field_name, e.target.value)}
          readOnly={fieldReadOnly}
          className={`${customInputClass} ${readOnlyClass}`}
        />
      );
    }

    if (["datetime", "datetime-local", "data_hora", "datahora"].includes(campo.tipo)) {
      const dateTimeValue = splitDateTimeValue(value);
      return (
        <div className="grid grid-cols-2 gap-1">
          <Input
            type="date"
            value={dateTimeValue.date}
            onChange={(e) => handleCustomDateTimeChange(campo.field_name, "date", e.target.value)}
            readOnly={fieldReadOnly}
            className={`${customInputClass} ${readOnlyClass}`}
          />
          <Input
            type="time"
            value={dateTimeValue.time}
            onChange={(e) => handleCustomDateTimeChange(campo.field_name, "time", e.target.value)}
            readOnly={fieldReadOnly}
            className={`${customInputClass} ${readOnlyClass}`}
          />
        </div>
      );
    }

    if (campo.tipo === "number" && campo.usar_mascara) {
      return (
        <Input
          type="text"
          inputMode="numeric"
          value={formatMaskedNumber(value, campo)}
          onChange={(e) => handleCustomChange(campo.field_name, formatMaskedNumber(e.target.value, campo))}
          placeholder={(campo.placeholder || campo.label || "").toUpperCase()}
          readOnly={fieldReadOnly}
          className={`${customInputClass} ${readOnlyClass}`}
        />
      );
    }

    if (["imagem", "image", "file"].includes(campo.tipo)) {
      const uploading = Boolean(uploadingFields[campo.field_name]);
      return (
        <EmpFormImageField
          value={value}
          readOnly={fieldReadOnly}
          uploading={uploading}
          onUpload={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const fieldName = campo.field_name;
            setUploadingFields((previous) => ({ ...previous, [fieldName]: true }));
            AnexosApi.uploadFile(file)
              .then(({ file_url }) => handleCustomChange(fieldName, file_url))
              .catch(() => onUploadError?.())
              .finally(() => {
                setUploadingFields((previous) => ({ ...previous, [fieldName]: false }));
              });
          }}
          onClear={() => handleCustomChange(campo.field_name, "")}
          alt={campo.label || "Imagem"}
        />
      );
    }

    return (
      <Input
        type={campo.tipo === "number" ? "number" : campo.tipo === "date" ? "date" : "text"}
        value={value}
        onChange={(e) => handleCustomChange(campo.field_name, e.target.value)}
        placeholder={(campo.placeholder || campo.label || "").toUpperCase()}
        readOnly={fieldReadOnly}
        className={`${customInputClass} ${campo.uppercase ? "uppercase" : ""} ${readOnlyClass}`}
      />
    );
  };

  return { renderCampoPersonalizado };
}
