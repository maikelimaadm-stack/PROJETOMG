#!/usr/bin/env node
/**
 * Gate G295 — Studio Editor Engine Validation (Program 2.2.7)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  STUDIO_EDITOR_VERSION,
  OFFICIAL_EDITOR_SERVICES,
  EDITOR_CONTRIBUTION_KINDS,
  EDITOR_HUB_EVENTS,
} from "../src/studio/editor/contracts/editorContracts.js";
import { DEPENDENCY_STACK, PUBLIC_API_ENTRY_POINTS } from "../src/studio/governance/studioArchitectureConstants.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";

const ROOT = process.cwd();
const EDITOR = path.join(ROOT, "src/studio/editor");
const LAYOUT = path.join(ROOT, "src/studio/designers/layout");
const SHELL = path.join(ROOT, "src/studio/shell");
const BRIDGE = path.join(ROOT, "src/studio/domain/providers/StudioUniversalBridge.jsx");
const EDITOR_BRIDGE = path.join(ROOT, "src/studio/editor/StudioEditorShellBridge.jsx");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const editorFiles = [
  "contracts/editorContracts.js",
  "catalog/editorCatalog.js",
  "services/explorerService.js",
  "services/workspaceService.js",
  "services/inspectorService.js",
  "services/propertyGridService.js",
  "services/canvasService.js",
  "services/previewService.js",
  "services/historyService.js",
  "services/publishService.js",
  "services/selectionService.js",
  "createStudioEditor.js",
  "EditorHost.jsx",
  "StudioEditorShellBridge.jsx",
  "useEditorBridge.js",
  "index.js",
];

gate(
  "G295 — Studio Editor structure exists",
  editorFiles.every((f) => exists(path.join(EDITOR, f)))
);

gate(
  "G295 — Official Editor version and services",
  STUDIO_EDITOR_VERSION === "mak-studio-editor-v1" &&
    OFFICIAL_EDITOR_SERVICES.length === 9 &&
    OFFICIAL_EDITOR_SERVICES.includes("explorer") &&
    OFFICIAL_EDITOR_SERVICES.includes("propertyGrid") &&
    OFFICIAL_EDITOR_SERVICES.includes("preview")
);

gate(
  "G295 — Editor contribution kinds",
  EDITOR_CONTRIBUTION_KINDS.length === 6 &&
    EDITOR_CONTRIBUTION_KINDS.includes("tools") &&
    EDITOR_CONTRIBUTION_KINDS.includes("renderers")
);

gate(
  "G295 — Generic editor hub events",
  EDITOR_HUB_EVENTS.PROPERTY_CHANGE === "editor.property.change" &&
    EDITOR_HUB_EVENTS.VALIDATION_CHANGED === "editor.validation.changed" &&
    EDITOR_HUB_EVENTS.PREVIEW_CHANGED === "editor.preview.changed"
);

gate(
  "G295 — Editor registry mount pattern",
  read(path.join(EDITOR, "catalog/editorCatalog.js")).includes("registerDesigner") &&
    read(path.join(EDITOR, "EditorHost.jsx")).includes("registry.mount")
);

gate(
  "G295 — Reusable editor services",
  read(path.join(EDITOR, "createStudioEditor.js")).includes("createExplorerService") &&
    read(path.join(EDITOR, "createStudioEditor.js")).includes("createPropertyGridService") &&
    read(path.join(EDITOR, "createStudioEditor.js")).includes("createHistoryService")
);

gate(
  "G295 — Dependency stack includes studio-editor",
  DEPENDENCY_STACK.some((l) => l.layerId === "studio-editor" && l.paths.includes("editor"))
);

gate(
  "G295 — Exported from Studio public API",
  read(path.join(ROOT, "src/studio/index.js")).includes("STUDIO_EDITOR_VERSION") &&
    read(path.join(ROOT, "src/studio/index.js")).includes("createStudioEditor") &&
    read(path.join(ROOT, "src/studio/index.js")).includes("EditorHost") &&
    PUBLIC_API_ENTRY_POINTS.some((p) => p.includes("editor"))
);

gate(
  "G295 — Shell uses Editor Engine (not direct designer mount)",
  read(path.join(SHELL, "StudioProductionShellProvider.jsx")).includes("createStudioEditor") &&
    read(path.join(SHELL, "StudioProductionShellProvider.jsx")).includes("registerLayoutEditor") &&
    !read(path.join(SHELL, "StudioProductionShellProvider.jsx")).includes("renderWorkspace") &&
    !read(path.join(SHELL, "StudioProductionShellProvider.jsx")).includes("LayoutWorkspaceMount")
);

gate(
  "G295 — Universal Bridge uses EditorHost",
  exists(EDITOR_BRIDGE) &&
    read(EDITOR_BRIDGE).includes("EditorHost") &&
    read(EDITOR_BRIDGE).includes("useEditorBridge") &&
    read(BRIDGE).includes("editorIntegration") &&
    !read(BRIDGE).includes("isLayoutDesigner") &&
    !read(BRIDGE).includes("renderWorkspace")
);

gate(
  "G295 — Layout registers Editor contributions only",
  exists(path.join(LAYOUT, "editor/layoutEditorRegistration.jsx")) &&
    read(path.join(LAYOUT, "editor/layoutEditorRegistration.jsx")).includes("getEditorCatalog") &&
    read(path.join(LAYOUT, "LayoutDocumentProvider.jsx")).includes("EDITOR_HUB_EVENTS.PROPERTY_CHANGE")
);

const forbiddenLocalEditorPatterns = [
  /export\s+function\s+createStudioEditor\b/,
  /export\s+function\s+createEditorRegistry\b/,
  /export\s+function\s+EditorHost\b/,
];

const designerFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("src/studio/designers/"));
const localEditorViolations = [];
designerFiles.forEach(({ path: filePath, content }) => {
  forbiddenLocalEditorPatterns.forEach((pattern) => {
    if (pattern.test(content)) {
      localEditorViolations.push(path.relative(ROOT, filePath));
    }
  });
});
gate(
  "G295 — No designer implements Editor Engine locally",
  localEditorViolations.length === 0,
  localEditorViolations.join(", ")
);

let governanceOk = false;
try {
  execSync("node scripts/gate-studio-architecture-governance.mjs", { cwd: ROOT, stdio: "pipe" });
  governanceOk = true;
} catch {
  governanceOk = false;
}
gate("G295 — Studio architecture governance still green", governanceOk);

const failed = results.filter((r) => !r.ok);
console.log(`\nG295: ${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exit(1);
