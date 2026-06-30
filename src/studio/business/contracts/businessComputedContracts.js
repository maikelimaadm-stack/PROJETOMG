/** Business Computed Field — official Business Asset contracts (Program 3.8, D-068) */

export const BUSINESS_COMPUTED_FIELD_VERSION = "mak-business-computed-field-v1";

export const BUSINESS_COMPUTED_DOCUMENT_VERSION = "mak-business-computed-document-v1";

export const BUSINESS_COMPUTED_METADATA_VERSION = "mak-business-computed-metadata-v1";

export const BUSINESS_COMPUTED_ASSET_TYPE = "business.asset.computed_field";

export const BUSINESS_COMPUTED_COMPATIBILITY_VERSION = "mak-business-computed-compat-v1";

export const BUSINESS_COMPUTED_EXPLAINABILITY_VERSION = "mak-business-computed-explainability-v1";

export const BUSINESS_COMPUTED_LIFECYCLE_VERSION = "mak-business-computed-lifecycle-v1";

export const BUSINESS_COMPUTED_LINEAGE_VERSION = "mak-business-computed-lineage-v1";

export const ARTIFACT_TYPE_BUSINESS_COMPUTED_FIELD = "business.computed_field";

export const ARTIFACT_TYPE_FORMULA_PROJECTION = "formula.document";

export const DERIVATION_KIND_COMPUTED_FIELD = "compute.computed_field";

export const BUSINESS_COMPUTED_LIFECYCLE_STATES = Object.freeze([
  "draft",
  "approved",
  "active",
  "deprecated",
  "archived",
]);

export const BUSINESS_COMPUTED_REGENERATION_POLICIES = Object.freeze(["auto", "manual", "blocked"]);

export const BUSINESS_COMPUTED_SYNCHRONIZATION_POLICIES = Object.freeze([
  "sync_on_intent_change",
  "manual",
  "blocked",
]);

export const BUSINESS_COMPUTED_ROLLBACK_POLICIES = Object.freeze(["allowed", "preview_only", "blocked"]);

export default BUSINESS_COMPUTED_FIELD_VERSION;
