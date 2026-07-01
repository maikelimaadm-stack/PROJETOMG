/** Corporate Intelligence Engine contracts — Program 3.20, D-086 */

export const CORPORATE_INTELLIGENCE_VERSION = "mak-corporate-intelligence-v1";
export const CORPORATE_INTELLIGENCE_STORE_VERSION = "mak-corporate-intelligence-store-v1";

export const CORPORATE_DOCUMENT_TYPES = Object.freeze({
  VIEW: "corporate.view",
  HEALTH: "corporate.health",
  BENCHMARK: "corporate.benchmark",
  PATTERN: "corporate.pattern",
  REFERENCE: "corporate.reference",
  VARIANCE: "corporate.variance",
  OPPORTUNITY: "corporate.opportunity",
});

export const CORPORATE_LIFECYCLE_STATES = Object.freeze([
  "draft",
  "aggregated",
  "published",
  "archived",
]);

export const CORPORATE_OWNERSHIP = Object.freeze({
  belongsToEnterprise: true,
  belongsToAi: false,
  tenantScoped: true,
  groupScopedRequiresAuthorization: true,
  individualProfilingForbidden: true,
  surveillanceForbidden: true,
  autonomousExecutionForbidden: true,
  humanApprovalRequired: true,
  crossTenantMixingForbidden: true,
  unauthorizedAggregationForbidden: true,
});

export const CORPORATE_INTELLIGENCE_EXTENSION_POINTS = Object.freeze([
  Object.freeze({ id: "ai.chat.assistant", implemented: false, forbiddenForBusinessUser: true }),
]);

export default CORPORATE_INTELLIGENCE_VERSION;
