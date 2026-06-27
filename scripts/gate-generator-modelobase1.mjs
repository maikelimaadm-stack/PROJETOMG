#!/usr/bin/env node
/**
 * Gates G103–G108 — Gerador oficial produz módulos ModeloBase1 (Enterprise V9).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SCAFFOLD = path.join(ROOT, "src/modules/template/scaffold");

const results = [];
const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const read = (filePath) => fs.readFileSync(filePath, "utf8");

const walk = (dir) => {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
};

const scaffoldFiles = walk(SCAFFOLD);
const scaffoldContents = scaffoldFiles.map((file) => read(file)).join("\n");

// G103 — Página thin ModeloBase1 no scaffold
const pageTpl = scaffoldFiles.find((file) => file.includes("/pages/") && file.endsWith(".jsx.tpl"));
gate(
  "G103 — Scaffold gera thin page ModeloBase1",
  pageTpl &&
    read(pageTpl).includes("ModeloBase1CadastroPage") &&
    read(pageTpl).includes("buildModeloBase1ConfigFromMakModule") === false
);

// G104 — Sem componentes legados FORM/TBL no scaffold
const legacyPatterns = [
  "SankhyaListToolbar",
  "EmpSplitToolbarLayout",
  "FORM__MODULE_ID_PASCAL__",
  "TBL__MODULE_ID_PASCAL__",
  "EmpConfiguracaoCamposDialog",
];
const legacyHits = legacyPatterns.filter((pattern) => scaffoldContents.includes(pattern));
gate(
  "G104 — Scaffold sem componentes legados (FORM/TBL/Toolbar)",
  legacyHits.length === 0,
  legacyHits.length ? legacyHits.join(", ") : ""
);

// G105 — Factory ModeloBase1 presente
gate(
  "G105 — Scaffold inclui ModeloBase1Config + MakModule",
  scaffoldContents.includes("buildModeloBase1ConfigFromMakModule") &&
    scaffoldFiles.some((file) => file.includes("ModeloBase1Config.js.tpl")) &&
    scaffoldFiles.some((file) => file.includes("MakModule.js.tpl"))
);

// G106 — Metadata + preferences + list cache
gate(
  "G106 — Scaffold inclui metadata/runtime completo",
  scaffoldFiles.some((file) => file.includes("ModuleMetadata.js.tpl")) &&
    scaffoldFiles.some((file) => file.includes("PreferencesAdapter.js.tpl")) &&
    scaffoldFiles.some((file) => file.includes("ListCache.js.tpl"))
);

// G107 — API promovida para src/apis (não modules/*/apis legado imperativo)
gate(
  "G107 — API scaffold em src/apis/__MODULE_ID__",
  scaffoldFiles.some((file) => file.includes("/apis/__API_NAME__.js.tpl")) &&
    read(scaffoldFiles.find((file) => file.includes("moduleDefinition.js.tpl"))).includes(
      '@/apis/__MODULE_ID__/__API_NAME__.js'
    )
);

// G108 — Gerador registra cadastro-modules.registry.json
const generatorScript = read(path.join(ROOT, "scripts/generate-cadastro-module.mjs"));
gate(
  "G108 — Gerador atualiza cadastro-modules.registry.json",
  generatorScript.includes("cadastro-modules.registry.json") &&
    generatorScript.includes("updateCadastroModulesRegistry")
);

const passed = results.filter((r) => r.ok).length;
console.log(`\nG103-G108: ${passed}/${results.length} aprovados`);
process.exit(passed === results.length ? 0 : 1);
