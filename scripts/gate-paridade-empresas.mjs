#!/usr/bin/env node
/**
 * Gates G58–G72 — Paridade Empresas ↔ ModeloBase1.
 */
import fs from "node:fs";
import { execSync } from "node:child_process";

const ROOT = "/workspace";
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

// G58-G62 — Props de painéis idênticos ao PAGEMP original
gate("G58 — searchProps usa empresas", /empresas:\s*filteredPanelRecords/.test(motor));
gate("G59 — MakCardsPanelStrip usa empresas", /MakCardsPanelStrip[\s\S]*?empresas=\{filteredPanelRecords\}/.test(motor));
gate("G60 — MakTablePanelStrip usa empresas", /MakTablePanelStrip[\s\S]*?empresas=\{filteredPanelRecords\}/.test(motor));
gate("G61 — tableProps usa empresas", /empresas:\s*filteredPanelRecords/.test(motor));
gate("G62 — SearchPanel aceita prop empresas", /empresas:\s*empresasProp/.test(searchPanel));

// G63-G65 — Hooks Empresas originais (preferências/cards)
gate("G63 — useEmpViewModePreference", config.includes("useEmpViewModePreference"));
gate("G64 — useEmpFavorites", config.includes("useEmpFavorites"));
gate("G65 — useEmpCardsVisFields", config.includes("useEmpCardsVisFields"));

// G66-G68 — Listagem infinita
gate("G66 — useEmpresasInfiniteData", config.includes("useEmpresasInfiniteData"));
gate("G67 — hook retorna aliases records", read(`${ROOT}/src/modules/empresas/hooks/useEmpresasInfiniteData.js`).includes("records: result.records"));
gate("G68 — tableProps isLoadingEmpresas", motor.includes("isLoadingEmpresas: recordsLoading"));

// G69-G72 — Sem regressão de componente genérico quebrado
gate("G69 — SearchPanel promovido wired no makModule", read(`${ROOT}/src/modules/empresas/config/empresasMakModule.js`).includes("MakCadastroSearchPanel"));
gate("G70 — Sem ModeloBase1RichSearchPanel órfão", !fs.existsSync(`${ROOT}/src/ModeloBase1/search/ModeloBase1RichSearchPanel.jsx`));
gate("G71 — Build produção", (() => { try { execSync("npm run build", { cwd: ROOT, stdio: "pipe" }); return true; } catch { return false; } })());
gate("G72 — Lint", (() => { try { execSync("npm run lint", { cwd: ROOT, stdio: "pipe" }); return true; } catch { return false; } })());

const passed = results.filter((r) => r.ok).length;
console.log(`\nG58-G72: ${passed}/${results.length} aprovados`);
process.exit(passed === results.length ? 0 : 1);
