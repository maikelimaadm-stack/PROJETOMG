/**
 * Adoption → Corporate Intelligence ingestion — authorized group scope only.
 */
import { assembleCorporateIntelligenceContext } from "./corporateIntelligenceContextAssembly.js";
import { aggregateCorporateHealth } from "./corporateHealthAggregation.js";
import { buildCorporateBenchmarkRegistry } from "./corporateBenchmarkRegistry.js";
import { buildCorporatePatternRegistry } from "./corporatePatternRegistry.js";
import { buildCorporateReferenceRegistry } from "./corporateReferenceRegistry.js";
import { buildCorporateVarianceRegistry } from "./corporateVarianceRegistry.js";
import { buildCorporateOpportunityRegistry } from "./corporateOpportunityRegistry.js";
import { buildAuthorizedGroupInsights } from "./authorizedGroupInsights.js";
import { buildGroupAdoptionComparison } from "./groupAdoptionComparison.js";
import { trackReplicationAdoption } from "./replicationAdoptionTracking.js";
import { trackRecommendationOutcomes } from "./recommendationOutcomeTracking.js";
import { createCorporateView, upsertCorporateView } from "./corporateIntelligenceStore.js";
import { buildCorporateIntelligenceLineage } from "./corporateIntelligenceLineage.js";
import { registerCorporateIntelligenceVersion } from "./corporateIntelligenceVersioning.js";
import { appendCorporateAuditEntry } from "./corporateIntelligenceAuditTrail.js";
import { CORPORATE_INTELLIGENCE_VERSION, CORPORATE_OWNERSHIP } from "./corporateIntelligenceContracts.js";

export function analyzeCorporateIntelligenceContext(groupId, tenantId = "default", options = {}) {
  const ctx = assembleCorporateIntelligenceContext(groupId, tenantId, options);

  if (!ctx.authorized) {
    return Object.freeze({
      groupId,
      tenantId,
      analyzedAt: new Date().toISOString(),
      authorized: false,
      reason: ctx.reason,
      ...CORPORATE_OWNERSHIP,
    });
  }

  const health = aggregateCorporateHealth(groupId, ctx);
  const benchmarks = buildCorporateBenchmarkRegistry(groupId, ctx);
  const patterns = buildCorporatePatternRegistry(groupId, ctx);
  const references = buildCorporateReferenceRegistry(groupId, ctx);
  const variances = buildCorporateVarianceRegistry(groupId, ctx);
  const opportunities = buildCorporateOpportunityRegistry(groupId, ctx);
  const insights = buildAuthorizedGroupInsights(groupId, tenantId);
  const groupComparison = buildGroupAdoptionComparison(groupId, tenantId);
  const replicationTracking = trackReplicationAdoption(tenantId);
  const recommendationOutcomes = trackRecommendationOutcomes(tenantId);

  const view = upsertCorporateView(
    createCorporateView({
      groupId,
      ownerClientId: ctx.ownerClientId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      title: "Visão corporativa autorizada",
      summary: health.healthRecords[0]?.summary ?? "Consolidação de adoção e maturidade do grupo.",
      lineage: buildCorporateIntelligenceLineage({ groupId, adoptionRef: options.adoptions?.[0]?.adoptionId }),
    })
  );
  registerCorporateIntelligenceVersion(groupId, view.viewId);

  appendCorporateAuditEntry({
    groupId,
    action: "corporate_intelligence_analyzed",
    entityId: view.viewId,
    entityType: "view",
  });

  return Object.freeze({
    groupId,
    tenantId,
    analyzedAt: new Date().toISOString(),
    engineVersion: CORPORATE_INTELLIGENCE_VERSION,
    authorized: true,
    view,
    health,
    benchmarks,
    patterns,
    references,
    variances,
    opportunities,
    insights,
    groupComparison,
    replicationTracking,
    recommendationOutcomes,
    ...CORPORATE_OWNERSHIP,
    explainable: true,
  });
}

export function ingestAdoptionToCorporateIntelligence(tenantId = "default", options = {}) {
  const groupId = options.groupId;
  if (!groupId) {
    return Object.freeze({ authorized: false, reason: "groupId required for corporate intelligence" });
  }
  return analyzeCorporateIntelligenceContext(groupId, tenantId, options);
}

export default {
  analyzeCorporateIntelligenceContext,
  ingestAdoptionToCorporateIntelligence,
};
