import { BUSINESS_COMPUTED_EXPLAINABILITY_VERSION } from "../contracts/businessComputedContracts.js";

export function buildBusinessComputedExplainability(intentDocument, session, computedField, metadata) {
  const document = computedField.document ?? computedField;
  const dependencyMetadata = document.dependencyMetadata ?? metadata?.dependencyMetadata;

  return Object.freeze({
    schemaVersion: BUSINESS_COMPUTED_EXPLAINABILITY_VERSION,
    whyExists:
      metadata?.generationReason === "intent_resolution"
        ? "Business rule requires a reusable computed field asset."
        : "Business computed field derived from approved intent.",
    problemSolved: intentDocument.intentPhrase,
    expectedResult: (intentDocument.outcomes ?? []).map((o) => o.phrase ?? o).join(" · ") || intentDocument.intentPhrase,
    generatedBy: session.initiatedBy,
    generatedAt: session.completedAt ?? session.startedAt,
    intentId: intentDocument.id,
    intentRevision: intentDocument.revision,
    computedFieldId: computedField.id,
    businessRule: intentDocument.intentPhrase,
    businessSummary: computedField.businessRuleSummary ?? intentDocument.intentPhrase,
    reusedAssets: Object.freeze([]),
    capabilitiesParticipated: (intentDocument.capabilities ?? []).map((c) => c.capabilityId),
    rulesParticipated: [
      ...(intentDocument.rules ?? []).map((r) => r.phrase ?? r),
      ...(intentDocument.conditions ?? []).map((c) => c.phrase ?? c),
    ].filter(Boolean),
    operationalImpacts: Object.freeze([
      `Computed value for field ${computedField.ownerFieldId}`,
      ...(dependencyMetadata?.operandFieldIds ?? []).map((f) => `Depends on field ${f}`),
    ]),
    dependenciesAffected: Object.freeze([
      ...(dependencyMetadata?.operandFieldIds ?? []),
      ...(dependencyMetadata?.affectedEntities ?? []),
    ]),
    capabilities: (intentDocument.capabilities ?? []).map((c) => c.capabilityId),
    objectsParticipated: [
      intentDocument.subject?.businessObjectId,
      intentDocument.subject?.fieldId,
      computedField.ownerFieldId,
    ].filter(Boolean),
    versionsParticipated: Object.freeze({
      intentRevision: intentDocument.revision,
      computedFieldRevision: computedField.revision,
      resolverVersion: metadata?.resolverVersion,
      compatibilityVersion: computedField.compatibility?.compatibilityVersion,
    }),
    derivationPath: Object.freeze([
      "business_language",
      "business_intent",
      "intent_resolver",
      "business_capability_resolution",
      "business_derivation",
      "business_computed_field",
      "formula_projection",
      "computation_document",
      "expression_ast",
      "evaluation_engine",
      "runtime_projection",
      "runtime",
    ]),
    explainBeforeExecute: Object.freeze({
      willExecute: "Evaluate derived computed field projection at runtime",
      projectionOnly: true,
      businessRuleSummary: computedField.businessRuleSummary,
    }),
    reusable: metadata?.reusable !== false,
    studioRole: "edit_asset_only",
    runtimeRole: "derived_projection_only",
  });
}

export default buildBusinessComputedExplainability;
