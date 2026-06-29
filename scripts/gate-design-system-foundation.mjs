#!/usr/bin/env node
/**
 * Gates G267–G271 — MAK Design System Foundation (Program 2.0.6)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const DS = path.join(ROOT, "src/studio/designSystem");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const registryFiles = [
  "tokenRegistry.js",
  "themeRegistry.js",
  "motionRegistry.js",
  "accessibilityRegistry.js",
  "manifestRegistry.js",
];

gate(
  "G267 — Design System Foundation package exists",
  exists(path.join(DS, "bootstrapDesignSystem.js")) &&
    exists(path.join(DS, "designSystemConstants.js")) &&
    registryFiles.every((f) => exists(path.join(DS, "registry", f))) &&
    exists(path.join(DS, "integration/registryIntegration.js"))
);

gate(
  "G268 — Token, Theme, Motion, Accessibility registries + catalogs",
  exists(path.join(DS, "catalogs/designTokens.catalog.js")) &&
    exists(path.join(DS, "catalogs/designThemes.catalog.js")) &&
    exists(path.join(DS, "catalogs/designMotions.catalog.js")) &&
    exists(path.join(DS, "catalogs/designAccessibility.catalog.js"))
);

gate(
  "G269 — Component Manifest + Universal Component Model contracts",
  read(path.join(DS, "contracts/componentManifestContract.js")).includes("validateComponentManifest") &&
    read(path.join(DS, "contracts/universalComponentModel.js")).includes("validateUniversalComponent") &&
    read(path.join(DS, "contracts/aiComponentKnowledge.js")).includes("buildAiComponentKnowledge")
);

let smokeOk = false;
try {
  execSync("node scripts/smoke-design-system.mjs", { cwd: ROOT, stdio: "pipe" });
  smokeOk = true;
} catch {
  smokeOk = false;
}
gate("G270 — Design System smoke (manifest + token integrity)", smokeOk);

const studioWalk = [];
const walk = (dir) => {
  if (!exists(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(jsx?|tsx?)$/.test(entry.name)) studioWalk.push(full);
  }
};
walk(path.join(ROOT, "src/studio/designSystem"));

const foundationImports = studioWalk.filter((file) => {
  const content = read(file);
  return (
    content.includes("src/framework/mak") ||
    content.includes("ModeloBase1") ||
    content.includes("mdpPublishService") ||
    content.includes("registerMak")
  );
});

gate(
  "G271 — Design System isolated from Foundation/MDP mutation",
  foundationImports.length === 0,
  foundationImports.map((f) => path.relative(ROOT, f)).join(", ")
);

const sdkDuplication = exists(path.join(DS, "sdk"));
gate(
  "G272 — No duplication with Studio SDK layer",
  !sdkDuplication && read(path.join(ROOT, "src/studio/index.js")).includes("bootstrapDesignSystem")
);

const failed = results.filter((r) => !r.ok);
console.log(`\nG267-G272: ${results.length - failed.length}/${results.length} gates passed`);
if (failed.length) process.exit(1);
