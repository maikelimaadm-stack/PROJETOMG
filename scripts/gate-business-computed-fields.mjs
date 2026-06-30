#!/usr/bin/env node
/**
 * Gate G306 — Business Computed Fields (Program 3.8, D-068)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  BUSINESS_INTENT_DOCUMENT_VERSION,
  INTENT_RESOLVER_VERSION,
  createBusinessLanguageInput,
  resolveFromBusinessLanguage,
} from "../src/studio/intent/index.js";
import {
  BUSINESS_COMPUTED_FIELD_VERSION,
  BUSINESS_COMPUTED_DOCUMENT_VERSION,
  BUSINESS_COMPUTED_ASSET_TYPE,
  DERIVATION_KIND_COMPUTED_FIELD,
  ARTIFACT_TYPE_BUSINESS_COMPUTED_FIELD,
  BUSINESS_COMPUTED_EXTENSION_POINTS,
  validateBusinessComputedField,
} from "../src/studio/business/index.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";
import { FORBIDDEN_FOUNDATION_PATTERNS } from "../src/studio/governance/studioArchitectureConstants.js";

const ROOT = process.cwd();
const BUSINESS = path.join(ROOT, "src/studio/business");
const INTENT = path.join(ROOT, "src/studio/intent");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const requiredBusinessFiles = [
  "contracts/businessComputedContracts.js",
  "computed/businessComputedField.js",
  "computed/businessComputedDocument.js",
  "computed/businessComputedMetadata.js",
  "computed/businessComputedLifecycle.js",
  "computed/businessComputedValidation.js",
  "computed/businessComputedLineage.js",
  "computed/businessComputedDiagnostics.js",
  "computed/businessComputedExplainability.js",
  "computed/businessComputedVersioning.js",
  "computed/businessComputedCompatibility.js",
  "computed/businessComputedPolicies.js",
  "computed/businessComputedPreview.js",
  "computed/businessComputedSynchronization.js",
  "computed/businessComputedRegeneration.js",
  "computed/businessComputedDependencyMetadata.js",
  "computed/businessComputedRuntimeProjection.js",
  "computed/businessComputedPublishingMetadata.js",
  "computed/businessComputedMarketplaceMetadata.js",
  "computed/businessComputedKnowledgeMetadata.js",
  "computed/businessComputedEvolutionMetadata.js",
  "computed/businessComputedAuditTrail.js",
  "computed/businessComputedOwnership.js",
  "computed/businessComputedSecurityContracts.js",
  "computed/businessComputedExtensionPoints.js",
  "computed/buildBusinessComputedAsset.js",
  "computed/projectFormulaFromComputedField.js",
  "index.js",
];

gate(
  "G306 — Business Asset structure exists",
  requiredBusinessFiles.every((f) => exists(path.join(BUSINESS, f)))
);

gate(
  "G306 — Official contract versions",
  BUSINESS_COMPUTED_FIELD_VERSION === "mak-business-computed-field-v1" &&
    BUSINESS_COMPUTED_DOCUMENT_VERSION === "mak-business-computed-document-v1" &&
    BUSINESS_COMPUTED_ASSET_TYPE === "business.asset.computed_field" &&
    DERIVATION_KIND_COMPUTED_FIELD === "compute.computed_field" &&
    ARTIFACT_TYPE_BUSINESS_COMPUTED_FIELD === "business.computed_field"
);

gate(
  "G306 — Business layer independent of designers",
  !read(path.join(BUSINESS, "index.js")).includes("designers/") &&
    !read(path.join(BUSINESS, "computed/buildBusinessComputedAsset.js")).includes("resolver/resolverPipeline")
);

gate(
  "G306 — Resolver creates Business Computed Field before Formula projection",
  read(path.join(INTENT, "resolver/computedFieldDerivation.js")).includes("buildBusinessComputedAsset") &&
    read(path.join(INTENT, "resolver/computedFieldDerivation.js")).includes("createFormulaProjectionFromComputedField") &&
    read(path.join(INTENT, "resolver/derivationPlanning.js")).includes("DERIVATION_KIND_COMPUTED_FIELD")
);

// End-to-end official flow
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

const e2e = resolveFromBusinessLanguage(blInput, { initiatedBy: "gate-g306" });

gate(
  "G306 — Business Language → Intent → Resolver → Business Computed Field",
  e2e.ok === true &&
    e2e.businessComputedField?.schemaVersion === BUSINESS_COMPUTED_FIELD_VERSION &&
    e2e.businessComputedDocument?.schemaVersion === BUSINESS_COMPUTED_DOCUMENT_VERSION
);

gate(
  "G306 — Business Computed Field is official reusable Business Asset",
  e2e.businessComputedField?.reusable === true &&
    e2e.businessComputedField?.belongsToBusiness === true &&
    e2e.businessComputedField?.studioOwned === false &&
    e2e.businessComputedField?.metadata?.belongsToBusiness === true &&
    e2e.businessComputedField?.metadata?.studioOwned === false
);

const assetValidation = validateBusinessComputedField(e2e.businessComputedField);
gate("G306 — Business Computed Field validation passes", assetValidation.ok === true);

gate(
  "G306 — Formula Document is projection FROM Business Computed Field",
  e2e.formulaDocument?.metadata?.derivedFromBusinessComputedField === true &&
    e2e.formulaDocument?.metadata?.businessComputedFieldId === e2e.businessComputedField?.id &&
    e2e.formulaDocument?.metadata?.projectionOnly === true
);

gate(
  "G306 — Formula → Computation → AST → Evaluation preview",
  e2e.computationDocument?.schemaVersion === "mak-computation-document-v1" &&
    e2e.expressionAst != null &&
    e2e.preview?.value != null &&
    Math.abs(Number(e2e.preview.value) - 115) < 0.01
);

gate(
  "G306 — Runtime receives derived projections only",
  e2e.formulaDocument?.metadata?.runtimeReceives === "derived_projection_only" &&
    e2e.businessPreview?.runtimeReceives === "derived_projection_only"
);

gate(
  "G306 — Full lineage + metadata + versioning",
  e2e.metadata?.lineage?.length >= 4 &&
    e2e.businessComputedField?.contentHash?.startsWith("bch-") &&
    e2e.businessComputedField?.revision >= 1 &&
    e2e.metadata?.derivationKind === DERIVATION_KIND_COMPUTED_FIELD
);

gate(
  "G306 — Explainability report",
  e2e.businessExplainability?.computedFieldId === e2e.businessComputedField?.id &&
    e2e.businessExplainability?.derivationPath?.includes("business_computed_field") &&
    e2e.businessExplainability?.studioRole === "edit_asset_only"
);

gate(
  "G306 — Full explainability + audit + ownership facets",
  e2e.businessExplainability?.problemSolved &&
    e2e.businessExplainability?.explainBeforeExecute?.projectionOnly === true &&
    e2e.businessComputedDocument?.auditTrail?.entries?.length >= 1 &&
    e2e.businessComputedDocument?.ownership?.ownerKind === "organization" &&
    e2e.businessComputedDocument?.ownership?.userOwned === false &&
    e2e.businessComputedDocument?.ownership?.belongsToBusiness === true
);

gate(
  "G306 — Dependency metadata + runtime projection + security contracts",
  e2e.businessComputedDocument?.dependencyMetadata?.schemaVersion != null &&
    e2e.runtimeProjection?.runtimeReceives === "derived_projection_only" &&
    e2e.businessComputedDocument?.securityContracts?.bypassForbidden === true &&
    BUSINESS_COMPUTED_EXTENSION_POINTS.every((e) => e.implemented === false)
);

gate(
  "G306 — Intent → Runtime traceability chain",
  e2e.intentDocument?.id === e2e.businessComputedField?.intentId &&
    e2e.businessExplainability?.derivationPath?.includes("runtime_projection") &&
    e2e.businessExplainability?.derivationPath?.includes("runtime")
);

// Determinism
const e2eRepeat = resolveFromBusinessLanguage(blInput, { initiatedBy: "gate-g306" });
gate(
  "G306 — Deterministic Business Computed Field id",
  e2e.businessComputedField?.id === e2eRepeat.businessComputedField?.id &&
    e2e.businessComputedField?.contentHash === e2eRepeat.businessComputedField?.contentHash &&
    e2e.preview?.value === e2eRepeat.preview?.value
);

// No designer bypass for asset creation
const designerFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("/designers/"));
const bypassPatterns = [
  /buildBusinessComputedAsset/,
  /createBusinessComputedField/,
  /executeComputedFieldDerivation/,
];
let bypassFound = false;
for (const file of designerFiles) {
  for (const pat of bypassPatterns) {
    if (pat.test(file.content)) {
      bypassFound = true;
      break;
    }
  }
}
gate("G306 — No Business Computed Field creation bypass in designers", !bypassFound);

// Business package must not import foundation forbidden patterns
const businessFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("/business/"));
let foundationViolation = false;
for (const file of businessFiles) {
  for (const { pattern } of FORBIDDEN_FOUNDATION_PATTERNS) {
    if (pattern.test(file.content)) {
      foundationViolation = true;
      break;
    }
  }
}
gate("G306 — No foundation forbidden imports in business package", !foundationViolation);

// Extension points only for other derivations
gate(
  "G306 — Workflow/Dashboard/Automation remain extension points only",
  read(path.join(INTENT, "resolver/extensionPoints.js")).includes("implemented: false") &&
    !read(path.join(BUSINESS, "index.js")).includes("workflow")
);

// Upstream gates still green
try {
  execSync("node scripts/gate-studio-intent-resolver.mjs", { stdio: "pipe" });
  gate("G306 — G305 Intent Resolver still green", true);
} catch {
  gate("G306 — G305 Intent Resolver still green", false, "G305 failed");
}

try {
  execSync("node scripts/gate-studio-formula-builder.mjs", { stdio: "pipe" });
  gate("G306 — G303A Formula Builder still green", true);
} catch {
  gate("G306 — G303A Formula Builder still green", false, "G303A failed");
}

const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`\nG306: ${passed}/${total} checks passed`);
if (passed < total) process.exit(1);
