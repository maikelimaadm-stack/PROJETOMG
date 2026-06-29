#!/usr/bin/env node
/**
 * Gates G273–G278 — MAK Studio Event Architecture (Program 2.0.7)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const EV = path.join(ROOT, "src/studio/events");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

gate(
  "G273 — Studio Event Architecture package exists",
  exists(path.join(EV, "bootstrapStudioEvents.js")) &&
    exists(path.join(EV, "eventArchitectureConstants.js")) &&
    exists(path.join(EV, "hub/studioEventHub.js")) &&
    exists(path.join(EV, "registry/eventBusRegistry.js")) &&
    exists(path.join(EV, "catalogs/studioBusEvents.catalog.js"))
);

gate(
  "G274 — Event Hub contracts (publish, subscribe, once, broadcast, scope)",
  read(path.join(EV, "hub/studioEventHub.js")).includes("publish") &&
    read(path.join(EV, "hub/studioEventHub.js")).includes("subscribe") &&
    read(path.join(EV, "hub/studioEventHub.js")).includes("once") &&
    read(path.join(EV, "hub/studioEventHub.js")).includes("broadcast") &&
    read(path.join(EV, "hub/studioEventHub.js")).includes("setScope")
);

gate(
  "G275 — Event Manifest + payload contracts",
  read(path.join(EV, "contracts/eventManifestContract.js")).includes("validateEventManifest") &&
    read(path.join(EV, "contracts/eventPayloadContracts.js")).includes("validateEventPayload") &&
    read(path.join(EV, "contracts/collaborationEventContract.js")).includes("COLLABORATION_EVENT_MANIFESTS")
);

gate(
  "G276 — Plugin + Designer + History + Preview integration",
  exists(path.join(EV, "integration/pluginEventIntegration.js")) &&
    exists(path.join(EV, "integration/designerEventIntegration.js")) &&
    exists(path.join(EV, "integration/historyEventIntegration.js")) &&
    exists(path.join(EV, "integration/previewEventIntegration.js"))
);

let smokeOk = false;
try {
  execSync("node scripts/smoke-studio-events.mjs", { cwd: ROOT, stdio: "pipe" });
  smokeOk = true;
} catch {
  smokeOk = false;
}
gate("G277 — Studio Event Architecture smoke (hub + registry)", smokeOk);

const eventsWalk = [];
const walk = (dir) => {
  if (!exists(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(jsx?|tsx?)$/.test(entry.name)) eventsWalk.push(full);
  }
};
walk(EV);

const forbiddenImports = eventsWalk.filter((file) => {
  const content = read(file);
  return (
    content.includes("src/framework/mak") ||
    content.includes("ModeloBase1") ||
    content.includes("mdpPublishService") ||
    content.includes("registerMak") ||
    content.includes("prisma.")
  );
});

gate(
  "G278 — Event Architecture isolated + no SDK/DS duplication",
  forbiddenImports.length === 0 &&
    !exists(path.join(EV, "sdk")) &&
    !exists(path.join(EV, "designSystem")) &&
    read(path.join(ROOT, "src/studio/index.js")).includes("bootstrapStudioEvents"),
  forbiddenImports.map((f) => path.relative(ROOT, f)).join(", ")
);

const failed = results.filter((r) => !r.ok);
console.log(`\nG273-G278: ${results.length - failed.length}/${results.length} gates passed`);
if (failed.length) process.exit(1);
