#!/usr/bin/env node
/**
 * Gate G310 — Enterprise Memory Engine MVP (Program 3.12, D-078)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  ENTERPRISE_MEMORY_ENGINE_VERSION,
  MEMORY_STORE_TYPES,
  MEMORY_ENGINE_EXTENSION_POINTS,
  publishDomainEvent,
  ingestEventToMemoryEngine,
  listEnterpriseMemoryRecords,
  retrieveMemoryRecords,
  replayMemorySequence,
  assembleMemoryContext,
  summarizeEnterpriseMemory,
  buildMemoryEngineBosProjection,
  bridgeMemoryToIntelligence,
  runMemoryEngine,
  buildIntelligenceHomeProjection,
} from "../src/intelligence/index.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";

const ROOT = process.cwd();
const INTELLIGENCE = path.join(ROOT, "src/intelligence/memory/engine");
const BOS = path.join(ROOT, "src/bos");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const requiredFiles = [
  "memoryEngineContracts.js",
  "enterpriseMemoryStore.js",
  "eventToMemoryPersistence.js",
  "typedMemoryStores.js",
  "memoryAggregation.js",
  "memorySummarization.js",
  "memoryReplay.js",
  "memoryContextAssembly.js",
  "memoryRetrieval.js",
  "memoryTimeline.js",
  "memoryOutcomeIndex.js",
  "memoryLineage.js",
  "memoryExplainability.js",
  "memoryOwnership.js",
  "memoryLifecycle.js",
  "memoryRetentionPolicies.js",
  "memoryVersioning.js",
  "memoryAuditTrail.js",
  "memorySeedsRegistry.js",
  "memoryToBosProjection.js",
  "memoryToIntelligenceBridge.js",
  "runMemoryEngine.js",
];

gate(
  "G310 — Enterprise Memory Engine structure exists",
  requiredFiles.every((f) => exists(path.join(INTELLIGENCE, f)))
);

gate(
  "G310 — Official engine version",
  ENTERPRISE_MEMORY_ENGINE_VERSION === "mak-enterprise-memory-engine-v1" &&
    Object.values(MEMORY_STORE_TYPES).length >= 7
);

const tenantA = "gate-mem-tenant-a";
const tenantB = "gate-mem-tenant-b";

const evt = publishDomainEvent({
  tenantId: tenantA,
  eventType: "workflow.action.approve",
  eventCategory: "workflow.operation",
  workflowId: "bwf-gate-mem",
  intentId: "intent-gate-mem",
  assetId: "bwf-gate-mem",
  assetType: "business.asset.workflow",
  actorId: "aprovador-gate",
  businessSummary: "Aprovação registrada no gate de memória.",
  whatHappened: "Responsável aprovou pedido de compra.",
  businessImpact: "Processo encerrado com decisão humana.",
  outcome: { status: "aprovado", terminal: true, humanDecision: true },
});

ingestEventToMemoryEngine(evt);

publishDomainEvent({
  tenantId: tenantB,
  eventType: "intent.preview",
  eventCategory: "intent.operation",
  businessSummary: "Evento isolado tenant B",
  whatHappened: "Preview tenant B",
});

const recordsA = listEnterpriseMemoryRecords(tenantA, { limit: 20 });
const recordsB = listEnterpriseMemoryRecords(tenantB, { limit: 20 });

gate(
  "G310 — Tenant-scoped memory store",
  recordsA.some((r) => r.workflowId === "bwf-gate-mem") &&
    !recordsA.some((r) => r.tenantId === tenantB) &&
    recordsB.every((r) => r.tenantId === tenantB)
);

gate(
  "G310 — Event-to-memory persistence enriches records",
  recordsA.some((r) => r.storeType === MEMORY_STORE_TYPES.WORKFLOW && r.explainability?.explainable === true)
);

const retrieved = retrieveMemoryRecords(tenantA, { workflowId: "bwf-gate-mem" });
gate("G310 — Memory retrieval by context", retrieved.length >= 1);

const replay = replayMemorySequence(tenantA, { workflowId: "bwf-gate-mem" });
gate(
  "G310 — Memory replay explainable",
  replay.explainable === true && replay.steps.length >= 1 && replay.automatedActionForbidden === true
);

const context = assembleMemoryContext(tenantA);
gate(
  "G310 — Memory context assembly",
  context.explainable === true && context.belongsToEnterprise === true && context.summary.totalRecords >= 1
);

const summary = summarizeEnterpriseMemory(tenantA);
gate("G310 — Memory summarization", summary.explainable === true && summary.aiGenerated === false);

const bosProjection = buildMemoryEngineBosProjection(tenantA);
gate(
  "G310 — Memory-to-BOS projection uses business vocabulary",
  bosProjection.explainable === true &&
    !JSON.stringify(bosProjection).includes("localStorage") &&
    !JSON.stringify(bosProjection).includes("ChatGPT")
);

gate(
  "G310 — BOS Home wired to memory sections",
  read(path.join(BOS, "pages/BosHomePage.jsx")).includes("MemoryDecisionsSection") &&
    read(path.join(BOS, "pages/BosHomePage.jsx")).includes("MemoryWhySection") &&
    exists(path.join(BOS, "components/MemorySections.jsx"))
);

gate(
  "G310 — Domain bus ingests to memory engine",
  read(path.join(ROOT, "src/intelligence/bus/domainEventBus.js")).includes("ingestEventToMemoryEngine")
);

gate(
  "G310 — Intelligence bridge for future engines",
  bridgeMemoryToIntelligence(tenantA).knowledgeGraphReady === false &&
    bridgeMemoryToIntelligence(tenantA).seeds.seedCount >= 1
);

gate(
  "G310 — No chat assistant",
  !read(path.join(ROOT, "src/App.jsx")).includes("/chat") &&
    MEMORY_ENGINE_EXTENSION_POINTS.some((ep) => ep.id === "ai.chat.assistant" && ep.forbiddenForBusinessUser)
);

const bosFiles = [path.join(BOS, "pages/BosHomePage.jsx"), path.join(BOS, "components/MemorySections.jsx")];
gate(
  "G310 — No technical memory UI for business user",
  bosFiles.every(
    (f) => !read(f).includes("EnterpriseMemoryStore") && !read(f).includes("memory/engine")
  )
);

const engineRun = runMemoryEngine(tenantA);
gate("G310 — Memory engine orchestrator", engineRun.engineVersion === ENTERPRISE_MEMORY_ENGINE_VERSION);

const homeProjection = buildIntelligenceHomeProjection(tenantA);
gate("G310 — Intelligence home uses memory engine", homeProjection.hasMemory === true);

const designerFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("/designers/"));
let bypass = false;
for (const file of designerFiles) {
  if (/ingestEventToMemoryEngine|runMemoryEngine/.test(file.content)) {
    bypass = true;
    break;
  }
}
gate("G310 — No memory engine bypass in designers", !bypass);

try {
  execSync("node scripts/gate-enterprise-intelligence-foundation.mjs", { stdio: "pipe" });
  gate("G310 — G309 Intelligence Foundation still green", true);
} catch {
  gate("G310 — G309 Intelligence Foundation still green", false, "G309 failed");
}

try {
  execSync("node scripts/gate-business-operating-shell.mjs", { stdio: "pipe" });
  gate("G310 — G307 BOS still green", true);
} catch {
  gate("G310 — G307 BOS still green", false, "G307 failed");
}

const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`\nG310: ${passed}/${total} checks passed`);
if (passed !== total) process.exit(1);
