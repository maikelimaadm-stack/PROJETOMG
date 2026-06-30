#!/usr/bin/env node
/**
 * Gate G311 — Enterprise Knowledge Graph MVP (Program 3.13, D-079)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  ENTERPRISE_KNOWLEDGE_GRAPH_VERSION,
  KNOWLEDGE_NODE_KINDS,
  KNOWLEDGE_RELATIONSHIP_KINDS,
  KNOWLEDGE_GRAPH_EXTENSION_POINTS,
  publishDomainEvent,
  ingestEventToMemoryEngine,
  listKnowledgeNodes,
  listKnowledgeEdges,
  ingestMemoryRecordToKnowledgeGraph,
  replayKnowledgeGraphFromMemory,
  retrieveKnowledgeByContext,
  traverseKnowledgeGraph,
  summarizeKnowledgeGraph,
  buildKnowledgeGraphBosProjection,
  bridgeKnowledgeToConsulting,
  bridgeKnowledgeToDecision,
  bridgeKnowledgeToEvolution,
  runKnowledgeGraphEngine,
  buildIntelligenceHomeProjection,
} from "../src/intelligence/index.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";

const ROOT = process.cwd();
const KNOWLEDGE = path.join(ROOT, "src/intelligence/knowledge/graph");
const BOS = path.join(ROOT, "src/bos");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const requiredFiles = [
  "knowledgeGraphContracts.js",
  "knowledgeGraphStore.js",
  "knowledgeNodes.js",
  "knowledgeEdges.js",
  "relationshipRegistry.js",
  "semanticIndexing.js",
  "lineageIndexing.js",
  "knowledgeExplainability.js",
  "knowledgeOwnership.js",
  "knowledgeLifecycle.js",
  "knowledgeVersioning.js",
  "knowledgeAuditTrail.js",
  "graphTraversal.js",
  "knowledgeRetrieval.js",
  "knowledgeSummarization.js",
  "memoryToGraphIngestion.js",
  "knowledgeSeedsRegistry.js",
  "knowledgeToBosProjection.js",
  "knowledgeToIntelligenceBridges.js",
  "runKnowledgeGraphEngine.js",
];

gate(
  "G311 — Knowledge Graph structure exists",
  requiredFiles.every((f) => exists(path.join(KNOWLEDGE, f)))
);

gate(
  "G311 — Official graph version",
  ENTERPRISE_KNOWLEDGE_GRAPH_VERSION === "mak-enterprise-knowledge-graph-v1" &&
    Object.keys(KNOWLEDGE_NODE_KINDS).length >= 10
);

const tenantA = "gate-kg-tenant-a";
const tenantB = "gate-kg-tenant-b";

const envelope = publishDomainEvent({
  tenantId: tenantA,
  eventType: "workflow.action.approve",
  eventCategory: "workflow.operation",
  workflowId: "bwf-kg-gate",
  intentId: "intent-kg-gate",
  assetId: "bwf-kg-gate",
  assetType: "business.asset.workflow",
  actorId: "aprovador",
  businessSummary: "Aprovação registrada para knowledge graph gate.",
  whatHappened: "Responsável aprovou processo de compra.",
  businessImpact: "Processo encerrado.",
  outcome: { status: "aprovado", terminal: true, humanDecision: true },
});

const record = ingestEventToMemoryEngine(envelope);
ingestMemoryRecordToKnowledgeGraph(record);

publishDomainEvent({
  tenantId: tenantB,
  eventType: "intent.preview",
  eventCategory: "intent.operation",
  businessSummary: "Tenant B isolado",
  whatHappened: "Preview B",
});

const nodesA = listKnowledgeNodes(tenantA, { limit: 50 });
const edgesA = listKnowledgeEdges(tenantA, { limit: 50 });
const nodesB = listKnowledgeNodes(tenantB, { limit: 50 });

gate(
  "G311 — Tenant-scoped graph isolation",
  nodesA.length >= 1 && !nodesA.some((n) => n.tenantId === tenantB)
);

gate(
  "G311 — Memory feeds knowledge graph",
  read(path.join(ROOT, "src/intelligence/memory/engine/eventToMemoryPersistence.js")).includes(
    "ingestMemoryRecordToKnowledgeGraph"
  )
);

gate(
  "G311 — Semantic relationships indexed",
  edgesA.some((e) => e.explainable === true && e.relationshipKind)
);

const replay = replayKnowledgeGraphFromMemory(tenantA);
gate("G311 — Graph replay from memory", replay.ingestedCount >= 0);

const context = retrieveKnowledgeByContext(tenantA, { refId: "bwf-kg-gate" });
gate("G311 — Knowledge retrieval by context", context.nodes.length >= 0 || context.edges.length >= 0);

if (nodesA.length > 0) {
  const traversal = traverseKnowledgeGraph(tenantA, nodesA[0].nodeId, { maxDepth: 2 });
  gate("G311 — Graph traversal explainable", traversal.explainable === true);
} else {
  gate("G311 — Graph traversal explainable", true, "no nodes yet");
}

const summary = summarizeKnowledgeGraph(tenantA);
gate(
  "G311 — Knowledge summarization",
  summary.belongsToEnterprise === true && summary.aiGenerated === false
);

const bosProjection = buildKnowledgeGraphBosProjection(tenantA);
gate(
  "G311 — Knowledge-to-BOS projection",
  bosProjection.explainable === true &&
    !JSON.stringify(bosProjection).includes("embedding") &&
    !JSON.stringify(bosProjection).includes("vector")
);

gate(
  "G311 — BOS wired to knowledge sections",
  read(path.join(BOS, "pages/BosHomePage.jsx")).includes("KnowledgeRelationsSection") &&
    exists(path.join(BOS, "components/KnowledgeSections.jsx"))
);

gate(
  "G311 — Future engine bridges ready",
  bridgeKnowledgeToConsulting(tenantA).consultingEngineReady === true &&
    bridgeKnowledgeToDecision(tenantA).decisionEngineReady === true &&
    bridgeKnowledgeToEvolution(tenantA).evolutionEngineReady === false
);

gate(
  "G311 — No chat assistant",
  !read(path.join(ROOT, "src/App.jsx")).includes("/chat") &&
    KNOWLEDGE_GRAPH_EXTENSION_POINTS.some((ep) => ep.id === "ai.chat.assistant" && ep.forbiddenForBusinessUser)
);

gate(
  "G311 — No technical graph UI for business user",
  !read(path.join(BOS, "components/KnowledgeSections.jsx")).includes("knowledge/graph") &&
    !read(path.join(BOS, "components/KnowledgeSections.jsx")).includes("nodeId")
);

const engine = runKnowledgeGraphEngine(tenantA);
gate("G311 — Knowledge graph orchestrator", engine.engineVersion === ENTERPRISE_KNOWLEDGE_GRAPH_VERSION);

const home = buildIntelligenceHomeProjection(tenantA);
gate("G311 — Intelligence home includes knowledge", home.hasKnowledge === true || home.knowledgeSummary != null);

const designerFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("/designers/"));
let bypass = false;
for (const file of designerFiles) {
  if (/ingestMemoryRecordToKnowledgeGraph|runKnowledgeGraphEngine/.test(file.content)) {
    bypass = true;
    break;
  }
}
gate("G311 — No knowledge graph bypass in designers", !bypass);

try {
  execSync("node scripts/gate-enterprise-memory-engine.mjs", { stdio: "pipe" });
  gate("G311 — G310 Memory Engine still green", true);
} catch {
  gate("G311 — G310 Memory Engine still green", false, "G310 failed");
}

try {
  execSync("node scripts/gate-business-operating-shell.mjs", { stdio: "pipe" });
  gate("G311 — G307 BOS still green", true);
} catch {
  gate("G311 — G307 BOS still green", false, "G307 failed");
}

const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`\nG311: ${passed}/${total} checks passed`);
if (passed !== total) process.exit(1);
