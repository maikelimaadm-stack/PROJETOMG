import {
  BUSINESS_WORKFLOW_DOCUMENT_VERSION,
  BUSINESS_WORKFLOW_ASSET_TYPE,
} from "../contracts/businessWorkflowContracts.js";
import { createBusinessWorkflowMetadata } from "./businessWorkflowMetadata.js";
import { createBusinessWorkflowLifecycle } from "./businessWorkflowLifecycle.js";
import { createBusinessWorkflowVersioning } from "./businessWorkflowVersioning.js";
import { createBusinessWorkflowCompatibility } from "./businessWorkflowCompatibility.js";
import { createBusinessWorkflowPolicies } from "./businessWorkflowPolicies.js";
import { createBusinessWorkflowSynchronization } from "./businessWorkflowSynchronization.js";
import {
  deriveWorkflowDependencyMetadataFromIntent,
  createBusinessWorkflowDependencyMetadata,
} from "./businessWorkflowDependencyMetadata.js";
import {
  createBusinessWorkflowPublishingMetadata,
  createBusinessWorkflowMarketplaceMetadata,
  createBusinessWorkflowKnowledgeMetadata,
  createBusinessWorkflowEvolutionMetadata,
} from "./businessWorkflowPublishingMetadata.js";
import { createBusinessWorkflowAuditTrail } from "./businessWorkflowAuditTrail.js";
import { createBusinessWorkflowOwnership } from "./businessWorkflowOwnership.js";
import { createBusinessWorkflowSecurityContracts } from "./businessWorkflowSecurityContracts.js";
import { BUSINESS_WORKFLOW_EXTENSION_POINTS } from "./businessWorkflowExtensionPoints.js";
import {
  createDefaultBusinessWorkflowStates,
  createDefaultBusinessWorkflowTransitions,
} from "./businessWorkflowStates.js";
import { createBusinessWorkflowAssignments } from "./businessWorkflowAssignment.js";
import { createBusinessWorkflowSla } from "./businessWorkflowSla.js";

export function createBusinessWorkflowDocument(partial = {}) {
  const processRef = partial.processRef ?? {};
  const processId = partial.processId ?? processRef.processId ?? "default-process";
  const contentSeed = [partial.intentId, processId, partial.businessProcessSummary, partial.objective]
    .filter(Boolean)
    .join("|");

  const versioning = createBusinessWorkflowVersioning({
    revision: partial.revision ?? 1,
    contentSeed,
    schemaVersion: BUSINESS_WORKFLOW_DOCUMENT_VERSION,
  });

  const metadata =
    partial.metadata ??
    createBusinessWorkflowMetadata({
      workflowId: partial.id,
      intentId: partial.intentId,
      intentRevision: partial.intentRevision,
      businessObjectId: partial.businessObjectId,
      capabilityId: partial.capabilityId,
      resolverVersion: partial.resolverVersion,
      derivationId: partial.derivationId,
      generatedBy: partial.generatedBy,
      lineage: partial.lineage,
      organizationId: partial.organizationId,
      policies: partial.policies ?? createBusinessWorkflowPolicies(),
    });

  const approvers = partial.approvers ?? processRef.approvers ?? [];
  const states = partial.states ?? createDefaultBusinessWorkflowStates();
  const transitions = partial.transitions ?? createDefaultBusinessWorkflowTransitions(approvers);
  const assignments = partial.assignments ?? createBusinessWorkflowAssignments(processRef, { approvers });
  const sla = partial.sla ?? createBusinessWorkflowSla(processRef, partial.slaPartial ?? {});

  const intentDocument = partial.intentDocument ?? null;
  const dependencyMetadata =
    partial.dependencyMetadata ??
    createBusinessWorkflowDependencyMetadata(
      intentDocument
        ? deriveWorkflowDependencyMetadataFromIntent(intentDocument, { ...processRef, processId })
        : { processId }
    );

  return Object.freeze({
    schemaVersion: BUSINESS_WORKFLOW_DOCUMENT_VERSION,
    assetType: BUSINESS_WORKFLOW_ASSET_TYPE,
    id: partial.id,
    intentId: partial.intentId,
    intentRevision: partial.intentRevision ?? 1,
    businessProcessSummary: partial.businessProcessSummary ?? "",
    processId,
    moduleId: partial.moduleId ?? processRef.moduleId ?? intentDocument?.subject?.moduleId ?? "default",
    entityId: partial.entityId ?? processRef.entityId ?? intentDocument?.subject?.entityId ?? "default",
    states,
    transitions,
    assignments,
    sla,
    revision: versioning.revision,
    contentHash: versioning.contentHash,
    metadata,
    dependencyMetadata,
    ownership: partial.ownership ?? createBusinessWorkflowOwnership({ organizationId: partial.organizationId }),
    publishingMetadata: partial.publishingMetadata ?? createBusinessWorkflowPublishingMetadata(),
    marketplaceMetadata: partial.marketplaceMetadata ?? createBusinessWorkflowMarketplaceMetadata(),
    knowledgeMetadata: partial.knowledgeMetadata ?? createBusinessWorkflowKnowledgeMetadata(),
    evolutionMetadata: partial.evolutionMetadata ?? createBusinessWorkflowEvolutionMetadata(),
    auditTrail: partial.auditTrail ?? createBusinessWorkflowAuditTrail({ actor: partial.generatedBy }),
    securityContracts: partial.securityContracts ?? createBusinessWorkflowSecurityContracts(),
    extensionPoints: BUSINESS_WORKFLOW_EXTENSION_POINTS,
    lifecycle: partial.lifecycle ?? createBusinessWorkflowLifecycle({ state: "active" }),
    compatibility: partial.compatibility ?? createBusinessWorkflowCompatibility(),
    synchronization: partial.synchronization ?? createBusinessWorkflowSynchronization(),
  });
}

export default createBusinessWorkflowDocument;
