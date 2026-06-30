#!/usr/bin/env node
/**
 * Gate G289 — Studio Domain Engine Foundation (Program 2.1A.6)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  OFFICIAL_DOMAIN_SLICES,
  OFFICIAL_DOMAIN_HOOKS,
  OFFICIAL_DOMAIN_SERVICES,
} from "../src/studio/domain/contracts/studioDomainContracts.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";
import { validateFileDependencies } from "../src/studio/governance/dependencyGraph.js";

const ROOT = process.cwd();
const DOMAIN = path.join(ROOT, "src/studio/domain");
const COMPONENTS = path.join(ROOT, "src/studio/components");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const domainDirs = ["state", "providers", "services", "adapters", "contracts", "hooks"];
gate(
  "G289 — Studio Domain structure exists",
  domainDirs.every((d) => exists(path.join(DOMAIN, d)))
);

gate(
  "G289 — Official domain slices defined",
  OFFICIAL_DOMAIN_SLICES.length === 12 &&
    exists(path.join(DOMAIN, "state/studioDomainReducer.js")) &&
    OFFICIAL_DOMAIN_SLICES.every((s) => read(path.join(DOMAIN, "state/studioDomainReducer.js")).includes(s))
);

gate(
  "G289 — Official domain hooks exported",
  OFFICIAL_DOMAIN_HOOKS.length === 12 &&
    exists(path.join(DOMAIN, "hooks/index.js")) &&
    OFFICIAL_DOMAIN_HOOKS.every((h) => read(path.join(DOMAIN, "hooks/index.js")).includes(h))
);

gate(
  "G289 — Official service contracts exist",
  OFFICIAL_DOMAIN_SERVICES.length === 6 &&
    exists(path.join(DOMAIN, "contracts/serviceContracts.js")) &&
    read(path.join(DOMAIN, "contracts/serviceContracts.js")).includes("defineStudioDomainServices")
);

const serviceFiles = [
  "previewService.js",
  "publishService.js",
  "compileService.js",
  "validationService.js",
  "assetService.js",
  "searchService.js",
];
gate(
  "G289 — Service stub files exist",
  serviceFiles.every((f) => exists(path.join(DOMAIN, "services", f)))
);

gate(
  "G289 — Exported from Studio public API",
  read(path.join(ROOT, "src/studio/index.js")).includes("STUDIO_DOMAIN_VERSION") &&
    read(path.join(ROOT, "src/studio/index.js")).includes("useSelection")
);

// Universal components must not import domain
const universalFiles = fs
  .readdirSync(COMPONENTS)
  .filter((f) => f.startsWith("Universal") && f.endsWith(".jsx"))
  .map((f) => path.join(COMPONENTS, f));

const universalDomainImports = universalFiles.filter((f) =>
  read(f).includes("/domain/") || read(f).includes("useSelection") || read(f).includes("useStudioDomain")
);
gate(
  "G289 — Universal components do not import domain",
  universalDomainImports.length === 0,
  universalDomainImports.map((f) => path.basename(f)).join(", ")
);

// Designers must not hold official domain state
const designersDir = path.join(ROOT, "src/studio/designers");
let designerViolations = [];
if (exists(designersDir)) {
  const walk = (dir) => {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
        const content = read(full);
        OFFICIAL_DOMAIN_SLICES.forEach((slice) => {
          if (new RegExp(`useState\\([^)]*${slice}`, "i").test(content)) {
            designerViolations.push(`${path.relative(ROOT, full)}: useState ${slice}`);
          }
        });
      }
    });
  };
  walk(designersDir);
}
gate(
  "G289 — No designer owns official domain state",
  designerViolations.length === 0,
  designerViolations.join("; ")
);

// Services accessed via adapters only in domain layer
gate(
  "G289 — Service adapters registry exists",
  exists(path.join(DOMAIN, "adapters/createMockDomainServiceAdapters.js"))
);

// No circular imports: domain/services must not import domain/providers
const serviceImportsProvider = fs
  .readdirSync(path.join(DOMAIN, "services"))
  .filter((f) => f.endsWith(".js"))
  .some((f) => read(path.join(DOMAIN, "services", f)).includes("/providers/"));
gate("G289 — No circular domain/services → providers", !serviceImportsProvider);

const providerImportsServicesDirectly = read(path.join(DOMAIN, "providers/StudioDomainProvider.jsx")).includes("../services/") &&
  !read(path.join(DOMAIN, "providers/StudioDomainProvider.jsx")).includes("adapters/");
// Provider uses adapters path, not raw services - check adapters usage
gate(
  "G289 — Domain provider uses service adapters",
  read(path.join(DOMAIN, "providers/StudioDomainProvider.jsx")).includes("createMockDomainServiceAdapters")
);

// Dependency graph for domain files
const files = collectStudioFiles(ROOT);
const domainViolations = files
  .filter((f) => f.path.includes("src/studio/domain/"))
  .flatMap((f) => validateFileDependencies(f.path, f.content))
  .filter((v) => v.rule === "dependency-inversion");
gate(
  "G289 — No domain dependency inversions",
  domainViolations.length === 0,
  domainViolations.slice(0, 2).map((v) => v.message).join("; ")
);

let governanceOk = false;
try {
  execSync("node scripts/gate-studio-architecture-governance.mjs", { cwd: ROOT, stdio: "pipe" });
  governanceOk = true;
} catch {
  governanceOk = false;
}
gate("G289 — Studio architecture governance still green", governanceOk);

const failed = results.filter((r) => !r.ok);
console.log(`\nG289: ${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exit(1);
