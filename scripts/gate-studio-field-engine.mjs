#!/usr/bin/env node
/**
 * Gate G296 — Field Studio Engine Validation (Program 2.3)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { FIELD_DOCUMENT_VERSION } from "../src/studio/designers/field/document/fieldDocumentContracts.js";
import { FIELD_AST_VERSION } from "../src/studio/designers/field/ast/fieldAstContracts.js";
import { FieldCommandTypes } from "../src/studio/designers/field/commands/fieldCommandTypes.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";
import { FORBIDDEN_FOUNDATION_PATTERNS } from "../src/studio/governance/studioArchitectureConstants.js";

const ROOT = process.cwd();
const FIELD = path.join(ROOT, "src/studio/designers/field");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const engineFiles = [
  "document/fieldDocumentContracts.js",
  "document/fieldDocumentStore.js",
  "document/documentToAst.js",
  "document/dictionaryToDocument.js",
  "ast/fieldAstContracts.js",
  "ast/astToMdpPayloads.js",
  "commands/fieldCommandTypes.js",
  "commands/createFieldCommandBus.js",
  "canvas/FieldCanvas.jsx",
  "validation/fieldValidationEngine.js",
  "preview/fieldPreviewBridge.js",
  "FieldDocumentProvider.jsx",
  "FieldDesignerPlugin.jsx",
  "registerFieldDesigner.js",
  "editor/fieldEditorRegistration.jsx",
];

gate(
  "G296 — Field Engine structure exists",
  engineFiles.every((f) => exists(path.join(FIELD, f))) &&
    exists(path.join(FIELD, "core/fieldCoreSetup.js"))
);

gate(
  "G296 — Field consumes Studio Core Engine",
  read(path.join(FIELD, "core/fieldCoreSetup.js")).includes("@/studio/core/index.js") &&
    read(path.join(FIELD, "commands/createFieldCommandBus.js")).includes("fieldCoreSetup") &&
    read(path.join(FIELD, "validation/fieldValidationEngine.js")).includes("fieldCoreSetup") &&
    read(path.join(FIELD, "document/fieldDocumentStore.js")).includes("fieldCoreSetup")
);

gate(
  "G296 — Field consumes Studio Object Model",
  exists(path.join(FIELD, "som/fieldSomSetup.js")) &&
    read(path.join(FIELD, "som/fieldSomSetup.js")).includes("@/studio/som/index.js") &&
    read(path.join(FIELD, "document/dictionaryToDocument.js")).includes("fieldDocumentContracts") &&
    read(path.join(FIELD, "commands/fieldCommandHandlers.js")).includes("fieldSomSetup")
);

gate(
  "G296 — Field consumes Studio Editor Engine",
  exists(path.join(FIELD, "editor/fieldEditorRegistration.jsx")) &&
    read(path.join(FIELD, "editor/fieldEditorRegistration.jsx")).includes("getEditorCatalog") &&
    read(path.join(ROOT, "src/studio/shell/StudioProductionShellProvider.jsx")).includes("registerFieldEditor") &&
    read(path.join(ROOT, "src/studio/editor/StudioEditorShellBridge.jsx")).includes("EditorHost")
);

gate(
  "G296 — Field Document official contract",
  FIELD_DOCUMENT_VERSION === "mak-field-document-v1" &&
    read(path.join(FIELD, "document/fieldDocumentContracts.js")).includes("groups") &&
    read(path.join(FIELD, "document/fieldDocumentContracts.js")).includes("fieldNodeId")
);

gate(
  "G296 — Field AST implemented",
  FIELD_AST_VERSION === "mak-field-ast-v1" &&
    exists(path.join(FIELD, "document/documentToAst.js")) &&
    exists(path.join(FIELD, "ast/astToMdpPayloads.js"))
);

const requiredCommands = ["ADD_FIELD", "DELETE_FIELD", "REORDER_FIELD", "UPDATE_PROPERTY"];
gate(
  "G296 — Command system mandatory",
  requiredCommands.every((c) => read(path.join(FIELD, "commands/fieldCommandTypes.js")).includes(c))
);

gate(
  "G296 — No direct JSON editing in designer UI",
  !read(path.join(FIELD, "FieldDesignerPlugin.jsx")).includes("JSON.parse") &&
    !read(path.join(FIELD, "FieldDesignerPlugin.jsx")).includes("textarea") &&
    read(path.join(FIELD, "FieldDocumentProvider.jsx")).includes("createFieldCommandBus")
);

gate(
  "G296 — No local Field Engine (uses Core only)",
  !read(path.join(FIELD, "core/fieldCoreSetup.js")).includes("createFieldEngine") &&
    !exists(path.join(FIELD, "engine/")) &&
    !exists(path.join(FIELD, "FieldEngine.js"))
);

gate(
  "G296 — Preview via Compile only",
  read(path.join(FIELD, "preview/fieldPreviewBridge.js")).includes("mdpCompile") &&
    read(path.join(FIELD, "preview/fieldPreviewBridge.js")).includes("documentToAst") &&
    !read(path.join(FIELD, "preview/fieldPreviewBridge.js")).includes("runtimeBridge")
);

gate(
  "G296 — MDP field client (public API)",
  exists(path.join(ROOT, "src/studio/services/mdpFieldClient.js")) &&
    read(path.join(ROOT, "src/studio/services/mdpFieldClient.js")).includes("apiClient") &&
    read(path.join(FIELD, "FieldDocumentProvider.jsx")).includes("mdpFieldList")
);

gate(
  "G296 — Designer registered via Contribution Manager",
  read(path.join(FIELD, "registerFieldDesigner.js")).includes("getContributionManager") &&
    read(path.join(FIELD, "registerFieldDesigner.js")).includes("getRegistryManager") &&
    !read(path.join(FIELD, "registerFieldDesigner.js")).includes("registerStudioDesigner(")
);

gate(
  "G296 — Shell mounts field designer",
  read(path.join(ROOT, "src/studio/shell/studioShellConfig.js")).includes('"field"') &&
    read(path.join(ROOT, "src/studio/shell/StudioProductionShellProvider.jsx")).includes("registerFieldDesigner")
);

const fieldFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("src/studio/designers/field/"));
const forbidden = fieldFiles.filter(({ content }) =>
  FORBIDDEN_FOUNDATION_PATTERNS.some(({ pattern }) => pattern.test(content))
);
gate(
  "G296 — No foundation/runtime forbidden imports in field designer",
  forbidden.length === 0,
  forbidden.map((f) => path.basename(f.path)).join(", ")
);

gate(
  "G296 — Layout Studio unchanged (still registered)",
  read(path.join(ROOT, "src/studio/shell/StudioProductionShellProvider.jsx")).includes("registerLayoutDesigner") &&
    read(path.join(ROOT, "src/studio/shell/StudioProductionShellProvider.jsx")).includes("registerLayoutEditor")
);

let governanceOk = false;
try {
  execSync("node scripts/gate-studio-architecture-governance.mjs", { cwd: ROOT, stdio: "pipe" });
  governanceOk = true;
} catch {
  governanceOk = false;
}
gate("G296 — Studio architecture governance still green", governanceOk);

const failed = results.filter((r) => !r.ok);
console.log(`\nG296: ${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exit(1);
