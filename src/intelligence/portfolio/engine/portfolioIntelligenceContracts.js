/** Portfolio Intelligence Engine contracts — Program 3.22, D-088 */

export const PORTFOLIO_INTELLIGENCE_VERSION = "mak-portfolio-intelligence-v1";
export const PORTFOLIO_INTELLIGENCE_STORE_VERSION = "mak-portfolio-intelligence-store-v1";

export const PORTFOLIO_DOCUMENT_TYPES = Object.freeze({
  VIEW: "portfolio.view",
  DASHBOARD: "portfolio.dashboard",
  COMMAND_CENTER: "portfolio.command_center",
  ALERT: "portfolio.alert",
  BENCHMARK: "portfolio.benchmark",
  PATTERN: "portfolio.pattern",
  OPPORTUNITY: "portfolio.opportunity",
  REFERENCE: "portfolio.reference",
  VARIANCE: "portfolio.variance",
});

export const PORTFOLIO_LIFECYCLE_STATES = Object.freeze([
  "draft",
  "aggregated",
  "published",
  "archived",
]);

export const PORTFOLIO_OWNERSHIP = Object.freeze({
  belongsToEnterprise: true,
  belongsToAuthorizedGroup: true,
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

export const PORTFOLIO_INTELLIGENCE_EXTENSION_POINTS = Object.freeze([
  Object.freeze({ id: "ai.chat.assistant", implemented: false, forbiddenForBusinessUser: true }),
]);

export default PORTFOLIO_INTELLIGENCE_VERSION;
