import { z } from "zod";

const OPERATORS = { "+": 1, "-": 1, "*": 2, "/": 2 };
const isCustom = (campo) => campo?.customField || campo?.origem === "customizado" || String(campo?.id || "").startsWith("custom:");
const getCustomKey = (campo) => campo?.customField || campo?.field_name || String(campo?.id || "").replace("custom:", "");
const getSourceKey = (campo) => campo?.tipo === "relation" ? campo?.relation_entity || "" : campo?.options_source_entity || campo?.options_source || "";
const getLabelField = (campo) => campo?.options_label_field || campo?.relation_display_field || "nome";
const getValueField = (campo) => campo?.options_value_field || "id";

const getRawValue = (registro, campo) => {
  if (!registro || !campo) return "";
  if (campo.tipo === "calculado") return calcularFormula(registro, campo);
  if (isCustom(campo)) return registro.campos_personalizados?.[getCustomKey(campo)] ?? "";
  return registro[campo.field_name || campo.id] ?? "";
};

const getFormulaScope = (registro) => ({ ...(registro || {}), ...(registro?.campos_personalizados || {}) });
const tokenizeFormula = (formula) => String(formula || "").match(/[a-zA-Z_][a-zA-Z0-9_]*|\d+(?:[.,]\d+)?|[()+\-*/]/g) || [];
const buildFormulaFromBuilder = (campo) => (campo?.calculation_builder?.items || []).filter((item) => item.field).map((item, index) => `${index > 0 ? `${item.operator || "+"} ` : ""}${item.field}`).join(" ");

const calcularFormula = (registro, campo) => {
  const tokens = tokenizeFormula(campo?.formula || buildFormulaFromBuilder(campo));
  const scope = getFormulaScope(registro);
  const output = [];
  const stack = [];

  tokens.forEach((token) => {
    if (/^\d/.test(token)) return output.push(Number(token.replace(",", ".")));
    if (/^[a-zA-Z_]/.test(token)) return output.push(Number(scope[token] ?? 0));
    if (token === "(") return stack.push(token);
    if (token === ")") { while (stack.length && stack[stack.length - 1] !== "(") output.push(stack.pop()); stack.pop(); return; }
    if (OPERATORS[token]) { while (stack.length && OPERATORS[stack[stack.length - 1]] >= OPERATORS[token]) output.push(stack.pop()); stack.push(token); }
  });

  while (stack.length) output.push(stack.pop());
  const values = [];
  output.forEach((token) => {
    if (typeof token === "number") return values.push(token);
    const b = values.pop() ?? 0;
    const a = values.pop() ?? 0;
    if (token === "+") values.push(a + b);
    if (token === "-") values.push(a - b);
    if (token === "*") values.push(a * b);
    if (token === "/") values.push(b === 0 ? 0 : a / b);
  });
  return Number.isFinite(values[0]) ? values[0] : 0;
};

const formatDate = (value) => {
  if (!value) return "-";
  const [ano, mes, dia] = String(value).split("T")[0].split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : "-";
};

const resolveOptionLabel = (value, campo, relatedOptions = {}) => {
  const sourceKey = getSourceKey(campo);
  const options = sourceKey ? relatedOptions[sourceKey] || [] : campo?.options || [];
  const option = options.find((item) => String(item.value ?? item[getValueField(campo)] ?? item.id) === String(value));
  return option?.label ?? option?.[getLabelField(campo)] ?? option?.nome ?? value;
};

const formatValue = (value, campo, relatedOptions = {}) => {
  if (value === undefined || value === null || value === "") return "-";
  if (campo?.tipo === "select" || campo?.tipo === "relation" || getSourceKey(campo)) return resolveOptionLabel(value, campo, relatedOptions);
  if (campo?.tipo === "date") return formatDate(value);
  if (campo?.tipo === "option_list") return Array.isArray(value) ? value.join(", ") : value;
  if (campo?.tipo === "number" && campo?.usar_mascara) return value;
  if (campo?.tipo === "calculado" || campo?.tipo === "number") {
    const places = Math.min(6, Math.max(0, Number(campo?.decimal_places ?? 2)));
    return Number(value).toLocaleString("pt-BR", campo?.usar_decimal ? { minimumFractionDigits: places, maximumFractionDigits: places } : { maximumFractionDigits: 2 });
  }
  return value;
};

const campoEngine = {
  normalize(campo) {
    return {
      ...campo,
      id: campo.id || (campo.origem === "customizado" ? `custom:${campo.field_name}` : campo.field_id),
      visivel_form: campo.visivel_form ?? campo.metadata?.visivel_formulario ?? true,
      visivel_tabela: campo.visivel_tabela ?? campo.metadata?.visivel_tabela ?? false,
      visivel_relatorio: campo.visivel_relatorio ?? campo.metadata?.visivel_relatorio ?? false,
      filtravel: campo.filtravel ?? true,
      largura_coluna: campo.largura_coluna || campo.metadata?.largura_coluna || 160,
      ordem_tabela: campo.ordem_tabela ?? campo.metadata?.ordem_tabela ?? campo.ordem ?? 999,
      agregacao_tipo: campo.agregacao_tipo || campo.agregacao || "",
      usar_decimal: !!campo.usar_decimal,
      decimal_places: campo.decimal_places ?? 2,
      usar_mascara: !!campo.usar_mascara,
      mascaras_text: campo.mascaras_text || "",
      calculation_builder: campo.calculation_builder || { items: [] }
    };
  },
  getValorCampo(registro, campo, relatedOptions = {}) { return formatValue(getRawValue(registro, campo), campo, relatedOptions); },
  getValorBruto(registro, campo) { return getRawValue(registro, campo); },
  getOptionsSourceKey: getSourceKey,
  getOptionsCampo(campo, relatedOptions = {}) {
    const sourceKey = getSourceKey(campo);
    if (campo?.tipo === "relation" && sourceKey) return relatedOptions[sourceKey] || [];
    return (campo.options || []).map((option) => ({ value: option.value || option.label, label: option.label || option.value })).sort((a, b) => String(a.label || "").localeCompare(String(b.label || ""), "pt-BR", { sensitivity: "base" }));
  },
  calcularCampo(registro, campo) { return calcularFormula(registro, campo); },
  aplicarCamposCalculados(registro, campos = []) {
    const personalizados = { ...(registro.campos_personalizados || {}) };
    campos.filter((campo) => campo.tipo === "calculado").forEach((campo) => { personalizados[campo.field_name] = calcularFormula({ ...registro, campos_personalizados: personalizados }, campo); });
    return { ...registro, campos_personalizados: personalizados };
  },
  buildValidationSchema(campos) {
    const shape = {};
    campos.filter((campo) => campo.obrigatorio && campo.tipo !== "calculado").forEach((campo) => { shape[campo.field_name] = campo.tipo === "option_list" ? z.array(z.string()).min(1) : z.union([z.string().min(1), z.number(), z.boolean()]); });
    return z.object(shape);
  },
  calcularAgregacoes(registros, colunas) {
    const result = {};
    colunas.filter((campo) => campo.agregacao_tipo || campo.agregacao).forEach((campo) => {
      const tipo = campo.agregacao_tipo || campo.agregacao;
      if (campo.tipo === "number" && campo.usar_mascara) return;
      const valores = registros.map((registro) => Number(getRawValue(registro, campo))).filter((value) => !Number.isNaN(value));
      if (!valores.length) return;
      if (tipo === "sum") result[campo.id] = valores.reduce((acc, value) => acc + value, 0);
      if (tipo === "avg") result[campo.id] = valores.reduce((acc, value) => acc + value, 0) / valores.length;
      if (tipo === "min") result[campo.id] = Math.min(...valores);
      if (tipo === "max") result[campo.id] = Math.max(...valores);
    });
    return result;
  }
};

export default campoEngine;