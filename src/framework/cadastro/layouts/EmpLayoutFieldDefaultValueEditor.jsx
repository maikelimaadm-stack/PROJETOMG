import React from "react";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import ToggleSwitch from "@/shared/components/ToggleSwitch";
import EmpAutocomplete from "@/framework/cadastro/formularios/EmpAutocomplete";

const isDateTimeField = (field) =>
  ["datetime", "datetime-local", "data_hora", "datahora"].includes(field?.type);

const splitDateTimeValue = (value) => {
  const raw = String(value || "");
  if (!raw) return { date: "", time: "" };
  const [date = "", time = ""] = raw.split("T");
  return { date, time: (time || "").slice(0, 5) };
};

const joinDateTimeValue = (date, time) => {
  if (!date && !time) return "";
  if (!date) return time ? `T${time}` : "";
  return time ? `${date}T${time}` : date;
};

export default function EmpLayoutFieldDefaultValueEditor({
  field,
  value,
  disabled = false,
  onChange,
  selectPortalled = false,
  onSelectOpenChange,
}) {
  if (!field) return null;

  const controlClass =
    "emp-layout-config-select h-7 w-full min-w-0 text-xs border border-[#cfd8e3] bg-white";

  if (field.id === "status" || field.name === "status") {
    const isActive = value !== "Inativa" && value !== false && value !== "false" && value !== 0 && value !== "0";
    return (
      <div className="flex h-7 items-center px-1">
        <ToggleSwitch
          checked={isActive}
          disabled={disabled}
          onChange={(checked) => onChange?.(checked ? "Ativa" : "Inativa")}
          className="emp-form-toggle-switch shrink-0"
          checkedClassName="emp-form-toggle-switch-on"
        />
      </div>
    );
  }

  if (field.type === "switch" || field.type === "checkbox") {
    return (
      <ToggleSwitch
        checked={value === true || value === "true" || value === 1 || value === "1"}
        disabled={disabled}
        onChange={(checked) => onChange?.(checked)}
        className="emp-form-toggle-switch"
        checkedClassName="emp-form-toggle-switch-on"
      />
    );
  }

  if (isDateTimeField(field)) {
    const { date, time } = splitDateTimeValue(value);
    return (
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <Input
          type="date"
          value={date}
          disabled={disabled}
          onChange={(event) => onChange?.(joinDateTimeValue(event.target.value, time))}
          className={`${controlClass} flex-1`}
        />
        <Input
          type="time"
          value={time}
          disabled={disabled}
          onChange={(event) => onChange?.(joinDateTimeValue(date, event.target.value))}
          className={`${controlClass} w-28 shrink-0`}
        />
      </div>
    );
  }

  if (field.type === "date") {
    return (
      <Input
        type="date"
        value={value || ""}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        className={controlClass}
      />
    );
  }

  if (field.type === "time") {
    return (
      <Input
        type="time"
        value={value || ""}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        className={controlClass}
      />
    );
  }

  if (field.type === "number" || field.type === "calculado") {
    return (
      <Input
        type="number"
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        className={controlClass}
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <Input
        value={value || ""}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        className={controlClass}
        placeholder="Valor padrão"
      />
    );
  }

  if (["select", "autocomplete", "option_list"].includes(field.type) && Array.isArray(field.options) && field.options.length > 0) {
    const options = field.options.map((option) => ({
      value: String(option?.id ?? option?.value ?? option?.label ?? option?.nome ?? ""),
      label: String(option?.nome ?? option?.label ?? option?.value ?? option?.id ?? ""),
    }));

    return (
      <Select
        value={value || ""}
        onValueChange={(nextValue) => onChange?.(nextValue)}
        disabled={disabled}
        onOpenChange={onSelectOpenChange}
      >
        <SelectTrigger className={`${controlClass} px-2`}>
          <SelectValue placeholder="Selecione..." />
        </SelectTrigger>
        <SelectContent portalled={selectPortalled} className="z-[250]">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-xs">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      type="text"
      value={value || ""}
      disabled={disabled}
      onChange={(event) => onChange?.(event.target.value)}
      className={controlClass}
      placeholder="Valor padrão"
    />
  );
}
