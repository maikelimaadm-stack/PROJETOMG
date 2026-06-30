#!/usr/bin/env node
/**
 * Gate G305 — Business Intent Resolver Implementation (Program 3.7, D-064/D-067)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  BUSINESS_INTENT_DOCUMENT_VERSION,
  INTENT_RESOLVER_VERSION,
  INTENT_RESOLVER_ENGINE_ID,
  RESOLVER_DOCUMENT_VERSION,
  DERIVATION_DOCUMENT_VERSION,
  createBusinessIntentDocument,
  createBusinessLanguageInput,
  createIntentResolver,
  resolveFromBusinessLanguage,
  resolveIntentDocument,
  RESOLVER_EXTENSION_POINTS,
  RESOLVER_PIPELINE_STAGES,
} from "../src/studio/intent/index.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";
import { FORBIDDEN_FOUNDATION_PATTERNS } from "../src/studio/governance/studioArchitectureConstants.js";

const ROOT = process.cwd();
const INTENT = path.join(ROOT, "src/studio/intent");
const DESIGNERS = path.join(ROOT, "src/studio/designers");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const requiredFiles = [
  "contracts/intentContracts.js",
  "contracts/derivationContracts.js",
  "document/intentDocument.js",
  "language/businessLanguageInput.js",
  "catalog/capabilityCatalog.js",
  "resolver/createIntentResolver.js",
  "resolver/resolverPipeline.js",
  "resolver/resolverSession.js",
  "resolver/resolverContext.js",
  "resolver/capabilityResolution.js",
  "resolver/capabilityValidation.js",
  "resolver/capabilityCompatibility.js",
  "resolver/derivationPlanning.js",
  "resolver/computedFieldDerivation.js",
  "resolver/formulaDerivation.js",
  "resolver/derivationMetadata.js",
  "resolver/lineage.js",
  "resolver/explainability.js",
  "resolver/telemetry.js",
  "resolver/regeneration.js",
  "resolver/extensionPoints.js",
  "resolver/projections/formulaProjection.js",
  "resolver/projections/computationProjection.js",
  "index.js",
];

gate("G305 — Intent Resolver structure exists", requiredFiles.every((f) => exists(path.join(INTENT, f))));

gate(
  "G305 — Official contract versions",
  BUSINESS_INTENT_DOCUMENT_VERSION === "mak-business-intent-document-v1" &&
    INTENT_RESOLVER_VERSION === "mak-intent-resolver-v1" &&
    INTENT_RESOLVER_ENGINE_ID === "mak-business-intent-resolver-engine" &&
    RESOLVER_DOCUMENT_VERSION === "mak-resolver-document-v1" &&
    DERIVATION_DOCUMENT_VERSION === "mak-derivation-document-v1"
);

gate(
  "G305 — Sole resolution via createIntentResolver / resolveIntentDocument",
  read(path.join(INTENT, "resolver/createIntentResolver.js")).includes("resolveIntent") &&
    read(path.join(INTENT, "resolver/createIntentResolver.js")).includes("resolveFromBusinessLanguage") &&
    read(path.join(INTENT, "index.js")).includes("resolveIntentDocument")
);

gate(
  "G305 — Pipeline stages registered",
  RESOLVER_PIPELINE_STAGES.includes("capability_resolution") &&
    RESOLVER_PIPELINE_STAGES.includes("derivation_planning") &&
    read(path.join(INTENT, "resolver/resolverPipeline.js")).includes("runResolverPipeline")
);

gate(
  "G305 — Business Computed Field derivation; extension points for other kinds",
  RESOLVER_EXTENSION_POINTS.length >= 5 &&
    RESOLVER_EXTENSION_POINTS.every((e) => e.implemented === false) &&
    read(path.join(INTENT, "resolver/derivationPlanning.js")).includes("DERIVATION_KIND_COMPUTED_FIELD") &&
    read(path.join(INTENT, "resolver/computedFieldDerivation.js")).includes("executeComputedFieldDerivation")
);

// End-to-end pipeline
const blInput = createBusinessLanguageInput({
  objective: "Calculate order total with tax",
  condition: "When price is set",
  expectedResult: "Total includes 10% tax",
  expressionSource: "price * 1.1 + coalesce(discount, 0)",
  ownerFieldId: "orderTotal",
  moduleId: "empresas",
  entityId: "EmpresaCadastro",
  sampleVariables: { price: 100, discount: 5 },
});

const e2e = resolveFromBusinessLanguage(blInput, { initiatedBy: "gate-g305" });

gate(
  "G305 — Business Language → Intent → Resolver",
  e2e.ok === true &&
    e2e.intentDocument?.schemaVersion === BUSINESS_INTENT_DOCUMENT_VERSION &&
    e2e.resolverDocument?.resolverSessionId
);

gate(
  "G305 — Derivation → Business Computed Field → Formula Document projection",
  e2e.businessComputedField?.id &&
    e2e.formulaDocument?.schemaVersion === "mak-formula-document-v1" &&
    e2e.formulaDocument?.metadata?.derivedFromIntent === true &&
    e2e.formulaDocument?.metadata?.derivedFromBusinessComputedField === true &&
    e2e.formulaDocument?.expressionSource?.includes("price")
);

gate(
  "G305 — Formula → Computation Document → AST → Evaluation preview",
  e2e.computationDocument?.schemaVersion === "mak-computation-document-v1" &&
    e2e.expressionAst != null &&
    e2e.preview?.value != null &&
    Math.abs(Number(e2e.preview.value) - 115) < 0.01
);

gate(
  "G305 — Mandatory derivation metadata + lineage",
  e2e.metadata?.derivationId &&
    e2e.metadata?.intentId === e2e.intentDocument.id &&
    e2e.metadata?.lineage?.length >= 3 &&
    e2e.metadata?.resolverVersion === INTENT_RESOLVER_VERSION
);

gate(
  "G305 — Explainability report",
  e2e.explainability?.intentId === e2e.intentDocument.id &&
    e2e.explainability?.businessSummary?.length > 0
);

// Determinism / idempotence
const e2eRepeat = resolveFromBusinessLanguage(blInput, { initiatedBy: "gate-g305" });
gate(
  "G305 — Deterministic derivation id and expression",
  e2e.metadata?.derivationId === e2eRepeat.metadata?.derivationId &&
    e2e.formulaDocument?.expressionSource === e2eRepeat.formulaDocument?.expressionSource &&
    e2e.preview?.value === e2eRepeat.preview?.value
);

// Regeneration / diff / rollback prepared
const resolver = createIntentResolver();
const rollback = resolver.prepareRollback(e2e.session, e2e);
const diff = resolver.diffResults(e2e, e2eRepeat);
gate(
  "G305 — Regeneration utilities (diff, rollback prepared)",
  rollback.prepared === true && diff.changed === false
);

// No designer bypass
const designerFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("/designers/"));
const bypassPatterns = [
  /resolveIntentDocument/,
  /resolveFromBusinessLanguage/,
  /runResolverPipeline/,
  /createIntentResolver/,
];
let bypassFound = false;
for (const file of designerFiles) {
  const content = file.content;
  for (const pat of bypassPatterns) {
    if (pat.test(content)) {
      bypassFound = true;
      break;
    }
  }
}
gate("G305 — No resolution bypass in designers", !bypassFound);

// Foundation forbidden patterns in intent package
const intentFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("/intent/"));
let foundationViolation = false;
for (const file of intentFiles) {
  const content = file.content;
  for (const { pattern } of FORBIDDEN_FOUNDATION_PATTERNS) {
    if (pattern.test(content)) {
      foundationViolation = true;
      break;
    }
  }
}
gate("G305 — No foundation forbidden imports in intent package", !foundationViolation);

gate(
  "G305 — Computation projection uses Computation Engine only",
  read(path.join(INTENT, "resolver/projections/computationProjection.js")).includes("createComputationEngine") &&
    !read(path.join(INTENT, "resolver/projections/computationProjection.js")).includes("designers/formula")
);

// Upstream G303A still green
try {
  execSync("node scripts/gate-studio-formula-builder.mjs", { stdio: "pipe" });
  gate("G305 — G303A Formula Builder still green", true);
} catch {
  gate("G305 — G303A Formula Builder still green", false, "G303A failed");
}

const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`\nG305: ${passed}/${total} checks passed`);
if (passed < total) process.exit(1);
