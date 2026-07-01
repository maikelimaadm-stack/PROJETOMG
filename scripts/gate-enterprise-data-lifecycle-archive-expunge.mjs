#!/usr/bin/env node
/**
 * Gate G323 — Data Lifecycle, Archive & Controlled Expunge MVP (Program 3.25, D-091)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  DATA_LIFECYCLE_VERSION,
  FORTRESS_EXTENSION_POINTS,
  LIFECYCLE_EXTENSION_POINTS,
  publishDomainEvent,
  ingestEventToMemoryEngine,
  ingestMemoryRecordToKnowledgeGraph,
  analyzeConsultingContext,
  analyzeDecisionContext,
  analyzeEvolutionContext,
  ingestEvolutionToBusinessDna,
  ingestDnaToSegmentation,
  ingestSegmentationToRecommendation,
  ingestRecommendationToAdoption,
  ingestAdoptionToImprovement,
  analyzeOptimizationContext,
  ingestOptimizationToPortfolio,
  ingestPortfolioToGovernance,
  ingestGovernanceToFortress,
  ingestFortressToLifecycle,
  retrieveLatestLifecycle,
  summarizeLifecycleEngine,
  buildLifecycleBosProjection,
  bridgeLifecycleToGovernance,
  bridgeLifecycleToFortress,
  bridgeLifecycleToConsulting,
  bridgeLifecycleToDecision,
  runDataLifecycleEngine,
  requestArchiveExecution,
  executeArchiveWithApproval,
  requestExpungeExecution,
  executeExpungeWithApproval,
  applyLegalHold,
  releaseLegalHold,
  buildIntelligenceHomeProjection,
  registerAuthorizedGroupScope,
  assembleLifecycleContext,
} from "../src/intelligence/index.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";

const ROOT = process.cwd();
const LC = path.join(ROOT, "src/intelligence/lifecycle/engine");
const FORT = path.join(ROOT, "src/intelligence/fortress/engine");
const BOS = path.join(ROOT, "src/bos");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const lifecycleFiles = [
  "dataLifecycleContracts.js",
  "lifecycleStore.js",
  "lifecycleDocument.js",
  "archiveEngine.js",
  "expungeEngine.js",
  "legalHoldEngine.js",
  "lifecycleContextAssembly.js",
  "lifecycleRulesRegistry.js",
  "archiveRulesRegistry.js",
  "expungeRulesRegistry.js",
  "holdRulesRegistry.js",
  "lifecycleScheduleRegistry.js",
  "lifecycleEventRegistry.js",
  "lifecycleAuditTrail.js",
  "lifecycleExplainability.js",
  "lifecycleLineage.js",
  "lifecycleVersioning.js",
  "lifecycleOwnership.js",
  "lifecycleRetrieval.js",
  "lifecycleSummarization.js",
  "lifecycleToBosProjection.js",
  "lifecycleToGovernanceBridge.js",
  "lifecycleToFortressBridge.js",
  "lifecycleToPortfolioBridge.js",
  "lifecycleToIntelligenceBridges.js",
  "archiveLifecycleRegistry.js",
  "expungeApprovalRegistry.js",
  "holdEnforcementRegistry.js",
  "dataStateRegistry.js",
  "dataClassificationRegistry.js",
  "retentionExecutionRegistry.js",
  "archiveExecutionRegistry.js",
  "expungeExecutionRegistry.js",
  "lifecycleSeedsRegistry.js",
  "lifecycleComplianceRegistry.js",
  "lifecycleExceptionRegistry.js",
  "lifecycleReviewRegistry.js",
  "lifecycleControlCenter.js",
  "fortressToLifecycleIngestion.js",
  "lifecycleSummaryEngine.js",
  "runDataLifecycleEngine.js",
];

gate("G323 — Lifecycle Engine structure exists", lifecycleFiles.every((f) => exists(path.join(LC, f))));

gate(
  "G323 — Official lifecycle version",
  DATA_LIFECYCLE_VERSION === "mak-data-lifecycle-v1"
);

const tenantA = "gate-lifecycle-tenant-a";
const tenantB = "gate-lifecycle-tenant-b";
const groupId = "gate-lifecycle-group-1";

const envelope = publishDomainEvent({
  tenantId: tenantA,
  eventType: "workflow.action.approve",
  eventCategory: "workflow.operation",
  workflowId: "bwf-lifecycle-gate",
  intentId: "intent-lifecycle-gate",
  assetId: "bwf-lifecycle-gate",
  assetType: "business.asset.workflow",
  actorId: "aprovador",
  businessSummary: "Aprovação registrada para lifecycle gate.",
  whatHappened: "Responsável aprovou processo.",
  businessImpact: "Processo encerrado.",
  outcome: { status: "aprovado", terminal: true, humanDecision: true },
});

const record = ingestEventToMemoryEngine(envelope);
ingestMemoryRecordToKnowledgeGraph(record);
analyzeConsultingContext(tenantA);
analyzeDecisionContext(tenantA);
analyzeEvolutionContext(tenantA);
ingestEvolutionToBusinessDna(tenantA);
ingestDnaToSegmentation(tenantA);
ingestSegmentationToRecommendation(tenantA);
ingestRecommendationToAdoption(tenantA);
ingestAdoptionToImprovement(tenantA);

registerAuthorizedGroupScope({
  groupId,
  ownerClientId: "client-gate-lifecycle",
  authorizedTenantIds: [tenantA, tenantB],
});

ingestEvolutionToBusinessDna(tenantB);
ingestDnaToSegmentation(tenantB);
ingestSegmentationToRecommendation(tenantB);
ingestRecommendationToAdoption(tenantB);
ingestAdoptionToImprovement(tenantB);

analyzeOptimizationContext(tenantA, { groupId });
ingestOptimizationToPortfolio(groupId, tenantA);
ingestPortfolioToGovernance(groupId, tenantA);
ingestGovernanceToFortress(groupId, tenantA);

gate(
  "G323 — Fortress feeds Lifecycle",
  read(path.join(FORT, "governanceToFortressIngestion.js")).includes("ingestFortressToLifecycle")
);

gate(
  "G323 — business.data_lifecycle extension point implemented",
  FORTRESS_EXTENSION_POINTS.some((ep) => ep.id === "business.data_lifecycle" && ep.implemented === true)
);

const lifecycleResult = ingestFortressToLifecycle(groupId, tenantA);
gate("G323 — Lifecycle analyzed for authorized group", lifecycleResult.authorized === true);

gate(
  "G323 — Expunge requires policy and audit",
  lifecycleResult.expungeExecutions?.expungeRequiresPolicyAndAudit === true &&
    lifecycleResult.expungeExecutions?.expungeAllowed === false
);

gate(
  "G323 — Archive requires policy and audit",
  read(path.join(LC, "dataLifecycleContracts.js")).includes("archiveRequiresPolicyAndAudit: true")
);

gate(
  "G323 — State change requires audit trail",
  read(path.join(LC, "dataLifecycleContracts.js")).includes("stateChangeRequiresAuditTrail: true")
);

const retrieved = retrieveLatestLifecycle(groupId);
gate(
  "G323 — Lifecycle retrieval explainable",
  retrieved.explainable === true && retrieved.expungeRequiresPolicyAndAudit === true
);

const summary = summarizeLifecycleEngine(groupId);
gate(
  "G323 — Lifecycle summarization",
  summary.belongsToPlatform === true &&
    summary.expungeAllowed === false &&
    summary.archiveRequiresPolicyAndAudit === true
);

const ctx = assembleLifecycleContext(groupId, tenantA);
const archiveReq = requestArchiveExecution(groupId, ctx, { dataCategory: "operacional" });
gate("G323 — Archive request requires approval", archiveReq.humanApprovalRequired === true);

const archiveExecBlocked = executeArchiveWithApproval(groupId, ctx, "test-exec", false);
gate("G323 — Archive blocked without approval", archiveExecBlocked.executed === false);

const expungeReq = requestExpungeExecution(groupId, ctx);
gate("G323 — Expunge blocked by default", expungeReq.blocked === true || expungeReq.allowed === false);

const expungeExecBlocked = executeExpungeWithApproval(groupId, ctx, "test-expunge", false);
gate("G323 — Expunge blocked without approval", expungeExecBlocked.executed === false);

const holdApplied = applyLegalHold(groupId, ctx);
gate("G323 — Legal hold applied with audit", holdApplied.applied === true);

const holdReleaseBlocked = releaseLegalHold(groupId, ctx, holdApplied.enforcement.enforcementId, false);
gate("G323 — Hold release requires authorization", holdReleaseBlocked.released === false);

const bosProjection = buildLifecycleBosProjection(groupId, tenantA);
gate(
  "G323 — Lifecycle-to-BOS projection",
  bosProjection.explainable === true &&
    !JSON.stringify(bosProjection).includes("prompt") &&
    !JSON.stringify(bosProjection).includes("embedding") &&
    !JSON.stringify(bosProjection).includes("documentId") &&
    !JSON.stringify(bosProjection).includes("ruleId") &&
    !JSON.stringify(bosProjection).includes("eventId")
);

gate(
  "G323 — BOS wired to lifecycle sections",
  read(path.join(BOS, "pages/BosHomePage.jsx")).includes("LifecycleStatusSection") &&
    exists(path.join(BOS, "components/BusinessLifecycleSections.jsx"))
);

gate(
  "G323 — No technical lifecycle UI for business user",
  !read(path.join(BOS, "components/BusinessLifecycleSections.jsx")).includes("lifecycle/engine") &&
    !read(path.join(BOS, "components/BusinessLifecycleSections.jsx")).includes("documentId")
);

gate(
  "G323 — Lifecycle bridges read-only",
  bridgeLifecycleToGovernance(groupId, tenantA).autonomousPolicyForbidden === true &&
    bridgeLifecycleToFortress(groupId, tenantA).readOnly === true &&
    bridgeLifecycleToConsulting(groupId, tenantA).autonomousAdviceForbidden === true &&
    bridgeLifecycleToDecision(groupId, tenantA).autonomousDecisionForbidden === true
);

gate(
  "G323 — No chat assistant",
  !read(path.join(ROOT, "src/App.jsx")).includes("/chat") &&
    LIFECYCLE_EXTENSION_POINTS.some((ep) => ep.id === "ai.chat.assistant" && ep.forbiddenForBusinessUser)
);

gate(
  "G323 — No individual profiling in lifecycle contracts",
  read(path.join(LC, "dataLifecycleContracts.js")).includes("individualProfilingForbidden: true") &&
    read(path.join(LC, "dataLifecycleContracts.js")).includes("surveillanceForbidden: true")
);

gate(
  "G323 — No autonomous lifecycle execution",
  read(path.join(LC, "dataLifecycleContracts.js")).includes("autonomousExecutionForbidden: true")
);

const lifecycleEngine = runDataLifecycleEngine(groupId, tenantA);
gate("G323 — Lifecycle orchestrator", lifecycleEngine.engineVersion === DATA_LIFECYCLE_VERSION);

gate(
  "G323 — Durable lifecycle store",
  lifecycleEngine.storeInfo?.durable === true
);

const home = buildIntelligenceHomeProjection(tenantA, { groupId });
gate(
  "G323 — Intelligence home includes lifecycle",
  home.hasLifecycle === true || home.lifecycleSummary != null
);

gate(
  "G323 — Cross-tenant mixing forbidden",
  read(path.join(LC, "dataLifecycleContracts.js")).includes("crossTenantMixingForbidden: true")
);

const designerFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("/designers/"));
let bypass = false;
for (const file of designerFiles) {
  if (/runDataLifecycleEngine|analyzeDataLifecycleContext|ingestFortressToLifecycle/.test(file.content)) {
    bypass = true;
    break;
  }
}
gate("G323 — No lifecycle engine bypass in designers", !bypass);

try {
  execSync("node scripts/gate-enterprise-compliance-retention-audit-fortress.mjs", { stdio: "pipe" });
  gate("G323 — G322 Fortress still green", true);
} catch {
  gate("G323 — G322 Fortress still green", false, "G322 failed");
}

try {
  execSync("node scripts/gate-business-operating-shell.mjs", { stdio: "pipe" });
  gate("G323 — G307 BOS still green", true);
} catch {
  gate("G323 — G307 BOS still green", false, "G307 failed");
}

const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`\nG323: ${passed}/${total} checks passed`);
if (passed !== total) process.exit(1);
