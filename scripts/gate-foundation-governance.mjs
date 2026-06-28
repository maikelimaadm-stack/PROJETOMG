#!/usr/bin/env node
/**
 * Gates G109–G125 — Governança permanente da Foundation (Enterprise V10).
 * Impede regressões arquiteturais sem refatorar código existente.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const BASELINE_PATH = path.join(ROOT, "scripts/governance-baseline.json");
const REGISTRY_PATH = path.join(ROOT, "config/cadastro-modules.registry.json");
const GENERATED_PATH = path.join(ROOT, "src/modules/generatedModules.json");

const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"));
const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
const generated = JSON.parse(fs.readFileSync(GENERATED_PATH, "utf8"));

const results = [];
const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const read = (filePath) => fs.readFileSync(filePath, "utf8");
const exists = (filePath) => fs.existsSync(filePath);
const rel = (filePath) => path.relative(ROOT, filePath).replaceAll("\\", "/");

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

const isLegacyModule = (moduleId) => baseline.legacyModuleExceptions.includes(moduleId);

const isInfrastructureModule = (moduleId) =>
  baseline.infrastructureModuleExceptions?.includes(moduleId) ?? false;

const isCadastroModule = (moduleId) =>
  !isLegacyModule(moduleId) && !isInfrastructureModule(moduleId);

const isAllowlisted = (filePath) => {
  const normalized = rel(filePath);
  return (
    baseline.legacyComponentAllowlist.includes(normalized) ||
    baseline.legacyHookAllowlist.includes(normalized)
  );
};

const isReExportOrThinWrapper = (content) => {
  const trimmed = content.trim();
  if (trimmed.includes("@deprecated") && trimmed.includes("export {")) return true;
  if (trimmed.includes('from "@/ModeloBase1/')) return true;
  if (trimmed.includes("MakFormShell") || trimmed.includes("MakTable")) return true;
  if (trimmed.split("\n").length <= 20 && !trimmed.includes("useState(")) return true;
  return false;
};

const countTodoFixme = (dir) => {
  let count = 0;
  walk(dir, (f) => /\.(jsx?|tsx?)$/.test(f)).forEach((file) => {
    const matches = read(file).match(/\b(TODO|FIXME)\b/g);
    if (matches) count += matches.length;
  });
  return count;
};

const certifiedModuleIds = registry.filter((m) => m.ativo !== false).map((m) => m.moduleId);

// G109 — Páginas certificadas usam ModeloBase1CadastroPage
const pageViolations = [];
certifiedModuleIds.forEach((moduleId) => {
  const pagesDir = path.join(ROOT, "src/modules", moduleId, "pages");
  walk(pagesDir, (f) => /PAG[^/]*\.jsx$/.test(f) && !/\.sections\.jsx$/.test(f)).forEach((pageFile) => {
    const content = read(pageFile);
    if (!content.includes("ModeloBase1CadastroPage")) {
      pageViolations.push(rel(pageFile));
    }
  });
});
gate(
  "G109 — Páginas certificadas consomem ModeloBase1CadastroPage",
  pageViolations.length === 0,
  pageViolations.join(", ")
);

// G110 — Imports proibidos em páginas certificadas
const forbiddenImportViolations = [];
certifiedModuleIds.forEach((moduleId) => {
  walk(path.join(ROOT, "src/modules", moduleId, "pages"), (f) => /\.jsx$/.test(f)).forEach((pageFile) => {
    const content = read(pageFile);
    baseline.forbiddenPageImports.forEach((token) => {
      if (content.includes(token)) forbiddenImportViolations.push(`${rel(pageFile)}:${token}`);
    });
  });
});
gate(
  "G110 — Sem Toolbar/Layout legado em páginas certificadas",
  forbiddenImportViolations.length === 0,
  forbiddenImportViolations.join(", ")
);

// G111 — Componentes estruturais duplicados (FORM/TBL/Search/Dock/Dialog)
const structuralViolations = [];
walk(path.join(ROOT, "src/modules"), (f) => /\.jsx$/.test(f)).forEach((file) => {
  const normalized = rel(file);
  const parts = normalized.split("/");
  const moduleId = parts[2];
  if (!moduleId || moduleId === "template" || isLegacyModule(moduleId)) return;
  if (isAllowlisted(file)) return;
  if (parts.includes("scaffold")) return;

  const base = path.basename(file);
  const isStructural =
    /^FORM[A-Z0-9_]+\.jsx$/i.test(base) ||
    /^TBL[A-Z0-9_]+\.jsx$/i.test(base) ||
    /Toolbar\.jsx$/i.test(base) ||
    /SearchPanel\.jsx$/i.test(base) ||
    /Dock\.jsx$/i.test(base);

  if (!isStructural) return;
  const content = read(file);
  if (!isReExportOrThinWrapper(content)) {
    structuralViolations.push(normalized);
  }
});
gate(
  "G111 — Sem componentes estruturais duplicados (FORM/TBL/Toolbar/Search/Dock)",
  structuralViolations.length === 0,
  structuralViolations.join(", ")
);

// G112 — Hooks estruturais próprios
const hookViolations = [];
walk(path.join(ROOT, "src/modules"), (f) => /\/hooks\/use.*\.js$/.test(f)).forEach((file) => {
  const normalized = rel(file);
  const moduleId = normalized.split("/")[2];
  if (!moduleId || isLegacyModule(moduleId) || isAllowlisted(file)) return;

  const base = path.basename(file);
  const isStructuralHook =
    /use.*Toolbar/i.test(base) ||
    /use.*TablePanel/i.test(base) ||
    /use.*FormPanel/i.test(base) ||
    /use.*SearchPanel/i.test(base) ||
    /use.*Dock/i.test(base) ||
    /use.*InfiniteList(?!Data)/i.test(base);

  if (!isStructuralHook) return;
  const content = read(file);
  if (!isReExportOrThinWrapper(content)) {
    hookViolations.push(normalized);
  }
});
gate(
  "G112 — Sem hooks estruturais próprios (Toolbar/Table/Form/Search/Dock)",
  hookViolations.length === 0,
  hookViolations.join(", ")
);

// G113 — Providers estruturais duplicados
const providerViolations = [];
walk(path.join(ROOT, "src/modules"), (f) => /Provider\.jsx$/.test(f)).forEach((file) => {
  const normalized = rel(file);
  const moduleId = normalized.split("/")[2];
  if (!moduleId || isLegacyModule(moduleId) || isInfrastructureModule(moduleId)) return;
  const content = read(file);
  if (content.includes("createContext") && !content.includes("@deprecated") && !content.includes("MakModuleProvider")) {
    providerViolations.push(normalized);
  }
});
gate(
  "G113 — Sem providers estruturais duplicados",
  providerViolations.length === 0,
  providerViolations.join(", ")
);

// G114 — Módulos certificados possuem arquivos obrigatórios
const missingRequired = [];
certifiedModuleIds.forEach((moduleId) => {
  const moduleDir = path.join(ROOT, "src/modules", moduleId);
  const configDir = path.join(moduleDir, "config");

  const requiredChecks = [
    [`${moduleId}ModeloBase1Config.js`, path.join(configDir, `${moduleId}ModeloBase1Config.js`)],
    [`${moduleId}MakModule.js`, path.join(configDir, `${moduleId}MakModule.js`)],
    [`${moduleId}ModuleMetadata.js`, path.join(configDir, `${moduleId}ModuleMetadata.js`)],
    [`${moduleId}CadastroConfig.js`, path.join(configDir, `${moduleId}CadastroConfig.js`)],
    [`${moduleId}PreferencesAdapter.js`, path.join(configDir, `${moduleId}PreferencesAdapter.js`)],
    [`${moduleId}ListCache.js`, path.join(moduleDir, "data", `${moduleId}ListCache.js`)],
  ];

  // Empresas usa subpasta modeloBase1/
  if (moduleId === "empresas") {
    requiredChecks[0] = [
      "empresasModeloBase1Config.js",
      path.join(configDir, "modeloBase1", "empresasModeloBase1Config.js"),
    ];
  }

  requiredChecks.forEach(([label, filePath]) => {
    if (!exists(filePath)) missingRequired.push(`${moduleId}:${label}`);
  });
});
gate(
  "G114 — Módulos certificados com metadata/runtime/preferences completos",
  missingRequired.length === 0,
  missingRequired.join(", ")
);

// G115 — Factory ModeloBase1 em todos os módulos certificados
const factoryViolations = [];
certifiedModuleIds.forEach((moduleId) => {
  const configCandidates = [
    path.join(ROOT, "src/modules", moduleId, "config", `${moduleId}ModeloBase1Config.js`),
    path.join(ROOT, "src/modules", moduleId, "config", "modeloBase1", `${moduleId}ModeloBase1Config.js`),
  ];
  const configFile = configCandidates.find((f) => exists(f));
  if (!configFile) {
    factoryViolations.push(`${moduleId}:config ausente`);
    return;
  }
  const content = read(configFile);
  if (!content.includes("buildModeloBase1ConfigFromMakModule")) {
    factoryViolations.push(`${moduleId}:sem factory`);
  }
});
gate(
  "G115 — Factory buildModeloBase1ConfigFromMakModule em módulos certificados",
  factoryViolations.length === 0,
  factoryViolations.join(", ")
);

// G116 — ModeloBase1 não importa modules/* (exceto re-exports documentados)
const mb1Imports = [];
walk(path.join(ROOT, "src/ModeloBase1"), (f) => /\.(jsx?|tsx?)$/.test(f)).forEach((file) => {
  const content = read(file);
  const matches = content.match(/from\s+["']@\/modules\/[^"']+["']/g);
  if (matches) mb1Imports.push(`${rel(file)} → ${matches.join(", ")}`);
});
gate(
  "G116 — ModeloBase1 sem imports de modules/*",
  mb1Imports.length === 0,
  mb1Imports.join("; ")
);

// G117 — Módulos runtime não certificados devem ser exceção formal
const runtimeModules = fs
  .readdirSync(path.join(ROOT, "src/modules"), { withFileTypes: true })
  .filter((e) => e.isDirectory() && e.name !== "template")
  .map((e) => e.name);

const uncertifiedViolations = runtimeModules.filter((moduleId) => {
  if (isLegacyModule(moduleId) || isInfrastructureModule(moduleId)) return false;
  if (certifiedModuleIds.includes(moduleId)) return false;
  return true;
});
gate(
  "G117 — Módulos runtime não certificados são exceção formal",
  uncertifiedViolations.length === 0,
  uncertifiedViolations.length ? `não certificados: ${uncertifiedViolations.join(", ")}` : ""
);

// G118 — Registry SSOT: módulos certificados registrados (baseline mínimo pós-#285: empresas + cadcps)
const minCertified = baseline.minimumCertifiedModules ?? 2;
const backendRegistryPath = path.join(ROOT, "backend/config/cadastro-modules.registry.json");
const backendRegistry = exists(backendRegistryPath)
  ? JSON.parse(fs.readFileSync(backendRegistryPath, "utf8"))
  : [];
const backendModuleIds = backendRegistry.filter((m) => m.ativo !== false).map((m) => m.moduleId);
const registrySyncOk =
  certifiedModuleIds.length === backendModuleIds.length &&
  certifiedModuleIds.every((id) => backendModuleIds.includes(id));
gate(
  "G118 — Registry cadastro-modules é fonte oficial de módulos certificados",
  exists(REGISTRY_PATH) &&
    certifiedModuleIds.length >= minCertified &&
    registrySyncOk,
  !registrySyncOk
    ? `FE ${certifiedModuleIds.join(",")} vs BE ${backendModuleIds.join(",")}`
    : certifiedModuleIds.length < minCertified
      ? `${certifiedModuleIds.length} < ${minCertified}`
      : ""
);

// G119 — Gerador scaffold ModeloBase1 (delegado G103-G108)
const scaffoldContent = walk(path.join(ROOT, "src/modules/template/scaffold")).map((f) => read(f)).join("\n");
gate(
  "G119 — Scaffold oficial sem padrão legado FORM/TBL",
  !scaffoldContent.includes("SankhyaListToolbar") &&
    !scaffoldContent.includes("FORM__MODULE_ID_PASCAL__") &&
    scaffoldContent.includes("ModeloBase1CadastroPage")
);

// G120 — Templates obrigatórios do gerador
const missingTemplates = baseline.requiredGeneratorTemplates.filter((tpl) => !exists(path.join(ROOT, tpl)));
gate(
  "G120 — Gerador possui templates ModeloBase1 obrigatórios",
  missingTemplates.length === 0,
  missingTemplates.join(", ")
);

// G121 — TODO/FIXME não aumentam em paths protegidos
const todoViolations = [];
Object.entries(baseline.todoFixmeBaseline).forEach(([dir, baselineCount]) => {
  const current = countTodoFixme(path.join(ROOT, dir));
  if (current > baselineCount) {
    todoViolations.push(`${dir}: ${current} > baseline ${baselineCount}`);
  }
});
gate(
  "G121 — TODO/FIXME não aumentam em ModeloBase1/framework/mak",
  todoViolations.length === 0,
  todoViolations.join(", ")
);

// G122 — Dependências cíclicas básicas: modules não importam ModeloBase1 config de outros modules
const crossModuleConfigImports = [];
walk(path.join(ROOT, "src/modules"), (f) => /\.(jsx?|tsx?)$/.test(f)).forEach((file) => {
  const normalized = rel(file);
  const moduleId = normalized.split("/")[2];
  if (!moduleId || isLegacyModule(moduleId) || isInfrastructureModule(moduleId)) return;
  const content = read(file);
  const imports = content.match(/from\s+["']@\/modules\/([^/"']+)/g) || [];
  imports.forEach((imp) => {
    const target = imp.match(/@\/modules\/([^/"']+)/)?.[1];
    if (target && target !== moduleId && isCadastroModule(moduleId) && isCadastroModule(target)) {
      crossModuleConfigImports.push(`${normalized} → ${target}`);
    }
  });
});
gate(
  "G122 — Sem imports cruzados entre módulos de cadastro",
  crossModuleConfigImports.length === 0,
  crossModuleConfigImports.slice(0, 5).join("; ")
);

// G123 — MakModule wired com SearchPanel promovido
const makModuleViolations = [];
certifiedModuleIds.forEach((moduleId) => {
  const makModulePath = path.join(ROOT, "src/modules", moduleId, "config", `${moduleId}MakModule.js`);
  if (!exists(makModulePath)) return;
  const content = read(makModulePath);
  if (!content.includes("defineMakModule")) makModuleViolations.push(`${moduleId}:sem defineMakModule`);
  if (!content.includes("MakCadastroSearchPanel")) makModuleViolations.push(`${moduleId}:sem SearchPanel promovido`);
});
gate(
  "G123 — MakModule certificado wired com runtime e SearchPanel",
  makModuleViolations.length === 0,
  makModuleViolations.join(", ")
);

// G124 — Páginas cadastro fora do ModeloBase1 (exceto legado)
const nonModeloBase1Pages = [];
walk(path.join(ROOT, "src/modules"), (f) => /\/pages\/PAG.*\.jsx$/.test(f)).forEach((pageFile) => {
  const moduleId = rel(pageFile).split("/")[2];
  if (isLegacyModule(moduleId)) return;
  const content = read(pageFile);
  const lineCount = content.split("\n").length;
  if (!content.includes("ModeloBase1CadastroPage") && lineCount > 25) {
    nonModeloBase1Pages.push(`${rel(pageFile)} (${lineCount} LOC)`);
  }
});
gate(
  "G124 — Páginas cadastro imperativas bloqueadas (exceto exceções legadas)",
  nonModeloBase1Pages.length === 0,
  nonModeloBase1Pages.join(", ")
);

// G125 — generatedModules.json alinhado com registry
const registryIds = new Set(certifiedModuleIds);
const generatedCertified = generated.filter((m) => registryIds.has(m.moduleId));
gate(
  "G125 — generatedModules inclui todos os módulos certificados",
  generatedCertified.length === certifiedModuleIds.length,
  `${generatedCertified.length}/${certifiedModuleIds.length}`
);

// G126 — Factory preserva hooks obrigatórios mesmo com overrides parciais (Empresas)
const factorySource = read(path.join(ROOT, "src/ModeloBase1/config/buildModeloBase1ConfigFromMakModule.js"));
const factoryPreservesHooks =
  factorySource.includes("...(overrideHooks ?? {})") &&
  factorySource.includes("...passthroughOverrides") &&
  !factorySource.match(/\.\.\.overrides,\s*\}\);/) &&
  factorySource.includes("useViewModePreference: useModeloBase1ViewModePreference");
gate(
  "G126 — Factory preserva hooks obrigatórios com overrides parciais",
  factoryPreservesHooks
);

// G127–G136 — SSOT ModeloBase1 (delegado gate-ssot-propagation.mjs)
try {
  execSync("node scripts/gate-ssot-propagation.mjs", { cwd: ROOT, stdio: "pipe" });
  gate("G127-G136 — SSOT propagation gates", true);
} catch (error) {
  gate(
    "G127-G136 — SSOT propagation gates",
    false,
    error?.stderr?.toString?.()?.trim?.() || "gate-ssot-propagation.mjs falhou"
  );
}

const passed = results.filter((r) => r.ok).length;
console.log(`\nG109-G136: ${passed}/${results.length} aprovados`);
process.exit(passed === results.length ? 0 : 1);
