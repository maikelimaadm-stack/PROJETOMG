#!/usr/bin/env node
/**
 * Gate G294 — Studio Object Model Validation (Program 2.2.6)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  STUDIO_OBJECT_MODEL_VERSION,
  OFFICIAL_SOM_ENGINES,
  SOM_OBJECT_KINDS,
  BINDING_KINDS,
  OBJECT_MODEL_VERSION,
  PROPERTY_ENGINE_VERSION,
  BINDING_ENGINE_VERSION,
  BEHAVIOR_ENGINE_VERSION,
  OBJECT_IDENTITY_VERSION,
  STUDIO_PACKAGE_VERSION,
} from "../src/studio/som/index.js";
import { DEPENDENCY_STACK, PUBLIC_API_ENTRY_POINTS } from "../src/studio/governance/studioArchitectureConstants.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";

const ROOT = process.cwd();
const SOM = path.join(ROOT, "src/studio/som");
const LAYOUT = path.join(ROOT, "src/studio/designers/layout");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const somEngineFiles = [
  "contracts/somContracts.js",
  "object/studioObjectModel.js",
  "property/propertyEngine.js",
  "binding/bindingEngine.js",
  "behavior/behaviorEngine.js",
  "identity/objectIdentitySystem.js",
  "package/studioPackageModel.js",
  "index.js",
];

gate(
  "G294 — Studio Object Model structure exists",
  somEngineFiles.every((f) => exists(path.join(SOM, f)))
);

gate(
  "G294 — Official SOM version and engines",
  STUDIO_OBJECT_MODEL_VERSION === "mak-studio-object-model-v1" &&
    OFFICIAL_SOM_ENGINES.length === 6 &&
    OFFICIAL_SOM_ENGINES.every((e) =>
      ["object", "property", "binding", "behavior", "identity", "package"].includes(e)
    )
);

gate(
  "G294 — SOM engine versions defined",
  OBJECT_MODEL_VERSION === "mak-som-object-v1" &&
    PROPERTY_ENGINE_VERSION === "mak-som-property-v1" &&
    BINDING_ENGINE_VERSION === "mak-som-binding-v1" &&
    BEHAVIOR_ENGINE_VERSION === "mak-som-behavior-v1" &&
    OBJECT_IDENTITY_VERSION === "mak-som-identity-v1" &&
    STUDIO_PACKAGE_VERSION === "mak-som-package-v1"
);

gate(
  "G294 — SOM object and binding kinds",
  SOM_OBJECT_KINDS.length >= 6 &&
    BINDING_KINDS.includes("field") &&
    BINDING_KINDS.includes("formula") &&
    BINDING_KINDS.includes("ai")
);

gate(
  "G294 — Property Engine registrable schemas",
  read(path.join(SOM, "property/propertyEngine.js")).includes("registerPropertySchema") &&
    read(path.join(SOM, "property/propertyEngine.js")).includes("setValue")
);

gate(
  "G294 — Binding Engine multi-kind support",
  read(path.join(SOM, "binding/bindingEngine.js")).includes("registerBindingKind") &&
    read(path.join(SOM, "binding/bindingEngine.js")).includes("normalizeAll") &&
    read(path.join(SOM, "binding/bindingEngine.js")).includes("expression")
);

gate(
  "G294 — Behavior Engine policies",
  read(path.join(SOM, "behavior/behaviorEngine.js")).includes("registerBehaviorPolicy") &&
    read(path.join(SOM, "behavior/behaviorEngine.js")).includes("registerTrigger") &&
    read(path.join(SOM, "behavior/behaviorEngine.js")).includes("registerAction")
);

gate(
  "G294 — Object Identity System",
  read(path.join(SOM, "identity/objectIdentitySystem.js")).includes("generateId") &&
    read(path.join(SOM, "identity/objectIdentitySystem.js")).includes("parseId") &&
    read(path.join(SOM, "identity/objectIdentitySystem.js")).includes("renameId")
);

gate(
  "G294 — Studio Package Model hierarchy",
  read(path.join(SOM, "package/studioPackageModel.js")).includes("createStudioPackage") &&
    read(path.join(SOM, "package/studioPackageModel.js")).includes("createPackageModel") &&
    read(path.join(SOM, "package/studioPackageModel.js")).includes("fromProject")
);

gate(
  "G294 — Dependency stack includes studio-som",
  DEPENDENCY_STACK.some((l) => l.layerId === "studio-som" && l.paths.includes("som"))
);

gate(
  "G294 — Exported from Studio public API",
  read(path.join(ROOT, "src/studio/index.js")).includes("STUDIO_OBJECT_MODEL_VERSION") &&
    read(path.join(ROOT, "src/studio/index.js")).includes("createPropertyEngine") &&
    read(path.join(ROOT, "src/studio/index.js")).includes("createBindingEngine") &&
    PUBLIC_API_ENTRY_POINTS.some((p) => p.includes("som"))
);

gate(
  "G294 — Layout Studio consumes SOM exclusively",
  exists(path.join(LAYOUT, "som/layoutSomSetup.js")) &&
    read(path.join(LAYOUT, "som/layoutSomSetup.js")).includes("@/studio/som/index.js") &&
    read(path.join(LAYOUT, "document/registryToDocument.js")).includes("layoutSomSetup") &&
    read(path.join(LAYOUT, "commands/layoutCommandHandlers.js")).includes("layoutSomSetup") &&
    read(path.join(LAYOUT, "core/layoutCoreSetup.js")).includes("layoutSomSetup")
);

const forbiddenLocalSomPatterns = [
  /export\s+function\s+createStudioObjectModel\b/,
  /export\s+function\s+createPropertyEngine\b/,
  /export\s+function\s+createBindingEngine\b/,
  /export\s+function\s+createBehaviorEngine\b/,
  /export\s+function\s+createObjectIdentitySystem\b/,
  /export\s+function\s+createPackageModel\b/,
];

const designerFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("src/studio/designers/"));
const localSomViolations = [];
designerFiles.forEach(({ path: filePath, content }) => {
  forbiddenLocalSomPatterns.forEach((pattern) => {
    if (pattern.test(content)) {
      localSomViolations.push(path.relative(ROOT, filePath));
    }
  });
});
gate(
  "G294 — No designer implements SOM engines locally",
  localSomViolations.length === 0,
  localSomViolations.join(", ")
);

let governanceOk = false;
try {
  execSync("node scripts/gate-studio-architecture-governance.mjs", { cwd: ROOT, stdio: "pipe" });
  governanceOk = true;
} catch {
  governanceOk = false;
}
gate("G294 — Studio architecture governance still green", governanceOk);

const failed = results.filter((r) => !r.ok);
console.log(`\nG294: ${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exit(1);
