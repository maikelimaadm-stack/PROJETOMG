export const ENTIDADES_RELACIONAIS = [];

export const CAMPOS_FIXOS_EMPRESA = [
  { value: "codempresa", label: "Código", tipo: "number", mock: 1 }
];

export const OPERACOES_CALCULO = [
  { value: "+", label: "+ Somar" },
  { value: "-", label: "- Subtrair" },
  { value: "*", label: "× Multiplicar" },
  { value: "/", label: "÷ Dividir" }
];

export const montarFormulaVisual = (items = []) => items.filter((item) => item.field).map((item, index) => `${index > 0 ? `${item.operator || "+"} ` : ""}${item.field}`).join(" ");

export const montarFormulaAmigavel = (items = [], fields = []) => items.filter((item) => item.field).map((item, index) => {
  const label = fields.find((field) => field.value === item.field)?.label || item.field;
  return `${index > 0 ? `${item.operator || "+"} ` : ""}${label.toUpperCase()}`;
}).join(" ");

export const calcularPreviewVisual = (items = [], fields = []) => {
  const valores = Object.fromEntries(fields.map((field) => [field.value, Number(field.mock ?? 10)]));
  const selecionados = items.filter((item) => item.field);
  if (selecionados.length !== items.length || selecionados.length < 2) return null;
  return selecionados.reduce((acc, item, index) => {
    const value = valores[item.field] ?? 10;
    if (index === 0) return value;
    if (item.operator === "-") return acc - value;
    if (item.operator === "*") return acc * value;
    if (item.operator === "/") return value === 0 ? 0 : acc / value;
    return acc + value;
  }, 0);
};

export const montarCamposDisponiveis = (campos = [], editingId = null) => {
  const custom = campos.filter((campo) => campo.id !== editingId && ["number", "calculado"].includes(campo.tipo)).map((campo) => ({ value: campo.field_name, label: campo.label, tipo: campo.tipo, mock: 10 }));
  return [...CAMPOS_FIXOS_EMPRESA, ...custom];
};