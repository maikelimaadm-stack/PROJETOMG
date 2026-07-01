#!/usr/bin/env node
/**
 * Gate G318 — Adoption Tracking & Corporate Intelligence MVP (Program 3.20, D-086)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  ADOPTION_ENGINE_VERSION,
  ADOPTION_STATUS_TYPES,
  ADOPTION_ENGINE_EXTENSION_POINTS,
  RECOMMENDATION_ENGINE_EXTENSION_POINTS,
  CORPORATE_INTELLIGENCE_VERSION,
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
  replayAdoptionFromStack,
  retrieveAdoptionsByContext,
  summarizeAdoptionEngine,
  buildAdoptionBosProjection,
  bridgeRecommendationToAdoption,
  bridgeAdoptionToConsulting,
  bridgeAdoptionToDecision,
  bridgeAdoptionToEvolution,
  runAdoptionEngine,
  analyzeCorporateIntelligenceContext,
  retrieveCorporateIntelligenceByContext,
  summarizeCorporateIntelligenceEngine,
  buildCorporateIntelligenceBosProjection,
  buildGroupAdoptionComparison,
  trackRecommendationOutcomes,
  runCorporateIntelligenceEngine,
  buildIntelligenceHomeProjection,
  registerAuthorizedGroupScope,
} from "../src/intelligence/index.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";

const ROOT = process.cwd();
const ADOPT = path.join(ROOT, "src/intelligence/adoption/engine");
const CORP = path.join(ROOT, "src/intelligence/corporate/engine");
const BOS = path.join(ROOT, "src/bos");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const adoptionFiles = [
  "adoptionEngineContracts.js",
  "adoptionEngineStore.js",
  "adoptionContextAssembly.js",
  "adoptionPlans.js",
  "adoptionMilestones.js",
  "adoptionStatus.js",
  "adoptionProgress.js",
  "adoptionEvidence.js",
  "adoptionOutcomes.js",
  "adoptionTimeline.js",
  "adoptionLineage.js",
  "adoptionVersioning.js",
  "adoptionLifecycle.js",
  "adoptionOwnership.js",
  "adoptionAuditTrail.js",
  "adoptionRetrieval.js",
  "adoptionSummarization.js",
  "adoptionExplainability.js",
  "adoptionRegistry.js",
  "recommendationToAdoptionIngestion.js",
  "adoptionToBosProjection.js",
  "adoptionToIntelligenceBridges.js",
  "runAdoptionEngine.js",
];

const corporateFiles = [
  "corporateIntelligenceContracts.js",
  "corporateIntelligenceStore.js",
  "corporateIntelligenceContextAssembly.js",
  "corporateHealthAggregation.js",
  "corporateBenchmarkRegistry.js",
  "corporatePatternRegistry.js",
  "corporateReferenceRegistry.js",
  "corporateVarianceRegistry.js",
  "corporateOpportunityRegistry.js",
  "corporateIntelligenceExplainability.js",
  "corporateIntelligenceLineage.js",
  "corporateIntelligenceVersioning.js",
  "corporateIntelligenceLifecycle.js",
  "corporateIntelligenceOwnership.js",
  "corporateIntelligenceAuditTrail.js",
  "authorizedGroupInsights.js",
  "groupAdoptionComparison.js",
  "replicationAdoptionTracking.js",
  "recommendationOutcomeTracking.js",
  "corporateIntelligenceRetrieval.js",
  "corporateIntelligenceSummarization.js",
  "adoptionToCorporateIngestion.js",
  "corporateIntelligenceToBosProjection.js",
  "runCorporateIntelligenceEngine.js",
];

gate(
  "G318 — Adoption Engine structure exists",
  adoptionFiles.every((f) => exists(path.join(ADOPT, f)))
);

gate(
  "G318 — Corporate Intelligence structure exists",
  corporateFiles.every((f) => exists(path.join(CORP, f)))
);

gate(
  "G318 — Official adoption version",
  ADOPTION_ENGINE_VERSION === "mak-adoption-engine-v1" &&
    Object.keys(ADOPTION_STATUS_TYPES).length >= 5
);

gate(
  "G318 — Official corporate intelligence version",
  CORPORATE_INTELLIGENCE_VERSION === "mak-corporate-intelligence-v1"
);

const tenantA = "gate-adopt-tenant-a";
const tenantB = "gate-adopt-tenant-b";
const groupId = "gate-adopt-group-1";

const envelope = publishDomainEvent({
  tenantId: tenantA,
  eventType: "workflow.action.approve",
  eventCategory: "workflow.operation",
  workflowId: "bwf-adopt-gate",
  intentId: "intent-adopt-gate",
  assetId: "bwf-adopt-gate",
  assetType: "business.asset.workflow",
  actorId: "aprovador",
  businessSummary: "Aprovação registrada para adoption gate.",
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

const retrievedA = retrieveAdoptionsByContext(tenantA);
const retrievedBBefore = retrieveAdoptionsByContext(tenantB);

gate(
  "G318 — Tenant-scoped adoption isolation",
  retrievedA.adoptions.length >= 1 && retrievedBBefore.adoptions.length === 0
);

gate(
  "G318 — Recommendation feeds Adoption engine",
  read(path.join(ROOT, "src/intelligence/recommendation/engine/segmentationToRecommendationIngestion.js")).includes(
    "ingestRecommendationToAdoption"
  )
);

gate(
  "G318 — business.adoption extension point implemented",
  RECOMMENDATION_ENGINE_EXTENSION_POINTS.some((ep) => ep.id === "business.adoption" && ep.implemented === true)
);

gate(
  "G318 — business.corporate_intelligence extension point implemented",
  ADOPTION_ENGINE_EXTENSION_POINTS.some((ep) => ep.id === "business.corporate_intelligence" && ep.implemented === true)
);

const replay = replayAdoptionFromStack(tenantA);
gate("G318 — Adoption replay from stack", replay.adoptions?.length >= 1);

gate(
  "G318 — Adoption retrieval explainable",
  retrievedA.explainable === true && retrievedA.humanApprovalRequired === true
);

const summary = summarizeAdoptionEngine(tenantA);
gate(
  "G318 — Adoption summarization",
  summary.belongsToEnterprise === true &&
    summary.humanApprovalRequired === true &&
    summary.autonomousExecutionForbidden === true
);

gate(
  "G318 — All adoptions require human approval",
  retrievedA.adoptions.every((a) => a.requiresHumanApproval === true)
);

const bosProjection = buildAdoptionBosProjection(tenantA);
gate(
  "G318 — Adoption-to-BOS projection",
  bosProjection.explainable === true &&
    !JSON.stringify(bosProjection).includes("prompt") &&
    !JSON.stringify(bosProjection).includes("embedding") &&
    !JSON.stringify(bosProjection).includes("adoptionId")
);

gate(
  "G318 — BOS wired to adoption sections",
  read(path.join(BOS, "pages/BosHomePage.jsx")).includes("AdoptedRecommendationsSection") &&
    exists(path.join(BOS, "components/BusinessAdoptionSections.jsx"))
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
ingestRecommendationToAdoption(tenantA, { groupId });

const corporateResult = analyzeCorporateIntelligenceContext(groupId, tenantA);
gate(
  "G318 — Corporate intelligence requires authorization",
  corporateResult.authorized === true &&
    corporateResult.unauthorizedAggregationForbidden !== false
);

const corpRetrieved = retrieveCorporateIntelligenceByContext(groupId);
gate(
  "G318 — Corporate intelligence tenant isolation",
  corpRetrieved.crossTenantMixingForbidden === true &&
    corpRetrieved.unauthorizedAggregationForbidden === true
);

const groupComparison = buildGroupAdoptionComparison(groupId, tenantA);
gate(
  "G318 — Group adoption comparison authorized only",
  groupComparison.authorized === true && groupComparison.comparisons.length >= 2
);

const recommendationOutcomes = trackRecommendationOutcomes(tenantA);
gate(
  "G318 — Recommendation outcome tracking",
  recommendationOutcomes.explainable === true && recommendationOutcomes.outcomes.length >= 1
);

const corpSummary = summarizeCorporateIntelligenceEngine(groupId);
gate(
  "G318 — Corporate intelligence summarization",
  corpSummary.belongsToEnterprise === true && corpSummary.crossTenantMixingForbidden === true
);

const corpBos = buildCorporateIntelligenceBosProjection(groupId, tenantA);
gate(
  "G318 — Corporate-to-BOS projection",
  corpBos.explainable === true &&
    !JSON.stringify(corpBos).includes("viewId") &&
    corpBos.unauthorizedAggregationForbidden === true
);

gate(
  "G318 — Recommendation-to-Adoption bridge live",
  bridgeRecommendationToAdoption(tenantA).adoptionEngineReady === true
);

gate(
  "G318 — Adoption intelligence bridges read-only",
  bridgeAdoptionToConsulting(tenantA).autonomousAdviceForbidden === true &&
    bridgeAdoptionToDecision(tenantA).autonomousDecisionForbidden === true &&
    bridgeAdoptionToEvolution(tenantA).autonomousEvolutionForbidden === true
);

gate(
  "G318 — No chat assistant",
  !read(path.join(ROOT, "src/App.jsx")).includes("/chat") &&
    ADOPTION_ENGINE_EXTENSION_POINTS.some((ep) => ep.id === "ai.chat.assistant" && ep.forbiddenForBusinessUser)
);

gate(
  "G318 — No technical adoption UI for business user",
  !read(path.join(BOS, "components/BusinessAdoptionSections.jsx")).includes("adoption/engine") &&
    !read(path.join(BOS, "components/BusinessAdoptionSections.jsx")).includes("adoptionId")
);

gate(
  "G318 — No individual profiling in adoption contracts",
  read(path.join(ADOPT, "adoptionEngineContracts.js")).includes("individualProfilingForbidden: true") &&
    read(path.join(ADOPT, "adoptionEngineContracts.js")).includes("humanApprovalRequired: true")
);

gate(
  "G318 — No surveillance in adoption contracts",
  read(path.join(ADOPT, "adoptionEngineContracts.js")).includes("surveillanceForbidden: true")
);

const adoptionEngine = runAdoptionEngine(tenantA);
gate("G318 — Adoption engine orchestrator", adoptionEngine.engineVersion === ADOPTION_ENGINE_VERSION);

gate(
  "G318 — No autonomous adoption execution",
  adoptionEngine.autonomousExecutionForbidden === true && adoptionEngine.humanApprovalRequired === true
);

const corpEngine = runCorporateIntelligenceEngine(groupId, tenantA);
gate(
  "G318 — Corporate intelligence orchestrator",
  corpEngine.engineVersion === CORPORATE_INTELLIGENCE_VERSION
);

const home = buildIntelligenceHomeProjection(tenantA, { groupId });
gate(
  "G318 — Intelligence home includes adoption",
  home.hasAdoptions === true || home.adoptionSummary != null
);

gate(
  "G318 — Intelligence home includes corporate intelligence with groupId",
  home.hasCorporateIntelligence === true || home.corporateSummary != null
);

const designerFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("/designers/"));
let bypass = false;
for (const file of designerFiles) {
  if (/runAdoptionEngine|analyzeAdoptionContext|runCorporateIntelligenceEngine/.test(file.content)) {
    bypass = true;
    break;
  }
}
gate("G318 — No adoption/corporate engine bypass in designers", !bypass);

try {
  execSync("node scripts/gate-enterprise-recommendation-replication.mjs", { stdio: "pipe" });
  gate("G318 — G317 Recommendation still green", true);
} catch {
  gate("G318 — G317 Recommendation still green", false, "G317 failed");
}

try {
  execSync("node scripts/gate-business-operating-shell.mjs", { stdio: "pipe" });
  gate("G318 — G307 BOS still green", true);
} catch {
  gate("G318 — G307 BOS still green", false, "G307 failed");
}

const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`\nG318: ${passed}/${total} checks passed`);
if (passed !== total) process.exit(1);
