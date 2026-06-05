import React from "react";
import { Button } from "@/shared/ui/button";
import { Plus, X } from "lucide-react";
import EmpAutocomplete from "@/framework/cadastro/formularios/EmpAutocomplete";
import { OPERACOES_CALCULO, montarFormulaAmigavel, calcularPreviewVisual } from "./empFieldConfigOptions";

const EMPTY_ITEM = { field: "", operator: "*" };
const fieldRow = "grid grid-cols-[190px_minmax(0,1fr)] items-center gap-1";
const fieldLabel = "text-[12px] text-[#1a1f26] text-right leading-none";
const fieldBox =
  "h-6 border-[0.5px] border-[#c5ced8] rounded-[2px] bg-white focus-within:border-[#2899f5] transition-colors overflow-visible";
const inputCls =
  "border-0 shadow-none focus-visible:ring-0 bg-transparent h-[22px] text-xs uppercase";

const operadorItems = OPERACOES_CALCULO.map((op) => ({ id: op.value, nome: op.label }));

export default function EmpCalculationBuilder({ value = [], fields = [], onChange }) {
  const items = value.length ? value : [{ ...EMPTY_ITEM }, { ...EMPTY_ITEM }];
  const selectedFields = items.map((item) => item.field).filter(Boolean);
  const hasEmptyFields = items.some((item) => !item.field);
  const hasDuplicateFields = new Set(selectedFields).size !== selectedFields.length;
  const previewValue = calcularPreviewVisual(items, fields);
  const formulaPreview = montarFormulaAmigavel(items, fields);

  const fieldItems = fields.map((field) => ({
    id: field.value,
    nome: String(field.label || "").toUpperCase(),
    disabled: selectedFields.includes(field.value),
  }));

  const updateItem = (index, patch) =>
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  const removeItem = (index) => onChange(items.filter((_, itemIndex) => itemIndex !== index));

  return (
    <>
      {items.map((item, index) => (
        <div key={index} className={fieldRow}>
          <label className={fieldLabel}>{index === 0 ? "Campo do cálculo" : `Operação ${index}`}:</label>
          <div className="flex items-center gap-1">
            {index > 0 ? (
              <div className={`${fieldBox} w-[90px]`}>
                <EmpAutocomplete
                  variant="select"
                  items={operadorItems}
                  value={item.operator || "+"}
                  onChange={(operator) => updateItem(index, { operator })}
                  placeholder="SELECIONE"
                  displayField="nome"
                  searchFields={["nome"]}
                  className="h-full w-full"
                  inputClassName={inputCls}
                  uppercaseDisplay={false}
                />
              </div>
            ) : null}
            <div className={`${fieldBox} flex-1 min-w-0`}>
              <EmpAutocomplete
                variant="select"
                items={fieldItems.filter(
                  (fieldItem) =>
                    !fieldItem.disabled || fieldItem.id === item.field
                )}
                value={item.field || ""}
                onChange={(field) => updateItem(index, { field })}
                placeholder="SELECIONE O CAMPO"
                displayField="nome"
                searchFields={["nome"]}
                className="h-full w-full"
                inputClassName={inputCls}
                uppercaseDisplay={false}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-red-600"
              disabled={items.length <= 2}
              onClick={() => removeItem(index)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
      <div className={fieldRow}>
        <div />
        <Button
          type="button"
          size="icon"
          className="inline-flex h-7 w-8 items-center justify-center rounded-none border-y-0 border-l-0 border-r-[0.5px] border-green-400 bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-none hover:bg-green-600"
          onClick={() => onChange([...items, { ...EMPTY_ITEM, operator: "+" }])}
          title="Adicionar campo"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className={fieldRow}>
        <label className={fieldLabel}>Prévia do cálculo:</label>
        <div className="min-h-6 border border-slate-300 bg-slate-50 px-2 py-1 text-xs text-slate-700">
          {formulaPreview || "selecione os campos"}
          {previewValue !== null
            ? ` = ${Number(previewValue).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`
            : ""}
          {hasEmptyFields ? (
            <div className="text-[11px] text-amber-700">Preencha todos os campos do cálculo.</div>
          ) : null}
          {hasDuplicateFields ? (
            <div className="text-[11px] text-red-600">Use cada campo apenas uma vez.</div>
          ) : null}
        </div>
      </div>
    </>
  );
}
