/** Business Intent + Resolver — official contracts (Program 3.7, D-059/D-064) */

export const BUSINESS_INTENT_DOCUMENT_VERSION = "mak-business-intent-document-v1";

export const INTENT_RESOLVER_VERSION = "mak-intent-resolver-v1";

export const INTENT_RESOLVER_ENGINE_ID = "mak-business-intent-resolver-engine";

export const RESOLVER_DOCUMENT_VERSION = "mak-resolver-document-v1";

export const RESOLVER_RESULT_VERSION = "mak-resolver-result-v1";

export const RESOLVER_CONTEXT_VERSION = "mak-resolver-context-v1";

export const DERIVATION_DOCUMENT_VERSION = "mak-derivation-document-v1";

export const DERIVATION_KIND_COMPUTED_FIELD = "compute.computed_field";

export const DERIVATION_KIND_FORMULA = "compute.formula";

export const DERIVATION_KIND_WORKFLOW = "workflow.approval";

export const ARTIFACT_TYPE_BUSINESS_COMPUTED_FIELD = "business.computed_field";

export const ARTIFACT_TYPE_BUSINESS_WORKFLOW = "business.workflow";

export const ARTIFACT_TYPE_WORKFLOW_CONFIG = "workflow.config";

export const DERIVATION_CATEGORY_COMPUTATION = "Computation";

export const ARTIFACT_TYPE_FORMULA_DOCUMENT = "formula.document";

export const COMPATIBILITY_VERSION = "mak-derivation-compat-v1";

export const INTENT_CATEGORIES = Object.freeze([
  "Objective",
  "Rule",
  "Process",
  "Event",
  "Condition",
  "Outcome",
  "Computation",
]);

export const CAPABILITY_CALCULATION = "capability.calculation";

export const CAPABILITY_WORKFLOW = "capability.workflow";

export const RESOLVER_STRATEGIES = Object.freeze([
  "standard",
  "incremental",
  "preview",
  "regeneration",
]);

/** Extension-only derivation kinds — not implemented beyond Program 3.10 workflow */
export const EXTENSION_DERIVATION_KINDS = Object.freeze([
  "automation.rule",
  "visualization.dashboard",
  "reporting.definition",
  "integration.mapping",
  "ai.configuration",
  "security.permission",
  "event.definition",
]);

export default BUSINESS_INTENT_DOCUMENT_VERSION;
