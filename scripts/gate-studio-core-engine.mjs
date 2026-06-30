#!/usr/bin/env node
/**
 * Gate G293 — Studio Core Engine Validation (Program 2.2.5)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  STUDIO_CORE_VERSION,
  OFFICIAL_CORE_ENGINES,
  STUDIO_ARTIFACT_TYPES,
  DOCUMENT_ENGINE_VERSION,
  AST_ENGINE_VERSION,
  VALIDATION_ENGINE_VERSION,
  COMMAND_ENGINE_VERSION,
  STUDIO_PROJECT_VERSION,
  DEPENDENCY_GRAPH_VERSION,
  REFACTORING_ENGINE_VERSION,
} from "../src/studio/core/index.js";
import { DEPENDENCY_STACK, PUBLIC_API_ENTRY_POINTS } from "../src/studio/governance/studioArchitectureConstants.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";

const ROOT = process.cwd();
const CORE = path.join(ROOT, "src/studio/core");
const LAYOUT = path.join(ROOT, "src/studio/designers/layout");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const coreEngineFiles = [
  "contracts/coreContracts.js",
  "document/documentEngine.js",
  "ast/astEngine.js",
  "validation/validationEngine.js",
  "command/commandEngine.js",
  "project/studioProjectModel.js",
  "dependency/dependencyGraphEngine.js",
  "refactoring/refactoringEngine.js",
  "index.js",
];

gate(
  "G293 — Studio Core structure exists",
  coreEngineFiles.every((f) => exists(path.join(CORE, f)))
);

gate(
  "G293 — Official Core version and engines",
  STUDIO_CORE_VERSION === "mak-studio-core-v1" &&
    OFFICIAL_CORE_ENGINES.length === 7 &&
    OFFICIAL_CORE_ENGINES.every((e) =>
      ["document", "ast", "validation", "command", "project", "dependency", "refactoring"].includes(e)
    )
);

gate(
  "G293 — Core engine versions defined",
  DOCUMENT_ENGINE_VERSION === "mak-document-engine-v1" &&
    AST_ENGINE_VERSION === "mak-ast-engine-v1" &&
    VALIDATION_ENGINE_VERSION === "mak-validation-engine-v1" &&
    COMMAND_ENGINE_VERSION === "mak-command-engine-v1" &&
    STUDIO_PROJECT_VERSION === "mak-studio-project-v1" &&
    DEPENDENCY_GRAPH_VERSION === "mak-dependency-graph-v1" &&
    REFACTORING_ENGINE_VERSION === "mak-refactoring-engine-v1"
);

gate(
  "G293 — Studio Project artifact types",
  STUDIO_ARTIFACT_TYPES.length === 6 &&
    STUDIO_ARTIFACT_TYPES.includes("layout") &&
    STUDIO_ARTIFACT_TYPES.includes("field") &&
    STUDIO_ARTIFACT_TYPES.includes("workflow")
);

gate(
  "G293 — Document Engine capabilities",
  read(path.join(CORE, "document/documentEngine.js")).includes("createDocumentEngine") &&
    read(path.join(CORE, "document/documentEngine.js")).includes("createDocumentStore") &&
    read(path.join(CORE, "document/documentEngine.js")).includes("migrate") &&
    read(path.join(CORE, "document/documentEngine.js")).includes("serialize")
);

gate(
  "G293 — AST Engine capabilities",
  read(path.join(CORE, "ast/astEngine.js")).includes("registerTransformer") &&
    read(path.join(CORE, "ast/astEngine.js")).includes("registerCompiler") &&
    read(path.join(CORE, "ast/astEngine.js")).includes("registerVisitor") &&
    read(path.join(CORE, "ast/astEngine.js")).includes("parse") &&
    read(path.join(CORE, "ast/astEngine.js")).includes("compile")
);

gate(
  "G293 — Validation Engine registrable rules",
  read(path.join(CORE, "validation/validationEngine.js")).includes("registerRule") &&
    read(path.join(CORE, "validation/validationEngine.js")).includes("suggestions") &&
    read(path.join(CORE, "validation/validationEngine.js")).includes("optimizations")
);

gate(
  "G293 — Command Engine base",
  read(path.join(CORE, "command/commandEngine.js")).includes("createCommandEngine") &&
    read(path.join(CORE, "command/commandEngine.js")).includes("applyCommand") &&
    read(path.join(CORE, "command/commandEngine.js")).includes("dispatch")
);

gate(
  "G293 — Dependency Graph Engine",
  read(path.join(CORE, "dependency/dependencyGraphEngine.js")).includes("addNode") &&
    read(path.join(CORE, "dependency/dependencyGraphEngine.js")).includes("addEdge") &&
    read(path.join(CORE, "dependency/dependencyGraphEngine.js")).includes("getDependents")
);

gate(
  "G293 — Refactoring Engine",
  read(path.join(CORE, "refactoring/refactoringEngine.js")).includes("renameArtifact") &&
    read(path.join(CORE, "refactoring/refactoringEngine.js")).includes("renameBinding")
);

gate(
  "G293 — Dependency stack includes studio-core",
  DEPENDENCY_STACK.some((l) => l.layerId === "studio-core" && l.paths.includes("core"))
);

gate(
  "G293 — Exported from Studio public API",
  read(path.join(ROOT, "src/studio/index.js")).includes("STUDIO_CORE_VERSION") &&
    read(path.join(ROOT, "src/studio/index.js")).includes("createDocumentEngine") &&
    read(path.join(ROOT, "src/studio/index.js")).includes("createValidationEngine") &&
    PUBLIC_API_ENTRY_POINTS.some((p) => p.includes("core"))
);

gate(
  "G293 — Layout Studio consumes Core exclusively",
  exists(path.join(LAYOUT, "core/layoutCoreSetup.js")) &&
    read(path.join(LAYOUT, "core/layoutCoreSetup.js")).includes("@/studio/core/index.js") &&
    read(path.join(LAYOUT, "core/layoutCoreSetup.js")).includes("createDocumentEngine") &&
    read(path.join(LAYOUT, "commands/createLayoutCommandBus.js")).includes("layoutCoreSetup") &&
    read(path.join(LAYOUT, "validation/layoutValidationEngine.js")).includes("layoutCoreSetup") &&
    read(path.join(LAYOUT, "document/layoutDocumentStore.js")).includes("layoutCoreSetup")
);

const forbiddenLocalEnginePatterns = [
  /export\s+function\s+createDocumentEngine\b/,
  /export\s+function\s+createAstEngine\b/,
  /export\s+function\s+createValidationEngine\b/,
  /export\s+function\s+createCommandEngine\b/,
  /export\s+function\s+createDependencyGraphEngine\b/,
  /export\s+function\s+createRefactoringEngine\b/,
];

const designerFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("src/studio/designers/"));
const localEngineViolations = [];
designerFiles.forEach(({ path: filePath, content }) => {
  if (filePath.includes("/core/") && !filePath.includes("/designers/")) return;
  forbiddenLocalEnginePatterns.forEach((pattern) => {
    if (pattern.test(content)) {
      localEngineViolations.push(path.relative(ROOT, filePath));
    }
  });
});
gate(
  "G293 — No designer implements Core engines locally",
  localEngineViolations.length === 0,
  localEngineViolations.join(", ")
);

let governanceOk = false;
try {
  execSync("node scripts/gate-studio-architecture-governance.mjs", { cwd: ROOT, stdio: "pipe" });
  governanceOk = true;
} catch {
  governanceOk = false;
}
gate("G293 — Studio architecture governance still green", governanceOk);

const failed = results.filter((r) => !r.ok);
console.log(`\nG293: ${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exit(1);
