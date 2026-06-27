#!/usr/bin/env node
/**
 * Gates G196–G206 — ModeloBase1 Visual Certification V15.2.
 * Referência visual: Cadastro de Empresas (prevalece em divergências).
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const MB1 = path.join(ROOT, "src/ModeloBase1");
const MODULES = ["produtos", "marcas", "cadcps"];

const results = [];
const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const read = (filePath) => fs.readFileSync(filePath, "utf8");
const exists = (filePath) => fs.existsSync(filePath);

const visualTokens = read(path.join(MB1, "layout/modeloBase1VisualTokens.js"));
const empFormConstants = read(path.join(ROOT, "src/modules/empresas/components/formEmp.constants.js"));
const proFormConstants = read(path.join(ROOT, "src/modules/produtos/config/proForm.constants.js"));
const marFormConstants = read(path.join(ROOT, "src/modules/marcas/config/marForm.constants.js"));
const cpsFormConstants = read(path.join(ROOT, "src/modules/cadcps/config/cpsForm.constants.js"));

const extractExport = (source, exportName) => {
  const re = new RegExp(
    `export const ${exportName}\\s*=\\s*["'\`]([^"'\`]+)["'\`]`
  );
  return source.match(re)?.[1] ?? null;
};

const MAK_FORM_INPUT_CLASS =
  extractExport(visualTokens, "MAK_FORM_INPUT_CLASS") ??
  "emp-form-input border-0 shadow-none focus-visible:ring-0 bg-white uppercase w-full";

const moduleConstants = {
  empresas: empFormConstants,
  produtos: proFormConstants,
  marcas: marFormConstants,
  cadcps: cpsFormConstants,
};

const usesVisualSsot = (source) =>
  source.includes("modeloBase1VisualTokens.js") &&
  source.includes("MAK_FORM_INPUT_CLASS") &&
  source.includes("buildModeloBase1FormDefaultConfig");

const usesInputClassReexport = (source) =>
  /export const inputClass = MAK_FORM_INPUT_CLASS/.test(source);

const usesFieldLayoutInHelper = (source) =>
  source.includes("buildModeloBase1FormDefaultConfig") &&
  !source.match(/fieldLayoutConfig:\s*\{\s*mode:\s*"corporate"/);

// G196 — Paridade do Grid
const gridOk =
  visualTokens.includes('mode: "corporate"') &&
  visualTokens.includes("columns: 12") &&
  MODULES.every((moduleId) => usesFieldLayoutInHelper(moduleConstants[moduleId]));
gate("G196 — Paridade do Grid", gridOk, gridOk ? "" : "fieldLayoutConfig divergente");

// G197 — Paridade dos Espaçamentos
const spacingOk =
  visualTokens.includes("MAK_FORM_DEFAULT_CONFIG_SHELL") &&
  visualTokens.includes("hiddenFieldIds") &&
  MODULES.every((moduleId) => usesVisualSsot(moduleConstants[moduleId]));
gate(
  "G197 — Paridade dos Espaçamentos",
  spacingOk,
  spacingOk ? "" : "shell de config ausente"
);

// G198 — Paridade dos Labels
const labelsOk =
  usesVisualSsot(empFormConstants) &&
  MODULES.every((moduleId) => usesInputClassReexport(moduleConstants[moduleId])) &&
  MAK_FORM_INPUT_CLASS.includes("emp-form-input") &&
  MAK_FORM_INPUT_CLASS.includes("uppercase");
gate("G198 — Paridade dos Labels", labelsOk, labelsOk ? "" : "inputClass divergente");

// G199 — Paridade da Altura dos Campos
const heightOk =
  MAK_FORM_INPUT_CLASS.includes("emp-form-input") &&
  read(path.join(ROOT, "src/index.css")).includes("--emp-form-control-height") &&
  cpsFormConstants.includes("MAK_FORM_INPUT_CLASS_GRID");
gate("G199 — Paridade da Altura dos Campos", heightOk);

// G200 — Paridade dos Containers
const scopeOk =
  read(path.join(MB1, "layout/modeloBase1ScopeCss.js")).includes("cadastro-emp-scope mg-empresas-scope") &&
  MODULES.every((moduleId) =>
    read(path.join(ROOT, `src/modules/${moduleId}/config/${moduleId}ModeloBase1Config.js`)).includes(
      "buildModeloBase1ScopeCssClass"
    )
  );
gate("G200 — Paridade dos Containers", scopeOk);

// G201 — Paridade dos Painéis
const factory = read(path.join(MB1, "config/buildModeloBase1ConfigFromMakModule.js"));
const toolbar = read(path.join(MB1, "config/buildModeloBase1ToolbarComponents.js"));
const panelsOk =
  factory.includes("modeloBase1ToolbarComponents") &&
  toolbar.includes("MakFormPanel") &&
  toolbar.includes("MakSearchPanel") &&
  toolbar.includes("MakTablePanel") &&
  toolbar.includes("ModeloBase1ExtraDialogs");
gate("G201 — Paridade dos Painéis", panelsOk);

// G202 — Paridade dos Formulários
const formMeta = read(path.join(ROOT, "src/framework/mak/metadata/buildMakFormMetadata.js"));
const formOk =
  formMeta.includes("MAK_FORM_INPUT_CLASS") &&
  MODULES.every((moduleId) =>
    read(path.join(ROOT, `src/modules/${moduleId}/config/${moduleId}ModuleMetadata.js`)).includes("inputClass")
  );
gate("G202 — Paridade dos Formulários", formOk);

// G203 — Paridade da Toolbar
const toolbarOk =
  toolbar.includes("LoadBatchControls") &&
  factory.includes("LoadBatchControls") &&
  read(path.join(ROOT, "src/modules/empresas/config/modeloBase1/empresasToolbarConfig.js")).includes(
    "LoadBatchControls"
  );
gate("G203 — Paridade da Toolbar", toolbarOk);

// G204 — Paridade dos Dialogs
const dialogsOk =
  toolbar.includes("ModeloBase1ExtraDialogs") &&
  read(path.join(MB1, "render/ModeloBase1PanelSections.jsx")).includes("ModeloBase1ExtraDialogs");
gate("G204 — Paridade dos Dialogs", dialogsOk);

// G205 — Paridade Responsiva
const motor = read(path.join(MB1, "render/ModeloBase1CadastroPage.jsx"));
const responsiveOk = ["mg-view-stack", "MakMobileViewBar", "resolveMgViewMode"].every((token) =>
  motor.includes(token)
);
gate("G205 — Paridade Responsiva", responsiveOk);

// G206 — Paridade Visual Geral
const ssotOk = exists(path.join(MB1, "layout/modeloBase1VisualTokens.js"));
const allBeforeG206 = results.every((r) => r.ok);
gate("G206 — Paridade Visual Geral", allBeforeG206 && ssotOk);

const failed = results.filter((r) => !r.ok);
console.log(`\nG196-G206: ${results.length - failed.length}/${results.length} gates passed`);
if (failed.length) {
  process.exit(1);
}
