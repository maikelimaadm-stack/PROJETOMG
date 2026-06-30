#!/usr/bin/env node
/**
 * Gate G303A — Formula Builder Validation (Program 3.2)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  FORMULA_DOCUMENT_VERSION,
  FORMULA_BUILDER_VERSION,
} from "../src/studio/designers/formula/contracts/formulaContracts.js";
import { createFormulaDocument } from "../src/studio/designers/formula/document/formulaDocument.js";
import {
  applyFormulaDocumentEdit,
  getFormulaComputationEngine,
} from "../src/studio/designers/formula/core/formulaCoreSetup.js";
import { syncFormulaPipeline } from "../src/studio/designers/formula/core/formulaPipeline.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";
import { FORBIDDEN_FOUNDATION_PATTERNS } from "../src/studio/governance/studioArchitectureConstants.js";

const ROOT = process.cwd();
const FORMULA = path.join(ROOT, "src/studio/designers/formula");
const FIELD_COMP = path.join(ROOT, "src/studio/designers/field/computation");
const FIELD = path.join(ROOT, "src/studio/designers/field");
const DESIGNERS = path.join(ROOT, "src/studio/designers");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const requiredFiles = [
  "contracts/formulaContracts.js",
  "document/formulaDocument.js",
  "core/formulaCoreSetup.js",
  "core/formulaPipeline.js",
  "core/formulaTokenBuilder.js",
  "core/formulaSuggestions.js",
  "components/FormulaBuilderShell.jsx",
  "components/FormulaEditor.jsx",
  "components/FormulaToolbar.jsx",
  "components/FormulaExplorer.jsx",
  "components/FormulaInspector.jsx",
  "components/FormulaPreview.jsx",
  "components/FormulaDiagnostics.jsx",
  "components/FormulaSuggestions.jsx",
  "components/FormulaValidationPanel.jsx",
  "FormulaDocumentProvider.jsx",
  "FormulaDesignerPlugin.jsx",
  "registerFormulaDesigner.js",
  "editor/formulaEditorRegistration.jsx",
  "index.js",
];

gate("G303A — Formula Builder structure exists", requiredFiles.every((f) => exists(path.join(FORMULA, f))));

gate(
  "G303A — Official Formula Document and Builder versions",
  FORMULA_DOCUMENT_VERSION === "mak-formula-document-v1" &&
    FORMULA_BUILDER_VERSION === "mak-formula-builder-v1"
);

gate(
  "G303A — Sole mutation path via applyFormulaDocumentEdit",
  read(path.join(FORMULA, "core/formulaCoreSetup.js")).includes("applyFormulaDocumentEdit") &&
    read(path.join(FORMULA, "FormulaDocumentProvider.jsx")).includes("applyFormulaDocumentEdit") &&
    !read(path.join(FORMULA, "FormulaDocumentProvider.jsx")).includes("createFormulaDocument(")
);

gate(
  "G303A — Pipeline delegates to Computation Engine only",
  read(path.join(FORMULA, "core/formulaPipeline.js")).includes("getFormulaComputationEngine") &&
    read(path.join(FORMULA, "core/formulaPipeline.js")).includes("engine.validate") &&
    read(path.join(FORMULA, "core/formulaPipeline.js")).includes("engine.compile") &&
    read(path.join(FORMULA, "core/formulaPipeline.js")).includes("engine.evaluate") &&
    !read(path.join(FORMULA, "core/formulaPipeline.js")).includes("createExpressionParser")
);

const doc = createFormulaDocument({
  id: "gate-formula",
  computationDocumentId: "gate-comp",
  ownerFieldId: "total",
  moduleId: "gate",
  expressionSource: "",
});
const pipeline = syncFormulaPipeline(doc);
const afterInsert = applyFormulaDocumentEdit(doc, {
  type: "insertToken",
  token: { kind: "field", name: "price" },
});
const afterOp = applyFormulaDocumentEdit(afterInsert.formulaDocument, {
  type: "insertToken",
  token: { kind: "operator", op: "*" },
});
const afterConst = applyFormulaDocumentEdit(afterOp.formulaDocument, {
  type: "insertToken",
  token: { kind: "constant", value: 1.1 },
});

gate(
  "G303A — Visual token insert → Computation pipeline",
  afterConst.formulaDocument.expressionSource.includes("price") &&
    afterConst.computationDocument?.schemaVersion === "mak-computation-document-v1" &&
    afterConst.computationDocument?.expressionSource?.includes("price")
);

const engine = getFormulaComputationEngine();
const evalDoc = createFormulaDocument({
  id: "gate-eval",
  computationDocumentId: "gate-comp-eval",
  ownerFieldId: "total",
  moduleId: "gate",
  expressionSource: "price * 1.1 + coalesce(discount, 0)",
  sampleVariables: { price: 100, discount: 5 },
});
const evalPipeline = syncFormulaPipeline(evalDoc);

gate(
  "G303A — Preview via official Evaluation pipeline",
  evalPipeline.preview?.ok === true &&
    typeof evalPipeline.preview?.value === "number" &&
    evalPipeline.executionGraph?.getKernels?.()?.length >= 0
);

gate(
  "G303A — Field Studio computation adapter",
  exists(path.join(FIELD_COMP, "fieldComputationSetup.js")) &&
    read(path.join(FIELD_COMP, "fieldComputationSetup.js")).includes("createComputationEngine") &&
    read(path.join(FIELD, "core/fieldCoreSetup.js")).includes("getFieldComputationEngine") &&
    read(path.join(FIELD, "canvas/FieldCanvas.jsx")).includes("openFieldFormulaBuilderUrl")
);

const uiComponentFiles = [
  "components/FormulaEditor.jsx",
  "components/FormulaToolbar.jsx",
  "components/FormulaExplorer.jsx",
  "components/FormulaInspector.jsx",
  "components/FormulaPreview.jsx",
  "components/FormulaDiagnostics.jsx",
  "components/FormulaSuggestions.jsx",
  "components/FormulaValidationPanel.jsx",
  "components/FormulaBuilderShell.jsx",
  "FormulaDesignerPlugin.jsx",
];

const astDirectAccess = uiComponentFiles.filter((f) => {
  const content = read(path.join(FORMULA, f));
  return (
    /\.expression\b/.test(content) ||
    /astVersion/.test(content) ||
    /createExpressionParser/.test(content) ||
    /executeExpressionAst/.test(content)
  );
});

gate(
  "G303A — UI does not access AST directly",
  astDirectAccess.length === 0,
  astDirectAccess.join(", ")
);

const formulaForbidden = [
  /createExpressionParser\s*\(/,
  /executeExpressionAst\s*\(/,
  /createEvaluationEngine\s*\(/,
  /createEvaluationPipeline\s*\(/,
  /evaluateFormula\s*\(/,
  /class\s+FormulaEvaluator/,
];

const formulaViolations = [];
const walkFormula = (folder) => {
  fs.readdirSync(folder, { withFileTypes: true }).forEach((entry) => {
    const full = path.join(folder, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "core") return;
      walkFormula(full);
      return;
    }
    if (!/\.(js|jsx)$/.test(entry.name)) return;
    if (full.includes("/core/")) return;
    const content = read(full);
    formulaForbidden.forEach((pattern) => {
      if (pattern.test(content)) formulaViolations.push(path.relative(ROOT, full));
    });
  });
};
walkFormula(FORMULA);

gate(
  "G303A — No parallel parser/evaluator in Formula Builder UI",
  formulaViolations.length === 0,
  formulaViolations.join(", ")
);

const coreContent = read(path.join(FORMULA, "core/formulaCoreSetup.js"));
gate(
  "G303A — Core setup uses Computation Engine exclusively",
  coreContent.includes("createComputationEngine") &&
    !coreContent.includes("createExpressionEngine(") &&
    coreContent.includes("applyFormulaDocumentEdit")
);

const designerDirs = fs.readdirSync(DESIGNERS).filter((d) => fs.statSync(path.join(DESIGNERS, d)).isDirectory());
const parallelDesignerPatterns = [
  /createFormulaDocument\s*\(/,
  /syncFormulaPipeline\s*\(/,
  /applyFormulaDocumentEdit\s*\(/,
];
const designerViolations = [];
designerDirs.forEach((designerId) => {
  if (designerId === "formula") return;
  const dir = path.join(DESIGNERS, designerId);
  const walk = (folder) => {
    fs.readdirSync(folder, { withFileTypes: true }).forEach((entry) => {
      const full = path.join(folder, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "computation" && designerId === "field") {
          walk(full);
          return;
        }
        walk(full);
        return;
      }
      if (!/\.(js|jsx)$/.test(entry.name)) return;
      if (designerId === "field" && full.includes("/computation/")) return;
      const content = read(full);
      parallelDesignerPatterns.forEach((pattern) => {
        if (pattern.test(content) && !content.includes("@/studio/designers/formula")) {
          designerViolations.push(path.relative(ROOT, full));
        }
      });
    });
  };
  walk(dir);
});

gate(
  "G303A — Only Formula Builder mutates Formula Document",
  designerViolations.length === 0,
  designerViolations.join(", ")
);

gate(
  "G303A — Extension points prepared (AI / Marketplace / NL)",
  read(path.join(FORMULA, "contracts/formulaContracts.js")).includes("FORMULA_EXTENSION_POINTS") &&
    read(path.join(FORMULA, "core/formulaSuggestions.js")).includes("extensionPoint")
);

gate(
  "G303A — No Computed/Derived/Runtime execution in scope",
  !exists(path.join(FORMULA, "runtime/")) &&
    !read(path.join(FORMULA, "FormulaDesignerPlugin.jsx")).includes("ComputedField") &&
    !read(path.join(FIELD, "canvas/FieldCanvas.jsx")).includes("ComputedFieldEditor")
);

gate(
  "G303A — Formula designer registered in production shell",
  read(path.join(ROOT, "src/studio/shell/studioShellConfig.js")).includes('"formula"') &&
    read(path.join(ROOT, "src/studio/shell/StudioProductionShellProvider.jsx")).includes("registerFormulaDesigner")
);

const formulaFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("src/studio/designers/formula/"));
const forbidden = formulaFiles.filter(({ content }) =>
  FORBIDDEN_FOUNDATION_PATTERNS.some(({ pattern }) => pattern.test(content))
);
gate(
  "G303A — No foundation forbidden imports",
  forbidden.length === 0,
  forbidden.map((f) => path.basename(f.path)).join(", ")
);

let g302Ok = false;
try {
  execSync("node scripts/gate-studio-computation-engine.mjs", { cwd: ROOT, stdio: "pipe" });
  g302Ok = true;
} catch {
  g302Ok = false;
}
gate("G303A — G302 Computation Engine still green", g302Ok);

const failed = results.filter((r) => !r.ok);
console.log(`\nG303A: ${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exit(1);
