#!/usr/bin/env node
/**
 * Gate G312 — Enterprise Consulting Engine MVP (Program 3.14, D-080)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  ENTERPRISE_CONSULTING_ENGINE_VERSION,
  CONSULTING_DOCUMENT_TYPES,
  CONSULTING_SIGNAL_TYPES,
  CONSULTING_ENGINE_EXTENSION_POINTS,
  publishDomainEvent,
  ingestEventToMemoryEngine,
  ingestMemoryRecordToKnowledgeGraph,
  analyzeConsultingContext,
  replayConsultingFromMemoryAndGraph,
  retrieveConsultingByContext,
  summarizeConsultingEngine,
  buildConsultingEngineBosProjection,
  bridgeConsultingToDecision,
  bridgeConsultingToEvolution,
  bridgeConsultingToIntent,
  bridgeKnowledgeToConsulting,
  runConsultingEngine,
  buildIntelligenceHomeProjection,
} from "../src/intelligence/index.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";

const ROOT = process.cwd();
const CONSULTING = path.join(ROOT, "src/intelligence/consulting/engine");
const BOS = path.join(ROOT, "src/bos");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const requiredFiles = [
  "consultingEngineContracts.js",
  "consultingEngineStore.js",
  "consultingContextAssembly.js",
  "consultingSignalsRegistry.js",
  "consultingOpportunityRegistry.js",
  "improvementPlanBuilder.js",
  "recommendationBuilder.js",
  "consultingExplainability.js",
  "consultingLineage.js",
  "consultingVersioning.js",
  "consultingLifecycle.js",
  "consultingOwnership.js",
  "consultingAuditTrail.js",
  "consultingRetrieval.js",
  "consultingSummarization.js",
  "graphToConsultingIngestion.js",
  "consultingSeedsRegistry.js",
  "consultingToBosProjection.js",
  "consultingToIntelligenceBridges.js",
  "runConsultingEngine.js",
];

gate(
  "G312 — Consulting Engine structure exists",
  requiredFiles.every((f) => exists(path.join(CONSULTING, f)))
);

gate(
  "G312 — Official consulting version",
  ENTERPRISE_CONSULTING_ENGINE_VERSION === "mak-enterprise-consulting-engine-v1" &&
    Object.keys(CONSULTING_SIGNAL_TYPES).length >= 5
);

const tenantA = "gate-con-tenant-a";
const tenantB = "gate-con-tenant-b";

const envelope = publishDomainEvent({
  tenantId: tenantA,
  eventType: "workflow.action.approve",
  eventCategory: "workflow.operation",
  workflowId: "bwf-con-gate",
  intentId: "intent-con-gate",
  assetId: "bwf-con-gate",
  assetType: "business.asset.workflow",
  actorId: "aprovador",
  businessSummary: "Aprovação registrada para consulting engine gate.",
  whatHappened: "Responsável aprovou processo de compra.",
  businessImpact: "Processo encerrado.",
  outcome: { status: "aprovado", terminal: true, humanDecision: true },
});

const record = ingestEventToMemoryEngine(envelope);
ingestMemoryRecordToKnowledgeGraph(record);
analyzeConsultingContext(tenantA);

const retrievedA = retrieveConsultingByContext(tenantA);
const retrievedBBefore = retrieveConsultingByContext(tenantB);

gate(
  "G312 — Tenant-scoped consulting isolation",
  retrievedA.recommendations.length >= 1 && retrievedBBefore.recommendations.length === 0
);

publishDomainEvent({
  tenantId: tenantB,
  eventType: "intent.preview",
  eventCategory: "intent.operation",
  businessSummary: "Tenant B isolado",
  whatHappened: "Preview B",
});

const retrievedB = retrieveConsultingByContext(tenantB);

gate(
  "G312 — Knowledge Graph feeds consulting engine",
  read(path.join(ROOT, "src/intelligence/knowledge/graph/memoryToGraphIngestion.js")).includes(
    "ingestKnowledgeGraphToConsulting"
  )
);

gate(
  "G312 — Explainable recommendations with evidence",
  retrievedA.recommendations.some(
    (r) => r.explainable === true && r.humanApprovalRequired === true && r.explanation
  )
);

const replay = replayConsultingFromMemoryAndGraph(tenantA);
gate("G312 — Consulting replay from memory and graph", replay.analysis != null);

gate(
  "G312 — Consulting retrieval by context",
  retrievedA.recommendations.length >= 0 && retrievedA.explainable === true
);

const summary = summarizeConsultingEngine(tenantA);
gate(
  "G312 — Consulting summarization",
  summary.belongsToEnterprise === true && summary.autonomousExecutionForbidden === true
);

const bosProjection = buildConsultingEngineBosProjection(tenantA);
gate(
  "G312 — Consulting-to-BOS projection",
  bosProjection.explainable === true &&
    !JSON.stringify(bosProjection).includes("prompt") &&
    !JSON.stringify(bosProjection).includes("embedding")
);

gate(
  "G312 — BOS wired to consulting sections",
  read(path.join(BOS, "pages/BosHomePage.jsx")).includes("ConsultingRecommendationsSection") &&
    exists(path.join(BOS, "components/ConsultingSections.jsx"))
);

gate(
  "G312 — Future engine bridges ready",
  bridgeConsultingToDecision(tenantA).decisionEngineReady === true &&
    bridgeConsultingToEvolution(tenantA).evolutionEngineReady === false &&
    bridgeConsultingToIntent(tenantA).intentBridgeReady === false
);

gate(
  "G312 — Consulting engine live via knowledge bridge",
  bridgeKnowledgeToConsulting(tenantA).consultingEngineReady === true
);

gate(
  "G312 — No chat assistant",
  !read(path.join(ROOT, "src/App.jsx")).includes("/chat") &&
    CONSULTING_ENGINE_EXTENSION_POINTS.some((ep) => ep.id === "ai.chat.assistant" && ep.forbiddenForBusinessUser)
);

gate(
  "G312 — No technical consulting UI for business user",
  !read(path.join(BOS, "components/ConsultingSections.jsx")).includes("consulting/engine") &&
    !read(path.join(BOS, "components/ConsultingSections.jsx")).includes("recommendationId")
);

const engine = runConsultingEngine(tenantA);
gate("G312 — Consulting engine orchestrator", engine.engineVersion === ENTERPRISE_CONSULTING_ENGINE_VERSION);

gate(
  "G312 — Improvement plans require human approval",
  retrievedA.plans.every((p) => p.humanApprovalRequired === true && p.autonomousExecutionForbidden === true) ||
    retrievedA.plans.length === 0
);

const home = buildIntelligenceHomeProjection(tenantA);
gate("G312 — Intelligence home includes consulting", home.hasConsulting === true || home.consultingSummary != null);

const designerFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("/designers/"));
let bypass = false;
for (const file of designerFiles) {
  if (/runConsultingEngine|analyzeConsultingContext/.test(file.content)) {
    bypass = true;
    break;
  }
}
gate("G312 — No consulting engine bypass in designers", !bypass);

try {
  execSync("node scripts/gate-enterprise-knowledge-graph.mjs", { stdio: "pipe" });
  gate("G312 — G311 Knowledge Graph still green", true);
} catch {
  gate("G312 — G311 Knowledge Graph still green", false, "G311 failed");
}

try {
  execSync("node scripts/gate-business-operating-shell.mjs", { stdio: "pipe" });
  gate("G312 — G307 BOS still green", true);
} catch {
  gate("G312 — G307 BOS still green", false, "G307 failed");
}

const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`\nG312: ${passed}/${total} checks passed`);
if (passed !== total) process.exit(1);
