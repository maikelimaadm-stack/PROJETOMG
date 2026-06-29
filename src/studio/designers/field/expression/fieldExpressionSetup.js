/**
 * Field Studio — Expression Engine consumer setup (Program 2.3.2)
 * First designer consumer; no local parser/AST/evaluator.
 */
import { createExpressionEngine } from "@/studio/expression/index.js";
import { collectActiveFields } from "../fieldPropertyFields.js";
import { mapFieldTypeForExpression } from "../typeSystem/fieldTypeSetup.js";

let fieldExpressionEngine = null;

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
    ctx.setVariable(
      field.fieldName,
      null,
      mapFieldTypeForExpression(field.fieldType, field.businessTypeId)
    );
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
