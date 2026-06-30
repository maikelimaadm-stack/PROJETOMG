/** Formula Document projection FROM Business Computed Field — not from raw computation ref */

export const FORMULA_DOCUMENT_VERSION = "mak-formula-document-v1";

export function createFormulaProjectionFromComputedField(computedField, derivationMetadata) {
  return Object.freeze({
    schemaVersion: FORMULA_DOCUMENT_VERSION,
    id: `formula-${computedField.intentId}-${computedField.ownerFieldId}`,
    computationDocumentId: `comp-${computedField.intentId}-${computedField.ownerFieldId}`,
    ownerFieldId: computedField.ownerFieldId,
    fieldNodeId: computedField.ownerFieldId,
    moduleId: computedField.moduleId ?? "default",
    entityId: computedField.entityId ?? "default",
    fieldKind: computedField.fieldKind ?? "computed",
    expressionSource: computedField.expressionSource ?? "",
    tokens: Object.freeze([]),
    evaluationPolicy: computedField.evaluationPolicy ?? "lazy",
    sampleVariables: Object.freeze({ ...(computedField.sampleVariables ?? {}) }),
    metadata: Object.freeze({
      derivedFromIntent: true,
      derivedFromBusinessComputedField: true,
      businessComputedFieldId: computedField.id,
      intentId: computedField.intentId,
      intentRevision: computedField.intentRevision,
      derivationId: derivationMetadata?.derivationId,
      derivation: derivationMetadata ?? {},
      projectionOnly: true,
      runtimeReceives: "derived_projection_only",
    }),
    revision: computedField.revision ?? 1,
  });
}

export default createFormulaProjectionFromComputedField;
