#!/usr/bin/env node
/**
 * Gate G320 — Portfolio Intelligence & Command Center MVP (Program 3.22, D-088)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  PORTFOLIO_INTELLIGENCE_VERSION,
  PORTFOLIO_INTELLIGENCE_EXTENSION_POINTS,
  OPTIMIZATION_ENGINE_EXTENSION_POINTS,
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
  retrieveLatestPortfolioIntelligence,
  summarizePortfolioIntelligenceEngine,
  buildPortfolioIntelligenceBosProjection,
  bridgePortfolioToConsulting,
  bridgePortfolioToDecision,
  bridgePortfolioToEvolution,
  runPortfolioIntelligenceEngine,
  authorizePortfolioScope,
  buildIntelligenceHomeProjection,
  registerAuthorizedGroupScope,
} from "../src/intelligence/index.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";

const ROOT = process.cwd();
const PORT = path.join(ROOT, "src/intelligence/portfolio/engine");
const OPT = path.join(ROOT, "src/intelligence/optimization/engine");
const BOS = path.join(ROOT, "src/bos");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const portfolioFiles = [
  "portfolioIntelligenceContracts.js",
  "portfolioIntelligenceStore.js",
  "portfolioScopeAuthorization.js",
  "portfolioContextAssembly.js",
  "portfolioHealthAggregation.js",
  "portfolioMaturityAggregation.js",
  "portfolioEvolutionAggregation.js",
  "portfolioRecommendationAggregation.js",
  "portfolioAdoptionAggregation.js",
  "portfolioImprovementAggregation.js",
  "portfolioOptimizationAggregation.js",
  "portfolioComparisonEngine.js",
  "portfolioBenchmarkRegistry.js",
  "portfolioPatternRegistry.js",
  "portfolioOpportunityRegistry.js",
  "portfolioReferenceRegistry.js",
  "portfolioVarianceRegistry.js",
  "portfolioAlertRegistry.js",
  "portfolioRankingEngine.js",
  "portfolioSummaryEngine.js",
  "portfolioExplainability.js",
  "portfolioLineage.js",
  "portfolioVersioning.js",
  "portfolioLifecycle.js",
  "portfolioOwnership.js",
  "portfolioAuditTrail.js",
  "portfolioRetrieval.js",
  "portfolioSummarization.js",
  "authorizedGroupDashboard.js",
  "corporateCommandCenterView.js",
  "multiCompanyHealthView.js",
  "crossCompanyTrendView.js",
  "referenceCompanyView.js",
  "corporateStandardizationView.js",
  "groupCapabilityRadar.js",
  "groupEvolutionTimeline.js",
  "optimizationToPortfolioIngestion.js",
  "portfolioToBosProjection.js",
  "portfolioToIntelligenceBridges.js",
  "runPortfolioIntelligenceEngine.js",
];

gate("G320 — Portfolio Intelligence Engine structure exists", portfolioFiles.every((f) => exists(path.join(PORT, f))));

gate(
  "G320 — Official portfolio intelligence version",
  PORTFOLIO_INTELLIGENCE_VERSION === "mak-portfolio-intelligence-v1"
);

const tenantA = "gate-portfolio-tenant-a";
const tenantB = "gate-portfolio-tenant-b";
const groupId = "gate-portfolio-group-1";

const envelope = publishDomainEvent({
  tenantId: tenantA,
  eventType: "workflow.action.approve",
  eventCategory: "workflow.operation",
  workflowId: "bwf-portfolio-gate",
  intentId: "intent-portfolio-gate",
  assetId: "bwf-portfolio-gate",
  assetType: "business.asset.workflow",
  actorId: "aprovador",
  businessSummary: "Aprovação registrada para portfolio gate.",
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
  ownerClientId: "client-gate-portfolio",
  authorizedTenantIds: [tenantA, tenantB],
});

const unauthorized = authorizePortfolioScope("unauthorized-group", tenantA);
gate("G320 — Unauthorized group scope rejected", unauthorized.authorized === false);

ingestEvolutionToBusinessDna(tenantB);
ingestDnaToSegmentation(tenantB);
ingestSegmentationToRecommendation(tenantB);
ingestRecommendationToAdoption(tenantB);
ingestAdoptionToImprovement(tenantB);

const optimizationResult = analyzeOptimizationContext(tenantA, { groupId });
gate("G320 — Optimization loop from improvement", optimizationResult.loops?.length >= 1);

gate(
  "G320 — Optimization feeds Portfolio Intelligence",
  read(path.join(OPT, "improvementToOptimizationIngestion.js")).includes("ingestOptimizationToPortfolio")
);

gate(
  "G320 — business.portfolio_intelligence extension point implemented",
  OPTIMIZATION_ENGINE_EXTENSION_POINTS.some((ep) => ep.id === "business.portfolio_intelligence" && ep.implemented === true)
);

const portfolioResult = ingestOptimizationToPortfolio(groupId, tenantA, { optimizationLoopId: optimizationResult.loops?.[0]?.loopId });
gate("G320 — Portfolio intelligence analyzed for authorized group", portfolioResult.authorized === true);

const retrievedA = retrieveLatestPortfolioIntelligence(groupId);
gate(
  "G320 — Portfolio retrieval explainable",
  retrievedA.explainable === true && retrievedA.unauthorizedAggregationForbidden === true
);

const summary = summarizePortfolioIntelligenceEngine(groupId);
gate(
  "G320 — Portfolio summarization",
  summary.belongsToEnterprise === true &&
    summary.unauthorizedAggregationForbidden === true &&
    summary.crossTenantMixingForbidden === true
);

gate(
  "G320 — Portfolio views require authorization",
  read(path.join(PORT, "portfolioIntelligenceContracts.js")).includes("groupScopedRequiresAuthorization: true")
);

const bosProjection = buildPortfolioIntelligenceBosProjection(groupId, tenantA);
gate(
  "G320 — Portfolio-to-BOS projection",
  bosProjection.explainable === true &&
    !JSON.stringify(bosProjection).includes("prompt") &&
    !JSON.stringify(bosProjection).includes("embedding") &&
    !JSON.stringify(bosProjection).includes("viewId") &&
    !JSON.stringify(bosProjection).includes("loopId")
);

gate(
  "G320 — BOS wired to portfolio sections",
  read(path.join(BOS, "pages/BosHomePage.jsx")).includes("PortfolioCommandCenterSection") &&
    exists(path.join(BOS, "components/BusinessPortfolioSections.jsx"))
);

gate(
  "G320 — No technical portfolio UI for business user",
  !read(path.join(BOS, "components/BusinessPortfolioSections.jsx")).includes("portfolio/engine") &&
    !read(path.join(BOS, "components/BusinessPortfolioSections.jsx")).includes("viewId")
);

gate(
  "G320 — Portfolio intelligence bridges read-only",
  bridgePortfolioToConsulting(groupId, tenantA).autonomousAdviceForbidden === true &&
    bridgePortfolioToDecision(groupId, tenantA).autonomousDecisionForbidden === true &&
    bridgePortfolioToEvolution(groupId, tenantA).autonomousEvolutionForbidden === true
);

gate(
  "G320 — No chat assistant",
  !read(path.join(ROOT, "src/App.jsx")).includes("/chat") &&
    PORTFOLIO_INTELLIGENCE_EXTENSION_POINTS.some((ep) => ep.id === "ai.chat.assistant" && ep.forbiddenForBusinessUser)
);

gate(
  "G320 — No individual profiling in portfolio contracts",
  read(path.join(PORT, "portfolioIntelligenceContracts.js")).includes("individualProfilingForbidden: true") &&
    read(path.join(PORT, "portfolioIntelligenceContracts.js")).includes("surveillanceForbidden: true")
);

gate(
  "G320 — No autonomous portfolio execution",
  read(path.join(PORT, "portfolioIntelligenceContracts.js")).includes("autonomousExecutionForbidden: true")
);

const portfolioEngine = runPortfolioIntelligenceEngine(groupId, tenantA);
gate("G320 — Portfolio engine orchestrator", portfolioEngine.engineVersion === PORTFOLIO_INTELLIGENCE_VERSION);

gate(
  "G320 — No autonomous portfolio command",
  portfolioEngine.autonomousExecutionForbidden === true && portfolioEngine.humanApprovalRequired === true
);

const home = buildIntelligenceHomeProjection(tenantA, { groupId });
gate(
  "G320 — Intelligence home includes portfolio command center",
  home.hasPortfolioIntelligence === true || home.portfolioSummary != null
);

gate(
  "G320 — Cross-tenant mixing forbidden in scope auth",
  read(path.join(PORT, "portfolioScopeAuthorization.js")).includes("crossTenantMixingForbidden: true")
);

const designerFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("/designers/"));
let bypass = false;
for (const file of designerFiles) {
  if (/runPortfolioIntelligenceEngine|analyzePortfolioIntelligenceContext|ingestOptimizationToPortfolio/.test(file.content)) {
    bypass = true;
    break;
  }
}
gate("G320 — No portfolio engine bypass in designers", !bypass);

try {
  execSync("node scripts/gate-enterprise-continuous-improvement-optimization.mjs", { stdio: "pipe" });
  gate("G320 — G319 Optimization still green", true);
} catch {
  gate("G320 — G319 Optimization still green", false, "G319 failed");
}

try {
  execSync("node scripts/gate-business-operating-shell.mjs", { stdio: "pipe" });
  gate("G320 — G307 BOS still green", true);
} catch {
  gate("G320 — G307 BOS still green", false, "G307 failed");
}

const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`\nG320: ${passed}/${total} checks passed`);
if (passed !== total) process.exit(1);
