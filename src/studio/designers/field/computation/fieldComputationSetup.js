/**
 * Field Studio — Computation Engine consumer (Program 3.2)
 */
import { createComputationEngine } from "../../../computation/index.js";
import { createFormulaDocumentFromField } from "../../formula/core/formulaCoreSetup.js";

let fieldComputationEngine = null;

export function getFieldComputationEngine() {
  if (!fieldComputationEngine) {
    fieldComputationEngine = createComputationEngine({ domainId: "field-studio" });
  }
  return fieldComputationEngine;
}

export function openFieldFormulaBuilderUrl(moduleId, fieldNodeId) {
  const params = fieldNodeId ? `?fieldNodeId=${encodeURIComponent(fieldNodeId)}` : "";
  return `/studio/${moduleId}/formula${params}`;
}

export function buildFieldFormulaPreview(field, fieldDocument) {
  return createFormulaDocumentFromField(field, fieldDocument);
}

export default getFieldComputationEngine;
