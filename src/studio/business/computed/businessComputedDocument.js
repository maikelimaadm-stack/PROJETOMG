import {
  BUSINESS_COMPUTED_DOCUMENT_VERSION,
  BUSINESS_COMPUTED_ASSET_TYPE,
} from "../contracts/businessComputedContracts.js";
import { createBusinessComputedMetadata } from "./businessComputedMetadata.js";
import { createBusinessComputedLifecycle } from "./businessComputedLifecycle.js";
import { createBusinessComputedVersioning } from "./businessComputedVersioning.js";
import { createBusinessComputedCompatibility } from "./businessComputedCompatibility.js";
import { createBusinessComputedPolicies } from "./businessComputedPolicies.js";
import { createBusinessComputedSynchronization } from "./businessComputedSynchronization.js";
import { deriveDependencyMetadataFromIntent } from "./businessComputedDependencyMetadata.js";
import { createBusinessComputedPublishingMetadata } from "./businessComputedPublishingMetadata.js";
import { createBusinessComputedMarketplaceMetadata } from "./businessComputedMarketplaceMetadata.js";
import { createBusinessComputedKnowledgeMetadata } from "./businessComputedKnowledgeMetadata.js";
import { createBusinessComputedEvolutionMetadata } from "./businessComputedEvolutionMetadata.js";
import { createBusinessComputedAuditTrail } from "./businessComputedAuditTrail.js";
import { createBusinessComputedOwnership } from "./businessComputedOwnership.js";
import { createBusinessComputedSecurityContracts } from "./businessComputedSecurityContracts.js";
import { BUSINESS_COMPUTED_EXTENSION_POINTS } from "./businessComputedExtensionPoints.js";

export function createBusinessComputedDocument(partial = {}) {
  const subject = partial.subject ?? {};
  const computation = partial.computation ?? {};
  const intentDocument = partial.intentDocument ?? null;
  const contentSeed = [
    partial.intentId,
    partial.ownerFieldId,
    partial.businessRuleSummary,
    computation.expressionSource,
  ]
    .filter(Boolean)
    .join("|");

  const versioning = createBusinessComputedVersioning({
    revision: partial.revision ?? 1,
    contentSeed,
    schemaVersion: BUSINESS_COMPUTED_DOCUMENT_VERSION,
    compatibilityVersion: partial.compatibilityVersion,
  });

  const metadata =
    partial.metadata ??
    createBusinessComputedMetadata({
      computedFieldId: partial.id,
      intentId: partial.intentId,
      intentRevision: partial.intentRevision,
      businessObjectId: partial.businessObjectId,
      capabilityId: partial.capabilityId,
      resolverVersion: partial.resolverVersion,
      derivationId: partial.derivationId,
      generatedBy: partial.generatedBy,
      lineage: partial.lineage,
      organizationId: partial.organizationId,
      policies: partial.policies ?? createBusinessComputedPolicies(),
    });

  const dependencyMetadata =
    partial.dependencyMetadata ??
    (intentDocument
      ? deriveDependencyMetadataFromIntent(intentDocument, computation)
      : deriveDependencyMetadataFromIntent(
          { capabilities: [], dependencies: [], subject },
          computation
        ));

  const ownership =
    partial.ownership ??
    createBusinessComputedOwnership({
      organizationId: partial.organizationId,
      ownerUnitId: metadata.ownership?.ownerUnitId,
      businessOwnerRoleId: metadata.ownership?.businessOwnerRoleId,
    });

  return Object.freeze({
    schemaVersion: BUSINESS_COMPUTED_DOCUMENT_VERSION,
    assetType: BUSINESS_COMPUTED_ASSET_TYPE,
    id: partial.id,
    intentId: partial.intentId,
    intentRevision: partial.intentRevision ?? 1,
    businessRuleSummary: partial.businessRuleSummary ?? "",
    ownerFieldId: partial.ownerFieldId ?? subject.fieldId ?? "unknown",
    moduleId: subject.moduleId ?? partial.moduleId ?? "default",
    entityId: subject.entityId ?? partial.entityId ?? "default",
    fieldKind: computation.fieldKind ?? partial.fieldKind ?? "computed",
    expressionSource: computation.expressionSource ?? partial.expressionSource ?? "",
    sampleVariables: Object.freeze({ ...(computation.sampleVariables ?? partial.sampleVariables ?? {}) }),
    evaluationPolicy: partial.evaluationPolicy ?? "lazy",
    subject: Object.freeze({ ...subject }),
    computation: Object.freeze({
      computationId: computation.computationId ?? `comp-ref-${partial.ownerFieldId}`,
      expressionSource: computation.expressionSource ?? partial.expressionSource ?? "",
      ownerFieldId: computation.ownerFieldId ?? partial.ownerFieldId,
      fieldKind: computation.fieldKind ?? "computed",
      sampleVariables: Object.freeze({ ...(computation.sampleVariables ?? {}) }),
    }),
    metadata,
    dependencyMetadata,
    ownership,
    publishingMetadata: partial.publishingMetadata ?? createBusinessComputedPublishingMetadata(),
    marketplaceMetadata: partial.marketplaceMetadata ?? createBusinessComputedMarketplaceMetadata(),
    knowledgeMetadata:
      partial.knowledgeMetadata ??
      createBusinessComputedKnowledgeMetadata({
        businessRuleSummary: partial.businessRuleSummary,
      }),
    evolutionMetadata: partial.evolutionMetadata ?? createBusinessComputedEvolutionMetadata(),
    auditTrail:
      partial.auditTrail ??
      createBusinessComputedAuditTrail({
        generatedBy: partial.generatedBy,
        intentRevision: partial.intentRevision,
        assetRevision: versioning.revision,
      }),
    securityContracts: partial.securityContracts ?? createBusinessComputedSecurityContracts(),
    extensionPoints: BUSINESS_COMPUTED_EXTENSION_POINTS,
    lifecycle: partial.lifecycle ?? createBusinessComputedLifecycle({ state: "active" }),
    versioning,
    compatibility:
      partial.compatibility ??
      createBusinessComputedCompatibility({
        intentRevision: partial.intentRevision,
        resolverVersion: partial.resolverVersion,
      }),
    synchronization:
      partial.synchronization ??
      createBusinessComputedSynchronization({
        lastSyncedIntentRevision: partial.intentRevision,
        lastSyncedAt: new Date().toISOString(),
      }),
    revision: versioning.revision,
    contentHash: versioning.contentHash,
    createdAt: partial.createdAt ?? new Date().toISOString(),
    updatedAt: partial.updatedAt ?? new Date().toISOString(),
  });
}

export default createBusinessComputedDocument;
