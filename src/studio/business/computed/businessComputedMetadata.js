import {
  BUSINESS_COMPUTED_METADATA_VERSION,
  BUSINESS_COMPUTED_ASSET_TYPE,
  ARTIFACT_TYPE_BUSINESS_COMPUTED_FIELD,
  DERIVATION_KIND_COMPUTED_FIELD,
} from "../contracts/businessComputedContracts.js";
import { createBusinessComputedPolicies } from "./businessComputedPolicies.js";

export function createBusinessComputedMetadata(partial = {}) {
  const policies = partial.policies ?? createBusinessComputedPolicies(partial);
  return Object.freeze({
    schemaVersion: BUSINESS_COMPUTED_METADATA_VERSION,
    assetType: BUSINESS_COMPUTED_ASSET_TYPE,
    artifactType: ARTIFACT_TYPE_BUSINESS_COMPUTED_FIELD,
    derivationKind: DERIVATION_KIND_COMPUTED_FIELD,
    computedFieldId: partial.computedFieldId,
    intentId: partial.intentId,
    intentRevision: partial.intentRevision ?? 1,
    businessObjectId: partial.businessObjectId ?? "default",
    capabilityId: partial.capabilityId ?? "capability.calculation",
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

export default createBusinessComputedMetadata;
