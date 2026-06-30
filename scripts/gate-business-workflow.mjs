#!/usr/bin/env node
/**
 * Gate G308 — Business Workflow MVP (Program 3.10, D-075)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { createBusinessWorkflowLanguageInput } from "../src/studio/intent/language/businessWorkflowLanguageInput.js";
import { resolveFromBusinessLanguage } from "../src/studio/intent/index.js";
import {
  BUSINESS_WORKFLOW_VERSION,
  BUSINESS_WORKFLOW_DOCUMENT_VERSION,
  BUSINESS_WORKFLOW_ASSET_TYPE,
  DERIVATION_KIND_WORKFLOW,
  ARTIFACT_TYPE_BUSINESS_WORKFLOW,
  validateBusinessWorkflow,
  BUSINESS_WORKFLOW_EXTENSION_POINTS,
} from "../src/studio/business/index.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";

const ROOT = process.cwd();
const BUSINESS = path.join(ROOT, "src/studio/business");
const INTENT = path.join(ROOT, "src/studio/intent");
const BOS = path.join(ROOT, "src/bos");
const APP = path.join(ROOT, "src/App.jsx");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const requiredWorkflowFiles = [
  "contracts/businessWorkflowContracts.js",
  "workflow/businessWorkflowField.js",
  "workflow/businessWorkflowDocument.js",
  "workflow/businessWorkflowMetadata.js",
  "workflow/businessWorkflowLifecycle.js",
  "workflow/businessWorkflowValidation.js",
  "workflow/businessWorkflowLineage.js",
  "workflow/businessWorkflowDiagnostics.js",
  "workflow/businessWorkflowExplainability.js",
  "workflow/businessWorkflowVersioning.js",
  "workflow/businessWorkflowCompatibility.js",
  "workflow/businessWorkflowPolicies.js",
  "workflow/businessWorkflowPreview.js",
  "workflow/businessWorkflowSynchronization.js",
  "workflow/businessWorkflowRegeneration.js",
  "workflow/businessWorkflowDependencyMetadata.js",
  "workflow/businessWorkflowRuntimeProjection.js",
  "workflow/businessWorkflowPublishingMetadata.js",
  "workflow/businessWorkflowMarketplaceMetadata.js",
  "workflow/businessWorkflowKnowledgeMetadata.js",
  "workflow/businessWorkflowEvolutionMetadata.js",
  "workflow/businessWorkflowAuditTrail.js",
  "workflow/businessWorkflowOwnership.js",
  "workflow/businessWorkflowSecurityContracts.js",
  "workflow/businessWorkflowExtensionPoints.js",
  "workflow/businessWorkflowStates.js",
  "workflow/businessWorkflowAssignment.js",
  "workflow/businessWorkflowSla.js",
  "workflow/businessWorkflowTaskInbox.js",
  "workflow/buildBusinessWorkflowAsset.js",
  "workflow/projectWorkflowFromBusinessWorkflow.js",
];

gate(
  "G308 — Business Workflow structure exists",
  requiredWorkflowFiles.every((f) => exists(path.join(BUSINESS, f)))
);

gate(
  "G308 — Official contract versions",
  BUSINESS_WORKFLOW_VERSION === "mak-business-workflow-v1" &&
    BUSINESS_WORKFLOW_DOCUMENT_VERSION === "mak-business-workflow-document-v1" &&
    BUSINESS_WORKFLOW_ASSET_TYPE === "business.asset.workflow" &&
    DERIVATION_KIND_WORKFLOW === "workflow.approval" &&
    ARTIFACT_TYPE_BUSINESS_WORKFLOW === "business.workflow"
);

gate(
  "G308 — Business layer independent of designers",
  !read(path.join(BUSINESS, "workflow/buildBusinessWorkflowAsset.js")).includes("resolverPipeline") &&
    !read(path.join(BUSINESS, "workflow/projectWorkflowFromBusinessWorkflow.js")).includes("/designers/")
);

gate(
  "G308 — Resolver creates Business Workflow before config projection",
  read(path.join(INTENT, "resolver/workflowDerivation.js")).includes("buildBusinessWorkflowAsset") &&
    read(path.join(INTENT, "resolver/workflowDerivation.js")).includes("createWorkflowProjectionFromBusinessWorkflow") &&
    read(path.join(INTENT, "resolver/derivationPlanning.js")).includes("DERIVATION_KIND_WORKFLOW")
);

const wfInput = createBusinessWorkflowLanguageInput({
  objective: "Aprovar pedidos de compra",
  processDescription: "Compras acima do limite precisam de aprovação financeira",
  expectedResult: "Pedido aprovado ou retornado para correção",
  approvers: [{ role: "aprovador", label: "Gerente financeiro" }],
  process: { processId: "purchase-approval", moduleId: "empresas", entityId: "pedido", slaHours: 48 },
});

const wfResult = resolveFromBusinessLanguage(wfInput, { preview: true, initiatedBy: "gate-g308" });

gate("G308 — Business Language → Intent → Resolver → Business Workflow", wfResult.ok === true);

gate(
  "G308 — Business Workflow is reusable Business Asset",
  wfResult.businessWorkflow?.reusable === true &&
    wfResult.businessWorkflow?.belongsToBusiness === true &&
    wfResult.businessWorkflow?.studioOwned === false
);

const assetValidation = validateBusinessWorkflow(wfResult.businessWorkflow);
gate("G308 — Business Workflow validation passes", assetValidation.ok === true);

gate(
  "G308 — Workflow config is projection FROM Business Workflow",
  wfResult.workflowConfigDocument?.metadata?.derivedFromBusinessWorkflow === true &&
    wfResult.workflowConfigDocument?.metadata?.projectionOnly === true &&
    wfResult.workflowConfigDocument?.metadata?.bpmnForbidden === true
);

gate(
  "G308 — Runtime receives derived projections only",
  wfResult.runtimeProjection?.runtimeReceives === "derived_projection_only"
);

gate(
  "G308 — Business states and transitions in business vocabulary",
  (wfResult.businessWorkflow?.states?.length ?? 0) >= 2 &&
    (wfResult.businessWorkflow?.transitions?.length ?? 0) >= 2 &&
    !JSON.stringify(wfResult.businessWorkflow?.states).includes("BPMN")
);

gate(
  "G308 — SLA and escalation metadata present",
  Boolean(wfResult.businessWorkflow?.sla?.escalation?.enabled)
);

gate(
  "G308 — Explainability report",
  Boolean(wfResult.explainability?.businessSummary || wfResult.businessExplainability?.businessSummary)
);

gate(
  "G308 — Full lineage via workflow metadata",
  (wfResult.metadata?.lineage?.length ?? 0) >= 3
);

gate(
  "G308 — Deterministic Business Workflow id",
  wfResult.businessWorkflow?.id ===
    resolveFromBusinessLanguage(wfInput, { preview: true }).businessWorkflow?.id
);

gate(
  "G308 — No BPMN/designer exposure in BOS Business First",
  read(path.join(BOS, "pages/BusinessFirstPage.jsx")).includes('assetHint === "workflow"') &&
    read(path.join(BOS, "pages/BusinessFirstPage.jsx")).includes("Sem BPMN") &&
    !read(path.join(BOS, "pages/BusinessFirstPage.jsx")).includes("Workflow Studio")
);

gate(
  "G308 — BOS workflow inbox route registered",
  read(APP).includes("/bos/workflow/inbox") && exists(path.join(BOS, "pages/WorkflowInboxPage.jsx"))
);

gate(
  "G308 — Workflow asset available in BOS catalog",
  read(path.join(BOS, "config/bosAssetCatalog.js")).includes('status: "available"') &&
    read(path.join(BOS, "config/bosAssetCatalog.js")).includes("asset=workflow")
);

gate(
  "G308 — Security contracts forbid business-user technical authoring",
  read(path.join(BUSINESS, "workflow/businessWorkflowSecurityContracts.js")).includes("bpmnExposureForbidden")
);

const designerFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("/designers/"));
const bypassPatterns = [/buildBusinessWorkflowAsset/, /executeWorkflowDerivation/];
let bypassFound = false;
for (const file of designerFiles) {
  for (const pat of bypassPatterns) {
    if (pat.test(file.content)) {
      bypassFound = true;
      break;
    }
  }
}
gate("G308 — No Business Workflow creation bypass in designers", !bypassFound);

gate(
  "G308 — Automation/Dashboard remain extension points only",
  BUSINESS_WORKFLOW_EXTENSION_POINTS.every((ep) => ep.implemented === false)
);

try {
  execSync("node scripts/gate-business-computed-fields.mjs", { stdio: "pipe" });
  gate("G308 — G306 still green", true);
} catch {
  gate("G308 — G306 still green", false, "G306 failed");
}

try {
  execSync("node scripts/gate-business-operating-shell.mjs", { stdio: "pipe" });
  gate("G308 — G307 BOS still green", true);
} catch {
  gate("G308 — G307 BOS still green", false, "G307 failed");
}

const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`\nG308: ${passed}/${total} checks passed`);
if (passed !== total) process.exit(1);
