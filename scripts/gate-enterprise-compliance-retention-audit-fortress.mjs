#!/usr/bin/env node
/**
 * Gate G322 — Compliance, Retention & Audit Fortress MVP (Program 3.24, D-090)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  COMPLIANCE_FORTRESS_VERSION,
  FORTRESS_EXTENSION_POINTS,
  PLATFORM_GOVERNANCE_EXTENSION_POINTS,
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
  retrieveLatestFortress,
  summarizeFortressEngine,
  buildFortressBosProjection,
  bridgeFortressToGovernance,
  bridgeFortressToConsulting,
  bridgeFortressToDecision,
  runComplianceFortressEngine,
  buildIntelligenceHomeProjection,
  registerAuthorizedGroupScope,
} from "../src/intelligence/index.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";

const ROOT = process.cwd();
const FORT = path.join(ROOT, "src/intelligence/fortress/engine");
const GOV = path.join(ROOT, "src/intelligence/governance/engine");
const BOS = path.join(ROOT, "src/bos");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const fortressFiles = [
  "complianceFortressContracts.js",
  "fortressStore.js",
  "complianceContextAssembly.js",
  "retentionContextAssembly.js",
  "auditContextAssembly.js",
  "complianceRulesRegistry.js",
  "retentionRulesRegistry.js",
  "auditRulesRegistry.js",
  "dataExposureRules.js",
  "policyEnforcementRules.js",
  "retentionScheduleRegistry.js",
  "expiryExpungeRegistry.js",
  "legalHoldRegistry.js",
  "archiveRegistry.js",
  "auditEventRegistry.js",
  "fortressAuditReviewRegistry.js",
  "complianceReviewRegistry.js",
  "exceptionRegistry.js",
  "complianceExplainability.js",
  "retentionExplainability.js",
  "auditExplainability.js",
  "fortressLineage.js",
  "fortressVersioning.js",
  "fortressLifecycle.js",
  "fortressOwnership.js",
  "auditFortressAuditTrail.js",
  "fortressRetrieval.js",
  "fortressSummarization.js",
  "complianceDocument.js",
  "retentionDocument.js",
  "auditDocument.js",
  "fortressSeedsRegistry.js",
  "fortressSummaryEngine.js",
  "governanceToFortressIngestion.js",
  "fortressToBosProjection.js",
  "fortressToGovernanceBridge.js",
  "fortressToPortfolioBridge.js",
  "fortressToIntelligenceBridges.js",
  "runComplianceFortressEngine.js",
];

gate("G322 — Fortress Engine structure exists", fortressFiles.every((f) => exists(path.join(FORT, f))));

gate(
  "G322 — Official fortress version",
  COMPLIANCE_FORTRESS_VERSION === "mak-compliance-fortress-v1"
);

const tenantA = "gate-fortress-tenant-a";
const tenantB = "gate-fortress-tenant-b";
const groupId = "gate-fortress-group-1";

const envelope = publishDomainEvent({
  tenantId: tenantA,
  eventType: "workflow.action.approve",
  eventCategory: "workflow.operation",
  workflowId: "bwf-fortress-gate",
  intentId: "intent-fortress-gate",
  assetId: "bwf-fortress-gate",
  assetType: "business.asset.workflow",
  actorId: "aprovador",
  businessSummary: "Aprovação registrada para fortress gate.",
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
  ownerClientId: "client-gate-fortress",
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

gate(
  "G322 — Governance feeds Fortress",
  read(path.join(GOV, "portfolioToGovernanceIngestion.js")).includes("ingestGovernanceToFortress")
);

gate(
  "G322 — business.compliance_fortress extension point implemented",
  PLATFORM_GOVERNANCE_EXTENSION_POINTS.some((ep) => ep.id === "business.compliance_fortress" && ep.implemented === true)
);

const fortressResult = ingestGovernanceToFortress(groupId, tenantA);
gate("G322 — Fortress analyzed for authorized group", fortressResult.authorized === true);

gate(
  "G322 — Purge requires policy and audit",
  fortressResult.expunges?.purgeRequiresPolicyAndAudit === true && fortressResult.expunges?.purgeAllowed === false
);

const retrieved = retrieveLatestFortress(groupId);
gate(
  "G322 — Fortress retrieval explainable",
  retrieved.explainable === true && retrieved.purgeRequiresPolicyAndAudit === true
);

const summary = summarizeFortressEngine(groupId);
gate(
  "G322 — Fortress summarization",
  summary.belongsToPlatform === true &&
    summary.retentionRequiresExplicitRule === true &&
    summary.purgeRequiresPolicyAndAudit === true
);

gate(
  "G322 — Retention requires explicit rule",
  read(path.join(FORT, "complianceFortressContracts.js")).includes("retentionRequiresExplicitRule: true")
);

gate(
  "G322 — Exception requires audit trail",
  read(path.join(FORT, "complianceFortressContracts.js")).includes("exceptionRequiresAuditTrail: true")
);

const bosProjection = buildFortressBosProjection(groupId, tenantA);
gate(
  "G322 — Fortress-to-BOS projection",
  bosProjection.explainable === true &&
    !JSON.stringify(bosProjection).includes("prompt") &&
    !JSON.stringify(bosProjection).includes("embedding") &&
    !JSON.stringify(bosProjection).includes("documentId") &&
    !JSON.stringify(bosProjection).includes("ruleId") &&
    !JSON.stringify(bosProjection).includes("eventId")
);

gate(
  "G322 — BOS wired to fortress sections",
  read(path.join(BOS, "pages/BosHomePage.jsx")).includes("FortressComplianceSection") &&
    exists(path.join(BOS, "components/BusinessFortressSections.jsx"))
);

gate(
  "G322 — No technical fortress UI for business user",
  !read(path.join(BOS, "components/BusinessFortressSections.jsx")).includes("fortress/engine") &&
    !read(path.join(BOS, "components/BusinessFortressSections.jsx")).includes("documentId")
);

gate(
  "G322 — Fortress bridges read-only",
  bridgeFortressToGovernance(groupId, tenantA).autonomousPolicyForbidden === true &&
    bridgeFortressToConsulting(groupId, tenantA).autonomousAdviceForbidden === true &&
    bridgeFortressToDecision(groupId, tenantA).autonomousDecisionForbidden === true
);

gate(
  "G322 — No chat assistant",
  !read(path.join(ROOT, "src/App.jsx")).includes("/chat") &&
    FORTRESS_EXTENSION_POINTS.some((ep) => ep.id === "ai.chat.assistant" && ep.forbiddenForBusinessUser)
);

gate(
  "G322 — No individual profiling in fortress contracts",
  read(path.join(FORT, "complianceFortressContracts.js")).includes("individualProfilingForbidden: true") &&
    read(path.join(FORT, "complianceFortressContracts.js")).includes("surveillanceForbidden: true")
);

gate(
  "G322 — No autonomous purge or policy change",
  read(path.join(FORT, "complianceFortressContracts.js")).includes("autonomousExecutionForbidden: true")
);

const fortressEngine = runComplianceFortressEngine(groupId, tenantA);
gate("G322 — Fortress orchestrator", fortressEngine.engineVersion === COMPLIANCE_FORTRESS_VERSION);

gate(
  "G322 — No autonomous fortress execution",
  fortressEngine.autonomousExecutionForbidden === true && fortressEngine.humanApprovalRequired === true
);

const home = buildIntelligenceHomeProjection(tenantA, { groupId });
gate(
  "G322 — Intelligence home includes fortress compliance",
  home.hasFortress === true || home.fortressSummary != null
);

gate(
  "G322 — Cross-tenant mixing forbidden",
  read(path.join(FORT, "complianceFortressContracts.js")).includes("crossTenantMixingForbidden: true")
);

const designerFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("/designers/"));
let bypass = false;
for (const file of designerFiles) {
  if (/runComplianceFortressEngine|analyzeComplianceFortressContext|ingestGovernanceToFortress/.test(file.content)) {
    bypass = true;
    break;
  }
}
gate("G322 — No fortress engine bypass in designers", !bypass);

try {
  execSync("node scripts/gate-enterprise-platform-governance-portfolio-control.mjs", { stdio: "pipe" });
  gate("G322 — G321 Governance still green", true);
} catch {
  gate("G322 — G321 Governance still green", false, "G321 failed");
}

try {
  execSync("node scripts/gate-business-operating-shell.mjs", { stdio: "pipe" });
  gate("G322 — G307 BOS still green", true);
} catch {
  gate("G322 — G307 BOS still green", false, "G307 failed");
}

const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`\nG322: ${passed}/${total} checks passed`);
if (passed !== total) process.exit(1);
