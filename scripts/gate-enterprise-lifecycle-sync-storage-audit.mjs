#!/usr/bin/env node
/**
 * Gate G325 — Lifecycle Sync, Storage Integration & Audit Operations MVP (Program 3.27, D-093)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  LIFECYCLE_SYNC_VERSION,
  LIFECYCLE_PERSISTENCE_EXTENSION_POINTS,
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
  ingestLifecycleToPersistence,
  ingestPersistenceToSync,
  runLifecycleSyncEngineSync,
  summarizeLifecycleSync,
  buildLifecycleSyncBosProjection,
  bridgeSyncToGovernance,
  bridgeSyncToFortress,
  bridgeSyncToConsulting,
  bridgeSyncToDecision,
  runLifecycleSyncOrchestratorSync,
  buildIntelligenceHomeProjection,
  registerAuthorizedGroupScope,
  assembleSyncContext,
  createApprovalRequest,
  approveLifecycleRequest,
  assembleLifecycleExecutionContext,
  SYNC_OWNERSHIP,
  LIFECYCLE_SYNC_EXTENSION_POINTS,
} from "../src/intelligence/index.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";

const ROOT = process.cwd();
const LS = path.join(ROOT, "src/intelligence/lifecycle/sync");
const LP = path.join(ROOT, "src/intelligence/lifecycle/persistence");
const BOS = path.join(ROOT, "src/bos");
const BACKEND = path.join(ROOT, "backend/src/modules/lifecycle");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const syncFiles = [
  "lifecycleSyncContracts.js",
  "durabilitySyncStore.js",
  "lifecycleSyncEngine.js",
  "lifecycleSyncApiClient.js",
  "storageSyncAdapter.js",
  "backupSyncAdapter.js",
  "auditOperationsEngine.js",
  "syncDocument.js",
  "storageIntegrationDocument.js",
  "auditOperationsDocument.js",
  "syncContextAssembly.js",
  "syncRulesRegistry.js",
  "storageRulesRegistry.js",
  "backupRulesRegistry.js",
  "auditOperationsRegistry.js",
  "frontendBackendSyncPipeline.js",
  "lifecycleEventSync.js",
  "approvalSync.js",
  "executionSync.js",
  "storageActionSync.js",
  "backupActionSync.js",
  "auditTrailSync.js",
  "lifecycleExplainabilitySync.js",
  "lifecycleLineageSync.js",
  "lifecycleVersioningSync.js",
  "lifecycleOwnershipSync.js",
  "lifecycleRetrievalSync.js",
  "lifecycleSummariesSync.js",
  "lifecycleSyncToBosProjection.js",
  "lifecycleSyncToGovernanceBridge.js",
  "lifecycleSyncToFortressBridge.js",
  "lifecycleSyncToPortfolioBridge.js",
  "lifecycleSyncToIntelligenceBridges.js",
  "notificationRegistry.js",
  "notificationSeedsRegistry.js",
  "syncHealthRegistry.js",
  "syncErrorRegistry.js",
  "syncRetryRegistry.js",
  "syncMonitoringRegistry.js",
  "auditReviewCenter.js",
  "persistenceToSyncIngestion.js",
  "runLifecycleSyncEngine.js",
];

gate("G325 — Sync layer structure exists", syncFiles.every((f) => exists(path.join(LS, f))));

gate("G325 — Official sync version", LIFECYCLE_SYNC_VERSION === "mak-lifecycle-sync-v1");

const tenantA = "gate-sync-tenant-a";
const tenantB = "gate-sync-tenant-b";
const groupId = "gate-sync-group-1";

const envelope = publishDomainEvent({
  tenantId: tenantA,
  eventType: "workflow.action.approve",
  eventCategory: "workflow.operation",
  workflowId: "bwf-sync-gate",
  intentId: "intent-sync-gate",
  assetId: "bwf-sync-gate",
  assetType: "business.asset.workflow",
  actorId: "aprovador",
  businessSummary: "Aprovação para gate de sync.",
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
  ownerClientId: "client-gate-sync",
  authorizedTenantIds: [tenantA, tenantB],
});

ingestEvolutionToBusinessDna(tenantB);
analyzeOptimizationContext(tenantA, { groupId });
ingestOptimizationToPortfolio(groupId, tenantA);
ingestPortfolioToGovernance(groupId, tenantA);
ingestGovernanceToFortress(groupId, tenantA);
ingestFortressToLifecycle(groupId, tenantA);
ingestLifecycleToPersistence(groupId, tenantA);

gate(
  "G325 — Persistence feeds Sync",
  read(path.join(LP, "lifecycleToPersistenceIngestion.js")).includes("ingestPersistenceToSync")
);

gate(
  "G325 — business.lifecycle_sync extension point implemented",
  LIFECYCLE_EXTENSION_POINTS.some((ep) => ep.id === "business.lifecycle_sync" && ep.implemented === true) &&
    LIFECYCLE_PERSISTENCE_EXTENSION_POINTS.some((ep) => ep.id === "business.lifecycle_sync" && ep.implemented === true)
);

const syncResult = ingestPersistenceToSync(groupId, tenantA);
gate("G325 — Sync analyzed for authorized group", syncResult.authorized === true);

const ctx = assembleSyncContext(groupId, tenantA);
gate("G325 — Sync context assembly", ctx.authorized === true && ctx.approvalCount >= 0);

const execCtx = assembleLifecycleExecutionContext(groupId, tenantA);
const created = createApprovalRequest(groupId, tenantA, execCtx, {
  actionType: "archive",
  label: "Gate sync archive test",
});
approveLifecycleRequest(created.request.requestId, "gate-admin");

const engine = runLifecycleSyncEngineSync(groupId, tenantA, { push: true });
gate("G325 — Lifecycle sync engine runs", engine.authorized === true && engine.durable === true);

gate("G325 — Approval sync pipeline", engine.approvalResult != null);
gate("G325 — Execution sync pipeline", engine.executionResult != null);
gate("G325 — Storage action sync", engine.storageResult != null);
gate("G325 — Backup action sync", engine.backupResult != null);
gate("G325 — Audit trail sync", engine.auditResult != null);

const summary = summarizeLifecycleSync(groupId);
gate("G325 — Sync summary explainable", summary.explainable === true && summary.headline != null);

gate(
  "G325 — Divergence must be visible",
  read(path.join(LS, "lifecycleSyncContracts.js")).includes("hiddenDivergenceForbidden: true")
);

gate(
  "G325 — Sync requires audit trail",
  read(path.join(LS, "lifecycleSyncContracts.js")).includes("syncRequiresAuditTrail: true")
);

const bosProjection = buildLifecycleSyncBosProjection(groupId, tenantA);
gate(
  "G325 — Sync-to-BOS projection",
  bosProjection.explainable === true &&
    bosProjection.hasSync === true &&
    !JSON.stringify(bosProjection).includes("syncId") &&
    !JSON.stringify(bosProjection).includes("prompt")
);

gate(
  "G325 — BOS wired to sync sections",
  read(path.join(BOS, "pages/BosHomePage.jsx")).includes("LifecycleSyncSection") &&
    read(path.join(BOS, "components/BusinessLifecycleSections.jsx")).includes("Sincronização operacional")
);

gate(
  "G325 — No technical sync UI for business user",
  !read(path.join(BOS, "components/BusinessLifecycleSections.jsx")).includes("lifecycle/sync") &&
    !read(path.join(BOS, "components/BusinessLifecycleSections.jsx")).includes("syncRecords")
);

gate(
  "G325 — Backend sync module exists",
  exists(path.join(BACKEND, "lifecycleSyncService.js")) &&
    exists(path.join(BACKEND, "lifecycleSyncRepository.js")) &&
    read(path.join(BACKEND, "routes.js")).includes("/api/lifecycle/sync/") &&
    read(path.join(ROOT, "backend/prisma/schema.prisma")).includes("LifecycleSyncState")
);

gate(
  "G325 — Sync bridges read-only",
  bridgeSyncToGovernance(groupId, tenantA).autonomousPolicyForbidden === true &&
    bridgeSyncToFortress(groupId, tenantA).readOnly === true &&
    bridgeSyncToConsulting(groupId, tenantA).autonomousAdviceForbidden === true &&
    bridgeSyncToDecision(groupId, tenantA).autonomousDecisionForbidden === true
);

gate(
  "G325 — No chat assistant",
  !read(path.join(ROOT, "src/App.jsx")).includes("/chat") &&
    LIFECYCLE_SYNC_EXTENSION_POINTS.some((ep) => ep.id === "ai.chat.assistant" && ep.forbiddenForBusinessUser)
);

gate(
  "G325 — No autonomous sync execution",
  SYNC_OWNERSHIP.autonomousExecutionForbidden === true
);

const orchestrator = runLifecycleSyncOrchestratorSync(groupId, tenantA);
gate("G325 — Sync orchestrator", orchestrator.engineVersion === LIFECYCLE_SYNC_VERSION);

const home = buildIntelligenceHomeProjection(tenantA, { groupId });
gate(
  "G325 — Intelligence home includes lifecycle sync",
  home.hasLifecycleSync === true || home.lifecycleSyncSummary != null
);

gate(
  "G325 — Cross-tenant mixing forbidden",
  read(path.join(LS, "lifecycleSyncContracts.js")).includes("crossTenantMixingForbidden: true")
);

const designerFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("/designers/"));
let bypass = false;
for (const file of designerFiles) {
  if (/runLifecycleSyncEngine|ingestPersistenceToSync|runFrontendBackendSyncPipeline/.test(file.content)) {
    bypass = true;
    break;
  }
}
gate("G325 — No sync engine bypass in designers", !bypass);

try {
  execSync("node scripts/gate-enterprise-lifecycle-persistence-approval.mjs", { stdio: "pipe" });
  gate("G325 — G324 Persistence still green", true);
} catch {
  gate("G325 — G324 Persistence still green", false, "G324 failed");
}

try {
  execSync("node scripts/gate-business-operating-shell.mjs", { stdio: "pipe" });
  gate("G325 — G307 BOS still green", true);
} catch {
  gate("G325 — G307 BOS still green", false, "G307 failed");
}

const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`\nG325: ${passed}/${total} checks passed`);
if (passed !== total) process.exit(1);
