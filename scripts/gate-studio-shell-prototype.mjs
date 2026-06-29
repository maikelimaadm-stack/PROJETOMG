#!/usr/bin/env node
/**
 * Gate G286 — MAK Studio Shell Prototype (Program 2.1A)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const shellFiles = [
  "src/studio/shell/StudioShellPrototype.jsx",
  "src/studio/shell/StudioShellProvider.jsx",
  "src/studio/dock/StudioDockManager.jsx",
  "src/studio/panels/ExplorerPanel.jsx",
  "src/studio/panels/PropertyGridPanel.jsx",
  "src/studio/mock/studioMockData.js",
];

gate(
  "G286 — Studio Shell Prototype structure exists",
  shellFiles.every((f) => exists(path.join(ROOT, f)))
);

gate(
  "G286 — Shell uses Studio SDK + Event Hub (public API)",
  read(path.join(ROOT, "src/studio/shell/StudioShellProvider.jsx")).includes("createStudioSdk") &&
    read(path.join(ROOT, "src/studio/shell/StudioShellProvider.jsx")).includes("getStudioEventHub") &&
    read(path.join(ROOT, "src/studio/shell/StudioShellProvider.jsx")).includes("@/studio/index.js")
);

gate(
  "G286 — No MDP/API imports in prototype shell",
  !read(path.join(ROOT, "src/studio/shell/StudioShellProvider.jsx")).includes("/api/mdp") &&
    !read(path.join(ROOT, "src/studio/shell/StudioShellProvider.jsx")).includes("prisma")
);

gate(
  "G286 — Route wired in App",
  read(path.join(ROOT, "src/App.jsx")).includes("/studio") &&
    read(path.join(ROOT, "src/App.jsx")).includes("StudioPrototypePage")
);

let governanceOk = false;
try {
  execSync("node scripts/gate-studio-architecture-governance.mjs", { cwd: ROOT, stdio: "pipe" });
  governanceOk = true;
} catch {
  governanceOk = false;
}
gate("G286 — Studio architecture governance still green", governanceOk);

const failed = results.filter((r) => !r.ok);
console.log(`\nG286: ${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exit(1);
