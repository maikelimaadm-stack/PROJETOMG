#!/usr/bin/env node
/**
 * Gate G300 — Studio Type System Validation (Program 2.3.4)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  STUDIO_TYPE_SYSTEM_VERSION,
  OFFICIAL_TYPE_ENGINES,
  TYPE_REGISTRY_VERSION,
  PRIMITIVE_TYPE_IDS,
  createTypeSystem,
} from "../src/studio/typeSystem/index.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";
import { FORBIDDEN_FOUNDATION_PATTERNS, DEPENDENCY_STACK } from "../src/studio/governance/studioArchitectureConstants.js";

const ROOT = process.cwd();
const TS = path.join(ROOT, "src/studio/typeSystem");
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
  "contracts/typeSystemContracts.js",
  "catalog/typeCatalog.js",
  "primitives/primitiveTypes.js",
  "business/businessTypeDescriptors.js",
  "reference/referenceTypes.js",
  "collection/collectionTypes.js",
  "enum/enumTypes.js",
  "compatibility/typeCompatibilityEngine.js",
  "inference/typeInferenceEngine.js",
  "coercion/typeCoercionEngine.js",
  "validation/typeValidationEngine.js",
  "metadata/typeMetadata.js",
  "documentation/typeDocumentation.js",
  "createTypeSystem.js",
  "index.js",
];

gate("G300 — Type System structure exists", engineFiles.every((f) => exists(path.join(TS, f))));

gate(
  "G300 — Official Type System version and engines",
  STUDIO_TYPE_SYSTEM_VERSION === "mak-studio-type-system-v1" &&
    OFFICIAL_TYPE_ENGINES.length === 5 &&
    OFFICIAL_TYPE_ENGINES.includes("registry") &&
    OFFICIAL_TYPE_ENGINES.includes("inference")
);

gate(
  "G300 — Single official Type Registry",
  TYPE_REGISTRY_VERSION === "mak-studio-type-registry-v1" &&
    read(path.join(TS, "catalog/typeCatalog.js")).includes("createTypeRegistry") &&
    read(path.join(TS, "createTypeSystem.js")).includes("createTypeRegistry")
);

gate(
  "G300 — Primitive and structural types supported",
  PRIMITIVE_TYPE_IDS.includes("string") &&
    PRIMITIVE_TYPE_IDS.includes("decimal") &&
    PRIMITIVE_TYPE_IDS.includes("expression") &&
    PRIMITIVE_TYPE_IDS.includes("dataset") &&
    PRIMITIVE_TYPE_IDS.includes("formula")
);

const typeSystem = createTypeSystem();
const inferBool = typeSystem.inferExpression(
  { kind: "BinaryExpression", operator: "&&", left: { kind: "Literal", value: true, valueType: "boolean" }, right: { kind: "Literal", value: false, valueType: "boolean" } },
  {}
);
const compat = typeSystem.compatibility.describeCompatibility("integer", "decimal");
const coerce = typeSystem.coerce("42", "string", "integer");
const validate = typeSystem.validateValue(10, "integer");
const docs = typeSystem.documentation();

gate(
  "G300 — Inference, compatibility, coercion, validation pipeline",
  inferBool === "boolean" &&
    compat.compatible === true &&
    coerce.ok === true &&
    validate.valid === true &&
    docs.typeCount > 0
);

gate(
  "G300 — Type metadata for IA / Marketplace",
  read(path.join(TS, "metadata/typeMetadata.js")).includes("aiHints") &&
    read(path.join(TS, "metadata/typeMetadata.js")).includes("documentation") &&
    read(path.join(TS, "documentation/typeDocumentation.js")).includes("examples")
);

gate(
  "G300 — Expression Engine delegates to Studio Type System",
  read(path.join(EXPR, "types/expressionTypeSystem.js")).includes("createTypeSystem") &&
    !read(path.join(EXPR, "types/expressionTypeSystem.js")).includes("BINARY_RESULT")
);

const designerDirs = fs.readdirSync(DESIGNERS).filter((d) => fs.statSync(path.join(DESIGNERS, d)).isDirectory());
const forbiddenDesignerPatterns = [
  /createTypeRegistry\s*\(/,
  /createTypeInferenceEngine\s*\(/,
  /createTypeCoercionEngine\s*\(/,
  /createTypeCompatibilityEngine\s*\(/,
  /createTypeValidationEngine\s*\(/,
  /FIELD_TYPE_MAP\s*=/,
  /TYPE_COMPATIBILITY\s*=/,
];
const parallelViolations = [];
designerDirs.forEach((designerId) => {
  const dir = path.join(DESIGNERS, designerId);
  const walk = (folder) => {
    fs.readdirSync(folder, { withFileTypes: true }).forEach((entry) => {
      const full = path.join(folder, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "typeSystem" && designerId === "field") return;
        walk(full);
        return;
      }
      if (!/\.(js|jsx)$/.test(entry.name)) return;
      if (full.includes(`${designerId}/typeSystem/`) && designerId === "field") return;
      const content = read(full);
      forbiddenDesignerPatterns.forEach((pattern) => {
        if (pattern.test(content) && !content.includes("@/studio/typeSystem")) {
          parallelViolations.push(path.relative(ROOT, full));
        }
      });
    });
  };
  walk(dir);
});

gate(
  "G300 — No designer implements parallel type registry/inference/coercion",
  parallelViolations.length === 0,
  parallelViolations.join(", ")
);

gate(
  "G300 — Field Studio consumes Type System",
  exists(path.join(DESIGNERS, "field/typeSystem/fieldTypeSetup.js")) &&
    read(path.join(DESIGNERS, "field/typeSystem/fieldTypeSetup.js")).includes("createTypeSystem") &&
    read(path.join(DESIGNERS, "field/expression/fieldExpressionSetup.js")).includes("mapFieldTypeForExpression") &&
    !read(path.join(DESIGNERS, "field/expression/fieldExpressionSetup.js")).includes("FIELD_TYPE_MAP")
);

gate(
  "G300 — Type System in dependency stack",
  DEPENDENCY_STACK.some((l) => l.layerId === "studio-type-system")
);

gate(
  "G300 — Exported from studio public API",
  read(path.join(ROOT, "src/studio/index.js")).includes("createTypeSystem") &&
    read(path.join(ROOT, "src/studio/index.js")).includes("./typeSystem/index.js")
);

const tsFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("src/studio/typeSystem/"));
const forbidden = tsFiles.filter(({ content }) =>
  FORBIDDEN_FOUNDATION_PATTERNS.some(({ pattern }) => pattern.test(content))
);
gate(
  "G300 — No foundation forbidden imports in type system",
  forbidden.length === 0,
  forbidden.map((f) => path.basename(f.path)).join(", ")
);

gate(
  "G300 — No computed/derived/runtime evaluation in scope",
  !exists(path.join(TS, "computed/")) &&
    !exists(path.join(TS, "runtime/")) &&
    !read(path.join(DESIGNERS, "field/canvas/FieldCanvas.jsx")).includes("ComputedFieldEditor")
);

let g299Ok = false;
try {
  execSync("node scripts/gate-studio-dependency-engine.mjs", { cwd: ROOT, stdio: "pipe" });
  g299Ok = true;
} catch {
  g299Ok = false;
}
gate("G300 — G299 Dependency Engine still green", g299Ok);

const failed = results.filter((r) => !r.ok);
console.log(`\nG300: ${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exit(1);
