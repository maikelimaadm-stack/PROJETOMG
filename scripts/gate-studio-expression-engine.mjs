#!/usr/bin/env node
/**
 * Gate G298 — Studio Expression Engine Validation (Program 2.3.2)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  STUDIO_EXPRESSION_VERSION,
  OFFICIAL_EXPRESSION_ENGINES,
  EXPRESSION_AST_VERSION,
  EXPRESSION_DOCUMENT_VERSION,
  EXPRESSION_NODE_KINDS,
  createExpressionEngine,
} from "../src/studio/expression/index.js";
import { OFFICIAL_EXPRESSION_FUNCTIONS } from "../src/studio/expression/catalog/functionCatalog.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";
import { FORBIDDEN_FOUNDATION_PATTERNS, DEPENDENCY_STACK } from "../src/studio/governance/studioArchitectureConstants.js";

const ROOT = process.cwd();
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
  "contracts/expressionContracts.js",
  "document/expressionDocument.js",
  "ast/expressionAst.js",
  "parser/expressionParser.js",
  "compiler/expressionCompiler.js",
  "validator/expressionValidator.js",
  "types/expressionTypeSystem.js",
  "catalog/functionCatalog.js",
  "context/expressionContext.js",
  "dependency/expressionDependencyGraph.js",
  "refactoring/expressionRefactoring.js",
  "runtime/expressionExecutor.js",
  "createExpressionEngine.js",
  "index.js",
];

gate(
  "G298 — Expression Engine structure exists",
  engineFiles.every((f) => exists(path.join(EXPR, f)))
);

gate(
  "G298 — Official Expression version and engines",
  STUDIO_EXPRESSION_VERSION === "mak-studio-expression-v1" &&
    OFFICIAL_EXPRESSION_ENGINES.length === 10 &&
    OFFICIAL_EXPRESSION_ENGINES.includes("parser") &&
    OFFICIAL_EXPRESSION_ENGINES.includes("functionCatalog")
);

gate(
  "G298 — Single official AST",
  EXPRESSION_AST_VERSION === "mak-expression-ast-v1" &&
    EXPRESSION_NODE_KINDS.length >= 7 &&
    read(path.join(EXPR, "ast/expressionAst.js")).includes("createExpressionAstRoot")
);

gate(
  "G298 — Expression Document contract",
  EXPRESSION_DOCUMENT_VERSION === "mak-expression-document-v1" &&
    read(path.join(EXPR, "document/expressionDocument.js")).includes("createExpressionDocument")
);

gate(
  "G298 — Single official Parser",
  read(path.join(EXPR, "parser/expressionParser.js")).includes("createExpressionParser") &&
    read(path.join(EXPR, "createExpressionEngine.js")).includes("createExpressionParser")
);

gate(
  "G298 — Single official Function Catalog",
  OFFICIAL_EXPRESSION_FUNCTIONS.length >= 6 &&
    read(path.join(EXPR, "catalog/functionCatalog.js")).includes("aiHints") &&
    read(path.join(EXPR, "catalog/functionCatalog.js")).includes("documentation") &&
    read(path.join(EXPR, "catalog/functionCatalog.js")).includes("examples")
);

gate(
  "G298 — Structural language support",
  read(path.join(EXPR, "parser/expressionParser.js")).includes("??") &&
    read(path.join(EXPR, "parser/expressionParser.js")).includes("createCallNode") &&
    read(path.join(EXPR, "parser/expressionParser.js")).includes("createPropertyAccessNode")
);

const engine = createExpressionEngine();
const sampleAst = engine.parse("price * 1.1 + coalesce(discount, 0)", { designerId: "gate" });
const sampleValidation = engine.validate(sampleAst, engine.createContext({ variables: { price: 10, discount: null } }));
const sampleIr = engine.compile(sampleAst);
const sampleValue = engine.execute(sampleAst, engine.createContext({ variables: { price: 100, discount: null } }));

gate(
  "G298 — Parse, validate, compile, execute pipeline",
  sampleValidation.valid &&
    sampleIr.irVersion === "mak-expression-ir-v1" &&
    sampleIr.ops.length > 0 &&
    typeof sampleValue === "number"
);

gate(
  "G298 — Dependency graph and refactoring",
  read(path.join(EXPR, "dependency/expressionDependencyGraph.js")).includes("extractFromAst") &&
    read(path.join(EXPR, "dependency/expressionDependencyGraph.js")).includes("createDependencyEngine") &&
    read(path.join(EXPR, "refactoring/expressionRefactoring.js")).includes("renameVariable")
);

const deps = engine.extractDependencies(sampleAst, "gate-sample");
gate("G298 — Dependency extraction works", deps.includes("price") && deps.includes("discount"));

const designerDirs = fs.readdirSync(DESIGNERS).filter((d) => fs.statSync(path.join(DESIGNERS, d)).isDirectory());
const forbiddenDesignerPatterns = [
  /createExpressionParser\s*\(/,
  /function\s+parseExpression/,
  /class\s+ExpressionParser/,
  /createExpressionEvaluator/,
  /evaluateFormula\s*\(/,
];
const parallelViolations = [];
designerDirs.forEach((designerId) => {
  const dir = path.join(DESIGNERS, designerId);
  const walk = (folder) => {
    fs.readdirSync(folder, { withFileTypes: true }).forEach((entry) => {
      const full = path.join(folder, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "expression" && designerId === "field") return;
        walk(full);
        return;
      }
      if (!/\.(js|jsx)$/.test(entry.name)) return;
      if (full.includes(`${designerId}/expression/`) && designerId === "field") return;
      const content = read(full);
      forbiddenDesignerPatterns.forEach((pattern) => {
        if (pattern.test(content) && !content.includes("@/studio/expression")) {
          parallelViolations.push(path.relative(ROOT, full));
        }
      });
    });
  };
  walk(dir);
});

gate(
  "G298 — No designer implements own parser/AST/evaluator",
  parallelViolations.length === 0,
  parallelViolations.join(", ")
);

gate(
  "G298 — Field Studio consumes Expression Engine",
  exists(path.join(DESIGNERS, "field/expression/fieldExpressionSetup.js")) &&
    read(path.join(DESIGNERS, "field/expression/fieldExpressionSetup.js")).includes("createExpressionEngine") &&
    read(path.join(DESIGNERS, "field/core/fieldCoreSetup.js")).includes("getFieldExpressionEngine") &&
    !read(path.join(DESIGNERS, "field/expression/fieldExpressionSetup.js")).includes("createExpressionParser")
);

gate(
  "G298 — Expression in dependency stack",
  DEPENDENCY_STACK.some((l) => l.layerId === "studio-expression")
);

gate(
  "G298 — Exported from studio public API",
  read(path.join(ROOT, "src/studio/index.js")).includes("createExpressionEngine") &&
    read(path.join(ROOT, "src/studio/index.js")).includes("./expression/index.js")
);

const exprFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("src/studio/expression/"));
const forbidden = exprFiles.filter(({ content }) =>
  FORBIDDEN_FOUNDATION_PATTERNS.some(({ pattern }) => pattern.test(content))
);
gate(
  "G298 — No foundation forbidden imports in expression engine",
  forbidden.length === 0,
  forbidden.map((f) => path.basename(f.path)).join(", ")
);

gate(
  "G298 — No computed/derived/formula editor in scope",
  !exists(path.join(EXPR, "editor/")) &&
    !read(path.join(DESIGNERS, "field/canvas/FieldCanvas.jsx")).includes("FormulaEditor")
);

let g297Ok = false;
try {
  execSync("node scripts/gate-studio-field-smart-authoring.mjs", { cwd: ROOT, stdio: "pipe" });
  g297Ok = true;
} catch {
  g297Ok = false;
}
gate("G298 — G297 Smart Authoring still green", g297Ok);

const failed = results.filter((r) => !r.ok);
console.log(`\nG298: ${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exit(1);
