/**
 * Formula Suggestions — catalog + field heuristics (Program 3.2)
 * Architecture hooks for AI / NL / Marketplace — no execution here.
 */
import { listFormulaFunctions, listFormulaFields } from "./formulaCoreSetup.js";
import { FORMULA_EXTENSION_POINTS } from "../contracts/formulaContracts.js";

export function buildFormulaSuggestions(formulaDocument, fieldDocument, pipelineResult) {
  const suggestions = [];
  const source = formulaDocument?.expressionSource ?? "";
  const fields = listFormulaFields(fieldDocument);
  const functions = listFormulaFunctions();

  if (!source.trim()) {
    fields.slice(0, 5).forEach((f) => {
      suggestions.push({
        id: `field-${f.fieldName}`,
        kind: "field",
        label: f.label ?? f.fieldName,
        detail: `Inserir campo ${f.fieldName}`,
        token: { kind: "field", name: f.fieldName, label: f.label },
        origin: "catalog",
      });
    });
    functions.slice(0, 4).forEach((fn) => {
      suggestions.push({
        id: `fn-${fn.name}`,
        kind: "function",
        label: fn.name,
        detail: fn.documentation,
        token: { kind: "function", name: fn.name },
        origin: "function-catalog",
      });
    });
  }

  if (source.includes("??") || source.includes("coalesce")) {
    suggestions.push({
      id: "suggest-coalesce",
      kind: "pattern",
      label: "coalesce(a, b)",
      detail: "Tratar valores nulos com fallback",
      origin: "formulaAssist",
      extensionPoint: "formulaAssist",
    });
  }

  (pipelineResult?.validation?.warnings ?? []).forEach((w, i) => {
    suggestions.push({
      id: `warn-${i}`,
      kind: "diagnostic",
      label: w.message ?? w.code,
      detail: w.code,
      origin: "validation",
    });
  });

  return Object.freeze({
    suggestions: Object.freeze(suggestions),
    extensionPoints: Object.freeze(
      FORMULA_EXTENSION_POINTS.reduce((acc, key) => {
        acc[key] = Object.freeze({ enabled: false, ready: true });
        return acc;
      }, {})
    ),
  });
}

export default buildFormulaSuggestions;
