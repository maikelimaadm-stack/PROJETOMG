#!/usr/bin/env node
/**
 * Gate G315 — Enterprise Business DNA & Maturity MVP (Program 3.17, D-083)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  BUSINESS_DNA_ENGINE_VERSION,
  DNA_PATTERN_TYPES,
  DNA_ENGINE_EXTENSION_POINTS,
  publishDomainEvent,
  ingestEventToMemoryEngine,
  ingestMemoryRecordToKnowledgeGraph,
  analyzeConsultingContext,
  analyzeDecisionContext,
  analyzeEvolutionContext,
  ingestEvolutionToBusinessDna,
  replayBusinessDnaFromStack,
  retrieveBusinessDnaByContext,
  summarizeBusinessDnaEngine,
  buildBusinessDnaBosProjection,
  bridgeEvolutionToDna,
  bridgeDnaToConsulting,
  bridgeDnaToDecision,
  bridgeDnaToEvolution,
  runBusinessDnaEngine,
  buildIntelligenceHomeProjection,
  registerAuthorizedGroupScope,
  buildPortfolioView,
  aggregateGroupMaturity,
  buildCorporateBenchmarking,
  EVOLUTION_ENGINE_EXTENSION_POINTS,
} from "../src/intelligence/index.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";

const ROOT = process.cwd();
const DNA = path.join(ROOT, "src/intelligence/dna/engine");
const BOS = path.join(ROOT, "src/bos");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const requiredFiles = [
  "businessDnaContracts.js",
  "businessDnaStore.js",
  "businessDnaContextAssembly.js",
  "businessDnaMaturityModel.js",
  "businessDnaProfile.js",
  "businessDnaFingerprint.js",
  "businessDnaCapabilityRadar.js",
  "businessDnaPatterns.js",
  "businessDnaGrowthSignals.js",
  "businessDnaMaturityRegistry.js",
  "businessDnaMilestonesRegistry.js",
  "businessDnaExplainability.js",
  "businessDnaLineage.js",
  "businessDnaVersioning.js",
  "businessDnaAuditTrail.js",
  "businessDnaOwnership.js",
  "businessDnaRetrieval.js",
  "businessDnaSummarization.js",
  "businessDnaSeedsRegistry.js",
  "evolutionToDnaIngestion.js",
  "businessDnaToBosProjection.js",
  "businessDnaToIntelligenceBridges.js",
  "groupMaturityAggregation.js",
  "corporateBenchmarking.js",
  "portfolioView.js",
  "runBusinessDnaEngine.js",
];

gate(
  "G315 — Business DNA Engine structure exists",
  requiredFiles.every((f) => exists(path.join(DNA, f)))
);

gate(
  "G315 — Official Business DNA version",
  BUSINESS_DNA_ENGINE_VERSION === "mak-business-dna-engine-v1" &&
    Object.keys(DNA_PATTERN_TYPES).length >= 3
);

const tenantA = "gate-dna-tenant-a";
const tenantB = "gate-dna-tenant-b";
const groupId = "gate-dna-group-1";

const envelope = publishDomainEvent({
  tenantId: tenantA,
  eventType: "workflow.action.approve",
  eventCategory: "workflow.operation",
  workflowId: "bwf-dna-gate",
  intentId: "intent-dna-gate",
  assetId: "bwf-dna-gate",
  assetType: "business.asset.workflow",
  actorId: "aprovador",
  businessSummary: "Aprovação registrada para business DNA gate.",
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

const retrievedA = retrieveBusinessDnaByContext(tenantA);
const retrievedBBefore = retrieveBusinessDnaByContext(tenantB);

gate(
  "G315 — Tenant-scoped DNA isolation",
  retrievedA.profiles.length >= 1 && retrievedBBefore.profiles.length === 0
);

gate(
  "G315 — Evolution feeds Business DNA engine",
  read(path.join(ROOT, "src/intelligence/evolution/engine/decisionToEvolutionIngestion.js")).includes(
    "ingestEvolutionToBusinessDna"
  )
);

gate(
  "G315 — business.dna extension point implemented",
  EVOLUTION_ENGINE_EXTENSION_POINTS.some((ep) => ep.id === "business.dna" && ep.implemented === true)
);

const replay = replayBusinessDnaFromStack(tenantA);
gate("G315 — Business DNA replay from full stack", replay.profile != null);

gate(
  "G315 — Business DNA retrieval explainable",
  retrievedA.explainable === true && retrievedA.individualProfilingForbidden === true
);

const summary = summarizeBusinessDnaEngine(tenantA);
gate(
  "G315 — Business DNA summarization",
  summary.belongsToEnterprise === true &&
    summary.individualProfilingForbidden === true &&
    summary.surveillanceForbidden === true
);

const bosProjection = buildBusinessDnaBosProjection(tenantA);
gate(
  "G315 — Business DNA-to-BOS projection",
  bosProjection.explainable === true &&
    !JSON.stringify(bosProjection).includes("prompt") &&
    !JSON.stringify(bosProjection).includes("embedding") &&
    !JSON.stringify(bosProjection).includes("profileId")
);

gate(
  "G315 — BOS wired to Business DNA sections",
  read(path.join(BOS, "pages/BosHomePage.jsx")).includes("BusinessDnaIdentitySection") &&
    exists(path.join(BOS, "components/BusinessDnaSections.jsx"))
);

gate(
  "G315 — Portfolio requires explicit authorization",
  (() => {
    const unauthorized = buildPortfolioView(groupId, tenantA);
    if (unauthorized.authorized !== false) return false;
    registerAuthorizedGroupScope({
      groupId,
      ownerClientId: "client-gate",
      authorizedTenantIds: [tenantA, tenantB],
    });
    ingestEvolutionToBusinessDna(tenantB);
    const authorized = buildPortfolioView(groupId, tenantA);
    return authorized.authorized === true && authorized.crossTenantMixingForbidden === true;
  })()
);

gate(
  "G315 — Group maturity aggregation authorized only",
  aggregateGroupMaturity(groupId, tenantA).authorized === true &&
    aggregateGroupMaturity("unknown-group", tenantA).authorized === false
);

gate(
  "G315 — Corporate benchmarking within authorized scope",
  buildCorporateBenchmarking(groupId, tenantA).authorized === true
);

gate(
  "G315 — Evolution-to-DNA bridge live",
  bridgeEvolutionToDna(tenantA).businessDnaReady === true
);

gate(
  "G315 — DNA intelligence bridges read-only",
  bridgeDnaToConsulting(tenantA).autonomousAdviceForbidden === true &&
    bridgeDnaToDecision(tenantA).autonomousDecisionForbidden === true &&
    bridgeDnaToEvolution(tenantA).autonomousEvolutionForbidden === true
);

gate(
  "G315 — No chat assistant",
  !read(path.join(ROOT, "src/App.jsx")).includes("/chat") &&
    DNA_ENGINE_EXTENSION_POINTS.some((ep) => ep.id === "ai.chat.assistant" && ep.forbiddenForBusinessUser)
);

gate(
  "G315 — No technical DNA UI for business user",
  !read(path.join(BOS, "components/BusinessDnaSections.jsx")).includes("dna/engine") &&
    !read(path.join(BOS, "components/BusinessDnaSections.jsx")).includes("profileId")
);

gate(
  "G315 — No individual profiling in DNA contracts",
  read(path.join(DNA, "businessDnaContracts.js")).includes("individualProfilingForbidden: true") &&
    read(path.join(DNA, "businessDnaContracts.js")).includes("surveillanceForbidden: true")
);

const engine = runBusinessDnaEngine(tenantA);
gate("G315 — Business DNA engine orchestrator", engine.engineVersion === BUSINESS_DNA_ENGINE_VERSION);

gate(
  "G315 — No autonomous execution",
  engine.autonomousExecutionForbidden === true && engine.individualProfilingForbidden === true
);

const home = buildIntelligenceHomeProjection(tenantA);
gate("G315 — Intelligence home includes Business DNA", home.hasDna === true || home.dnaSummary != null);

const designerFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("/designers/"));
let bypass = false;
for (const file of designerFiles) {
  if (/runBusinessDnaEngine|analyzeBusinessDnaContext/.test(file.content)) {
    bypass = true;
    break;
  }
}
gate("G315 — No Business DNA engine bypass in designers", !bypass);

try {
  execSync("node scripts/gate-enterprise-evolution-engine.mjs", { stdio: "pipe" });
  gate("G315 — G314 Evolution Engine still green", true);
} catch {
  gate("G315 — G314 Evolution Engine still green", false, "G314 failed");
}

try {
  execSync("node scripts/gate-business-operating-shell.mjs", { stdio: "pipe" });
  gate("G315 — G307 BOS still green", true);
} catch {
  gate("G315 — G307 BOS still green", false, "G307 failed");
}

const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`\nG315: ${passed}/${total} checks passed`);
if (passed !== total) process.exit(1);
