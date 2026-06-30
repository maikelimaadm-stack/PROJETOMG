import {
  INTENT_RESOLVER_VERSION,
  DERIVATION_KIND_FORMULA,
  ARTIFACT_TYPE_FORMULA_DOCUMENT,
  COMPATIBILITY_VERSION,
} from "../contracts/intentContracts.js";
import {
  REGENERATION_POLICIES,
  SYNCHRONIZATION_POLICIES,
  ROLLBACK_POLICIES,
} from "../contracts/derivationContracts.js";
import { CAPABILITY_CALCULATION } from "../contracts/intentContracts.js";

export function createDerivationMetadata(partial = {}) {
  return Object.freeze({
    derivationId: partial.derivationId,
    intentId: partial.intentId,
    businessObjectId: partial.businessObjectId,
    capabilityId: partial.capabilityId ?? CAPABILITY_CALCULATION,
    artifactType: partial.artifactType ?? ARTIFACT_TYPE_FORMULA_DOCUMENT,
    derivationKind: partial.derivationKind ?? DERIVATION_KIND_FORMULA,
    derivationVersion: partial.derivationVersion ?? 1,
    resolverVersion: partial.resolverVersion ?? INTENT_RESOLVER_VERSION,
    lineage: partial.lineage ?? Object.freeze([]),
    provenance: Object.freeze({
      intentRevision: partial.intentRevision ?? 1,
      templateId: partial.templateId ?? null,
      marketplacePackageId: partial.marketplacePackageId ?? null,
      aiAssisted: partial.aiAssisted ?? false,
      ...(partial.provenance ?? {}),
    }),
    generatedBy: partial.generatedBy ?? "intent-resolver",
    generationReason: partial.generationReason ?? "intent_resolution",
    compatibilityVersion: partial.compatibilityVersion ?? COMPATIBILITY_VERSION,
    regenerationPolicy: partial.regenerationPolicy ?? REGENERATION_POLICIES[0],
    synchronizationPolicy: partial.synchronizationPolicy ?? SYNCHRONIZATION_POLICIES[0],
    rollbackPolicy: partial.rollbackPolicy ?? ROLLBACK_POLICIES[0],
    ownership: Object.freeze({
      businessOwnerRoleId: partial.ownership?.businessOwnerRoleId ?? null,
      ownerUnitId: partial.ownership?.ownerUnitId ?? null,
      organizationId: partial.ownership?.organizationId ?? partial.organizationId ?? null,
      ...(partial.ownership ?? {}),
    }),
    metadata: Object.freeze({ ...(partial.metadata ?? {}) }),
  });
}

export default createDerivationMetadata;
