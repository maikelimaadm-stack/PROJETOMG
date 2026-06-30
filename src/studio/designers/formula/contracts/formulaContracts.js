/** Formula Builder — official contracts (Program 3.2) */

export const FORMULA_DOCUMENT_VERSION = "mak-formula-document-v1";

export const FORMULA_BUILDER_VERSION = "mak-formula-builder-v1";

export const FORMULA_TOKEN_KINDS = Object.freeze(["field", "function", "operator", "constant", "paren"]);

export const FORMULA_OPERATORS = Object.freeze(["+", "-", "*", "/", "(", ")", "??"]);

/** Extension-point registry keys — architecture only (Program 3.2) */
export const FORMULA_EXTENSION_POINTS = Object.freeze([
  "formulaAssist",
  "visualFormulaBuilder",
  "aiFormulaSuggestions",
  "naturalLanguageFormula",
  "marketplaceFunctions",
  "customFunctions",
  "formulaTemplates",
]);

export default FORMULA_DOCUMENT_VERSION;
