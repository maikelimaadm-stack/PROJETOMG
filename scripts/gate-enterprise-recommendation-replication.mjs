#!/usr/bin/env node
/**
 * Gate G317 — Recommendation & Replication MVP (Program 3.19, D-085)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  RECOMMENDATION_ENGINE_VERSION,
  RECOMMENDATION_SIGNAL_TYPES,
  RECOMMENDATION_ENGINE_EXTENSION_POINTS,
  SEGMENTATION_ENGINE_EXTENSION_POINTS,
  publishDomainEvent,
  ingestEventToMemoryEngine,
  ingestMemoryRecordToKnowledgeGraph,
  analyzeConsultingContext,
  analyzeDecisionContext,
  analyzeEvolutionContext,
  ingestEvolutionToBusinessDna,
  ingestDnaToSegmentation,
  ingestSegmentationToRecommendation,
  replayRecommendationFromStack,
  retrieveRecommendationsByContext,
  retrieveReplicationsByContext,
  summarizeRecommendationEngine,
  buildRecommendationBosProjection,
  bridgeSegmentationToRecommendation,
  bridgeRecommendationToConsulting,
  bridgeRecommendationToDecision,
  bridgeRecommendationToEvolution,
  runRecommendationEngine,
  buildIntelligenceHomeProjection,
  registerAuthorizedGroupScope,
} from "../src/intelligence/index.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";

const ROOT = process.cwd();
const REC = path.join(ROOT, "src/intelligence/recommendation/engine");
const BOS = path.join(ROOT, "src/bos");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const requiredFiles = [
  "recommendationEngineContracts.js",
  "recommendationEngineStore.js",
  "recommendationContextAssembly.js",
  "recommendationSignals.js",
  "recommendationCandidates.js",
  "recommendationPlans.js",
  "recommendationExplainability.js",
  "recommendationVersioning.js",
  "recommendationLifecycle.js",
  "recommendationOwnership.js",
  "recommendationAuditTrail.js",
  "recommendationRetrieval.js",
  "recommendationSummarization.js",
  "recommendationRegistry.js",
  "replicationTargets.js",
  "replicationCompatibility.js",
  "replicationPlans.js",
  "replicationExplainability.js",
  "replicationLineage.js",
  "replicationOwnership.js",
  "replicationSummarization.js",
  "replicationRetrieval.js",
  "replicationRegistry.js",
  "replicationSeedsRegistry.js",
  "segmentationToRecommendationIngestion.js",
  "recommendationToBosProjection.js",
  "replicationToBosProjection.js",
  "recommendationToIntelligenceBridges.js",
  "runRecommendationEngine.js",
];

gate(
  "G317 — Recommendation Engine structure exists",
  requiredFiles.every((f) => exists(path.join(REC, f)))
);

gate(
  "G317 — Official recommendation version",
  RECOMMENDATION_ENGINE_VERSION === "mak-recommendation-engine-v1" &&
    Object.keys(RECOMMENDATION_SIGNAL_TYPES).length >= 4
);

const tenantA = "gate-rec-tenant-a";
const tenantB = "gate-rec-tenant-b";
const groupId = "gate-rec-group-1";

const envelope = publishDomainEvent({
  tenantId: tenantA,
  eventType: "workflow.action.approve",
  eventCategory: "workflow.operation",
  workflowId: "bwf-rec-gate",
  intentId: "intent-rec-gate",
  assetId: "bwf-rec-gate",
  assetType: "business.asset.workflow",
  actorId: "aprovador",
  businessSummary: "Aprovação registrada para recommendation gate.",
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

const retrievedA = retrieveRecommendationsByContext(tenantA);
const retrievedBBefore = retrieveRecommendationsByContext(tenantB);

gate(
  "G317 — Tenant-scoped recommendation isolation",
  retrievedA.recommendations.length >= 1 && retrievedBBefore.recommendations.length === 0
);

gate(
  "G317 — Segmentation feeds Recommendation engine",
  read(path.join(ROOT, "src/intelligence/segmentation/engine/dnaToSegmentationIngestion.js")).includes(
    "ingestSegmentationToRecommendation"
  )
);

gate(
  "G317 — business.recommendation extension point implemented",
  SEGMENTATION_ENGINE_EXTENSION_POINTS.some((ep) => ep.id === "business.recommendation" && ep.implemented === true)
);

const replay = replayRecommendationFromStack(tenantA);
gate("G317 — Recommendation replay from stack", replay.recommendations?.length >= 1);

gate(
  "G317 — Recommendation retrieval explainable",
  retrievedA.explainable === true && retrievedA.humanApprovalRequired === true
);

const summary = summarizeRecommendationEngine(tenantA);
gate(
  "G317 — Recommendation summarization",
  summary.belongsToEnterprise === true &&
    summary.humanApprovalRequired === true &&
    summary.autonomousExecutionForbidden === true
);

gate(
  "G317 — All recommendations require human approval",
  retrievedA.recommendations.every((r) => r.requiresHumanApproval === true)
);

const bosProjection = buildRecommendationBosProjection(tenantA);
gate(
  "G317 — Recommendation-to-BOS projection",
  bosProjection.explainable === true &&
    !JSON.stringify(bosProjection).includes("prompt") &&
    !JSON.stringify(bosProjection).includes("embedding") &&
    !JSON.stringify(bosProjection).includes("recommendationId")
);

gate(
  "G317 — BOS wired to recommendation sections",
  read(path.join(BOS, "pages/BosHomePage.jsx")).includes("PriorityRecommendationsSection") &&
    exists(path.join(BOS, "components/BusinessRecommendationSections.jsx"))
);

gate(
  "G317 — Replication requires authorization and approval",
  (() => {
    registerAuthorizedGroupScope({
      groupId,
      ownerClientId: "client-gate",
      authorizedTenantIds: [tenantA, tenantB],
    });
    ingestEvolutionToBusinessDna(tenantB);
    ingestDnaToSegmentation(tenantB);
    ingestSegmentationToRecommendation(tenantB);
    ingestSegmentationToRecommendation(tenantA, { groupId });
    const replications = retrieveReplicationsByContext(tenantA);
    return (
      replications.explainable === true &&
      replications.humanApprovalRequired === true &&
      replications.autonomousExecutionForbidden === true
    );
  })()
);

gate(
  "G317 — No autonomous replication",
  retrievedA.plans.every((p) => p.autonomousExecutionForbidden === true) || retrievedA.plans.length === 0
);

gate(
  "G317 — Segmentation-to-Recommendation bridge live",
  bridgeSegmentationToRecommendation(tenantA).recommendationEngineReady === true
);

gate(
  "G317 — Recommendation intelligence bridges read-only",
  bridgeRecommendationToConsulting(tenantA).autonomousAdviceForbidden === true &&
    bridgeRecommendationToDecision(tenantA).autonomousDecisionForbidden === true &&
    bridgeRecommendationToEvolution(tenantA).autonomousEvolutionForbidden === true
);

gate(
  "G317 — No chat assistant",
  !read(path.join(ROOT, "src/App.jsx")).includes("/chat") &&
    RECOMMENDATION_ENGINE_EXTENSION_POINTS.some(
      (ep) => ep.id === "ai.chat.assistant" && ep.forbiddenForBusinessUser
    )
);

gate(
  "G317 — No technical recommendation UI for business user",
  !read(path.join(BOS, "components/BusinessRecommendationSections.jsx")).includes("recommendation/engine") &&
    !read(path.join(BOS, "components/BusinessRecommendationSections.jsx")).includes("recommendationId")
);

gate(
  "G317 — No individual profiling in recommendation contracts",
  read(path.join(REC, "recommendationEngineContracts.js")).includes("individualProfilingForbidden: true") &&
    read(path.join(REC, "recommendationEngineContracts.js")).includes("humanApprovalRequired: true")
);

const engine = runRecommendationEngine(tenantA);
gate("G317 — Recommendation engine orchestrator", engine.engineVersion === RECOMMENDATION_ENGINE_VERSION);

gate(
  "G317 — No autonomous execution",
  engine.autonomousExecutionForbidden === true && engine.humanApprovalRequired === true
);

const home = buildIntelligenceHomeProjection(tenantA);
gate(
  "G317 — Intelligence home includes recommendations",
  home.hasRecommendations === true || home.recommendationSummary != null
);

const designerFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("/designers/"));
let bypass = false;
for (const file of designerFiles) {
  if (/runRecommendationEngine|analyzeRecommendationContext/.test(file.content)) {
    bypass = true;
    break;
  }
}
gate("G317 — No recommendation engine bypass in designers", !bypass);

try {
  execSync("node scripts/gate-enterprise-segmentation.mjs", { stdio: "pipe" });
  gate("G317 — G316 Segmentation still green", true);
} catch {
  gate("G317 — G316 Segmentation still green", false, "G316 failed");
}

try {
  execSync("node scripts/gate-business-operating-shell.mjs", { stdio: "pipe" });
  gate("G317 — G307 BOS still green", true);
} catch {
  gate("G317 — G307 BOS still green", false, "G307 failed");
}

const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`\nG317: ${passed}/${total} checks passed`);
if (passed !== total) process.exit(1);
