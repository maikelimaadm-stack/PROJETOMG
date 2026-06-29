#!/usr/bin/env node
/**
 * Gate G290 — Studio Contribution Engine Foundation (Program 2.1A.7)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  OFFICIAL_CONTRIBUTION_TYPES,
  OFFICIAL_REGISTRY_IDS,
} from "../src/studio/contributions/contracts/contributionContracts.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";
import { CONSUMER_LAYER_PATHS } from "../src/studio/governance/studioArchitectureConstants.js";

const ROOT = process.cwd();
const CONTRIBUTIONS = path.join(ROOT, "src/studio/contributions");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const requiredDirs = [
  "contracts",
  "store",
  "registryManager",
  "lifecycle",
  "validators",
];
gate(
  "G290 — Contribution Engine structure exists",
  requiredDirs.every((d) => exists(path.join(CONTRIBUTIONS, d))) &&
    exists(path.join(CONTRIBUTIONS, "contributionManager.js"))
);

const registerApis = [
  "registerExplorerContribution",
  "registerToolbarContribution",
  "registerInspectorContribution",
  "registerCommandContribution",
  "registerContextMenuContribution",
  "registerDockContribution",
  "registerPropertyContribution",
];
gate(
  "G290 — Contribution Manager public APIs",
  registerApis.every(
    (api) =>
      read(path.join(CONTRIBUTIONS, "contributionManager.js")).includes(api) &&
      read(path.join(ROOT, "src/studio/index.js")).includes(api)
  )
);

gate(
  "G290 — Official contribution types",
  OFFICIAL_CONTRIBUTION_TYPES.length === 7
);

gate(
  "G290 — Registry Manager wraps official registries",
  exists(path.join(CONTRIBUTIONS, "registryManager/registryManager.js")) &&
    OFFICIAL_REGISTRY_IDS.every((id) =>
      read(path.join(CONTRIBUTIONS, "registryManager/registryManager.js")).includes(`${id}:`)
    )
);

gate(
  "G290 — Lifecycle support (register/unregister/enable/disable/unload)",
  read(path.join(CONTRIBUTIONS, "lifecycle/contributionLifecycle.js")).includes("unregister") &&
    read(path.join(CONTRIBUTIONS, "lifecycle/contributionLifecycle.js")).includes("unload") &&
    read(path.join(CONTRIBUTIONS, "lifecycle/contributionLifecycle.js")).includes("enable")
);

gate(
  "G290 — Marketplace manifest contract",
  read(path.join(CONTRIBUTIONS, "contracts/contributionContracts.js")).includes("validateMakPackageManifest") &&
    read(path.join(CONTRIBUTIONS, "contributionManager.js")).includes("registerPackageContributions")
);

gate(
  "G290 — Exported from Studio public API",
  read(path.join(ROOT, "src/studio/index.js")).includes("STUDIO_CONTRIBUTIONS_VERSION") &&
    read(path.join(ROOT, "src/studio/index.js")).includes("getRegistryManager")
);

// Designers must not register directly in registries
const directRegistryPatterns = [
  /registerStudioComponent\s*\(/,
  /registerStudioAction\s*\(/,
  /registerStudioDesigner\s*\(/,
  /registerStudioProperty\s*\(/,
];
const designersDir = path.join(ROOT, "src/studio/designers");
let designerDirectRegistrations = [];
if (exists(designersDir)) {
  const walk = (dir) => {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
        const content = read(full);
        directRegistryPatterns.forEach((pattern) => {
          if (pattern.test(content)) {
            designerDirectRegistrations.push(path.relative(ROOT, full));
          }
        });
      }
    });
  };
  walk(designersDir);
}
gate(
  "G290 — No designer direct registry registration",
  designerDirectRegistrations.length === 0,
  designerDirectRegistrations.join("; ")
);

// Consumer layer (except bootstrap paths) should not import registry internals
const files = collectStudioFiles(ROOT);
const consumerRegistryViolations = [];
files.forEach(({ path: filePath, content }) => {
  const normalized = filePath.replace(/\\/g, "/");
  const studioIdx = normalized.indexOf("src/studio/");
  if (studioIdx < 0) return;
  const relative = normalized.slice(studioIdx + "src/studio/".length);
  const isConsumer = CONSUMER_LAYER_PATHS.some((p) => relative.startsWith(`${p}/`));
  if (!isConsumer) return;
  if (relative.includes("bootstrap")) return;
  if (content.includes("/registry/componentRegistry") || content.includes("/registry/actionRegistry")) {
    consumerRegistryViolations.push(relative);
  }
});
gate(
  "G290 — Consumer layer uses Contribution Engine (no direct registry internals)",
  consumerRegistryViolations.length === 0,
  consumerRegistryViolations.join("; ")
);

gate(
  "G290 — Contribution validators exist",
  exists(path.join(CONTRIBUTIONS, "validators/contributionValidators.js"))
);

let governanceOk = false;
try {
  execSync("node scripts/gate-studio-architecture-governance.mjs", { cwd: ROOT, stdio: "pipe" });
  governanceOk = true;
} catch {
  governanceOk = false;
}
gate("G290 — Studio architecture governance still green", governanceOk);

const failed = results.filter((r) => !r.ok);
console.log(`\nG290: ${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exit(1);
