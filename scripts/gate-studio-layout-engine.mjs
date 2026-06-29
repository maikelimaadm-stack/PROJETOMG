#!/usr/bin/env node
/**
 * Gate G291 — Layout Studio Engine Validation (Program 2.2)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { LAYOUT_DOCUMENT_VERSION } from "../src/studio/designers/layout/document/layoutDocumentContracts.js";
import { LAYOUT_AST_VERSION } from "../src/studio/designers/layout/ast/layoutAstContracts.js";
import { LayoutCommandTypes } from "../src/studio/designers/layout/commands/layoutCommandTypes.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";
import { FORBIDDEN_FOUNDATION_PATTERNS } from "../src/studio/governance/studioArchitectureConstants.js";

const ROOT = process.cwd();
const LAYOUT = path.join(ROOT, "src/studio/designers/layout");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const engineFiles = [
  "document/layoutDocumentContracts.js",
  "document/layoutDocumentStore.js",
  "document/documentToAst.js",
  "document/registryToDocument.js",
  "ast/layoutAstContracts.js",
  "ast/astToMdpPayloads.js",
  "commands/layoutCommandTypes.js",
  "commands/createLayoutCommandBus.js",
  "canvas/canvasEngine.js",
  "canvas/LayoutCanvas.jsx",
  "validation/layoutValidationEngine.js",
  "preview/layoutPreviewBridge.js",
  "LayoutDocumentProvider.jsx",
  "LayoutDesignerPlugin.jsx",
  "registerLayoutDesigner.js",
];

gate(
  "G291 — Layout Engine structure exists",
  engineFiles.every((f) => exists(path.join(LAYOUT, f))) &&
    exists(path.join(LAYOUT, "core/layoutCoreSetup.js"))
);

gate(
  "G291 — Layout consumes Studio Core Engine",
  read(path.join(LAYOUT, "core/layoutCoreSetup.js")).includes("@/studio/core/index.js") &&
    read(path.join(LAYOUT, "commands/createLayoutCommandBus.js")).includes("layoutCoreSetup") &&
    read(path.join(LAYOUT, "validation/layoutValidationEngine.js")).includes("layoutCoreSetup") &&
    read(path.join(LAYOUT, "document/layoutDocumentStore.js")).includes("layoutCoreSetup")
);

gate(
  "G291 — Layout consumes Studio Object Model",
  exists(path.join(LAYOUT, "som/layoutSomSetup.js")) &&
    read(path.join(LAYOUT, "som/layoutSomSetup.js")).includes("@/studio/som/index.js") &&
    read(path.join(LAYOUT, "document/registryToDocument.js")).includes("layoutSomSetup") &&
    read(path.join(LAYOUT, "commands/layoutCommandHandlers.js")).includes("layoutSomSetup")
);

gate(
  "G291 — Layout Document official contract",
  LAYOUT_DOCUMENT_VERSION === "mak-layout-document-v1" &&
    read(path.join(LAYOUT, "document/layoutDocumentContracts.js")).includes("pages") &&
    read(path.join(LAYOUT, "document/layoutDocumentContracts.js")).includes("bindings")
);

gate(
  "G291 — Layout AST implemented",
  LAYOUT_AST_VERSION === "mak-layout-ast-v1" &&
    exists(path.join(LAYOUT, "document/documentToAst.js")) &&
    exists(path.join(LAYOUT, "ast/astToMdpPayloads.js"))
);

const commandTypes = Object.values(LayoutCommandTypes);
const requiredCommands = [
  "ADD_COMPONENT",
  "DELETE_COMPONENT",
  "MOVE_COMPONENT",
  "RESIZE_COMPONENT",
  "DUPLICATE_COMPONENT",
  "REORDER_COMPONENT",
];
gate(
  "G291 — Command system mandatory",
  requiredCommands.every((c) => read(path.join(LAYOUT, "commands/layoutCommandTypes.js")).includes(c))
);

gate(
  "G291 — No direct JSON editing in designer UI",
  !read(path.join(LAYOUT, "LayoutDesignerPlugin.jsx")).includes("JSON.parse") &&
    !read(path.join(LAYOUT, "LayoutDesignerPlugin.jsx")).includes("textarea") &&
    read(path.join(LAYOUT, "LayoutDocumentProvider.jsx")).includes("createLayoutCommandBus")
);

gate(
  "G291 — Canvas engine extensibility",
  read(path.join(LAYOUT, "canvas/canvasEngine.js")).includes("zoom") &&
    read(path.join(LAYOUT, "canvas/canvasEngine.js")).includes("pan") &&
    read(path.join(LAYOUT, "canvas/canvasEngine.js")).includes("multiSelection")
);

gate(
  "G291 — Preview via Compile only",
  read(path.join(LAYOUT, "preview/layoutPreviewBridge.js")).includes("mdpCompile") &&
    read(path.join(LAYOUT, "preview/layoutPreviewBridge.js")).includes("documentToAst") &&
    !read(path.join(LAYOUT, "preview/layoutPreviewBridge.js")).includes("runtimeBridge")
);

gate(
  "G291 — MDP registry client (public API)",
  exists(path.join(ROOT, "src/studio/services/mdpRegistryClient.js")) &&
    read(path.join(ROOT, "src/studio/services/mdpRegistryClient.js")).includes("apiClient")
);

gate(
  "G291 — Designer registered via Contribution Manager",
  read(path.join(LAYOUT, "registerLayoutDesigner.js")).includes("getContributionManager") &&
    read(path.join(LAYOUT, "registerLayoutDesigner.js")).includes("getRegistryManager") &&
    !read(path.join(LAYOUT, "registerLayoutDesigner.js")).includes("registerStudioDesigner(")
);

const layoutFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("src/studio/designers/layout/"));
const forbidden = layoutFiles.filter(({ content }) =>
  FORBIDDEN_FOUNDATION_PATTERNS.some(({ pattern }) => pattern.test(content))
);
gate(
  "G291 — No foundation/runtime forbidden imports in layout designer",
  forbidden.length === 0,
  forbidden.map((f) => path.basename(f.path)).join(", ")
);

gate(
  "G291 — Shell mounts layout designer",
  read(path.join(ROOT, "src/studio/shell/StudioProductionShellProvider.jsx")).includes("LayoutWorkspaceMount") &&
    read(path.join(ROOT, "src/studio/shell/StudioProductionShellProvider.jsx")).includes("registerLayoutDesigner") &&
    read(path.join(ROOT, "src/studio/domain/providers/StudioUniversalBridge.jsx")).includes("renderWorkspace")
);

let governanceOk = false;
try {
  execSync("node scripts/gate-studio-architecture-governance.mjs", { cwd: ROOT, stdio: "pipe" });
  governanceOk = true;
} catch {
  governanceOk = false;
}
gate("G291 — Studio architecture governance still green", governanceOk);

const failed = results.filter((r) => !r.ok);
console.log(`\nG291: ${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exit(1);
