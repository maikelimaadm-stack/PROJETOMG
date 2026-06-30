#!/usr/bin/env node
/**
 * Gate G309 — Enterprise Intelligence Foundation (Program 3.11, D-077)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  ENTERPRISE_INTELLIGENCE_VERSION,
  DOMAIN_EVENT_BUS_VERSION,
  BUSINESS_MEMORY_FOUNDATION_VERSION,
  BUSINESS_EVENT_ENVELOPE_VERSION,
  INTELLIGENCE_OWNERSHIP,
  INTELLIGENCE_EXTENSION_POINTS,
  publishDomainEvent,
  listDomainEvents,
  listBusinessMemoryRecords,
  processObservationLayer,
  buildBusinessEventTimeline,
  buildIntelligenceHomeProjection,
  validateIntelligenceSecurity,
  captureIntentOutcome,
  captureWorkflowOutcome,
} from "../src/intelligence/index.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";

const ROOT = process.cwd();
const INTELLIGENCE = path.join(ROOT, "src/intelligence");
const BOS = path.join(ROOT, "src/bos");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const requiredFiles = [
  "contracts/intelligenceContracts.js",
  "bus/businessEventEnvelope.js",
  "bus/domainEventBus.js",
  "memory/businessMemoryStore.js",
  "memory/lineageStorage.js",
  "memory/knowledgeSeeds.js",
  "capture/enterpriseContextCapture.js",
  "capture/workflowOutcomeCapture.js",
  "capture/intentOutcomeCapture.js",
  "capture/decisionCapture.js",
  "capture/outcomeCapture.js",
  "observation/observationRegistry.js",
  "observation/observationLayer.js",
  "observation/patternCapture.js",
  "timeline/businessEventTimeline.js",
  "signals/businessHealthSignals.js",
  "signals/explainableIntelligenceRecord.js",
  "registry/improvementOpportunityRegistry.js",
  "registry/consultingSignals.js",
  "registry/evolutionTelemetry.js",
  "security/intelligenceSecurityContracts.js",
  "integration/intelligenceEventBridge.js",
  "integration/bosIntelligenceProjection.js",
  "index.js",
];

gate(
  "G309 — Intelligence Foundation structure exists",
  requiredFiles.every((f) => exists(path.join(INTELLIGENCE, f)))
);

gate(
  "G309 — Official contract versions",
  ENTERPRISE_INTELLIGENCE_VERSION === "mak-enterprise-intelligence-v1" &&
    DOMAIN_EVENT_BUS_VERSION === "mak-domain-event-bus-v1" &&
    BUSINESS_MEMORY_FOUNDATION_VERSION === "mak-business-memory-foundation-v1" &&
    BUSINESS_EVENT_ENVELOPE_VERSION === "mak-business-event-envelope-v1"
);

gate(
  "G309 — Intelligence belongs to enterprise not AI",
  INTELLIGENCE_OWNERSHIP.belongsToEnterprise === true &&
    INTELLIGENCE_OWNERSHIP.belongsToAi === false &&
    INTELLIGENCE_OWNERSHIP.observationalOnly === true
);

const security = validateIntelligenceSecurity();
gate(
  "G309 — Security contracts forbid chat and autonomous execution",
  security.ok === true &&
    read(path.join(INTELLIGENCE, "security/intelligenceSecurityContracts.js")).includes(
      "chatAssistantForbiddenForBusinessUser"
    )
);

gate(
  "G309 — Domain Event Bus is tenant-scoped",
  read(path.join(INTELLIGENCE, "bus/domainEventBus.js")).includes("tenantId") &&
    read(path.join(INTELLIGENCE, "bus/domainEventBus.js")).includes("crossTenantLeakageForbidden")
);

const tenantA = "gate-tenant-a";
const tenantB = "gate-tenant-b";

const evtA = publishDomainEvent({
  tenantId: tenantA,
  eventType: "intent.preview",
  eventCategory: "intent.operation",
  businessSummary: "Gate test event A",
  whatHappened: "Test observation A",
});

publishDomainEvent({
  tenantId: tenantB,
  eventType: "intent.preview",
  eventCategory: "intent.operation",
  businessSummary: "Gate test event B",
  whatHappened: "Test observation B",
});

const eventsA = listDomainEvents(tenantA, { limit: 10 });
const eventsB = listDomainEvents(tenantB, { limit: 10 });

gate(
  "G309 — Events isolated per tenant",
  eventsA.some((e) => e.eventId === evtA.eventId) &&
    !eventsA.some((e) => e.tenantId === tenantB) &&
    eventsB.every((e) => e.tenantId === tenantB)
);

captureIntentOutcome({
  tenantId: tenantA,
  intentId: "intent-gate-test",
  ok: true,
  preview: false,
  assetType: "business.asset.workflow",
  assetId: "bwf-gate-test",
  intentPhrase: "Aprovar compras",
  explainability: "Intenção de aprovação registrada.",
});

captureWorkflowOutcome({
  tenantId: tenantA,
  workflowId: "bwf-gate-test",
  taskId: "task-gate-test",
  action: "approve",
  fromState: "aguardando_aprovacao",
  toState: "aprovado",
  workflowTitle: "Aprovação gate",
  explainability: "Aprovação registrada no gate.",
});

const memories = listBusinessMemoryRecords(tenantA, { limit: 20 });
gate("G309 — Business Memory Foundation persists records", memories.length >= 2);

const observation = processObservationLayer(tenantA);
gate(
  "G309 — Observation layer produces explainable signals",
  observation.explainable === true && observation.observationCount >= 0
);

const timeline = buildBusinessEventTimeline(tenantA, { limit: 5 });
gate(
  "G309 — Business Event Timeline answers what/when/tenant",
  timeline.length >= 1 &&
    timeline.every((t) => t.when && t.label && t.explainableRecord?.explainable === true)
);

const projection = buildIntelligenceHomeProjection(tenantA);
gate(
  "G309 — BOS projection uses business vocabulary",
  projection.health?.label === "Saúde operacional" &&
    !JSON.stringify(projection).includes("ChatGPT") &&
    !JSON.stringify(projection).includes("LLM")
);

gate(
  "G309 — BOS wired to intelligence bridge",
  read(path.join(BOS, "pages/BosHomePage.jsx")).includes("buildIntelligenceHomeProjection") &&
    read(path.join(BOS, "pages/BusinessFirstPage.jsx")).includes("bridgeIntentResolverResult") &&
    read(path.join(ROOT, "src/studio/business/workflow/businessWorkflowTaskInbox.js")).includes(
      "bridgeWorkflowTaskAction"
    )
);

gate(
  "G309 — No chat assistant route in App",
  !read(path.join(ROOT, "src/App.jsx")).includes("/chat") &&
    !read(path.join(ROOT, "src/App.jsx")).includes("ChatAssistant")
);

const bosFiles = [path.join(BOS, "pages/BosHomePage.jsx"), path.join(BOS, "pages/BusinessFirstPage.jsx")];
gate(
  "G309 — No technical intelligence UI exposed to business user",
  bosFiles.every(
    (f) =>
      !read(f).includes("DomainEventBus") &&
      !read(f).includes("EventEnvelope") &&
      !read(f).includes("intelligence/index")
  )
);

gate(
  "G309 — Future engines remain extension points only",
  INTELLIGENCE_EXTENSION_POINTS.every(
    (ep) => ep.implemented === false || ep.implemented === undefined
  ) &&
    INTELLIGENCE_EXTENSION_POINTS.some((ep) => ep.id === "ai.chat.assistant" && ep.forbiddenForBusinessUser)
);

const designerFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("/designers/"));
let intelligenceBypass = false;
for (const file of designerFiles) {
  if (/publishDomainEvent|processObservationLayer/.test(file.content)) {
    intelligenceBypass = true;
    break;
  }
}
gate("G309 — No intelligence bypass in Studio designers", !intelligenceBypass);

gate(
  "G309 — Intelligence layer independent of Studio designers",
  !read(path.join(INTELLIGENCE, "bus/domainEventBus.js")).includes("/designers/")
);

try {
  execSync("node scripts/gate-business-workflow.mjs", { stdio: "pipe" });
  gate("G309 — G308 Workflow still green", true);
} catch {
  gate("G309 — G308 Workflow still green", false, "G308 failed");
}

try {
  execSync("node scripts/gate-business-operating-shell.mjs", { stdio: "pipe" });
  gate("G309 — G307 BOS still green", true);
} catch {
  gate("G309 — G307 BOS still green", false, "G307 failed");
}

const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`\nG309: ${passed}/${total} checks passed`);
if (passed !== total) process.exit(1);
