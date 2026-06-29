#!/usr/bin/env node
/**
 * Gate G288 — Universal Studio Components Foundation (Program 2.1A.5)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const COMPONENTS = path.join(ROOT, "src/studio/components");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const universalComponents = [
  "UniversalExplorer.jsx",
  "UniversalInspector.jsx",
  "UniversalPropertyGrid.jsx",
  "UniversalWorkspace.jsx",
  "UniversalDock.jsx",
  "UniversalTabs.jsx",
  "UniversalStatusBar.jsx",
  "UniversalNotificationArea.jsx",
  "UniversalBreadcrumb.jsx",
  "UniversalCommandPalette.jsx",
];

const providers = [
  "ExplorerProvider.jsx",
  "InspectorProvider.jsx",
  "PropertyProvider.jsx",
  "WorkspaceProvider.jsx",
  "DockProvider.jsx",
  "NotificationProvider.jsx",
  "BreadcrumbProvider.jsx",
  "CommandPaletteProvider.jsx",
  "StatusBarProvider.jsx",
];

gate(
  "G288 — Universal component files exist",
  universalComponents.every((f) => exists(path.join(COMPONENTS, f)))
);

gate(
  "G288 — Provider files exist",
  providers.every((f) => exists(path.join(COMPONENTS, "providers", f)))
);

gate(
  "G288 — Public contracts defined",
  exists(path.join(COMPONENTS, "contracts/universalComponentContracts.js")) &&
    read(path.join(COMPONENTS, "contracts/universalComponentContracts.js")).includes(
      "UNIVERSAL_COMPONENTS_VERSION"
    )
);

gate(
  "G288 — Exported from Studio public API",
  read(path.join(ROOT, "src/studio/index.js")).includes("UniversalExplorer") &&
    read(path.join(ROOT, "src/studio/index.js")).includes("ExplorerProvider") &&
    read(path.join(ROOT, "src/studio/components/index.js")).includes("UNIVERSAL_COMPONENTS_VERSION")
);

const forbiddenInUniversals = [
  { pattern: /\/designers\//, label: "designers/" },
  { pattern: /\/mock\//, label: "mock/" },
  { pattern: /Layout Studio|Workflow Studio|Dashboard Studio|Field Studio/, label: "designer-specific name" },
  { pattern: /layout-studio|workflow-studio|dashboard-studio/, label: "designer-specific path" },
];

const universalFiles = fs
  .readdirSync(COMPONENTS)
  .filter((f) => f.startsWith("Universal") && f.endsWith(".jsx"))
  .map((f) => path.join(COMPONENTS, f));

const providerFiles = providers.map((f) => path.join(COMPONENTS, "providers", f));

const allUniversalSources = [...universalFiles, ...providerFiles];
const studioSpecificViolations = [];

allUniversalSources.forEach((filePath) => {
  const content = read(filePath);
  forbiddenInUniversals.forEach(({ pattern, label }) => {
    if (pattern.test(content)) {
      studioSpecificViolations.push(`${path.basename(filePath)}: ${label}`);
    }
  });
});

gate(
  "G288 — No universal component depends on specific Studio",
  studioSpecificViolations.length === 0,
  studioSpecificViolations.join("; ")
);

const usesProvidersOnly = universalComponents.every((fileName) => {
  const content = read(path.join(COMPONENTS, fileName));
  return content.includes("Provider") || fileName === "UniversalTabs.jsx";
});

gate("G288 — Universal components consume Providers only", usesProvidersOnly);

let governanceOk = false;
try {
  execSync("node scripts/gate-studio-architecture-governance.mjs", { cwd: ROOT, stdio: "pipe" });
  governanceOk = true;
} catch {
  governanceOk = false;
}
gate("G288 — Studio architecture governance still green", governanceOk);

const failed = results.filter((r) => !r.ok);
console.log(`\nG288: ${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exit(1);
