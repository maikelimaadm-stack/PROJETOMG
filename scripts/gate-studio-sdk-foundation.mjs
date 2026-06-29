#!/usr/bin/env node
/**
 * Gates G262–G266 — MAK Studio SDK & Registry Foundation (Program 2.0.5)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const STUDIO = path.join(ROOT, "src/studio");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const sdkContracts = [
  "workspaceApi.js",
  "dockApi.js",
  "explorerApi.js",
  "inspectorApi.js",
  "historyApi.js",
  "previewApi.js",
  "publishApi.js",
  "commandApi.js",
  "selectionApi.js",
  "clipboardApi.js",
  "dragDropApi.js",
  "pluginApi.js",
];

const registryFiles = [
  "componentRegistry.js",
  "propertyRegistry.js",
  "eventRegistry.js",
  "actionRegistry.js",
  "capabilityRegistry.js",
  "designerRegistry.js",
  "bootstrapStudioRegistries.js",
];

gate(
  "G262 — Studio SDK package exists",
  exists(path.join(STUDIO, "sdk/createStudioSdk.js")) &&
    exists(path.join(STUDIO, "index.js")) &&
    sdkContracts.every((file) => exists(path.join(STUDIO, "sdk/contracts", file)))
);

gate(
  "G263 — Studio registries + catalogs exist",
  registryFiles.every((file) => exists(path.join(STUDIO, "registry", file))) &&
    exists(path.join(STUDIO, "registry/catalogs/studioComponents.catalog.js")) &&
    exists(path.join(STUDIO, "registry/catalogs/studioProperties.catalog.js"))
);

let smokeOk = false;
try {
  execSync("node scripts/smoke-studio-sdk.mjs", { cwd: ROOT, stdio: "pipe" });
  smokeOk = true;
} catch {
  smokeOk = false;
}
gate("G264 — Studio SDK smoke (registries + APIs)", smokeOk);

const studioWalk = [];
const walk = (dir) => {
  if (!exists(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(jsx?|tsx?)$/.test(entry.name)) studioWalk.push(full);
  }
};
walk(STUDIO);

const foundationMutationImports = studioWalk.filter((file) => {
  const content = read(file);
  return (
    content.includes("registerMakLayoutConfigEngine") ||
    content.includes("registerMakFieldConfigEngine") ||
    content.includes("mdpPublishService") ||
    content.includes("prisma.")
  );
});

gate(
  "G265 — Studio SDK isolated from Foundation mutation",
  foundationMutationImports.length === 0,
  foundationMutationImports.map((f) => path.relative(ROOT, f)).join(", ")
);

const designerContractOk =
  exists(path.join(STUDIO, "sdk/studioDesignerContract.js")) &&
  exists(path.join(STUDIO, "sdk/studioPluginContract.js")) &&
  read(path.join(STUDIO, "sdk/studioDesignerContract.js")).includes("validateStudioDesigner");

gate("G266 — Designer + Plugin contracts defined", designerContractOk);

const failed = results.filter((r) => !r.ok);
console.log(`\nG262-G266: ${results.length - failed.length}/${results.length} gates passed`);
if (failed.length) process.exit(1);
