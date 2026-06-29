#!/usr/bin/env node
/**
 * Gate G287 — Studio Shell Production (Program 2.1B)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  OFFICIAL_SELECTION_KINDS,
  STUDIO_SELECTION_MODEL_VERSION,
} from "../src/studio/domain/contracts/selectionModel.js";
import {
  STUDIO_WORKSPACE_SESSION_VERSION,
} from "../src/studio/domain/contracts/workspaceSession.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";

const ROOT = process.cwd();
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const productionFiles = [
  "src/studio/shell/StudioShell.jsx",
  "src/studio/shell/StudioAuthGate.jsx",
  "src/studio/shell/StudioProductionShellProvider.jsx",
  "src/studio/pages/StudioProductionPage.jsx",
  "src/studio/domain/adapters/createProductionDomainAdapters.js",
  "src/studio/services/mdpStudioClient.js",
  "src/studio/services/previewCrbAdapter.js",
  "src/studio/services/studioPersistence.js",
  "src/studio/domain/contracts/selectionModel.js",
  "src/studio/domain/contracts/workspaceSession.js",
];

gate(
  "G287 — Studio Shell Production structure exists",
  productionFiles.every((f) => exists(path.join(ROOT, f)))
);

const productionProvider = read(path.join(ROOT, "src/studio/shell/StudioProductionShellProvider.jsx"));

gate(
  "G287 — Production shell has no mock imports",
  !productionProvider.includes("studioMockData") &&
    !productionProvider.includes("MOCK_") &&
    !productionProvider.includes("createMockDomainServiceAdapters")
);

gate(
  "G287 — Production uses MDP public API client",
  productionProvider.includes("createProductionDomainAdapters") &&
    productionProvider.includes("@/studio/services/index.js") &&
    exists(path.join(ROOT, "src/studio/services/mdpStudioClient.js"))
);

gate(
  "G287 — Auth gate wired",
  read(path.join(ROOT, "src/studio/shell/StudioShell.jsx")).includes("StudioAuthGate") &&
    read(path.join(ROOT, "src/studio/shell/StudioAuthGate.jsx")).includes("useAuth")
);

gate(
  "G287 — Selection Model official contract",
  OFFICIAL_SELECTION_KINDS.length === 9 &&
    STUDIO_SELECTION_MODEL_VERSION === "mak-studio-selection-v1" &&
    read(path.join(ROOT, "src/studio/domain/state/createDomainActions.js")).includes("createStudioSelection")
);

gate(
  "G287 — Workspace Session official contract",
  STUDIO_WORKSPACE_SESSION_VERSION === "mak-studio-workspace-session-v1" &&
    productionProvider.includes("createWorkspaceSession")
);

gate(
  "G287 — Preview via CRB adapter (not Runtime Bridge import)",
  exists(path.join(ROOT, "src/studio/services/previewCrbAdapter.js")) &&
    !read(path.join(ROOT, "src/studio/services/previewCrbAdapter.js")).includes("runtimeBridge") &&
    read(path.join(ROOT, "src/studio/domain/adapters/createProductionDomainAdapters.js")).includes("loadPreviewCrbFromIntrospect")
);

gate(
  "G287 — Persistence layer exists",
  read(path.join(ROOT, "src/studio/services/studioPersistence.js")).includes("localStorage") &&
    productionProvider.includes("saveStudioPersistence")
);

gate(
  "G287 — Production routes in App",
  read(path.join(ROOT, "src/App.jsx")).includes("StudioProductionPage") &&
    read(path.join(ROOT, "src/App.jsx")).includes("/studio/:moduleId/:designerId") &&
    read(path.join(ROOT, "src/App.jsx")).includes("/studio/prototype")
);

const shellFiles = collectStudioFiles(ROOT).filter((f) =>
  f.path.includes("src/studio/shell/StudioProduction") ||
  f.path.includes("src/studio/services/")
);

const forbiddenInProduction = shellFiles.filter(({ content, path: filePath }) => {
  if (filePath.includes("studioMockData")) return false;
  return /runtimeBridge|registerRuntimeBridge|\bprisma\./.test(content);
});
gate(
  "G287 — No Runtime Bridge / Prisma in production path",
  forbiddenInProduction.length === 0,
  forbiddenInProduction.map((f) => path.basename(f.path)).join(", ")
);

let governanceOk = false;
try {
  execSync("node scripts/gate-studio-architecture-governance.mjs", { cwd: ROOT, stdio: "pipe" });
  governanceOk = true;
} catch {
  governanceOk = false;
}
gate("G287 — Studio architecture governance still green", governanceOk);

const failed = results.filter((r) => !r.ok);
console.log(`\nG287: ${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exit(1);
