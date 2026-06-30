import { createBusinessIntentDocument } from "../document/intentDocument.js";
import { CAPABILITY_CALCULATION } from "../contracts/intentContracts.js";

/**
 * Business Language input — structured business expression (D-065).
 * Produces Business Intent Document; never technical artifacts.
 */
export function createBusinessLanguageInput(partial = {}) {
  return Object.freeze({
    schemaVersion: "mak-business-language-input-v1",
    objective: partial.objective ?? "",
    rule: partial.rule ?? null,
    process: partial.process ?? null,
    event: partial.event ?? null,
    condition: partial.condition ?? null,
    expectedResult: partial.expectedResult ?? "",
    computation: Object.freeze({
      expressionSource: partial.computation?.expressionSource ?? partial.expressionSource ?? "",
      ownerFieldId: partial.computation?.ownerFieldId ?? partial.ownerFieldId ?? "unknown",
      moduleId: partial.computation?.moduleId ?? partial.moduleId ?? "default",
      entityId: partial.computation?.entityId ?? partial.entityId ?? "default",
      fieldKind: partial.computation?.fieldKind ?? "computed",
      sampleVariables: Object.freeze({ ...(partial.computation?.sampleVariables ?? partial.sampleVariables ?? {}) }),
    }),
    organizationId: partial.organizationId ?? null,
    tenantId: partial.tenantId ?? "default",
    authoredBy: partial.authoredBy ?? "business-user",
    metadata: Object.freeze({ ...(partial.metadata ?? {}) }),
  });
}

/** Convert Business Language input → approved Business Intent Document */
export function businessLanguageToIntent(input, options = {}) {
  const intentPhrase = [
    input.objective,
    input.condition ? `When: ${input.condition}` : null,
    input.expectedResult ? `Result: ${input.expectedResult}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return createBusinessIntentDocument({
    id: options.intentId ?? `intent-${input.computation.ownerFieldId}`,
    title: input.objective || "Business computation",
    intentPhrase,
    category: "Computation",
    description: input.rule ?? input.expectedResult ?? "",
    subject: {
      businessObjectId: `${input.computation.moduleId}.${input.computation.entityId}`,
      moduleId: input.computation.moduleId,
      entityId: input.computation.entityId,
      fieldId: input.computation.ownerFieldId,
    },
    capabilities: [
      { capabilityId: CAPABILITY_CALCULATION, role: "requires", parameters: {} },
    ],
    computations: [
      {
        computationId: `comp-ref-${input.computation.ownerFieldId}`,
        expressionSource: input.computation.expressionSource,
        ownerFieldId: input.computation.ownerFieldId,
        fieldKind: input.computation.fieldKind,
        sampleVariables: input.computation.sampleVariables,
      },
    ],
    goals: input.objective ? [{ phrase: input.objective }] : [],
    conditions: input.condition ? [{ phrase: input.condition }] : [],
    outcomes: input.expectedResult ? [{ phrase: input.expectedResult }] : [],
    lifecycle: "approved",
    organizationId: input.organizationId,
    tenantId: input.tenantId,
    authoredBy: input.authoredBy,
    metadata: input.metadata,
    revision: options.revision ?? 1,
  });
}

export default createBusinessLanguageInput;
