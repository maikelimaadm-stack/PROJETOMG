export function createBusinessComputedPreview(computedField, pipelinePreview) {
  return Object.freeze({
    schemaVersion: "mak-business-computed-preview-v1",
    computedFieldId: computedField.id,
    ownerFieldId: computedField.ownerFieldId,
    businessRuleSummary: computedField.businessRuleSummary,
    sampleVariables: computedField.sampleVariables ?? {},
    projectedValue: pipelinePreview?.value ?? null,
    projectedType: pipelinePreview?.type ?? null,
    evaluationPolicy: computedField.evaluationPolicy ?? "lazy",
    derivedFrom: "business_computed_field",
    runtimeReceives: "derived_projection_only",
  });
}

export default createBusinessComputedPreview;
