/**
 * Formula Builder — Computation Engine consumer (Program 3.2)
 * Sole mutation path for Formula Documents.
 */
import { createComputationEngine } from "../../../computation/index.js";
import { createFormulaDocument } from "../document/formulaDocument.js";
import { insertFormulaToken, createFormulaToken } from "./formulaTokenBuilder.js";
import { syncFormulaPipeline } from "./formulaPipeline.js";

let formulaComputationEngine = null;

export function getFormulaComputationEngine() {
  if (!formulaComputationEngine) {
    formulaComputationEngine = createComputationEngine({ domainId: "formula-builder" });
  }
  return formulaComputationEngine;
}

/** Only official mutation API — UI must not alter Formula Document directly. */
export function applyFormulaDocumentEdit(formulaDocument, edit) {
  if (!formulaDocument || !edit?.type) {
    throw new Error("applyFormulaDocumentEdit requires formulaDocument and edit.type");
  }

  let nextPartial = { ...formulaDocument, revision: (formulaDocument.revision ?? 0) + 1 };

  switch (edit.type) {
    case "insertToken": {
      const token = edit.token ?? createFormulaToken("constant", { value: 0 });
      nextPartial.expressionSource = insertFormulaToken(formulaDocument.expressionSource, token);
      nextPartial.tokens = [...(formulaDocument.tokens ?? []), token];
      break;
    }
    case "clear":
      nextPartial.expressionSource = "";
      nextPartial.tokens = [];
      break;
    case "setSampleVariable":
      nextPartial.sampleVariables = {
        ...(formulaDocument.sampleVariables ?? {}),
        [edit.name]: edit.value,
      };
      break;
    default:
      throw new Error(`Unknown formula edit type: ${edit.type}`);
  }

  const nextDoc = createFormulaDocument(nextPartial);
  return syncFormulaPipeline(nextDoc, { sampleVariables: nextDoc.sampleVariables });
}

export function createFormulaDocumentFromField(field, fieldDocument) {
  const doc = createFormulaDocument({
    id: `formula-${field.fieldNodeId}`,
    computationDocumentId: `comp-${field.fieldNodeId}`,
    ownerFieldId: field.fieldName ?? field.fieldNodeId,
    fieldNodeId: field.fieldNodeId,
    moduleId: fieldDocument.moduleId,
    entityId: fieldDocument.entityId ?? "default",
    fieldKind: field.source === "derived" ? "derived" : "computed",
    expressionSource: field.expressionSource ?? field.presentation?.expressionDraft ?? "",
    sampleVariables: buildSampleVariables(fieldDocument),
  });
  return syncFormulaPipeline(doc);
}

function buildSampleVariables(fieldDocument) {
  const vars = {};
  (fieldDocument?.groups ?? []).forEach((g) => {
    (g.fields ?? []).forEach((f) => {
      if (!f.fieldName || f._pendingDelete) return;
      if (f.fieldType === "number" || f.fieldType === "decimal") vars[f.fieldName] = 100;
      else if (f.fieldType === "boolean") vars[f.fieldName] = false;
      else vars[f.fieldName] = null;
    });
  });
  return vars;
}

export function listFormulaFunctions() {
  return getFormulaComputationEngine().expressionEngine.functionCatalog.list();
}

export function listFormulaFields(fieldDocument) {
  const fields = [];
  (fieldDocument?.groups ?? []).forEach((g) => {
    (g.fields ?? []).forEach((f) => {
      if (f._pendingDelete || !f.fieldName) return;
      fields.push({
        fieldNodeId: f.fieldNodeId,
        fieldName: f.fieldName,
        label: f.label,
        fieldType: f.fieldType,
      });
    });
  });
  return fields;
}

export default getFormulaComputationEngine;
