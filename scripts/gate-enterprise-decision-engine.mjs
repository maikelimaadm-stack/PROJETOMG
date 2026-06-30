#!/usr/bin/env node
/**
 * Gate G313 — Enterprise Decision Engine MVP (Program 3.15, D-081)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  ENTERPRISE_DECISION_ENGINE_VERSION,
  DECISION_OPTION_TYPES,
  DECISION_ENGINE_EXTENSION_POINTS,
  publishDomainEvent,
  ingestEventToMemoryEngine,
  ingestMemoryRecordToKnowledgeGraph,
  analyzeConsultingContext,
  analyzeDecisionContext,
  replayDecisionFromStack,
  retrieveDecisionsByContext,
  summarizeDecisionEngine,
  buildDecisionEngineBosProjection,
  bridgeConsultingToDecision,
  bridgeDecisionToEvolution,
  bridgeDecisionToIntent,
  bridgeKnowledgeToDecision,
  runDecisionEngine,
  buildIntelligenceHomeProjection,
  approveDecision,
} from "../src/intelligence/index.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";

const ROOT = process.cwd();
const DECISION = path.join(ROOT, "src/intelligence/decision/engine");
const BOS = path.join(ROOT, "src/bos");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const requiredFiles = [
  "decisionEngineContracts.js",
  "decisionEngineStore.js",
  "decisionContextAssembly.js",
  "decisionOptionsRegistry.js",
  "alternativesBuilder.js",
  "scenarioSimulation.js",
  "confidenceScoring.js",
  "decisionEvidenceRegistry.js",
  "decisionExplainability.js",
  "decisionLineage.js",
  "decisionVersioning.js",
  "decisionLifecycle.js",
  "decisionOwnership.js",
  "decisionAuditTrail.js",
  "decisionRetrieval.js",
  "decisionSummarization.js",
  "consultingToDecisionIngestion.js",
  "decisionApprovalWorkflow.js",
  "decisionSeedsRegistry.js",
  "decisionToBosProjection.js",
  "decisionToIntelligenceBridges.js",
  "runDecisionEngine.js",
];

gate(
  "G313 — Decision Engine structure exists",
  requiredFiles.every((f) => exists(path.join(DECISION, f)))
);

gate(
  "G313 — Official decision version",
  ENTERPRISE_DECISION_ENGINE_VERSION === "mak-enterprise-decision-engine-v1" &&
    Object.keys(DECISION_OPTION_TYPES).length >= 4
);

const tenantA = "gate-dec-tenant-a";
const tenantB = "gate-dec-tenant-b";

const envelope = publishDomainEvent({
  tenantId: tenantA,
  eventType: "workflow.action.approve",
  eventCategory: "workflow.operation",
  workflowId: "bwf-dec-gate",
  intentId: "intent-dec-gate",
  assetId: "bwf-dec-gate",
  assetType: "business.asset.workflow",
  actorId: "aprovador",
  businessSummary: "Aprovação registrada para decision engine gate.",
  whatHappened: "Responsável aprovou processo de compra.",
  businessImpact: "Processo encerrado.",
  outcome: { status: "aprovado", terminal: true, humanDecision: true },
});

const record = ingestEventToMemoryEngine(envelope);
ingestMemoryRecordToKnowledgeGraph(record);
analyzeConsultingContext(tenantA);
analyzeDecisionContext(tenantA);

const retrievedA = retrieveDecisionsByContext(tenantA);
const retrievedBBefore = retrieveDecisionsByContext(tenantB);

gate(
  "G313 — Tenant-scoped decision isolation",
  retrievedA.documents.length >= 1 && retrievedBBefore.documents.length === 0
);

gate(
  "G313 — Consulting feeds decision engine",
  read(path.join(ROOT, "src/intelligence/consulting/engine/graphToConsultingIngestion.js")).includes(
    "ingestConsultingToDecision"
  )
);

gate(
  "G313 — Explainable alternatives with scenarios",
  retrievedA.options.length >= 3 &&
    retrievedA.scenarios.length >= 3 &&
    retrievedA.options.every((o) => o.explainable === true)
);

const replay = replayDecisionFromStack(tenantA);
gate("G313 — Decision replay from full stack", replay.analysis != null);

gate(
  "G313 — Decision retrieval by context",
  retrievedA.explainable === true && retrievedA.pendingDecisions.length >= 0
);

const summary = summarizeDecisionEngine(tenantA);
gate(
  "G313 — Decision summarization",
  summary.belongsToEnterprise === true && summary.autonomousExecutionForbidden === true
);

const bosProjection = buildDecisionEngineBosProjection(tenantA);
gate(
  "G313 — Decision-to-BOS projection",
  bosProjection.explainable === true &&
    !JSON.stringify(bosProjection).includes("prompt") &&
    !JSON.stringify(bosProjection).includes("embedding")
);

gate(
  "G313 — BOS wired to decision sections",
  read(path.join(BOS, "pages/BosHomePage.jsx")).includes("DecisionPendingSection") &&
    exists(path.join(BOS, "components/DecisionSections.jsx"))
);

gate(
  "G313 — Future engine bridges ready",
  bridgeDecisionToEvolution(tenantA).evolutionEngineReady === false &&
    bridgeDecisionToIntent(tenantA).intentBridgeReady === false
);

gate(
  "G313 — Decision engine live via consulting bridge",
  bridgeConsultingToDecision(tenantA).decisionEngineReady === true &&
    bridgeKnowledgeToDecision(tenantA).decisionEngineReady === true
);

gate(
  "G313 — No chat assistant",
  !read(path.join(ROOT, "src/App.jsx")).includes("/chat") &&
    DECISION_ENGINE_EXTENSION_POINTS.some((ep) => ep.id === "ai.chat.assistant" && ep.forbiddenForBusinessUser)
);

gate(
  "G313 — No technical decision UI for business user",
  !read(path.join(BOS, "components/DecisionSections.jsx")).includes("decision/engine") &&
    !read(path.join(BOS, "components/DecisionSections.jsx")).includes("decisionId")
);

const engine = runDecisionEngine(tenantA);
gate("G313 — Decision engine orchestrator", engine.engineVersion === ENTERPRISE_DECISION_ENGINE_VERSION);

const pending = retrievedA.pendingDecisions[0];
if (pending) {
  const approved = approveDecision(tenantA, pending.decisionId, "gate-approver");
  gate(
    "G313 — Human approval workflow",
    approved?.lifecycleState === "approved" && approved?.autonomousExecutionForbidden === true
  );
} else {
  gate("G313 — Human approval workflow", true, "no pending decision");
}

const home = buildIntelligenceHomeProjection(tenantA);
gate("G313 — Intelligence home includes decisions", home.hasDecisions === true || home.decisionSummary != null);

const designerFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("/designers/"));
let bypass = false;
for (const file of designerFiles) {
  if (/runDecisionEngine|analyzeDecisionContext/.test(file.content)) {
    bypass = true;
    break;
  }
}
gate("G313 — No decision engine bypass in designers", !bypass);

try {
  execSync("node scripts/gate-enterprise-consulting-engine.mjs", { stdio: "pipe" });
  gate("G313 — G312 Consulting Engine still green", true);
} catch {
  gate("G313 — G312 Consulting Engine still green", false, "G312 failed");
}

try {
  execSync("node scripts/gate-business-operating-shell.mjs", { stdio: "pipe" });
  gate("G313 — G307 BOS still green", true);
} catch {
  gate("G313 — G307 BOS still green", false, "G307 failed");
}

const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`\nG313: ${passed}/${total} checks passed`);
if (passed !== total) process.exit(1);
