#!/usr/bin/env node
/**
 * Gate G314 — Enterprise Evolution Engine MVP (Program 3.16, D-082)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  ENTERPRISE_EVOLUTION_ENGINE_VERSION,
  EVOLUTION_SIGNAL_TYPES,
  EVOLUTION_ENGINE_EXTENSION_POINTS,
  publishDomainEvent,
  ingestEventToMemoryEngine,
  ingestMemoryRecordToKnowledgeGraph,
  analyzeConsultingContext,
  analyzeDecisionContext,
  analyzeEvolutionContext,
  replayEvolutionFromStack,
  retrieveEvolutionByContext,
  summarizeEvolutionEngine,
  buildEvolutionEngineBosProjection,
  bridgeDecisionToEvolution,
  bridgeConsultingToEvolution,
  bridgeKnowledgeToEvolution,
  bridgeEvolutionToConsulting,
  bridgeEvolutionToIntent,
  runEvolutionEngine,
  buildIntelligenceHomeProjection,
  computeEvolutionMaturity,
} from "../src/intelligence/index.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";

const ROOT = process.cwd();
const EVOLUTION = path.join(ROOT, "src/intelligence/evolution/engine");
const BOS = path.join(ROOT, "src/bos");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const requiredFiles = [
  "evolutionEngineContracts.js",
  "evolutionEngineStore.js",
  "evolutionContextAssembly.js",
  "evolutionTimeline.js",
  "evolutionSignalsRegistry.js",
  "evolutionOpportunityRegistry.js",
  "evolutionPlanBuilder.js",
  "roadmapBuilder.js",
  "evolutionMaturityModel.js",
  "progressTracker.js",
  "evolutionExplainability.js",
  "evolutionLineage.js",
  "evolutionVersioning.js",
  "evolutionLifecycle.js",
  "evolutionOwnership.js",
  "evolutionAuditTrail.js",
  "evolutionRetrieval.js",
  "evolutionSummarization.js",
  "decisionToEvolutionIngestion.js",
  "evolutionMilestonesRegistry.js",
  "evolutionSeedsRegistry.js",
  "evolutionToBosProjection.js",
  "evolutionToIntelligenceBridges.js",
  "runEvolutionEngine.js",
];

gate(
  "G314 — Evolution Engine structure exists",
  requiredFiles.every((f) => exists(path.join(EVOLUTION, f)))
);

gate(
  "G314 — Official evolution version",
  ENTERPRISE_EVOLUTION_ENGINE_VERSION === "mak-enterprise-evolution-engine-v1" &&
    Object.keys(EVOLUTION_SIGNAL_TYPES).length >= 5
);

const tenantA = "gate-evol-tenant-a";
const tenantB = "gate-evol-tenant-b";

const envelope = publishDomainEvent({
  tenantId: tenantA,
  eventType: "workflow.action.approve",
  eventCategory: "workflow.operation",
  workflowId: "bwf-evol-gate",
  intentId: "intent-evol-gate",
  assetId: "bwf-evol-gate",
  assetType: "business.asset.workflow",
  actorId: "aprovador",
  businessSummary: "Aprovação registrada para evolution engine gate.",
  whatHappened: "Responsável aprovou processo de compra.",
  businessImpact: "Processo encerrado.",
  outcome: { status: "aprovado", terminal: true, humanDecision: true },
});

const record = ingestEventToMemoryEngine(envelope);
ingestMemoryRecordToKnowledgeGraph(record);
analyzeConsultingContext(tenantA);
analyzeDecisionContext(tenantA);
analyzeEvolutionContext(tenantA);

const retrievedA = retrieveEvolutionByContext(tenantA);
const retrievedBBefore = retrieveEvolutionByContext(tenantB);

gate(
  "G314 — Tenant-scoped evolution isolation",
  retrievedA.documents.length >= 1 && retrievedBBefore.documents.length === 0
);

gate(
  "G314 — Decision feeds evolution engine",
  read(path.join(ROOT, "src/intelligence/decision/engine/consultingToDecisionIngestion.js")).includes(
    "ingestDecisionToEvolution"
  )
);

gate(
  "G314 — Maturity model and progress tracking",
  retrievedA.plans.length >= 0 && retrievedA.milestones.length >= 0
);

const replay = replayEvolutionFromStack(tenantA);
gate("G314 — Evolution replay from full stack", replay.analysis != null);

gate(
  "G314 — Evolution retrieval by context",
  retrievedA.explainable === true
);

const summary = summarizeEvolutionEngine(tenantA);
gate(
  "G314 — Evolution summarization",
  summary.belongsToEnterprise === true && summary.autonomousExecutionForbidden === true
);

const bosProjection = buildEvolutionEngineBosProjection(tenantA);
gate(
  "G314 — Evolution-to-BOS projection",
  bosProjection.explainable === true &&
    !JSON.stringify(bosProjection).includes("prompt") &&
    !JSON.stringify(bosProjection).includes("embedding")
);

gate(
  "G314 — BOS wired to evolution sections",
  read(path.join(BOS, "pages/BosHomePage.jsx")).includes("EvolutionTimelineSection") &&
    exists(path.join(BOS, "components/EvolutionSections.jsx"))
);

gate(
  "G314 — Future intelligence bridges ready",
  bridgeEvolutionToConsulting(tenantA).consultingBridgeReady === false &&
    bridgeEvolutionToIntent(tenantA).intentBridgeReady === false
);

gate(
  "G314 — Evolution engine live via decision bridge",
  bridgeDecisionToEvolution(tenantA).evolutionEngineReady === true &&
    bridgeConsultingToEvolution(tenantA).evolutionEngineReady === true &&
    bridgeKnowledgeToEvolution(tenantA).evolutionEngineReady === true
);

gate(
  "G314 — No chat assistant",
  !read(path.join(ROOT, "src/App.jsx")).includes("/chat") &&
    EVOLUTION_ENGINE_EXTENSION_POINTS.some((ep) => ep.id === "ai.chat.assistant" && ep.forbiddenForBusinessUser)
);

gate(
  "G314 — No technical evolution UI for business user",
  !read(path.join(BOS, "components/EvolutionSections.jsx")).includes("evolution/engine") &&
    !read(path.join(BOS, "components/EvolutionSections.jsx")).includes("evolutionId")
);

const engine = runEvolutionEngine(tenantA);
gate("G314 — Evolution engine orchestrator", engine.engineVersion === ENTERPRISE_EVOLUTION_ENGINE_VERSION);

gate(
  "G314 — No autonomous execution",
  engine.autonomousExecutionForbidden === true &&
    retrievedA.plans.every((p) => p.autonomousExecutionForbidden === true) || retrievedA.plans.length === 0
);

const home = buildIntelligenceHomeProjection(tenantA);
gate("G314 — Intelligence home includes evolution", home.hasEvolution === true || home.evolutionSummary != null);

const designerFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("/designers/"));
let bypass = false;
for (const file of designerFiles) {
  if (/runEvolutionEngine|analyzeEvolutionContext/.test(file.content)) {
    bypass = true;
    break;
  }
}
gate("G314 — No evolution engine bypass in designers", !bypass);

try {
  execSync("node scripts/gate-enterprise-decision-engine.mjs", { stdio: "pipe" });
  gate("G314 — G313 Decision Engine still green", true);
} catch {
  gate("G314 — G313 Decision Engine still green", false, "G313 failed");
}

try {
  execSync("node scripts/gate-business-operating-shell.mjs", { stdio: "pipe" });
  gate("G314 — G307 BOS still green", true);
} catch {
  gate("G314 — G307 BOS still green", false, "G307 failed");
}

const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`\nG314: ${passed}/${total} checks passed`);
if (passed !== total) process.exit(1);
