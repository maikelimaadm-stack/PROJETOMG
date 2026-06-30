/** Business Workflow — official Business Asset contracts (Program 3.10, D-075) */

export const BUSINESS_WORKFLOW_VERSION = "mak-business-workflow-v1";

export const BUSINESS_WORKFLOW_DOCUMENT_VERSION = "mak-business-workflow-document-v1";

export const BUSINESS_WORKFLOW_METADATA_VERSION = "mak-business-workflow-metadata-v1";

export const BUSINESS_WORKFLOW_ASSET_TYPE = "business.asset.workflow";

export const BUSINESS_WORKFLOW_COMPATIBILITY_VERSION = "mak-business-workflow-compat-v1";

export const BUSINESS_WORKFLOW_EXPLAINABILITY_VERSION = "mak-business-workflow-explainability-v1";

export const BUSINESS_WORKFLOW_LIFECYCLE_VERSION = "mak-business-workflow-lifecycle-v1";

export const BUSINESS_WORKFLOW_LINEAGE_VERSION = "mak-business-workflow-lineage-v1";

export const ARTIFACT_TYPE_BUSINESS_WORKFLOW = "business.workflow";

export const ARTIFACT_TYPE_WORKFLOW_PROJECTION = "workflow.config";

export const DERIVATION_KIND_WORKFLOW = "workflow.approval";

export const BUSINESS_WORKFLOW_LIFECYCLE_STATES = Object.freeze([
  "draft",
  "active",
  "paused",
  "deprecated",
  "archived",
]);

export const BUSINESS_WORKFLOW_BUSINESS_STATES = Object.freeze([
  "solicitado",
  "em_analise",
  "aguardando_aprovacao",
  "aprovado",
  "rejeitado",
  "retornado_correcao",
  "escalado",
  "concluido",
]);

export const BUSINESS_WORKFLOW_REGENERATION_POLICIES = Object.freeze(["auto", "manual", "blocked"]);

export const BUSINESS_WORKFLOW_SYNCHRONIZATION_POLICIES = Object.freeze([
  "sync_on_intent_change",
  "manual",
  "blocked",
]);

export const BUSINESS_WORKFLOW_ROLLBACK_POLICIES = Object.freeze(["allowed", "preview_only", "blocked"]);

export default BUSINESS_WORKFLOW_VERSION;
