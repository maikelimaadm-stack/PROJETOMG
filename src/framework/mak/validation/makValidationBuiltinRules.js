/**
 * Regras builtin da Validation Configuration Engine — metadata-driven.
 */

const digitsOnly = (value) => String(value ?? "").replace(/\D/g, "");

export const MAK_VALIDATION_RULE_TYPES = Object.freeze([
  "required",
  "min",
  "max",
  "minLength",
  "maxLength",
  "precision",
  "scale",
  "regex",
  "email",
  "url",
  "cep",
  "cpf",
  "cnpj",
  "cpf_cnpj",
  "tel",
  "mask",
  "when",
  "dependsOn",
  "blocking",
  "severity",
]);

const isEmpty = (value) => {
  if (value == null) return true;
  if (typeof value === "boolean") return false;
  if (typeof value === "number") return Number.isNaN(value);
  if (Array.isArray(value)) return value.length === 0;
  return String(value).trim() === "";
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
const isValidUrl = (value) => {
  try {
    const parsed = new URL(String(value).trim());
    return Boolean(parsed.protocol && parsed.host);
  } catch {
    return false;
  }
};
const isValidCep = (value) => /^\d{5}-?\d{3}$/.test(String(value).trim());
const isValidCpf = (value) => digitsOnly(value).length === 11;
const isValidCnpj = (value) => digitsOnly(value).length === 14;
const isValidTel = (value) => digitsOnly(value).length >= 10;

const resolveMaskPattern = (mask) => String(mask || "").replace(/#/g, "\\d");

export function evaluateMakValidationRule(rule, value, formData = {}) {
  if (!rule || typeof rule !== "object") return null;

  const type = String(rule.type || rule.kind || "").toLowerCase();
  if (!type) return null;

  if (type === "when" && rule.condition) {
    const shouldApply = typeof rule.condition === "function"
      ? rule.condition(formData)
      : Boolean(rule.when ?? rule.if);
    if (!shouldApply) return null;
    const nested = rule.rules || rule.then || [];
    for (const nestedRule of nested) {
      const nestedError = evaluateMakValidationRule(nestedRule, value, formData);
      if (nestedError) return nestedError;
    }
    return null;
  }

  if (type === "required") {
    return isEmpty(value) ? rule.message || "Campo obrigatório." : null;
  }

  if (isEmpty(value)) return null;

  switch (type) {
    case "min":
      return Number(value) < Number(rule.value ?? rule.min)
        ? rule.message || `Valor mínimo: ${rule.value ?? rule.min}.`
        : null;
    case "max":
      return Number(value) > Number(rule.value ?? rule.max)
        ? rule.message || `Valor máximo: ${rule.value ?? rule.max}.`
        : null;
    case "minlength":
      return String(value).length < Number(rule.value ?? rule.minLength)
        ? rule.message || `Mínimo de ${rule.value ?? rule.minLength} caracteres.`
        : null;
    case "maxlength":
      return String(value).length > Number(rule.value ?? rule.maxLength)
        ? rule.message || `Máximo de ${rule.value ?? rule.maxLength} caracteres.`
        : null;
    case "precision": {
      const parts = String(value).replace(",", ".").split(".");
      const decimals = parts[1]?.length ?? 0;
      return decimals > Number(rule.value ?? rule.precision)
        ? rule.message || `Precisão máxima: ${rule.value ?? rule.precision}.`
        : null;
    }
    case "scale": {
      const numeric = Number(String(value).replace(",", "."));
      const scale = Number(rule.value ?? rule.scale);
      const factor = 10 ** scale;
      return Math.round(numeric * factor) / factor !== numeric
        ? rule.message || `Escala inválida (máx. ${scale} casas).`
        : null;
    }
    case "regex": {
      const pattern = rule.value ?? rule.pattern ?? rule.regex;
      if (!pattern) return null;
      const re = pattern instanceof RegExp ? pattern : new RegExp(String(pattern));
      return re.test(String(value)) ? null : rule.message || "Formato inválido.";
    }
    case "email":
      return isValidEmail(value) ? null : rule.message || "E-mail inválido.";
    case "url":
      return isValidUrl(value) ? null : rule.message || "URL inválida.";
    case "cep":
      return isValidCep(value) ? null : rule.message || "CEP inválido.";
    case "cpf":
      return isValidCpf(value) ? null : rule.message || "CPF inválido.";
    case "cnpj":
      return isValidCnpj(value) ? null : rule.message || "CNPJ inválido.";
    case "cpf_cnpj": {
      const len = digitsOnly(value).length;
      return len === 11 || len === 14 ? null : rule.message || "CPF/CNPJ inválido.";
    }
    case "tel":
      return isValidTel(value) ? null : rule.message || "Telefone inválido.";
    case "mask": {
      const mask = rule.value ?? rule.mask;
      if (!mask) return null;
      const re = new RegExp(`^${resolveMaskPattern(mask)}$`);
      return re.test(String(value)) ? null : rule.message || "Formato inválido.";
    }
    default:
      return null;
  }
}

export function normalizeMakValidationRules(source = {}) {
  if (Array.isArray(source)) return source;
  if (Array.isArray(source.rules)) return source.rules;

  const rules = [];
  if (source.required === true) {
    rules.push({ type: "required", message: source.messages?.required });
  }
  for (const type of ["email", "url", "cep", "cpf", "cnpj", "cpf_cnpj", "tel"]) {
    if (source[type] === true) {
      rules.push({ type, message: source.messages?.[type] });
    }
  }
  for (const key of ["min", "max", "minLength", "maxLength", "precision", "scale", "regex", "mask"]) {
    if (source[key] != null) {
      rules.push({ type: key, value: source[key], message: source.messages?.[key] });
    }
  }
  if (Array.isArray(source.when)) {
    rules.push({ type: "when", rules: source.when, condition: () => true });
  }
  return rules;
}

export function evaluateMakFieldValidation(fieldDef, value, formData = {}) {
  const fieldName = fieldDef?.errorKey || fieldDef?.name || fieldDef?.id;

  if (fieldDef?.dependsOn) {
    const depValue = formData?.[fieldDef.dependsOn];
    if (!depValue) return null;
  }

  const rules = normalizeMakValidationRules(fieldDef?.validation ?? fieldDef?.rules ?? {});
  if (fieldDef?.required === true && !rules.some((rule) => String(rule.type).toLowerCase() === "required")) {
    rules.unshift({ type: "required" });
  }

  for (const rule of rules) {
    const message = evaluateMakValidationRule(rule, value, formData);
    if (message) {
      return { field: fieldName, message, blocking: rule.blocking !== false, severity: rule.severity || "error" };
    }
  }
  return null;
}

export default {
  MAK_VALIDATION_RULE_TYPES,
  evaluateMakValidationRule,
  normalizeMakValidationRules,
  evaluateMakFieldValidation,
};
