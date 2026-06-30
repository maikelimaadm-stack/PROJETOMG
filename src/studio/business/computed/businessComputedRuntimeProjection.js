export function createBusinessComputedRuntimeProjection(computedField, pipeline = {}) {
  return Object.freeze({
    schemaVersion: "mak-business-computed-runtime-projection-v1",
    computedFieldId: computedField.id,
    ownerFieldId: computedField.ownerFieldId,
    projectionKind: "derived_computed_value",
    runtimeReceives: "derived_projection_only",
    formulaDocumentId: pipeline.formulaDocumentId ?? null,
    computationDocumentId: pipeline.computationDocumentId ?? null,
    expressionAstPresent: pipeline.expressionAst != null,
    evaluationPolicy: computedField.evaluationPolicy ?? "lazy",
    samplePreview: pipeline.preview ?? null,
    studioBypassForbidden: true,
    directRuntimeMutationForbidden: true,
  });
}

export default createBusinessComputedRuntimeProjection;
