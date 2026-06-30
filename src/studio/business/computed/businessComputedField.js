import { BUSINESS_COMPUTED_FIELD_VERSION } from "../contracts/businessComputedContracts.js";
import { createBusinessComputedDocument } from "./businessComputedDocument.js";
import { validateBusinessComputedField } from "./businessComputedValidation.js";

export function stableComputedFieldId(intentId, ownerFieldId) {
  const raw = `${intentId}:computed_field:${ownerFieldId}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return `bcf-${hash.toString(16).padStart(8, "0")}`;
}

export function createBusinessComputedField(partial = {}) {
  const id = partial.id ?? stableComputedFieldId(partial.intentId, partial.ownerFieldId);
  const document = createBusinessComputedDocument({ ...partial, id });

  const field = Object.freeze({
    schemaVersion: BUSINESS_COMPUTED_FIELD_VERSION,
    id,
    documentId: document.id,
    intentId: document.intentId,
    intentRevision: document.intentRevision,
    businessRuleSummary: document.businessRuleSummary,
    ownerFieldId: document.ownerFieldId,
    moduleId: document.moduleId,
    entityId: document.entityId,
    fieldKind: document.fieldKind,
    expressionSource: document.expressionSource,
    sampleVariables: document.sampleVariables,
    evaluationPolicy: document.evaluationPolicy,
    revision: document.revision,
    contentHash: document.contentHash,
    metadata: document.metadata,
    dependencyMetadata: document.dependencyMetadata,
    ownership: document.ownership,
    publishingMetadata: document.publishingMetadata,
    marketplaceMetadata: document.marketplaceMetadata,
    knowledgeMetadata: document.knowledgeMetadata,
    evolutionMetadata: document.evolutionMetadata,
    auditTrail: document.auditTrail,
    securityContracts: document.securityContracts,
    extensionPoints: document.extensionPoints,
    lifecycle: document.lifecycle,
    compatibility: document.compatibility,
    synchronization: document.synchronization,
    reusable: document.metadata.reusable !== false,
    belongsToBusiness: true,
    studioOwned: false,
  });

  const validation = validateBusinessComputedField(field);
  return Object.freeze({ field, document, validation });
}

export default createBusinessComputedField;
