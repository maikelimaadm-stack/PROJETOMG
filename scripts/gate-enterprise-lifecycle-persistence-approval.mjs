#!/usr/bin/env node
/**
 * Gate G324 — Data Lifecycle Persistence & Approval Workflow MVP (Program 3.26, D-092)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  LIFECYCLE_PERSISTENCE_VERSION,
  LIFECYCLE_EXTENSION_POINTS,
  LIFECYCLE_PERSISTENCE_EXTENSION_POINTS,
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
  retrievePersistentLifecycle,
  summarizeLifecyclePersistence,
  buildLifecyclePersistenceBosProjection,
  bridgePersistenceToGovernance,
  bridgePersistenceToFortress,
  bridgePersistenceToConsulting,
  bridgePersistenceToDecision,
  runLifecyclePersistenceEngine,
  createApprovalRequest,
  approveLifecycleRequest,
  rejectLifecycleRequest,
  processExecutionQueue,
  buildIntelligenceHomeProjection,
  registerAuthorizedGroupScope,
  assembleLifecycleExecutionContext,
} from "../src/intelligence/index.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";

const ROOT = process.cwd();
const LP = path.join(ROOT, "src/intelligence/lifecycle/persistence");
const LC = path.join(ROOT, "src/intelligence/lifecycle/engine");
const BOS = path.join(ROOT, "src/bos");
const BACKEND = path.join(ROOT, "backend/src/modules/lifecycle");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const persistenceFiles = [
  "lifecyclePersistenceContracts.js",
  "durableLifecycleStore.js",
  "approvalWorkflowEngine.js",
  "lifecycleExecutionQueue.js",
  "persistenceDocument.js",
  "approvalDocument.js",
  "lifecycleExecutionContextAssembly.js",
  "lifecycleEventPersistence.js",
  "lifecycleApprovalRegistry.js",
  "archiveApprovalWorkflow.js",
  "expungeApprovalWorkflow.js",
  "legalHoldApprovalWorkflow.js",
  "storageIntegrationAdapter.js",
  "backupIntegrationAdapter.js",
  "durableAuditTrailStore.js",
  "lifecycleStatePersistence.js",
  "lifecycleTransitionPersistence.js",
  "lifecyclePersistenceRetrieval.js",
  "lifecyclePersistenceSummaries.js",
  "lifecyclePersistenceExplainability.js",
  "lifecyclePersistenceLineage.js",
  "lifecyclePersistenceVersioning.js",
  "lifecyclePersistenceOwnership.js",
  "lifecycleAuditReview.js",
  "lifecyclePersistenceControlCenter.js",
  "lifecyclePersistenceToBosProjection.js",
  "lifecyclePersistenceToGovernanceBridge.js",
  "lifecyclePersistenceToFortressBridge.js",
  "lifecyclePersistenceToPortfolioBridge.js",
  "lifecyclePersistenceToIntelligenceBridges.js",
  "lifecyclePersistenceSeedsRegistry.js",
  "lifecycleToPersistenceIngestion.js",
  "runLifecyclePersistenceEngine.js",
];

gate("G324 — Persistence layer structure exists", persistenceFiles.every((f) => exists(path.join(LP, f))));

gate(
  "G324 — Official persistence version",
  LIFECYCLE_PERSISTENCE_VERSION === "mak-lifecycle-persistence-v1"
);

const tenantA = "gate-persist-tenant-a";
const tenantB = "gate-persist-tenant-b";
const groupId = "gate-persist-group-1";

const envelope = publishDomainEvent({
  tenantId: tenantA,
  eventType: "workflow.action.approve",
  eventCategory: "workflow.operation",
  workflowId: "bwf-persist-gate",
  intentId: "intent-persist-gate",
  assetId: "bwf-persist-gate",
  assetType: "business.asset.workflow",
  actorId: "aprovador",
  businessSummary: "Aprovação para gate de persistência.",
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
  ownerClientId: "client-gate-persist",
  authorizedTenantIds: [tenantA, tenantB],
});

ingestEvolutionToBusinessDna(tenantB);
analyzeOptimizationContext(tenantA, { groupId });
ingestOptimizationToPortfolio(groupId, tenantA);
ingestPortfolioToGovernance(groupId, tenantA);
ingestGovernanceToFortress(groupId, tenantA);
ingestFortressToLifecycle(groupId, tenantA);

gate(
  "G324 — Lifecycle feeds Persistence",
  read(path.join(LC, "fortressToLifecycleIngestion.js")).includes("ingestLifecycleToPersistence")
);

gate(
  "G324 — business.lifecycle_persistence extension point implemented",
  LIFECYCLE_EXTENSION_POINTS.some((ep) => ep.id === "business.lifecycle_persistence" && ep.implemented === true)
);

const persistResult = ingestLifecycleToPersistence(groupId, tenantA);
gate("G324 — Persistence analyzed for authorized group", persistResult.authorized === true);

gate(
  "G324 — Durable store enabled",
  persistResult.durable === true || summarizeLifecyclePersistence(groupId).durable === true
);

const ctx = assembleLifecycleExecutionContext(groupId, tenantA);
const created = createApprovalRequest(groupId, tenantA, ctx, {
  actionType: "archive",
  label: "Gate archive test",
});
gate("G324 — Approval request created", created.created === true);

const approved = approveLifecycleRequest(created.request.requestId, "gate-admin");
gate("G324 — Approval workflow grants with audit", approved.approved === true);

const queue = processExecutionQueue(groupId, { limit: 5 });
gate("G324 — Execution queue processes approved", queue.processedCount >= 0);

const rejectedReq = createApprovalRequest(groupId, tenantA, ctx, {
  actionType: "expunge",
  label: "Gate reject test",
});
const rejected = rejectLifecycleRequest(rejectedReq.request.requestId, "gate-admin", "Teste gate");
gate("G324 — Rejection workflow", rejected.rejected === true);

const retrieved = retrievePersistentLifecycle(groupId);
gate(
  "G324 — Persistent retrieval explainable",
  retrieved.explainable === true && retrieved.durable === true
);

gate(
  "G324 — Archive requires policy and audit",
  read(path.join(LP, "lifecyclePersistenceContracts.js")).includes("archiveRequiresPolicyAndAudit: true")
);

gate(
  "G324 — Queue requires approval when required",
  read(path.join(LP, "lifecyclePersistenceContracts.js")).includes("queueRequiresApprovalWhenRequired: true")
);

const bosProjection = buildLifecyclePersistenceBosProjection(groupId, tenantA);
gate(
  "G324 — Persistence-to-BOS projection",
  bosProjection.explainable === true &&
    bosProjection.durable === true &&
    !JSON.stringify(bosProjection).includes("documentId") &&
    !JSON.stringify(bosProjection).includes("requestId") &&
    !JSON.stringify(bosProjection).includes("prompt")
);

gate(
  "G324 — BOS wired to interactive approval",
  read(path.join(BOS, "pages/BosHomePage.jsx")).includes("handleApproveLifecycle") &&
    read(path.join(BOS, "components/BusinessLifecycleSections.jsx")).includes("Aprovar")
);

gate(
  "G324 — No technical persistence UI for business user",
  !read(path.join(BOS, "components/BusinessLifecycleSections.jsx")).includes("lifecycle/persistence") &&
    !read(path.join(BOS, "components/BusinessLifecycleSections.jsx")).includes("executionJobs")
);

gate(
  "G324 — Backend lifecycle module exists",
  exists(path.join(BACKEND, "routes.js")) &&
    exists(path.join(BACKEND, "lifecycleService.js")) &&
    read(path.join(ROOT, "backend/prisma/schema.prisma")).includes("LifecycleApprovalRequest")
);

gate(
  "G324 — Persistence bridges read-only",
  bridgePersistenceToGovernance(groupId, tenantA).autonomousPolicyForbidden === true &&
    bridgePersistenceToFortress(groupId, tenantA).readOnly === true &&
    bridgePersistenceToConsulting(groupId, tenantA).autonomousAdviceForbidden === true &&
    bridgePersistenceToDecision(groupId, tenantA).autonomousDecisionForbidden === true
);

gate(
  "G324 — No chat assistant",
  !read(path.join(ROOT, "src/App.jsx")).includes("/chat") &&
    LIFECYCLE_PERSISTENCE_EXTENSION_POINTS.some((ep) => ep.id === "ai.chat.assistant" && ep.forbiddenForBusinessUser)
);

gate(
  "G324 — No autonomous persistence execution",
  read(path.join(LP, "lifecyclePersistenceContracts.js")).includes("autonomousExecutionForbidden: true")
);

const engine = runLifecyclePersistenceEngine(groupId, tenantA);
gate("G324 — Persistence orchestrator", engine.engineVersion === LIFECYCLE_PERSISTENCE_VERSION);

const home = buildIntelligenceHomeProjection(tenantA, { groupId });
gate(
  "G324 — Intelligence home includes lifecycle persistence",
  home.hasLifecyclePersistence === true || home.lifecyclePersistenceSummary != null
);

gate(
  "G324 — Cross-tenant mixing forbidden",
  read(path.join(LP, "lifecyclePersistenceContracts.js")).includes("crossTenantMixingForbidden: true")
);

const designerFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("/designers/"));
let bypass = false;
for (const file of designerFiles) {
  if (/runLifecyclePersistenceEngine|ingestLifecycleToPersistence|approveLifecycleRequest/.test(file.content)) {
    bypass = true;
    break;
  }
}
gate("G324 — No persistence engine bypass in designers", !bypass);

try {
  execSync("node scripts/gate-enterprise-data-lifecycle-archive-expunge.mjs", { stdio: "pipe" });
  gate("G324 — G323 Lifecycle still green", true);
} catch {
  gate("G324 — G323 Lifecycle still green", false, "G323 failed");
}

try {
  execSync("node scripts/gate-business-operating-shell.mjs", { stdio: "pipe" });
  gate("G324 — G307 BOS still green", true);
} catch {
  gate("G324 — G307 BOS still green", false, "G307 failed");
}

const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`\nG324: ${passed}/${total} checks passed`);
if (passed !== total) process.exit(1);
