/**
 * Field Studio — Expression Engine consumer setup (Program 2.3.2)
 * First designer consumer; no local parser/AST/evaluator.
 */
import { createExpressionEngine } from "@/studio/expression/index.js";
import { collectActiveFields } from "../fieldPropertyFields.js";

let fieldExpressionEngine = null;

const FIELD_TYPE_MAP = Object.freeze({
  string: "string",
  number: "number",
  boolean: "boolean",
  date: "string",
  datetime: "string",
  text: "string",
  select: "string",
  reference: "unknown",
  decimal: "number",
});

export function getFieldExpressionEngine() {
  if (!fieldExpressionEngine) {
    fieldExpressionEngine = createExpressionEngine();
  }
  return fieldExpressionEngine;
}

export function buildFieldExpressionContext(fieldDocument) {
  const engine = getFieldExpressionEngine();
  const ctx = engine.createContext({});
  collectActiveFields(fieldDocument).forEach((field) => {
    ctx.setVariable(field.fieldName, null, FIELD_TYPE_MAP[field.fieldType] ?? "unknown");
  });
  return ctx;
}

/** Validate expression source against field document variables (structural foundation). */
export function validateFieldExpressionSource(source, fieldDocument) {
  const engine = getFieldExpressionEngine();
  const context = buildFieldExpressionContext(fieldDocument);
  const ast = engine.parse(source, { designerId: "field", metadata: { consumer: "field-studio" } });
  const validation = engine.validate(ast, context);
  return Object.freeze({ ast, ...validation });
}

export default getFieldExpressionEngine;
