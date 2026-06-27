#!/usr/bin/env node
/**
 * Gates G127–G136 — Certificação SSOT ModeloBase1 (propagação global).
 * Garante que alterações estruturais no ModeloBase1 propagam sem edits por módulo.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, "config/cadastro-modules.registry.json");
const BASELINE_PATH = path.join(ROOT, "scripts/governance-baseline.json");
const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"));
const certifiedModuleIds = registry.filter((m) => m.ativo !== false).map((m) => m.moduleId);

const results = [];
const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const read = (filePath) => fs.readFileSync(filePath, "utf8");
const exists = (filePath) => fs.existsSync(filePath);
const rel = (filePath) => path.relative(ROOT, filePath).replaceAll("\\", "/");

const isAllowlistedLegacy = (filePath) => {
  const normalized = rel(filePath);
  return (
    baseline.legacyComponentAllowlist?.includes(normalized) ||
    baseline.legacyHookAllowlist?.includes(normalized)
  );
};

const walk = (dir, filter = () => true) => {
  const files = [];
  if (!exists(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full, filter));
    else if (filter(full)) files.push(full);
  }
  return files;
};

const FOUNDATION_PATHS = [
  "src/framework/mak/form/MakCadastroForm.jsx",
  "src/framework/mak/table/MakCadastroTable.jsx",
  "src/framework/mak/page/MakCadastroPage.jsx",
  "src/ModeloBase1/render/ModeloBase1CadastroPage.jsx",
  "src/ModeloBase1/config/buildModeloBase1ConfigFromMakModule.js",
  "src/ModeloBase1/config/buildSearchViewFromMakModule.js",
];

// G127 — Eventos derivados de moduleId (sem emp-* hardcoded na foundation)
const hardcodedEmpEvents = [];
FOUNDATION_PATHS.forEach((filePath) => {
  const full = path.join(ROOT, filePath);
  if (!exists(full)) return;
  const content = read(full);
  const matches = content.match(/CustomEvent\(["']emp-/g);
  if (matches) hardcodedEmpEvents.push(`${rel(full)}: ${matches.length}`);
});
gate(
  "G127 — Foundation sem eventos emp-* hardcoded",
  hardcodedEmpEvents.length === 0,
  hardcodedEmpEvents.join(", ")
);

// G128 — Sem codempresa hardcoded na foundation MAK
const codempresaViolations = [];
FOUNDATION_PATHS.filter((p) => p.includes("mak/")).forEach((filePath) => {
  const full = path.join(ROOT, filePath);
  if (!exists(full)) return;
  if (read(full).includes('"codempresa"') || read(full).includes("'codempresa'")) {
    codempresaViolations.push(rel(full));
  }
});
gate(
  "G128 — Foundation MAK sem sort/campo codempresa hardcoded",
  codempresaViolations.length === 0,
  codempresaViolations.join(", ")
);

// G129 — Módulos certificados não sobrescrevem searchView estrutural
const searchViewOverrides = [];
certifiedModuleIds.forEach((moduleId) => {
  const configPath = path.join(
    ROOT,
    "src/modules",
    moduleId,
    "config",
    `${moduleId}ModeloBase1Config.js`
  );
  const altPath = path.join(
    ROOT,
    "src/modules",
    moduleId,
    "config/modeloBase1",
    `${moduleId}ModeloBase1Config.js`
  );
  const filePath = exists(configPath) ? configPath : altPath;
  if (!exists(filePath)) return;
  const content = read(filePath);
  if (/searchView\s*:/.test(content)) {
    searchViewOverrides.push(`${moduleId}: searchView override`);
  }
});
gate(
  "G129 — Módulos certificados usam searchView genérico (factory)",
  searchViewOverrides.length === 0,
  searchViewOverrides.join(", ")
);

// G130 — buildDynamicFields obrigatório em metadata de formulário
const missingDynamicFields = [];
certifiedModuleIds.forEach((moduleId) => {
  const metaPath = path.join(
    ROOT,
    "src/modules",
    moduleId,
    "config",
    `${moduleId}ModuleMetadata.js`
  );
  if (!exists(metaPath)) {
    missingDynamicFields.push(`${moduleId}: metadata ausente`);
    return;
  }
  const content = read(metaPath);
  if (!content.includes("buildDynamicFields")) {
    missingDynamicFields.push(moduleId);
  }
});
gate(
  "G130 — Módulos certificados declaram buildDynamicFields",
  missingDynamicFields.length === 0,
  missingDynamicFields.join(", ")
);

// G131 — makModuleEvents SSOT
gate(
  "G131 — makModuleEvents.js (eventos por moduleId)",
  exists(path.join(ROOT, "src/framework/mak/events/makModuleEvents.js")) &&
    read(path.join(ROOT, "src/framework/mak/events/makModuleEvents.js")).includes("getModuleEventName")
);

// G132 — Factory usa buildSearchViewFromMakModule
const factorySource = read(
  path.join(ROOT, "src/ModeloBase1/config/buildModeloBase1ConfigFromMakModule.js")
);
gate(
  "G132 — Factory deriva searchView de makModule",
  factorySource.includes("buildSearchViewFromMakModule(makModule)")
);

// G133 — Páginas thin (≤25 LOC) com ModeloBase1CadastroPage
const pageViolations = [];
certifiedModuleIds.forEach((moduleId) => {
  const pagesDir = path.join(ROOT, "src/modules", moduleId, "pages");
  walk(pagesDir, (f) => /PAG[^/]*\.jsx$/.test(f) && !/\.sections\.jsx$/.test(f)).forEach((pageFile) => {
    const content = read(pageFile);
    const lines = content.split("\n").length;
    if (!content.includes("ModeloBase1CadastroPage") || lines > 25) {
      pageViolations.push(`${rel(pageFile)} (${lines} LOC)`);
    }
  });
});
gate(
  "G133 — Páginas certificadas são thin consumers ModeloBase1",
  pageViolations.length === 0,
  pageViolations.join(", ")
);

// G134 — defaultSort declarado por módulo (domínio), não hardcoded na foundation
const missingDefaultSort = [];
certifiedModuleIds.forEach((moduleId) => {
  const metaPath = path.join(
    ROOT,
    "src/modules",
    moduleId,
    "config",
    `${moduleId}ModuleMetadata.js`
  );
  if (!exists(metaPath)) return;
  if (!read(metaPath).includes("defaultSort")) {
    missingDefaultSort.push(moduleId);
  }
});
gate(
  "G134 — Módulos certificados declaram defaultSort (domínio)",
  missingDefaultSort.length === 0,
  missingDefaultSort.join(", ")
);

// G135 — Sem componentes estruturais legados TBLEMP/FORM/TBL nos módulos certificados
const structuralLegacy = [];
certifiedModuleIds.forEach((moduleId) => {
  const modDir = path.join(ROOT, "src/modules", moduleId);
  walk(modDir, (f) => /\/(TBL|FORM|Srch|SRC)[A-Z]{2,}\.jsx$/.test(f)).forEach((file) => {
    if (isAllowlistedLegacy(file)) return;
    structuralLegacy.push(rel(file));
  });
});
gate(
  "G135 — Sem componentes estruturais legados nos módulos certificados",
  structuralLegacy.length === 0,
  structuralLegacy.join(", ")
);

// G136 — Propagação: motor único referenciado por todos os módulos certificados
const motorMissing = [];
certifiedModuleIds.forEach((moduleId) => {
  const pagesDir = path.join(ROOT, "src/modules", moduleId, "pages");
  const hasMotor = walk(pagesDir, (f) => f.endsWith(".jsx")).some((pageFile) =>
    read(pageFile).includes("ModeloBase1CadastroPage")
  );
  if (!hasMotor) motorMissing.push(moduleId);
});
gate(
  "G136 — Todos os módulos certificados consomem ModeloBase1CadastroPage",
  motorMissing.length === 0,
  motorMissing.join(", ")
);

const passed = results.filter((r) => r.ok).length;
console.log(`\nG127-G136: ${passed}/${results.length} aprovados`);
process.exit(passed === results.length ? 0 : 1);
