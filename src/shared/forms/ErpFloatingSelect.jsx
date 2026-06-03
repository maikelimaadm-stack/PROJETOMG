import React, { useMemo, useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import ErpFloatingField from "./ErpFloatingField";

/**
 * Select pesquisável (combobox) com floating label — sem &lt;select&gt; nativo.
 * @param {{ value: string, label: string }[]} options
 */
export default function ErpFloatingSelect({
  label,
  value,
  onValueChange,
  options = [],
  required,
  error,
  hint,
  disabled,
  readOnly,
  id,
  className,
  clearable = true,
  searchPlaceholder,
  emptyText = "Nenhum resultado.",
  multiple = false,
  values = [],
  onValuesChange,
}) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(
    () => options.find((o) => String(o.value) === String(value)),
    [options, value]
  );
  const filled = multiple ? values.length > 0 : Boolean(value);

  const displayText = multiple
    ? values
        .map((v) => options.find((o) => String(o.value) === String(v))?.label)
        .filter(Boolean)
        .join(", ")
    : selected?.label || "";

  const trigger = (
    <Popover open={open && !disabled && !readOnly} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || readOnly}
          className={cn(
            "erp-float-control erp-float-select-trigger",
            !filled && "erp-float-select-trigger--empty"
          )}
        >
          <span className={cn("erp-float-select-value", !displayText && "erp-float-select-value--empty")}>
            {displayText || "\u00a0"}
          </span>
          <span className="erp-float-select-icons">
            {clearable && filled && !disabled && !readOnly ? (
              <X
                className="erp-float-select-clear"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (multiple) onValuesChange?.([]);
                  else onValueChange?.("");
                }}
              />
            ) : null}
            <ChevronsUpDown className="erp-float-select-chevron" aria-hidden />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="erp-float-select-content p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder || "Pesquisar..."} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup className="max-h-[280px] overflow-auto">
              {options.map((option) => {
                const isSelected = multiple
                  ? values.some((v) => String(v) === String(option.value))
                  : String(value) === String(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      if (multiple) {
                        const set = new Set(values.map(String));
                        const key = String(option.value);
                        if (set.has(key)) set.delete(key);
                        else set.add(key);
                        onValuesChange?.([...set]);
                      } else {
                        onValueChange?.(option.value);
                        setOpen(false);
                      }
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );

  return (
    <ErpFloatingField
      id={id}
      label={label}
      required={required}
      error={error}
      hint={hint}
      disabled={disabled}
      readOnly={readOnly}
      filled={filled}
      className={cn("erp-float-field--select", className)}
    >
      {trigger}
    </ErpFloatingField>
  );
}
