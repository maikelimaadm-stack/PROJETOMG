const UF_NAMES = new Set(["uf", "estado", "sigla_uf", "uf_emissor"]);
const SHORT_NAMES = new Set(["rg", "orgao", "orgao_expedidor", "ddd", "numero", "nr", "nro"]);
const DATE_TYPES = new Set(["date", "datetime", "datetime-local"]);
const LOOKUP_TYPES = new Set(["select", "autocomplete", "relation"]);

/**
 * Largura do campo no layout SGG (label à esquerda, controle proporcional ao conteúdo).
 * @returns {"xs"|"sm"|"sm-date"|"md"|"lg"|"xl"|"lookup"|"full"|"toggle"}
 */
export function resolveFieldWidthToken(field) {
  if (!field) return "md";
  if (field.width) return field.width;

  const type = String(field.type || "text").toLowerCase();
  const name = String(field.name || field.field_name || field.dataField || "").toLowerCase();

  if (type === "textarea" || type === "option_list") return field.wide ? "full" : "xl";
  if (field.wide) return "lg";
  if (type === "checkbox" || type === "switch") return "toggle";
  if (type === "image" || type === "file" || type === "imagem") return "xs";
  if (LOOKUP_TYPES.has(type)) return "lookup";
  if (DATE_TYPES.has(type) || name.includes("data")) return "sm-date";
  if (UF_NAMES.has(name) || name === "uf" || name.endsWith("_uf")) return "xs";
  if (name.includes("cep") || name.includes("cpf") || name.includes("cnpj")) return "md";
  if (SHORT_NAMES.has(name) || field.compact) return "sm";
  if (field.medium) return "md";
  if (type === "number" || type === "decimal" || type === "moeda" || type === "percentual") return "sm";

  return "lg";
}

function isImageField(type) {
  return type === "image" || type === "file" || type === "imagem";
}

export function shouldFieldSpanFullRow(field) {
  const token = resolveFieldWidthToken(field);
  return token === "full" || isImageField(String(field?.type || ""));
}
