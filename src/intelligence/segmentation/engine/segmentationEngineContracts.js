/** Business Segmentation Engine contracts — Program 3.18, D-084 */

export const SEGMENTATION_ENGINE_VERSION = "mak-business-segmentation-engine-v1";
export const SEGMENTATION_STORE_VERSION = "mak-segmentation-store-v1";
export const TEMPLATE_LIBRARY_VERSION = "mak-template-library-v1";

export const SEGMENTATION_DOCUMENT_TYPES = Object.freeze({
  PROFILE: "segmentation.profile",
  CLASSIFICATION: "segmentation.classification",
  RULE: "segmentation.rule",
  BENCHMARK: "segmentation.benchmark",
});

export const OPERATIONAL_SEGMENTS = Object.freeze({
  OPERATIONALLY_MATURE: "segment.operational_mature",
  IMPROVEMENT_DRIVEN: "segment.improvement_driven",
  STRUCTURE_BUILDING: "segment.structure_building",
  GROWTH_FOCUSED: "segment.growth_focused",
  EMERGING_OPERATION: "segment.emerging_operation",
});

export const SEGMENTATION_LIFECYCLE_STATES = Object.freeze([
  "draft",
  "classified",
  "tracking",
  "benchmarked",
  "archived",
]);

export const TEMPLATE_LIFECYCLE_STATES = Object.freeze([
  "draft",
  "published",
  "matched",
  "applied",
  "archived",
]);

export const SEGMENTATION_OWNERSHIP = Object.freeze({
  belongsToEnterprise: true,
  belongsToAi: false,
  tenantScoped: true,
  individualProfilingForbidden: true,
  surveillanceForbidden: true,
  autonomousExecutionForbidden: true,
  humanApprovalRequired: false,
  portfolioRequiresAuthorization: true,
});

export const SEGMENTATION_ENGINE_EXTENSION_POINTS = Object.freeze([
  Object.freeze({ id: "ai.chat.assistant", implemented: false, forbiddenForBusinessUser: true }),
]);

export default SEGMENTATION_ENGINE_VERSION;
