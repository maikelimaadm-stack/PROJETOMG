/** Business DNA Engine contracts — Program 3.17, D-083 */

export const BUSINESS_DNA_ENGINE_VERSION = "mak-business-dna-engine-v1";
export const BUSINESS_DNA_STORE_VERSION = "mak-business-dna-store-v1";
export const BUSINESS_DNA_PROFILE_SCHEMA_VERSION = "mak-business-dna-profile-v1";
export const BUSINESS_DNA_FINGERPRINT_SCHEMA_VERSION = "mak-business-dna-fingerprint-v1";

export const BUSINESS_DNA_DOCUMENT_TYPES = Object.freeze({
  PROFILE: "business.dna.profile",
  FINGERPRINT: "business.dna.fingerprint",
  MATURITY: "business.dna.maturity",
  PATTERN: "business.dna.pattern",
  PORTFOLIO: "business.dna.portfolio",
});

export const DNA_PATTERN_TYPES = Object.freeze({
  OPERATIONAL: "dna.pattern.operational",
  CULTURAL: "dna.pattern.cultural",
  CAPABILITY: "dna.pattern.capability",
  RECURRING: "dna.pattern.recurring",
});

export const DNA_MATURITY_LEVELS = Object.freeze(["emerging", "developing", "established", "advanced"]);

export const DNA_LIFECYCLE_STATES = Object.freeze([
  "draft",
  "profiled",
  "tracking",
  "matured",
  "archived",
]);

export const DNA_OWNERSHIP = Object.freeze({
  belongsToEnterprise: true,
  belongsToAi: false,
  tenantScoped: true,
  individualProfilingForbidden: true,
  surveillanceForbidden: true,
  autonomousExecutionForbidden: true,
  humanApprovalRequired: false,
});

export const DNA_ENGINE_EXTENSION_POINTS = Object.freeze([
  Object.freeze({ id: "business.segmentation", implemented: true, consumes: ["business.dna"] }),
  Object.freeze({ id: "ai.chat.assistant", implemented: false, forbiddenForBusinessUser: true }),
]);

export default BUSINESS_DNA_ENGINE_VERSION;
