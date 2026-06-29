#!/usr/bin/env node
/**
 * Gate G299 — Studio Dependency Engine Validation (Program 2.3.3)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  STUDIO_DEPENDENCY_VERSION,
  OFFICIAL_DEPENDENCY_ENGINES,
  DEPENDENCY_GRAPH_VERSION,
  DEPENDENCY_NODE_KINDS,
  createDependencyEngine,
} from "../src/studio/dependency/index.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";
import { FORBIDDEN_FOUNDATION_PATTERNS, DEPENDENCY_STACK } from "../src/studio/governance/studioArchitectureConstants.js";

const ROOT = process.cwd();
const DEP = path.join(ROOT, "src/studio/dependency");
const EXPR = path.join(ROOT, "src/studio/expression");
const DESIGNERS = path.join(ROOT, "src/studio/designers");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const engineFiles = [
  "contracts/dependencyContracts.js",
  "graph/dependencyGraph.js",
  "graph/dependencyNode.js",
  "graph/dependencyEdge.js",
  "analyzer/dependencyAnalyzer.js",
  "cycle/cycleDetection.js",
  "resolver/dependencyResolver.js",
  "cache/dependencyCache.js",
  "invalidation/dependencyInvalidation.js",
  "impact/impactAnalyzer.js",
  "refactoring/safeRenameEngine.js",
  "refactoring/safeDeleteEngine.js",
  "metadata/dependencyMetadata.js",
  "createDependencyEngine.js",
  "index.js",
];

gate(
  "G299 — Dependency Engine structure exists",
  engineFiles.every((f) => exists(path.join(DEP, f)))
);

gate(
  "G299 — Official Dependency version and engines",
  STUDIO_DEPENDENCY_VERSION === "mak-studio-dependency-v1" &&
    OFFICIAL_DEPENDENCY_ENGINES.length === 9 &&
    OFFICIAL_DEPENDENCY_ENGINES.includes("cycleDetection") &&
    OFFICIAL_DEPENDENCY_ENGINES.includes("impactAnalyzer")
);

gate(
  "G299 — Single official Dependency Graph",
  DEPENDENCY_GRAPH_VERSION === "mak-studio-dependency-graph-v1" &&
    read(path.join(DEP, "graph/dependencyGraph.js")).includes("createDependencyGraph") &&
    read(path.join(DEP, "createDependencyEngine.js")).includes("createDependencyGraph")
);

gate(
  "G299 — Supported artifact node kinds",
  DEPENDENCY_NODE_KINDS.includes("layout") &&
    DEPENDENCY_NODE_KINDS.includes("field") &&
    DEPENDENCY_NODE_KINDS.includes("expression") &&
    DEPENDENCY_NODE_KINDS.includes("workflow") &&
    DEPENDENCY_NODE_KINDS.includes("marketplace_package")
);

const engine = createDependencyEngine({ domainId: "gate" });
engine.graph.addNode({ id: "a", kind: "field", label: "A" });
engine.graph.addNode({ id: "b", kind: "field", label: "B" });
engine.graph.addEdge({ from: "a", to: "b", kind: "expression-ref" });
const order = engine.resolveOrder();
const impact = engine.analyzeImpact("a", "modify");
const snap = engine.snapshot();

gate(
  "G299 — Resolver, cycle detection, impact analyzer pipeline",
  order.length === 2 &&
    !engine.detectCycles().hasCycle &&
    impact.affectedCount >= 0 &&
    snap.metadata?.aiHints?.length > 0
);

gate(
  "G299 — Safe rename and delete engines",
  read(path.join(DEP, "refactoring/safeRenameEngine.js")).includes("createSafeRenameEngine") &&
    read(path.join(DEP, "refactoring/safeDeleteEngine.js")).includes("canDelete")
);

gate(
  "G299 — Dependency metadata for IA / Marketplace",
  read(path.join(DEP, "metadata/dependencyMetadata.js")).includes("dependencyExplanation") &&
    read(path.join(DEP, "metadata/dependencyMetadata.js")).includes("lineage") &&
    read(path.join(DEP, "metadata/dependencyMetadata.js")).includes("graphDocumentation")
);

gate(
  "G299 — Expression Engine delegates to Studio Dependency Engine",
  read(path.join(EXPR, "dependency/expressionDependencyGraph.js")).includes("createDependencyEngine") &&
    read(path.join(EXPR, "dependency/expressionVariableRefs.js")).includes("extractVariableRefsFromAst")
);

const designerDirs = fs.readdirSync(DESIGNERS).filter((d) => fs.statSync(path.join(DESIGNERS, d)).isDirectory());
const forbiddenDesignerPatterns = [
  /createDependencyGraph\s*\(/,
  /createCycleDetection\s*\(/,
  /createImpactAnalyzer\s*\(/,
  /createDependencyCache\s*\(/,
  /function\s+detectCycles\s*\(/,
  /class\s+DependencyGraph/,
  /class\s+CycleDetector/,
];
const parallelViolations = [];
designerDirs.forEach((designerId) => {
  const dir = path.join(DESIGNERS, designerId);
  const walk = (folder) => {
    fs.readdirSync(folder, { withFileTypes: true }).forEach((entry) => {
      const full = path.join(folder, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "dependency" && designerId === "field") return;
        walk(full);
        return;
      }
      if (!/\.(js|jsx)$/.test(entry.name)) return;
      if (full.includes(`${designerId}/dependency/`) && designerId === "field") return;
      const content = read(full);
      forbiddenDesignerPatterns.forEach((pattern) => {
        if (pattern.test(content) && !content.includes("@/studio/dependency")) {
          parallelViolations.push(path.relative(ROOT, full));
        }
      });
    });
  };
  walk(dir);
});

gate(
  "G299 — No designer implements parallel dependency graph/resolver/cache",
  parallelViolations.length === 0,
  parallelViolations.join(", ")
);

gate(
  "G299 — Field Studio consumes Dependency Engine",
  exists(path.join(DESIGNERS, "field/dependency/fieldDependencySetup.js")) &&
    read(path.join(DESIGNERS, "field/dependency/fieldDependencySetup.js")).includes("createDependencyEngine") &&
    read(path.join(DESIGNERS, "field/core/fieldCoreSetup.js")).includes("buildFieldDocumentDependencyGraph") &&
    read(path.join(DESIGNERS, "field/core/fieldCoreSetup.js")).includes("getFieldDependencyEngine")
);

gate(
  "G299 — Dependency in dependency stack",
  DEPENDENCY_STACK.some((l) => l.layerId === "studio-dependency")
);

gate(
  "G299 — Exported from studio public API",
  read(path.join(ROOT, "src/studio/index.js")).includes("createDependencyEngine") &&
    read(path.join(ROOT, "src/studio/index.js")).includes("./dependency/index.js")
);

const depFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("src/studio/dependency/"));
const forbidden = depFiles.filter(({ content }) =>
  FORBIDDEN_FOUNDATION_PATTERNS.some(({ pattern }) => pattern.test(content))
);
gate(
  "G299 — No foundation forbidden imports in dependency engine",
  forbidden.length === 0,
  forbidden.map((f) => path.basename(f.path)).join(", ")
);

gate(
  "G299 — No computed/derived/workflow engine in scope",
  !exists(path.join(DEP, "computed/")) &&
    !exists(path.join(DEP, "workflow/")) &&
    !read(path.join(DESIGNERS, "field/canvas/FieldCanvas.jsx")).includes("ComputedFieldEditor")
);

let g298Ok = false;
try {
  execSync("node scripts/gate-studio-expression-engine.mjs", { cwd: ROOT, stdio: "pipe" });
  g298Ok = true;
} catch {
  g298Ok = false;
}
gate("G299 — G298 Expression Engine still green", g298Ok);

const failed = results.filter((r) => !r.ok);
console.log(`\nG299: ${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exit(1);
