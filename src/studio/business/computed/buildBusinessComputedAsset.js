import {
  DERIVATION_KIND_COMPUTED_FIELD,
  ARTIFACT_TYPE_BUSINESS_COMPUTED_FIELD,
} from "../contracts/businessComputedContracts.js";
import { createBusinessComputedField, stableComputedFieldId } from "./businessComputedField.js";
import { createBusinessComputedMetadata } from "./businessComputedMetadata.js";
import { buildBusinessComputedLineage } from "./businessComputedLineage.js";
import { buildBusinessComputedExplainability } from "./businessComputedExplainability.js";
import { checkBusinessComputedCompatibility } from "./businessComputedCompatibility.js";

/**
 * Creates Business Computed Field asset from resolver-supplied plain data.
 * No Intent Resolver imports — business layer stays independent (D-068).
 */
export function buildBusinessComputedAsset(input) {
  const {
    intentDocument,
    computationRef,
    session,
    derivationId,
    resolverVersion,
    organizationId,
  } = input;

  const ownerFieldId = computationRef.ownerFieldId ?? intentDocument.subject?.fieldId ?? "unknown";
  const computedFieldId = stableComputedFieldId(intentDocument.id, ownerFieldId);

  const lineage = buildBusinessComputedLineage(
    intentDocument,
    session,
    computedFieldId,
    derivationId
  );

  const metadata = createBusinessComputedMetadata({
    computedFieldId,
    intentId: intentDocument.id,
    intentRevision: intentDocument.revision,
    businessObjectId: intentDocument.subject?.businessObjectId ?? "default",
    capabilityId: input.capabilityId ?? "capability.calculation",
    artifactType: ARTIFACT_TYPE_BUSINESS_COMPUTED_FIELD,
    derivationKind: DERIVATION_KIND_COMPUTED_FIELD,
    generatedBy: session.initiatedBy,
    organizationId,
    lineage,
    derivationId,
    resolverVersion,
  });

  const created = createBusinessComputedField({
    id: computedFieldId,
    intentId: intentDocument.id,
    intentRevision: intentDocument.revision,
    businessRuleSummary: intentDocument.intentPhrase,
    ownerFieldId,
    subject: intentDocument.subject,
    computation: computationRef,
    intentDocument,
    metadata,
    lineage,
    derivationId,
    resolverVersion,
    organizationId,
    generatedBy: session.initiatedBy,
  });

  const compatibility = checkBusinessComputedCompatibility(created.field, {
    intentRevision: intentDocument.revision,
  });

  const explainability = buildBusinessComputedExplainability(
    intentDocument,
    session,
    created.field,
    metadata
  );

  return Object.freeze({
    businessComputedField: created.field,
    businessComputedDocument: created.document,
    metadata,
    validation: created.validation,
    compatibility,
    explainability,
  });
}

export default buildBusinessComputedAsset;
