#!/usr/bin/env node
/**
 * Gates G279–G284 — MAK Studio Architecture Governance (Program 2.0.8)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  checkDesignerIsolation,
  checkStudioDependencyRules,
  checkRegistryProtection,
  checkPublicApiValidation,
  checkArchitectureBoundaries,
  checkDependencyGraphValidation,
  collectStudioFiles,
  validateStudioArchitecture,
} from "../src/studio/governance/architectureRules.js";

const ROOT = process.cwd();
const GOV = path.join(ROOT, "src/studio/governance");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const files = collectStudioFiles(ROOT);

gate(
  "G279 — Designer Isolation",
  exists(path.join(GOV, "architectureRules.js")) &&
    exists(path.join(GOV, "dependencyGraph.js")) &&
    checkDesignerIsolation(files).length === 0,
  checkDesignerIsolation(files).map((v) => v.message).join("; ")
);

gate(
  "G280 — Studio Dependency Rules",
  exists(path.join(GOV, "studioArchitectureConstants.js")) &&
    read(path.join(GOV, "studioArchitectureConstants.js")).includes("DEPENDENCY_STACK") &&
    checkStudioDependencyRules(files).length === 0,
  checkStudioDependencyRules(files).slice(0, 3).map((v) => v.message).join("; ")
);

gate(
  "G281 — Registry Protection",
  checkRegistryProtection(ROOT).length === 0,
  checkRegistryProtection(ROOT).map((v) => v.message).join("; ")
);

gate(
  "G282 — Public API Validation",
  read(path.join(ROOT, "src/studio/index.js")).includes("createStudioSdk") &&
    read(path.join(ROOT, "src/studio/index.js")).includes("getStudioEventHub") &&
    checkPublicApiValidation(files).length === 0,
  checkPublicApiValidation(files).map((v) => v.message).join("; ")
);

gate(
  "G283 — Architecture Boundary Validation",
  checkArchitectureBoundaries(files).length === 0,
  checkArchitectureBoundaries(files).slice(0, 3).map((v) => v.message).join("; ")
);

gate(
  "G284 — Dependency Graph Validation",
  exists(path.join(GOV, "dependencyGraph.js")) &&
    read(path.join(GOV, "dependencyGraph.js")).includes("validateDependencyGraph") &&
    checkDependencyGraphValidation(files).length === 0,
  checkDependencyGraphValidation(files).slice(0, 3).map((v) => v.message).join("; ")
);

let smokeOk = false;
try {
  execSync("node scripts/smoke-studio-governance.mjs", { cwd: ROOT, stdio: "pipe" });
  smokeOk = true;
} catch (e) {
  smokeOk = false;
}
if (!smokeOk) {
  gate("G284b — Governance smoke test", false, "smoke-studio-governance failed");
}

const failed = results.filter((r) => !r.ok);
console.log(`\nG279-G284: ${results.length - failed.length}/${results.length} gates passed`);
if (failed.length) process.exit(1);
