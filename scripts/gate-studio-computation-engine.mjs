#!/usr/bin/env node
/**
 * Gate G302 — Studio Computation Engine Validation (Program 3.1)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  STUDIO_COMPUTATION_VERSION,
  OFFICIAL_COMPUTATION_ENGINES,
  COMPUTATION_DOCUMENT_VERSION,
  COMPUTATION_AST_VERSION,
  COMPUTATION_GRAPH_VERSION,
  EXECUTION_GRAPH_VERSION,
  COMPUTATION_IR_VERSION,
  createComputationEngine,
  createComputationDocument,
} from "../src/studio/computation/index.js";
import { createExpressionEngine } from "../src/studio/expression/index.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";
import { FORBIDDEN_FOUNDATION_PATTERNS, DEPENDENCY_STACK } from "../src/studio/governance/studioArchitectureConstants.js";

const ROOT = process.cwd();
const COMP = path.join(ROOT, "src/studio/computation");
const EXPR = path.join(ROOT, "src/studio/expression");
const DEP = path.join(ROOT, "src/studio/dependency");
const EVAL = path.join(ROOT, "src/studio/evaluation");
const TYPE = path.join(ROOT, "src/studio/typeSystem");
const DESIGNERS = path.join(ROOT, "src/studio/designers");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const engineFiles = [
  "contracts/computationContracts.js",
  "document/computationDocument.js",
  "ast/computationAst.js",
  "graph/computationGraph.js",
  "graph/executionGraph.js",
  "ir/computationIr.js",
  "context/studioContext.js",
  "context/runtimeContext.js",
  "context/computationContext.js",
  "optimizer/computationOptimizer.js",
  "cost/costAnalyzer.js",
  "pipeline/computationValidationPipeline.js",
  "metadata/computationMetadata.js",
  "fieldModels/fieldComputationModels.js",
  "createComputationEngine.js",
  "index.js",
];

gate("G302 — Computation Engine structure exists", engineFiles.every((f) => exists(path.join(COMP, f))));

gate(
  "G302 — Official Computation version and engines",
  STUDIO_COMPUTATION_VERSION === "mak-studio-computation-v1" &&
    OFFICIAL_COMPUTATION_ENGINES.length === 10 &&
    OFFICIAL_COMPUTATION_ENGINES.includes("validationPipeline") &&
    OFFICIAL_COMPUTATION_ENGINES.includes("executionGraph")
);

gate(
  "G302 — Official artifact version constants",
  COMPUTATION_DOCUMENT_VERSION === "mak-computation-document-v1" &&
    COMPUTATION_AST_VERSION === "mak-computation-ast-v1" &&
    COMPUTATION_GRAPH_VERSION === "mak-computation-graph-v1" &&
    EXECUTION_GRAPH_VERSION === "mak-execution-graph-v1" &&
    COMPUTATION_IR_VERSION === "mak-computation-ir-v1"
);

gate(
  "G302 — Facade composes Expression, Dependency, Type, Evaluation",
  read(path.join(COMP, "createComputationEngine.js")).includes("createExpressionEngine") &&
    read(path.join(COMP, "createComputationEngine.js")).includes("createDependencyEngine") &&
    read(path.join(COMP, "createComputationEngine.js")).includes("createTypeSystem") &&
    read(path.join(COMP, "createComputationEngine.js")).includes("createEvaluationEngine")
);

gate(
  "G302 — No parallel cycle detection or topological sort",
  !read(path.join(COMP, "createComputationEngine.js")).includes("createCycleDetection") &&
    read(path.join(COMP, "graph/computationGraph.js")).includes("dependencyEngine") &&
    read(path.join(COMP, "createComputationEngine.js")).includes("dependencyEngine.detectCycles") &&
    read(path.join(COMP, "createComputationEngine.js")).includes("dependencyEngine.resolveOrder")
);

gate(
  "G302 — Validation pipeline integrates Expression + Dependency + Type",
  read(path.join(COMP, "pipeline/computationValidationPipeline.js")).includes("expressionEngine") &&
    read(path.join(COMP, "pipeline/computationValidationPipeline.js")).includes("dependencyEngine") &&
    read(path.join(COMP, "pipeline/computationValidationPipeline.js")).includes("typeSystem")
);

const engine = createComputationEngine({ domainId: "gate" });
const exprEngine = createExpressionEngine();
const parsed = exprEngine.parse("price * 1.1 + coalesce(discount, 0)", { designerId: "gate" });
const doc = createComputationDocument({
  id: "gate-field-total",
  ownerId: "gate-field-total",
  moduleId: "gate",
  entityId: "empresas",
  fieldKind: "computed",
  expressionSource: "price * 1.1 + coalesce(discount, 0)",
  ast: parsed,
  evaluationPolicy: "lazy",
});
const validation = engine.validate(doc);
const compiled = engine.compile(doc);
const evaluated = engine.evaluate(doc, {
  variables: { price: 100, discount: 5 },
  studioPartial: { clienteId: "gate", moduleId: "gate", designerId: "gate" },
  runtimePartial: { clienteId: "gate", moduleId: "gate", record: { price: 100, discount: 5 } },
});

gate(
  "G302 — Validate, compile, evaluate pipeline",
  validation.ok === true &&
    compiled.computationGraph.getNodes().length >= 1 &&
    compiled.executionGraph.getKernels().length >= 1 &&
    evaluated.ok === true &&
    typeof evaluated.value === "number"
);

gate(
  "G302 — Studio, Runtime, Computation contexts",
  read(path.join(COMP, "context/studioContext.js")).includes("createStudioContext") &&
    read(path.join(COMP, "context/runtimeContext.js")).includes("createRuntimeContext") &&
    read(path.join(COMP, "context/computationContext.js")).includes("createComputationContext") &&
    evaluated.computationContext?.listVariables?.().length >= 0
);

gate(
  "G302 — Cost analyzer and optimizer stubs",
  read(path.join(COMP, "cost/costAnalyzer.js")).includes("createCostAnalyzer") &&
    read(path.join(COMP, "optimizer/computationOptimizer.js")).includes("createComputationOptimizer")
);

gate(
  "G302 — Field computation models (infra contracts)",
  read(path.join(COMP, "fieldModels/fieldComputationModels.js")).includes("computed") &&
    read(path.join(COMP, "fieldModels/fieldComputationModels.js")).includes("derived") &&
    exists(path.join(DESIGNERS, "field/computation/fieldComputationSetup.js"))
);

const allowedComputationConsumers = [
  "designers/field/computation/",
  "designers/formula/core/formulaCoreSetup.js",
  "designers/formula/core/formulaPipeline.js",
];
const isAllowedConsumer = (relPath) => {
  const norm = relPath.replace(/\\/g, "/");
  return allowedComputationConsumers.some((p) => norm.includes(p));
};

const designerDirs = fs.readdirSync(DESIGNERS).filter((d) => fs.statSync(path.join(DESIGNERS, d)).isDirectory());
const forbiddenDesignerPatterns = [
  /createComputationEngine\s*\(/,
  /createComputationGraph\s*\(/,
  /createExecutionGraph\s*\(/,
  /compileDocumentToIr\s*\(/,
  /createComputationValidationPipeline\s*\(/,
  /evaluateFormula\s*\(/,
  /function\s+computeField\s*\(/,
  /class\s+ComputationGraph/,
  /class\s+ComputationEvaluator/,
];
const parallelViolations = [];
designerDirs.forEach((designerId) => {
  const dir = path.join(DESIGNERS, designerId);
  const walk = (folder) => {
    fs.readdirSync(folder, { withFileTypes: true }).forEach((entry) => {
      const full = path.join(folder, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        return;
      }
      if (!/\.(js|jsx)$/.test(entry.name)) return;
      const rel = path.relative(ROOT, full);
      if (isAllowedConsumer(rel)) return;
      const content = read(full);
      forbiddenDesignerPatterns.forEach((pattern) => {
        if (pattern.test(content) && !content.includes("@/studio/computation") && !content.includes("../../../computation/")) {
          parallelViolations.push(rel);
        }
      });
    });
  };
  walk(dir);
});

gate(
  "G302 — No designer implements parallel computation graph/evaluator",
  parallelViolations.length === 0,
  parallelViolations.join(", ")
);

gate(
  "G302 — Computation in dependency stack",
  DEPENDENCY_STACK.some((l) => l.layerId === "studio-computation")
);

gate(
  "G302 — Exported from studio public API",
  read(path.join(ROOT, "src/studio/index.js")).includes("createComputationEngine") &&
    read(path.join(ROOT, "src/studio/index.js")).includes("./computation/index.js")
);

const compFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("src/studio/computation/"));
const forbidden = compFiles.filter(({ content }) =>
  FORBIDDEN_FOUNDATION_PATTERNS.some(({ pattern }) => pattern.test(content))
);
gate(
  "G302 — No foundation forbidden imports in computation engine",
  forbidden.length === 0,
  forbidden.map((f) => path.basename(f.path)).join(", ")
);

gate(
  "G302 — No Computed Fields UI in scope (Formula Builder via G303A)",
  !read(path.join(DESIGNERS, "field/canvas/FieldCanvas.jsx")).includes("ComputedFieldEditor") &&
    exists(path.join(DESIGNERS, "formula/components/FormulaBuilderShell.jsx"))
);

gate(
  "G302 — Prior engines remain integrated (source wiring)",
  read(path.join(EXPR, "dependency/expressionDependencyGraph.js")).includes("createDependencyEngine") &&
    read(path.join(EXPR, "runtime/expressionEvaluationBridge.js")).includes("createEvaluationEngine") &&
    read(path.join(EVAL, "createEvaluationEngine.js")).includes("createDependencyEngine") &&
    read(path.join(EVAL, "createEvaluationEngine.js")).includes("createTypeSystem")
);

let g301Ok = false;
try {
  execSync("node scripts/gate-studio-evaluation-engine.mjs", { cwd: ROOT, stdio: "pipe" });
  g301Ok = true;
} catch {
  g301Ok = false;
}
gate("G302 — G301 Evaluation Engine still green", g301Ok);

const failed = results.filter((r) => !r.ok);
console.log(`\nG302: ${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exit(1);
