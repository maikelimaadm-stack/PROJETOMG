import {
  BUSINESS_WORKFLOW_METADATA_VERSION,
  BUSINESS_WORKFLOW_ASSET_TYPE,
  ARTIFACT_TYPE_BUSINESS_WORKFLOW,
  DERIVATION_KIND_WORKFLOW,
} from "../contracts/businessWorkflowContracts.js";
import { createBusinessWorkflowPolicies } from "./businessWorkflowPolicies.js";

export function createBusinessWorkflowMetadata(partial = {}) {
  const policies = partial.policies ?? createBusinessWorkflowPolicies(partial);
  return Object.freeze({
    schemaVersion: BUSINESS_WORKFLOW_METADATA_VERSION,
    assetType: BUSINESS_WORKFLOW_ASSET_TYPE,
    artifactType: ARTIFACT_TYPE_BUSINESS_WORKFLOW,
    derivationKind: DERIVATION_KIND_WORKFLOW,
    workflowId: partial.workflowId,
    intentId: partial.intentId,
    intentRevision: partial.intentRevision ?? 1,
    businessObjectId: partial.businessObjectId ?? "default",
    capabilityId: partial.capabilityId ?? "capability.workflow",
    resolverVersion: partial.resolverVersion ?? null,
    derivationId: partial.derivationId ?? null,
    generatedBy: partial.generatedBy ?? "intent-resolver",
    generationReason: partial.generationReason ?? "intent_resolution",
    reusable: partial.reusable !== false,
    studioOwned: false,
    belongsToBusiness: true,
    lineage: partial.lineage ?? Object.freeze([]),
    provenance: Object.freeze({
      intentRevision: partial.intentRevision ?? 1,
      templateId: partial.templateId ?? null,
      marketplacePackageId: partial.marketplacePackageId ?? null,
      aiAssisted: partial.aiAssisted ?? false,
      ...(partial.provenance ?? {}),
    }),
    ownership: Object.freeze({
      businessOwnerRoleId: partial.ownership?.businessOwnerRoleId ?? null,
      ownerUnitId: partial.ownership?.ownerUnitId ?? null,
      organizationId: partial.ownership?.organizationId ?? partial.organizationId ?? null,
      ...(partial.ownership ?? {}),
    }),
    policies,
    metadata: Object.freeze({ ...(partial.metadata ?? {}) }),
  });
}

export default createBusinessWorkflowMetadata;
