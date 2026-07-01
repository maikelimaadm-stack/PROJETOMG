#!/usr/bin/env node
/**
 * Gate G321 — Platform Governance & Portfolio Control Center MVP (Program 3.23, D-089)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  PLATFORM_GOVERNANCE_VERSION,
  PLATFORM_GOVERNANCE_EXTENSION_POINTS,
  PORTFOLIO_INTELLIGENCE_EXTENSION_POINTS,
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
  retrieveLatestGovernance,
  summarizePlatformGovernanceEngine,
  buildPlatformGovernanceBosProjection,
  bridgeGovernanceToPortfolio,
  bridgeGovernanceToConsulting,
  bridgeGovernanceToDecision,
  runPlatformGovernanceEngine,
  enforceCrossTenantAccessGuard,
  enforceDataExposureGuard,
  buildIntelligenceHomeProjection,
  registerAuthorizedGroupScope,
} from "../src/intelligence/index.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";

const ROOT = process.cwd();
const GOV = path.join(ROOT, "src/intelligence/governance/engine");
const PORT = path.join(ROOT, "src/intelligence/portfolio/engine");
const BOS = path.join(ROOT, "src/bos");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const governanceFiles = [
  "platformGovernanceContracts.js",
  "platformGovernanceStore.js",
  "governanceContextAssembly.js",
  "authorizedGroupScopeManagement.js",
  "tenantVisibilityRules.js",
  "permissionRegistry.js",
  "policyRegistry.js",
  "retentionPolicyEngine.js",
  "auditPolicyEngine.js",
  "compliancePolicyEngine.js",
  "adminScopeRegistry.js",
  "rolePermissionMatrix.js",
  "groupAuthorizationRegistry.js",
  "crossTenantAccessGuard.js",
  "dataExposureGuard.js",
  "retentionEnforcementRegistry.js",
  "policyComplianceRegistry.js",
  "auditReviewRegistry.js",
  "governanceControlCenter.js",
  "portfolioControlCenter.js",
  "governanceDocument.js",
  "governanceLifecycle.js",
  "governanceVersioning.js",
  "governanceOwnership.js",
  "governanceAuditTrail.js",
  "governanceRetrieval.js",
  "governanceSummarization.js",
  "governanceExplainability.js",
  "governanceSeedsRegistry.js",
  "governanceSummaryEngine.js",
  "portfolioToGovernanceIngestion.js",
  "governanceToBosProjection.js",
  "governanceToPortfolioBridge.js",
  "governanceToIntelligenceBridges.js",
  "runPlatformGovernanceEngine.js",
];

gate("G321 — Platform Governance Engine structure exists", governanceFiles.every((f) => exists(path.join(GOV, f))));

gate(
  "G321 — Official platform governance version",
  PLATFORM_GOVERNANCE_VERSION === "mak-platform-governance-v1"
);

const tenantA = "gate-gov-tenant-a";
const tenantB = "gate-gov-tenant-b";
const groupId = "gate-gov-group-1";

const envelope = publishDomainEvent({
  tenantId: tenantA,
  eventType: "workflow.action.approve",
  eventCategory: "workflow.operation",
  workflowId: "bwf-gov-gate",
  intentId: "intent-gov-gate",
  assetId: "bwf-gov-gate",
  assetType: "business.asset.workflow",
  actorId: "aprovador",
  businessSummary: "Aprovação registrada para governance gate.",
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
  ownerClientId: "client-gate-gov",
  authorizedTenantIds: [tenantA, tenantB],
});

ingestEvolutionToBusinessDna(tenantB);
ingestDnaToSegmentation(tenantB);
ingestSegmentationToRecommendation(tenantB);
ingestRecommendationToAdoption(tenantB);
ingestAdoptionToImprovement(tenantB);

analyzeOptimizationContext(tenantA, { groupId });
ingestOptimizationToPortfolio(groupId, tenantA);

gate(
  "G321 — Portfolio feeds Platform Governance",
  read(path.join(PORT, "optimizationToPortfolioIngestion.js")).includes("ingestPortfolioToGovernance")
);

gate(
  "G321 — business.platform_governance extension point implemented",
  PORTFOLIO_INTELLIGENCE_EXTENSION_POINTS.some((ep) => ep.id === "business.platform_governance" && ep.implemented === true)
);

const govResult = ingestPortfolioToGovernance(groupId, tenantA);
gate("G321 — Platform governance analyzed for authorized group", govResult.authorized === true);

const crossTenantBlocked = enforceCrossTenantAccessGuard(groupId, govResult.context ?? { authorized: true, authorizedTenantIds: [tenantA] }, ["unauthorized-tenant"]);
gate("G321 — Cross-tenant access guard blocks unauthorized", crossTenantBlocked.allowed === false);

const retrieved = retrieveLatestGovernance(groupId);
gate(
  "G321 — Governance retrieval explainable",
  retrieved.explainable === true && retrieved.policyChangeRequiresAudit === true
);

const summary = summarizePlatformGovernanceEngine(groupId);
gate(
  "G321 — Governance summarization",
  summary.belongsToPlatform === true &&
    summary.policyChangeRequiresAudit === true &&
    summary.crossTenantMixingForbidden === true
);

gate(
  "G321 — Policy change requires audit",
  read(path.join(GOV, "platformGovernanceContracts.js")).includes("policyChangeRequiresAudit: true")
);

const bosProjection = buildPlatformGovernanceBosProjection(groupId, tenantA);
gate(
  "G321 — Governance-to-BOS projection",
  bosProjection.explainable === true &&
    !JSON.stringify(bosProjection).includes("prompt") &&
    !JSON.stringify(bosProjection).includes("embedding") &&
    !JSON.stringify(bosProjection).includes("documentId") &&
    !JSON.stringify(bosProjection).includes("policyId")
);

gate(
  "G321 — BOS wired to governance sections",
  read(path.join(BOS, "pages/BosHomePage.jsx")).includes("GovernanceControlCenterSection") &&
    exists(path.join(BOS, "components/BusinessGovernanceSections.jsx"))
);

gate(
  "G321 — No technical governance UI for business user",
  !read(path.join(BOS, "components/BusinessGovernanceSections.jsx")).includes("governance/engine") &&
    !read(path.join(BOS, "components/BusinessGovernanceSections.jsx")).includes("documentId")
);

gate(
  "G321 — Governance bridges read-only",
  bridgeGovernanceToConsulting(groupId, tenantA).autonomousAdviceForbidden === true &&
    bridgeGovernanceToDecision(groupId, tenantA).autonomousDecisionForbidden === true &&
    bridgeGovernanceToPortfolio(groupId, tenantA).autonomousPortfolioForbidden === true
);

gate(
  "G321 — No chat assistant",
  !read(path.join(ROOT, "src/App.jsx")).includes("/chat") &&
    PLATFORM_GOVERNANCE_EXTENSION_POINTS.some((ep) => ep.id === "ai.chat.assistant" && ep.forbiddenForBusinessUser)
);

gate(
  "G321 — No individual profiling in governance contracts",
  read(path.join(GOV, "platformGovernanceContracts.js")).includes("individualProfilingForbidden: true") &&
    read(path.join(GOV, "platformGovernanceContracts.js")).includes("surveillanceForbidden: true")
);

gate(
  "G321 — No autonomous governance execution",
  read(path.join(GOV, "platformGovernanceContracts.js")).includes("autonomousExecutionForbidden: true")
);

const govEngine = runPlatformGovernanceEngine(groupId, tenantA);
gate("G321 — Platform governance orchestrator", govEngine.engineVersion === PLATFORM_GOVERNANCE_VERSION);

gate(
  "G321 — No autonomous policy change",
  govEngine.autonomousExecutionForbidden === true && govEngine.humanApprovalRequired === true
);

const exposure = enforceDataExposureGuard(groupId, govEngine.context, "corporate_view");
gate("G321 — Data exposure guard explainable", exposure.explainable === true);

const home = buildIntelligenceHomeProjection(tenantA, { groupId });
gate(
  "G321 — Intelligence home includes governance control center",
  home.hasPlatformGovernance === true || home.governanceSummary != null
);

gate(
  "G321 — Cross-tenant mixing forbidden in governance",
  read(path.join(GOV, "crossTenantAccessGuard.js")).includes("crossTenantMixingForbidden: true")
);

const designerFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("/designers/"));
let bypass = false;
for (const file of designerFiles) {
  if (/runPlatformGovernanceEngine|analyzePlatformGovernanceContext|ingestPortfolioToGovernance/.test(file.content)) {
    bypass = true;
    break;
  }
}
gate("G321 — No governance engine bypass in designers", !bypass);

try {
  execSync("node scripts/gate-enterprise-portfolio-intelligence-command-center.mjs", { stdio: "pipe" });
  gate("G321 — G320 Portfolio still green", true);
} catch {
  gate("G321 — G320 Portfolio still green", false, "G320 failed");
}

try {
  execSync("node scripts/gate-business-operating-shell.mjs", { stdio: "pipe" });
  gate("G321 — G307 BOS still green", true);
} catch {
  gate("G321 — G307 BOS still green", false, "G307 failed");
}

const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`\nG321: ${passed}/${total} checks passed`);
if (passed !== total) process.exit(1);
