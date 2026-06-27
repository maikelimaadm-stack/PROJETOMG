#!/usr/bin/env node
/**
 * Gates G58–G72 — Paridade Empresas ↔ ModeloBase1.
 */
import fs from "node:fs";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const MOTOR = `${ROOT}/src/ModeloBase1/render/ModeloBase1CadastroPage.jsx`;
const CONFIG = `${ROOT}/src/modules/empresas/config/modeloBase1/empresasModeloBase1Config.js`;
const SEARCH_PANEL = `${ROOT}/src/ModeloBase1/search/MakCadastroSearchPanel.jsx`;

const results = [];
const gate = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const read = (p) => fs.readFileSync(p, "utf8");
const motor = read(MOTOR);
const config = read(CONFIG);
const searchPanel = read(SEARCH_PANEL);

// G58-G62 — Props genéricos records (+ retrocompat empresas)
gate("G58 — searchProps usa records", /records:\s*filteredPanelRecords/.test(motor));
gate(
  "G59 — MakCardsPanelStrip usa records",
  /MakCardsPanelStrip[\s\S]*?records=\{filteredPanelRecords\}/.test(motor)
);
gate(
  "G60 — MakTablePanelStrip usa records",
  /MakTablePanelStrip[\s\S]*?records=\{filteredPanelRecords\}/.test(motor)
);
gate("G61 — tableProps usa records", /records:\s*filteredPanelRecords/.test(motor));
gate(
  "G62 — SearchPanel aceita prop records",
  /records:\s*recordsProp/.test(searchPanel)
);

// G63-G66 — Hooks promovidos via factory ModeloBase1
const factoryHooks = read(`${ROOT}/src/ModeloBase1/config/buildModeloBase1ConfigFromMakModule.js`);
gate(
  "G63 — useModeloBase1ViewModePreference",
  config.includes("useModeloBase1ViewModePreference") || factoryHooks.includes("useModeloBase1ViewModePreference")
);
gate(
  "G64 — useModeloBase1Favorites",
  config.includes("useModeloBase1Favorites") || factoryHooks.includes("useModeloBase1Favorites")
);
gate(
  "G65 — useModeloBase1CardsVisFields",
  config.includes("useModeloBase1CardsVisFields") || factoryHooks.includes("useModeloBase1CardsVisFields")
);
gate(
  "G66 — useModeloBase1InfiniteListData",
  config.includes("useModeloBase1InfiniteListData") || factoryHooks.includes("useModeloBase1InfiniteListData")
);

// G67-G68 — Listagem infinita / tabela
gate(
  "G67 — searchView empresas via factory genérico",
  (config.includes("buildModeloBase1ConfigFromMakModule") &&
    !config.includes("searchView:")) ||
    config.includes("buildSearchViewFromMakModule")
);
gate("G68 — tableProps isLoadingRecords", motor.includes("isLoadingRecords: recordsLoading"));

// G69-G72 — Sem regressão de componente genérico quebrado
gate("G69 — SearchPanel promovido wired no makModule", read(`${ROOT}/src/modules/empresas/config/empresasMakModule.js`).includes("MakCadastroSearchPanel"));
gate("G70 — Sem ModeloBase1RichSearchPanel órfão", !fs.existsSync(`${ROOT}/src/ModeloBase1/search/ModeloBase1RichSearchPanel.jsx`));
gate("G71 — Build produção", (() => { try { execSync("npm run build", { cwd: ROOT, stdio: "pipe" }); return true; } catch { return false; } })());
gate("G72 — Lint", (() => { try { execSync("npm run lint", { cwd: ROOT, stdio: "pipe" }); return true; } catch { return false; } })());

const passed = results.filter((r) => r.ok).length;
console.log(`\nG58-G72: ${passed}/${results.length} aprovados`);
process.exit(passed === results.length ? 0 : 1);
