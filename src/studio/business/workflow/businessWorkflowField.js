import { BUSINESS_WORKFLOW_VERSION } from "../contracts/businessWorkflowContracts.js";
import { createBusinessWorkflowDocument } from "./businessWorkflowDocument.js";
import { validateBusinessWorkflow } from "./businessWorkflowValidation.js";

export function stableWorkflowId(intentId, processId) {
  const raw = `${intentId}:workflow:${processId}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return `bwf-${hash.toString(16).padStart(8, "0")}`;
}

export function createBusinessWorkflowField(partial = {}) {
  const processId = partial.processId ?? partial.ownerProcessId ?? "default-process";
  const id = partial.id ?? stableWorkflowId(partial.intentId, processId);
  const document = createBusinessWorkflowDocument({ ...partial, id, processId });

  const field = Object.freeze({
    schemaVersion: BUSINESS_WORKFLOW_VERSION,
    id,
    documentId: document.id,
    intentId: document.intentId,
    intentRevision: document.intentRevision,
    businessProcessSummary: document.businessProcessSummary,
    processId: document.processId,
    moduleId: document.moduleId,
    entityId: document.entityId,
    states: document.states,
    transitions: document.transitions,
    assignments: document.assignments,
    sla: document.sla,
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

  const validation = validateBusinessWorkflow(field);
  return Object.freeze({ field, document, validation });
}

export default createBusinessWorkflowField;
