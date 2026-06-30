/** Formula Document projection — Resolver output (mak-formula-document-v1) without designer imports */

export const FORMULA_DOCUMENT_VERSION = "mak-formula-document-v1";

export function createFormulaDocumentProjection(partial = {}) {
  return Object.freeze({
    schemaVersion: FORMULA_DOCUMENT_VERSION,
    id: partial.id ?? `formula-${partial.ownerFieldId ?? "unknown"}`,
    computationDocumentId: partial.computationDocumentId ?? partial.id ?? `comp-${partial.ownerFieldId ?? "unknown"}`,
    ownerFieldId: partial.ownerFieldId ?? "unknown",
    fieldNodeId: partial.fieldNodeId ?? partial.ownerFieldId ?? null,
    moduleId: partial.moduleId ?? "default",
    entityId: partial.entityId ?? "default",
    fieldKind: partial.fieldKind ?? "computed",
    expressionSource: partial.expressionSource ?? "",
    tokens: Object.freeze([...(partial.tokens ?? [])]),
    evaluationPolicy: partial.evaluationPolicy ?? "lazy",
    sampleVariables: Object.freeze({ ...(partial.sampleVariables ?? {}) }),
    metadata: Object.freeze({
      derivedFromIntent: true,
      ...(partial.metadata ?? {}),
      derivation: partial.derivationMetadata ?? {},
    }),
    revision: partial.revision ?? 1,
  });
}

export function projectFormulaFromComputation(computationRef, intentDocument, derivationMetadata) {
  const subject = intentDocument.subject ?? {};
  return createFormulaDocumentProjection({
    id: `formula-${intentDocument.id}-${computationRef.ownerFieldId}`,
    computationDocumentId: `comp-${intentDocument.id}-${computationRef.computationId ?? computationRef.ownerFieldId}`,
    ownerFieldId: computationRef.ownerFieldId ?? subject.fieldId,
    fieldNodeId: computationRef.ownerFieldId ?? subject.fieldId,
    moduleId: subject.moduleId ?? computationRef.moduleId ?? "default",
    entityId: subject.entityId ?? computationRef.entityId ?? "default",
    fieldKind: computationRef.fieldKind ?? "computed",
    expressionSource: computationRef.expressionSource ?? "",
    sampleVariables: computationRef.sampleVariables ?? {},
    derivationMetadata,
    metadata: {
      intentId: intentDocument.id,
      intentRevision: intentDocument.revision,
      derivationId: derivationMetadata.derivationId,
    },
  });
}

export default createFormulaDocumentProjection;
