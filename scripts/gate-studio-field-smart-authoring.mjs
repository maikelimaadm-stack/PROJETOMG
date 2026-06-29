#!/usr/bin/env node
/**
 * Gate G297 — Field Studio Smart Authoring Validation (Program 2.3.1)
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  SMART_FIELD_TEMPLATE_VERSION,
  SMART_FIELD_TEMPLATES,
  listSmartFieldTemplates,
} from "../src/studio/designers/field/templates/smartFieldTemplates.js";
import {
  BUSINESS_FIELD_TYPE_VERSION,
  BUSINESS_FIELD_TYPES,
  listBusinessFieldTypes,
} from "../src/studio/designers/field/businessTypes/businessTypeCatalog.js";
import { FieldCommandTypes } from "../src/studio/designers/field/commands/fieldCommandTypes.js";
import { collectStudioFiles } from "../src/studio/governance/architectureRules.js";
import { FORBIDDEN_FOUNDATION_PATTERNS } from "../src/studio/governance/studioArchitectureConstants.js";

const ROOT = process.cwd();
const FIELD = path.join(ROOT, "src/studio/designers/field");
const results = [];

const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const exists = (filePath) => fs.existsSync(filePath);
const read = (filePath) => fs.readFileSync(filePath, "utf8");

const REQUIRED_TEMPLATES = ["cpf", "cnpj", "email", "telefone", "cep", "url", "pix", "data", "hora", "data_hora"];
const REQUIRED_BUSINESS_TYPES = [
  "cliente",
  "fornecedor",
  "produto",
  "funcionario",
  "conta_bancaria",
  "centro_custo",
  "fazenda",
  "talhao",
  "piquete",
  "lote",
  "animal",
  "maquina",
  "safra",
];

gate(
  "G297 — Smart Authoring structure exists",
  exists(path.join(FIELD, "templates/smartFieldTemplates.js")) &&
    exists(path.join(FIELD, "templates/applySmartFieldTemplate.js")) &&
    exists(path.join(FIELD, "businessTypes/businessTypeCatalog.js")) &&
    exists(path.join(ROOT, "src/studio/services/fieldPresentationAdapter.js"))
);

gate(
  "G297 — Smart Field Templates centralized",
  SMART_FIELD_TEMPLATE_VERSION === "mak-smart-field-template-v1" &&
    SMART_FIELD_TEMPLATES.length === 10 &&
    REQUIRED_TEMPLATES.every((id) => listSmartFieldTemplates().some((t) => t.templateId === id))
);

const templateContent = read(path.join(FIELD, "templates/smartFieldTemplates.js"));
gate(
  "G297 — Templates auto-fill properties",
  templateContent.includes("maskText") &&
    templateContent.includes("placeholder") &&
    templateContent.includes("helpText") &&
    templateContent.includes("validationHints") &&
    templateContent.includes("documentation")
);

gate(
  "G297 — applySmartFieldTemplate is single application path",
  read(path.join(FIELD, "templates/applySmartFieldTemplate.js")).includes("getSmartFieldTemplate") &&
    read(path.join(FIELD, "commands/fieldCommandHandlers.js")).includes("applySmartFieldTemplate") &&
    !read(path.join(FIELD, "canvas/FieldCanvas.jsx")).includes("maskText:")
);

gate(
  "G297 — Business Field Types registered",
  BUSINESS_FIELD_TYPE_VERSION === "mak-business-field-type-v1" &&
    BUSINESS_FIELD_TYPES.length >= 13 &&
    REQUIRED_BUSINESS_TYPES.every((id) => listBusinessFieldTypes().some((t) => t.businessTypeId === id))
);

gate(
  "G297 — Business Types architecture only (no relationship rules)",
  !read(path.join(FIELD, "businessTypes/businessTypeCatalog.js")).includes("createRelationship") &&
    !read(path.join(FIELD, "businessTypes/businessTypeCatalog.js")).includes("formula") &&
    read(path.join(FIELD, "businessTypes/businessTypeCatalog.js")).includes("aiReady")
);

const smartCommands = ["ADD_FIELD_FROM_TEMPLATE", "ADD_FIELD_FROM_BUSINESS_TYPE", "ADD_GROUP", "ASSIGN_FIELD_GROUP"];
gate(
  "G297 — Smart authoring commands",
  smartCommands.every((c) => read(path.join(FIELD, "commands/fieldCommandTypes.js")).includes(c))
);

gate(
  "G297 — Advanced properties in Property Grid",
  read(path.join(FIELD, "fieldPropertyFields.js")).includes("placeholder") &&
    read(path.join(FIELD, "fieldPropertyFields.js")).includes("helpText") &&
    read(path.join(FIELD, "fieldPropertyFields.js")).includes("minValue") &&
    read(path.join(FIELD, "fieldPropertyFields.js")).includes("precision")
);

gate(
  "G297 — Presentation adapter centralized (no duplication)",
  read(path.join(ROOT, "src/studio/services/fieldPresentationAdapter.js")).includes("buildFieldPresentation") &&
    read(path.join(FIELD, "commands/fieldCommandHandlers.js")).includes("buildFieldPresentation") &&
    read(path.join(ROOT, "src/studio/services/mdpFieldClient.js")).includes("buildFieldPresentation")
);

gate(
  "G297 — Canvas exposes Smart Templates UI",
  read(path.join(FIELD, "canvas/FieldCanvas.jsx")).includes("listSmartFieldTemplates") &&
    read(path.join(FIELD, "canvas/FieldCanvas.jsx")).includes("addFieldFromTemplate") &&
    read(path.join(FIELD, "canvas/FieldCanvas.jsx")).includes("listBusinessFieldTypes")
);

gate(
  "G297 — Multi-group organization",
  read(path.join(FIELD, "document/fieldDocumentContracts.js")).includes("DEFAULT_FIELD_GROUPS") &&
    read(path.join(FIELD, "fieldPropertyFields.js")).includes("buildFieldExplorerTree")
);

gate(
  "G297 — No forbidden scope (relationships/formula/computed)",
  !read(path.join(FIELD, "commands/fieldCommandHandlers.js")).includes("formulaRef") &&
    !read(path.join(FIELD, "commands/fieldCommandHandlers.js")).includes("relationshipRef") &&
    !exists(path.join(FIELD, "formula/"))
);

const fieldFiles = collectStudioFiles(ROOT).filter((f) => f.path.includes("src/studio/designers/field/"));
const forbidden = fieldFiles.filter(({ content }) =>
  FORBIDDEN_FOUNDATION_PATTERNS.some(({ pattern }) => pattern.test(content))
);
gate(
  "G297 — No foundation forbidden imports",
  forbidden.length === 0,
  forbidden.map((f) => path.basename(f.path)).join(", ")
);

gate(
  "G297 — Layout Studio unchanged",
  read(path.join(ROOT, "src/studio/shell/StudioProductionShellProvider.jsx")).includes("registerLayoutDesigner")
);

let g296Ok = false;
try {
  execSync("node scripts/gate-studio-field-engine.mjs", { cwd: ROOT, stdio: "pipe" });
  g296Ok = true;
} catch {
  g296Ok = false;
}
gate("G297 — G296 Phase 1 still green", g296Ok);

const failed = results.filter((r) => !r.ok);
console.log(`\nG297: ${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exit(1);
