import { FORMULA_DOCUMENT_VERSION } from "../contracts/formulaContracts.js";

/** Formula Document — authoring SSOT; mutations only via formulaCoreSetup (Program 3.2) */

export function createFormulaDocument(partial = {}) {
  return Object.freeze({
    schemaVersion: FORMULA_DOCUMENT_VERSION,
    id: partial.id ?? `formula-${Date.now()}`,
    computationDocumentId: partial.computationDocumentId ?? partial.id ?? `comp-${Date.now()}`,
    ownerFieldId: partial.ownerFieldId ?? partial.fieldNodeId ?? "unknown",
    fieldNodeId: partial.fieldNodeId ?? null,
    moduleId: partial.moduleId ?? "default",
    entityId: partial.entityId ?? "default",
    fieldKind: partial.fieldKind ?? "computed",
    expressionSource: partial.expressionSource ?? "",
    tokens: Object.freeze([...(partial.tokens ?? [])]),
    evaluationPolicy: partial.evaluationPolicy ?? "lazy",
    sampleVariables: Object.freeze(partial.sampleVariables ?? {}),
    metadata: Object.freeze({
      extensionPoints: partial.extensionPoints ?? {},
      ...(partial.metadata ?? {}),
    }),
    revision: partial.revision ?? 1,
  });
}

export function validateFormulaDocument(doc) {
  const errors = [];
  if (!doc?.schemaVersion) errors.push("schemaVersion is required.");
  if (doc?.schemaVersion && doc.schemaVersion !== FORMULA_DOCUMENT_VERSION) {
    errors.push(`Invalid schemaVersion: ${doc.schemaVersion}`);
  }
  if (!doc?.id) errors.push("id is required.");
  return { valid: errors.length === 0, ok: errors.length === 0, errors };
}

export default createFormulaDocument;
