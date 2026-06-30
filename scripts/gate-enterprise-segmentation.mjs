#!/usr/bin/env node
/**
 * Gate G316 — Segmentation, Templates & Advanced Maturity MVP (Program 3.18, D-084)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  SEGMENTATION_ENGINE_VERSION,
  OPERATIONAL_SEGMENTS,
  SEGMENTATION_ENGINE_EXTENSION_POINTS,
  DNA_ENGINE_EXTENSION_POINTS,
  publishDomainEvent,
  ingestEventToMemoryEngine,
  ingestMemoryRecordToKnowledgeGraph,
  analyzeConsultingContext,
  analyzeDecisionContext,
  analyzeEvolutionContext,
  ingestEvolutionToBusinessDna,
  ingestDnaToSegmentation,
  replaySegmentationFromStack,
  retrieveSegmentationByContext,
  summarizeSegmentationEngine,
  buildSegmentationBosProjection,
  bridgeDnaToSegmentation,
  bridgeSegmentationToConsulting,
  bridgeSegmentationToDecision,
  bridgeSegmentationToEvolution,
  runSegmentationEngine,
  buildIntelligenceHomeProjection,
  registerAuthorizedGroupScope,
  buildAuthorizedGroupComparison,
  buildCorporatePatternSuggestions,
  getTemplateCatalog,
  computeAdvancedMaturityScore,
} from "../src/intelligence/index.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";

const ROOT = process.cwd();
const SEG = path.join(ROOT, "src/intelligence/segmentation/engine");
const BOS = path.join(ROOT, "src/bos");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const requiredFiles = [
  "segmentationEngineContracts.js",
  "segmentationEngineStore.js",
  "segmentationContextAssembly.js",
  "segmentationRules.js",
  "segmentationClassifiers.js",
  "segmentationProfiles.js",
  "segmentationLifecycle.js",
  "segmentationVersioning.js",
  "segmentationOwnership.js",
  "segmentationAuditTrail.js",
  "segmentationExplainability.js",
  "segmentationLineage.js",
  "segmentationRetrieval.js",
  "segmentationSummarization.js",
  "segmentSeedsRegistry.js",
  "templateCatalog.js",
  "templateLibrary.js",
  "templateMatching.js",
  "templateCompatibility.js",
  "templateLifecycle.js",
  "templateVersioning.js",
  "templateOwnership.js",
  "templateAuditTrail.js",
  "templateExplainability.js",
  "templateRetrieval.js",
  "templateSummarization.js",
  "advancedMaturityScoring.js",
  "advancedMaturityRadar.js",
  "maturityBenchmarks.js",
  "maturityProgressComparison.js",
  "authorizedGroupComparison.js",
  "corporatePatternSuggestions.js",
  "dnaToSegmentationIngestion.js",
  "segmentationToBosProjection.js",
  "segmentationToIntelligenceBridges.js",
  "runSegmentationEngine.js",
];

gate(
  "G316 — Segmentation Engine structure exists",
  requiredFiles.every((f) => exists(path.join(SEG, f)))
);

gate(
  "G316 — Official segmentation version",
  SEGMENTATION_ENGINE_VERSION === "mak-business-segmentation-engine-v1" &&
    Object.keys(OPERATIONAL_SEGMENTS).length >= 5
);

const tenantA = "gate-seg-tenant-a";
const tenantB = "gate-seg-tenant-b";
const groupId = "gate-seg-group-1";

const envelope = publishDomainEvent({
  tenantId: tenantA,
  eventType: "workflow.action.approve",
  eventCategory: "workflow.operation",
  workflowId: "bwf-seg-gate",
  intentId: "intent-seg-gate",
  assetId: "bwf-seg-gate",
  assetType: "business.asset.workflow",
  actorId: "aprovador",
  businessSummary: "Aprovação registrada para segmentation gate.",
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

const retrievedA = retrieveSegmentationByContext(tenantA);
const retrievedBBefore = retrieveSegmentationByContext(tenantB);

gate(
  "G316 — Tenant-scoped segmentation isolation",
  retrievedA.profiles.length >= 1 && retrievedBBefore.profiles.length === 0
);

gate(
  "G316 — DNA feeds Segmentation engine",
  read(path.join(ROOT, "src/intelligence/dna/engine/evolutionToDnaIngestion.js")).includes(
    "ingestDnaToSegmentation"
  )
);

gate(
  "G316 — business.segmentation extension point implemented",
  DNA_ENGINE_EXTENSION_POINTS.some((ep) => ep.id === "business.segmentation" && ep.implemented === true)
);

const replay = replaySegmentationFromStack(tenantA);
gate("G316 — Segmentation replay from stack", replay.segment != null);

gate(
  "G316 — Segmentation retrieval explainable",
  retrievedA.explainable === true && retrievedA.individualProfilingForbidden === true
);

const summary = summarizeSegmentationEngine(tenantA);
gate(
  "G316 — Segmentation summarization",
  summary.belongsToEnterprise === true &&
    summary.individualProfilingForbidden === true &&
    summary.segmentLabel != null
);

gate(
  "G316 — Template catalog available",
  getTemplateCatalog().length >= 5
);

gate(
  "G316 — Template matches for tenant",
  retrievedA.templateMatches.length >= 1
);

const advanced = computeAdvancedMaturityScore(tenantA);
gate("G316 — Advanced maturity scoring", advanced.advancedScore >= 0);

const bosProjection = buildSegmentationBosProjection(tenantA);
gate(
  "G316 — Segmentation-to-BOS projection",
  bosProjection.explainable === true &&
    !JSON.stringify(bosProjection).includes("prompt") &&
    !JSON.stringify(bosProjection).includes("embedding") &&
    !JSON.stringify(bosProjection).includes("classificationId")
);

gate(
  "G316 — BOS wired to segmentation sections",
  read(path.join(BOS, "pages/BosHomePage.jsx")).includes("SegmentationProfileSection") &&
    exists(path.join(BOS, "components/BusinessSegmentationSections.jsx"))
);

gate(
  "G316 — Group comparison requires authorization",
  (() => {
    const unauthorized = buildAuthorizedGroupComparison(groupId, tenantA);
    if (unauthorized.authorized !== false) return false;
    registerAuthorizedGroupScope({
      groupId,
      ownerClientId: "client-gate",
      authorizedTenantIds: [tenantA, tenantB],
    });
    ingestDnaToSegmentation(tenantB);
    const authorized = buildAuthorizedGroupComparison(groupId, tenantA);
    const patterns = buildCorporatePatternSuggestions(groupId, tenantA);
    return authorized.authorized === true && patterns.authorized === true;
  })()
);

gate(
  "G316 — DNA-to-Segmentation bridge live",
  bridgeDnaToSegmentation(tenantA).segmentationEngineReady === true
);

gate(
  "G316 — Segmentation intelligence bridges read-only",
  bridgeSegmentationToConsulting(tenantA).autonomousAdviceForbidden === true &&
    bridgeSegmentationToDecision(tenantA).autonomousDecisionForbidden === true &&
    bridgeSegmentationToEvolution(tenantA).autonomousEvolutionForbidden === true
);

gate(
  "G316 — No chat assistant",
  !read(path.join(ROOT, "src/App.jsx")).includes("/chat") &&
    SEGMENTATION_ENGINE_EXTENSION_POINTS.some(
      (ep) => ep.id === "ai.chat.assistant" && ep.forbiddenForBusinessUser
    )
);

gate(
  "G316 — No technical segmentation UI for business user",
  !read(path.join(BOS, "components/BusinessSegmentationSections.jsx")).includes("segmentation/engine") &&
    !read(path.join(BOS, "components/BusinessSegmentationSections.jsx")).includes("classificationId")
);

gate(
  "G316 — No individual profiling in segmentation contracts",
  read(path.join(SEG, "segmentationEngineContracts.js")).includes("individualProfilingForbidden: true") &&
    read(path.join(SEG, "segmentationEngineContracts.js")).includes("surveillanceForbidden: true")
);

const engine = runSegmentationEngine(tenantA);
gate("G316 — Segmentation engine orchestrator", engine.engineVersion === SEGMENTATION_ENGINE_VERSION);

gate(
  "G316 — No autonomous execution",
  engine.autonomousExecutionForbidden === true && engine.individualProfilingForbidden === true
);

const home = buildIntelligenceHomeProjection(tenantA);
gate(
  "G316 — Intelligence home includes segmentation",
  home.hasSegmentation === true || home.segmentationSummary != null
);

const designerFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("/designers/"));
let bypass = false;
for (const file of designerFiles) {
  if (/runSegmentationEngine|analyzeSegmentationContext/.test(file.content)) {
    bypass = true;
    break;
  }
}
gate("G316 — No segmentation engine bypass in designers", !bypass);

try {
  execSync("node scripts/gate-enterprise-business-dna.mjs", { stdio: "pipe" });
  gate("G316 — G315 Business DNA still green", true);
} catch {
  gate("G316 — G315 Business DNA still green", false, "G315 failed");
}

try {
  execSync("node scripts/gate-business-operating-shell.mjs", { stdio: "pipe" });
  gate("G316 — G307 BOS still green", true);
} catch {
  gate("G316 — G307 BOS still green", false, "G307 failed");
}

const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`\nG316: ${passed}/${total} checks passed`);
if (passed !== total) process.exit(1);
