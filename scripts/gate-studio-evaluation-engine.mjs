#!/usr/bin/env node
/**
 * Gate G301 — Studio Evaluation Engine Validation (Program 2.3.5)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  STUDIO_EVALUATION_VERSION,
  OFFICIAL_EVALUATION_ENGINES,
  EVALUATION_STRATEGIES,
  createEvaluationEngine,
} from "../src/studio/evaluation/index.js";
import { createExpressionEngine } from "../src/studio/expression/index.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";
import { FORBIDDEN_FOUNDATION_PATTERNS, DEPENDENCY_STACK } from "../src/studio/governance/studioArchitectureConstants.js";

const ROOT = process.cwd();
const EVAL = path.join(ROOT, "src/studio/evaluation");
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
  "contracts/evaluationContracts.js",
  "context/evaluationContext.js",
  "session/evaluationSession.js",
  "pipeline/evaluationPipeline.js",
  "cache/evaluationCache.js",
  "metadata/evaluationMetadata.js",
  "scheduler/evaluationScheduler.js",
  "strategy/evaluationStrategy.js",
  "result/evaluationResult.js",
  "diagnostics/evaluationDiagnostics.js",
  "profiler/evaluationProfiler.js",
  "hooks/evaluationHooks.js",
  "runners/expressionAstRunner.js",
  "createEvaluationEngine.js",
  "index.js",
];

gate("G301 — Evaluation Engine structure exists", engineFiles.every((f) => exists(path.join(EVAL, f))));

gate(
  "G301 — Official Evaluation version and engines",
  STUDIO_EVALUATION_VERSION === "mak-studio-evaluation-v1" &&
    OFFICIAL_EVALUATION_ENGINES.length === 9 &&
    OFFICIAL_EVALUATION_ENGINES.includes("pipeline") &&
    OFFICIAL_EVALUATION_ENGINES.includes("scheduler")
);

gate(
  "G301 — Evaluation strategies supported",
  EVALUATION_STRATEGIES.includes("lazy") &&
    EVALUATION_STRATEGIES.includes("batch") &&
    EVALUATION_STRATEGIES.includes("incremental")
);

const engine = createEvaluationEngine({ domainId: "gate" });
const exprEngine = createExpressionEngine();
const sampleAst = exprEngine.parse("price * 1.1 + coalesce(discount, 0)", { designerId: "gate" });
const sampleCtx = exprEngine.createContext({ variables: { price: 100, discount: null } });
const sampleResult = engine.evaluateExpression({
  ast: sampleAst,
  expressionContext: sampleCtx,
  ownerId: "gate-sample",
});
const syncValue = exprEngine.execute(sampleAst, sampleCtx);

gate(
  "G301 — Pipeline, cache, scheduler, diagnostics pipeline",
  sampleResult.ok === true &&
    typeof sampleResult.value === "number" &&
    typeof syncValue === "number" &&
    sampleResult.metadata?.executionCost >= 1 &&
    engine.snapshot().cacheSize >= 0
);

gate(
  "G301 — Evaluation metadata for IA / Runtime",
  read(path.join(EVAL, "metadata/evaluationMetadata.js")).includes("executionCost") &&
    read(path.join(EVAL, "metadata/evaluationMetadata.js")).includes("optimizationHints") &&
    read(path.join(EVAL, "metadata/evaluationMetadata.js")).includes("aiHints")
);

gate(
  "G301 — Expression Engine delegates to Evaluation Engine",
  read(path.join(EXPR, "runtime/expressionEvaluationBridge.js")).includes("createEvaluationEngine") &&
    read(path.join(EXPR, "createExpressionEngine.js")).includes("createExpressionEvaluationBridge") &&
    !read(path.join(EXPR, "createExpressionEngine.js")).includes("executeExpressionAst")
);

const designerDirs = fs.readdirSync(DESIGNERS).filter((d) => fs.statSync(path.join(DESIGNERS, d)).isDirectory());
const forbiddenDesignerPatterns = [
  /executeExpressionAst\s*\(/,
  /createEvaluationEngine\s*\(/,
  /createEvaluationScheduler\s*\(/,
  /createEvaluationCache\s*\(/,
  /createEvaluationPipeline\s*\(/,
  /evaluateFormula\s*\(/,
  /class\s+ExpressionEvaluator/,
];
const parallelViolations = [];
designerDirs.forEach((designerId) => {
  const dir = path.join(DESIGNERS, designerId);
  const walk = (folder) => {
    fs.readdirSync(folder, { withFileTypes: true }).forEach((entry) => {
      const full = path.join(folder, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "evaluation" && designerId === "field") return;
        walk(full);
        return;
      }
      if (!/\.(js|jsx)$/.test(entry.name)) return;
      if (full.includes(`${designerId}/evaluation/`) && designerId === "field") return;
      const content = read(full);
      forbiddenDesignerPatterns.forEach((pattern) => {
        if (pattern.test(content) && !content.includes("@/studio/evaluation")) {
          parallelViolations.push(path.relative(ROOT, full));
        }
      });
    });
  };
  walk(dir);
});

gate(
  "G301 — No designer implements parallel evaluator/scheduler/cache",
  parallelViolations.length === 0,
  parallelViolations.join(", ")
);

gate(
  "G301 — Field Studio consumes Evaluation Engine",
  exists(path.join(DESIGNERS, "field/evaluation/fieldEvaluationSetup.js")) &&
    read(path.join(DESIGNERS, "field/evaluation/fieldEvaluationSetup.js")).includes("createEvaluationEngine") &&
    read(path.join(DESIGNERS, "field/core/fieldCoreSetup.js")).includes("getFieldEvaluationEngine") &&
    read(path.join(DESIGNERS, "field/evaluation/fieldEvaluationSetup.js")).includes("evaluateFieldDocumentBatch")
);

gate(
  "G301 — Evaluation in dependency stack",
  DEPENDENCY_STACK.some((l) => l.layerId === "studio-evaluation")
);

gate(
  "G301 — Exported from studio public API",
  read(path.join(ROOT, "src/studio/index.js")).includes("createEvaluationEngine") &&
    read(path.join(ROOT, "src/studio/index.js")).includes("./evaluation/index.js")
);

const evalFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("src/studio/evaluation/"));
const forbidden = evalFiles.filter(({ content }) =>
  FORBIDDEN_FOUNDATION_PATTERNS.some(({ pattern }) => pattern.test(content))
);
gate(
  "G301 — No foundation forbidden imports in evaluation engine",
  forbidden.length === 0,
  forbidden.map((f) => path.basename(f.path)).join(", ")
);

gate(
  "G301 — No computed/derived/workflow runtime in scope",
  !exists(path.join(EVAL, "computed/")) &&
    !exists(path.join(EVAL, "workflow/")) &&
    !read(path.join(DESIGNERS, "field/canvas/FieldCanvas.jsx")).includes("ComputedFieldEditor")
);

let g300Ok = false;
try {
  execSync("node scripts/gate-studio-type-system.mjs", { cwd: ROOT, stdio: "pipe" });
  g300Ok = true;
} catch {
  g300Ok = false;
}
gate("G301 — G300 Type System still green", g300Ok);

const failed = results.filter((r) => !r.ok);
console.log(`\nG301: ${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exit(1);
