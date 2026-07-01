#!/usr/bin/env node
/**
 * Gate G319 — Continuous Improvement & Optimization Loop MVP (Program 3.21, D-087)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  IMPROVEMENT_ENGINE_VERSION,
  IMPROVEMENT_SIGNAL_TYPES,
  IMPROVEMENT_ENGINE_EXTENSION_POINTS,
  ADOPTION_ENGINE_EXTENSION_POINTS,
  OPTIMIZATION_ENGINE_VERSION,
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
  replayImprovementFromStack,
  retrieveImprovementsByContext,
  summarizeImprovementEngine,
  buildImprovementBosProjection,
  bridgeAdoptionToImprovement,
  bridgeImprovementToConsulting,
  bridgeImprovementToDecision,
  bridgeImprovementToEvolution,
  runImprovementEngine,
  analyzeOptimizationContext,
  retrieveOptimizationsByContext,
  summarizeOptimizationEngine,
  buildOptimizationBosProjection,
  trackImprovementProgress,
  runOptimizationEngine,
  buildIntelligenceHomeProjection,
  registerAuthorizedGroupScope,
} from "../src/intelligence/index.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";

const ROOT = process.cwd();
const IMP = path.join(ROOT, "src/intelligence/improvement/engine");
const OPT = path.join(ROOT, "src/intelligence/optimization/engine");
const BOS = path.join(ROOT, "src/bos");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const improvementFiles = [
  "improvementEngineContracts.js",
  "improvementEngineStore.js",
  "improvementContextAssembly.js",
  "improvementSignals.js",
  "improvementOpportunities.js",
  "improvementPlans.js",
  "improvementMilestones.js",
  "improvementVersioning.js",
  "improvementLifecycle.js",
  "improvementOwnership.js",
  "improvementAuditTrail.js",
  "improvementRetrieval.js",
  "improvementSummarization.js",
  "improvementExplainability.js",
  "improvementTracking.js",
  "improvementBenchmarkRegistry.js",
  "improvementSeedsRegistry.js",
  "improvementLineage.js",
  "adoptionToImprovementIngestion.js",
  "improvementToBosProjection.js",
  "improvementToIntelligenceBridges.js",
  "runImprovementEngine.js",
];

const optimizationFiles = [
  "optimizationEngineContracts.js",
  "optimizationEngineStore.js",
  "optimizationContextAssembly.js",
  "optimizationSignals.js",
  "optimizationOpportunities.js",
  "optimizationPlans.js",
  "optimizationMilestones.js",
  "optimizationVersioning.js",
  "optimizationLifecycle.js",
  "optimizationOwnership.js",
  "optimizationAuditTrail.js",
  "optimizationRetrieval.js",
  "optimizationSummarization.js",
  "optimizationExplainability.js",
  "optimizationTracking.js",
  "optimizationBenchmarkRegistry.js",
  "optimizationSeedsRegistry.js",
  "optimizationLineage.js",
  "improvementToOptimizationIngestion.js",
  "optimizationToBosProjection.js",
  "runOptimizationEngine.js",
];

gate("G319 — Improvement Engine structure exists", improvementFiles.every((f) => exists(path.join(IMP, f))));
gate("G319 — Optimization Engine structure exists", optimizationFiles.every((f) => exists(path.join(OPT, f))));

gate(
  "G319 — Official improvement version",
  IMPROVEMENT_ENGINE_VERSION === "mak-improvement-engine-v1" && Object.keys(IMPROVEMENT_SIGNAL_TYPES).length >= 4
);

gate("G319 — Official optimization version", OPTIMIZATION_ENGINE_VERSION === "mak-optimization-engine-v1");

const tenantA = "gate-imp-tenant-a";
const tenantB = "gate-imp-tenant-b";
const groupId = "gate-imp-group-1";

const envelope = publishDomainEvent({
  tenantId: tenantA,
  eventType: "workflow.action.approve",
  eventCategory: "workflow.operation",
  workflowId: "bwf-imp-gate",
  intentId: "intent-imp-gate",
  assetId: "bwf-imp-gate",
  assetType: "business.asset.workflow",
  actorId: "aprovador",
  businessSummary: "Aprovação registrada para improvement gate.",
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

const retrievedA = retrieveImprovementsByContext(tenantA);
const retrievedBBefore = retrieveImprovementsByContext(tenantB);

gate(
  "G319 — Tenant-scoped improvement isolation",
  retrievedA.loops.length >= 1 && retrievedBBefore.loops.length === 0
);

gate(
  "G319 — Adoption feeds Improvement engine",
  read(path.join(ROOT, "src/intelligence/adoption/engine/recommendationToAdoptionIngestion.js")).includes(
    "ingestAdoptionToImprovement"
  )
);

gate(
  "G319 — business.continuous_improvement extension point implemented",
  ADOPTION_ENGINE_EXTENSION_POINTS.some((ep) => ep.id === "business.continuous_improvement" && ep.implemented === true)
);

gate(
  "G319 — business.optimization_loop extension point implemented",
  IMPROVEMENT_ENGINE_EXTENSION_POINTS.some((ep) => ep.id === "business.optimization_loop" && ep.implemented === true)
);

const replay = replayImprovementFromStack(tenantA);
gate("G319 — Improvement replay from stack", replay.loops?.length >= 1);

gate(
  "G319 — Improvement retrieval explainable",
  retrievedA.explainable === true && retrievedA.humanApprovalRequired === true
);

const summary = summarizeImprovementEngine(tenantA);
gate(
  "G319 — Improvement summarization",
  summary.belongsToEnterprise === true &&
    summary.humanApprovalRequired === true &&
    summary.autonomousExecutionForbidden === true
);

gate(
  "G319 — All improvement loops require human approval",
  retrievedA.loops.every((l) => l.requiresHumanApproval === true)
);

const bosProjection = buildImprovementBosProjection(tenantA);
gate(
  "G319 — Improvement-to-BOS projection",
  bosProjection.explainable === true &&
    !JSON.stringify(bosProjection).includes("prompt") &&
    !JSON.stringify(bosProjection).includes("embedding") &&
    !JSON.stringify(bosProjection).includes("loopId")
);

gate(
  "G319 — BOS wired to improvement sections",
  read(path.join(BOS, "pages/BosHomePage.jsx")).includes("ImprovementCyclesSection") &&
    exists(path.join(BOS, "components/BusinessImprovementSections.jsx"))
);

registerAuthorizedGroupScope({
  groupId,
  ownerClientId: "client-gate",
  authorizedTenantIds: [tenantA, tenantB],
});

ingestEvolutionToBusinessDna(tenantB);
ingestDnaToSegmentation(tenantB);
ingestSegmentationToRecommendation(tenantB);
ingestRecommendationToAdoption(tenantB);
ingestAdoptionToImprovement(tenantB);
ingestAdoptionToImprovement(tenantA, { groupId });

const optimizationResult = analyzeOptimizationContext(tenantA, { groupId });
gate("G319 — Optimization loop from improvement", optimizationResult.loops?.length >= 1);

const optRetrieved = retrieveOptimizationsByContext(tenantA);
gate(
  "G319 — Optimization retrieval explainable",
  optRetrieved.explainable === true && optRetrieved.autonomousExecutionForbidden === true
);

const optSummary = summarizeOptimizationEngine(tenantA);
gate(
  "G319 — Optimization summarization",
  optSummary.belongsToEnterprise === true && optSummary.humanApprovalRequired === true
);

const optBos = buildOptimizationBosProjection(tenantA);
gate(
  "G319 — Optimization-to-BOS projection",
  optBos.explainable === true && optBos.operationalFeedbackLoop != null && !JSON.stringify(optBos).includes("loopId")
);

const tracking = trackImprovementProgress(tenantA);
gate("G319 — Improvement tracking", tracking.explainable === true && tracking.individualProfilingForbidden === true);

gate(
  "G319 — Adoption-to-Improvement bridge live",
  bridgeAdoptionToImprovement(tenantA).improvementEngineReady === true
);

gate(
  "G319 — Improvement intelligence bridges read-only",
  bridgeImprovementToConsulting(tenantA).autonomousAdviceForbidden === true &&
    bridgeImprovementToDecision(tenantA).autonomousDecisionForbidden === true &&
    bridgeImprovementToEvolution(tenantA).autonomousEvolutionForbidden === true
);

gate(
  "G319 — No chat assistant",
  !read(path.join(ROOT, "src/App.jsx")).includes("/chat") &&
    IMPROVEMENT_ENGINE_EXTENSION_POINTS.some((ep) => ep.id === "ai.chat.assistant" && ep.forbiddenForBusinessUser)
);

gate(
  "G319 — No technical improvement UI for business user",
  !read(path.join(BOS, "components/BusinessImprovementSections.jsx")).includes("improvement/engine") &&
    !read(path.join(BOS, "components/BusinessImprovementSections.jsx")).includes("loopId")
);

gate(
  "G319 — No individual profiling in improvement contracts",
  read(path.join(IMP, "improvementEngineContracts.js")).includes("individualProfilingForbidden: true") &&
    read(path.join(IMP, "improvementEngineContracts.js")).includes("humanApprovalRequired: true")
);

gate(
  "G319 — No autonomous optimization",
  read(path.join(OPT, "optimizationEngineContracts.js")).includes("autonomousExecutionForbidden: true")
);

const improvementEngine = runImprovementEngine(tenantA);
gate("G319 — Improvement engine orchestrator", improvementEngine.engineVersion === IMPROVEMENT_ENGINE_VERSION);

gate(
  "G319 — No autonomous improvement execution",
  improvementEngine.autonomousExecutionForbidden === true && improvementEngine.humanApprovalRequired === true
);

const optEngine = runOptimizationEngine(tenantA);
gate("G319 — Optimization engine orchestrator", optEngine.engineVersion === OPTIMIZATION_ENGINE_VERSION);

const home = buildIntelligenceHomeProjection(tenantA, { groupId });
gate(
  "G319 — Intelligence home includes improvement loop",
  home.hasImprovement === true || home.improvementSummary != null
);

gate(
  "G319 — Intelligence home includes optimization loop",
  home.hasOptimization === true || home.optimizationSummary != null
);

const designerFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("/designers/"));
let bypass = false;
for (const file of designerFiles) {
  if (/runImprovementEngine|analyzeImprovementContext|runOptimizationEngine/.test(file.content)) {
    bypass = true;
    break;
  }
}
gate("G319 — No improvement/optimization engine bypass in designers", !bypass);

try {
  execSync("node scripts/gate-enterprise-adoption-corporate-intelligence.mjs", { stdio: "pipe" });
  gate("G319 — G318 Adoption still green", true);
} catch {
  gate("G319 — G318 Adoption still green", false, "G318 failed");
}

try {
  execSync("node scripts/gate-business-operating-shell.mjs", { stdio: "pipe" });
  gate("G319 — G307 BOS still green", true);
} catch {
  gate("G319 — G307 BOS still green", false, "G307 failed");
}

const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`\nG319: ${passed}/${total} checks passed`);
if (passed !== total) process.exit(1);
