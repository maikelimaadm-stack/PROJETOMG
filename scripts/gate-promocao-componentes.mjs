#!/usr/bin/env node
/**
 * Gates G86–G99 — Auditoria de promoção vs reimplementação (missão ModeloBase1).
 *
 * Critério: cada componente do cadastro deve ser Movido | Extraído | Generalizado.
 * Falha se detectar Cópia | Reescrita | Componente alternativo no caminho Empresas.
 */
import fs from "node:fs";
import { execSync } from "node:child_process";

const ROOT = "/workspace";
const read = (path) => fs.readFileSync(`${ROOT}/${path}`, "utf8");
const exists = (path) => fs.existsSync(`${ROOT}/${path}`);

const results = [];
const gate = (name, ok, detail = "") => {
  const passed = Boolean(ok);
  results.push({ name, ok: passed, detail });
  console.log(`${passed ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const LEGACY_REF = process.env.LEGACY_VISUAL_REF || "21ac50b7^";
const LEGACY_PAGEMP = "src/modules/empresas/pages/PAGEMP.jsx";

const motor = read("src/ModeloBase1/render/ModeloBase1CadastroPage.jsx");
const pagemp = read("src/modules/empresas/pages/PAGEMP.jsx");
const config = read("src/modules/empresas/config/modeloBase1/empresasModeloBase1Config.js");
const toolbarConfig = read("src/modules/empresas/config/modeloBase1/empresasToolbarConfig.js");
const panelSections = read("src/ModeloBase1/render/ModeloBase1PanelSections.jsx");
const pagempSections = read("src/modules/empresas/pages/PAGEMP.sections.jsx");
const empresasMakModule = read("src/modules/empresas/config/empresasMakModule.js");
const layoutConfig = read("src/modules/empresas/config/modeloBase1/empresasLayoutConfig.js");

// G86 — Motor: extraído do PAGEMP master (não reimplementado do zero)
let legacyPagemp = "";
try {
  legacyPagemp = execSync(`git show ${LEGACY_REF}:${LEGACY_PAGEMP}`, {
    cwd: ROOT,
    encoding: "utf8",
  });
} catch {
  legacyPagemp = "";
}
const motorExtracted =
  pagemp.includes("ModeloBase1CadastroPage") &&
  pagemp.includes("empresasModeloBase1Config") &&
  motor.includes("ModeloBase1CadastroPageContent") &&
  legacyPagemp.length > 1000;
gate("G86 — Motor extraído do PAGEMP master", motorExtracted);

// G87 — Toolbar: MgActionBar promovido (framework), não ModeloBase1Toolbar reimplementado
const toolbarPromoted =
  motor.includes('from "@/ModeloBase1/layout"') &&
  motor.includes("MakActionBar") &&
  !exists("src/ModeloBase1/toolbar/ModeloBase1ActionBar.jsx");
gate("G87 — Toolbar promovida (MgActionBar)", toolbarPromoted);

// G88 — SearchPanel master: SRCHEMP via MakModuleProvider (não MakGenericSearchPanel)
const searchMaster =
  empresasMakModule.includes("SearchPanel: SRCHEMP") &&
  motor.includes("<MakModuleProvider module={module}>") &&
  !config.includes("MakGenericSearchPanel") &&
  !toolbarConfig.includes("MakGenericSearchPanel");
gate("G88 — SearchPanel master (SRCHEMP)", searchMaster);

// G89 — Cards: sem fork visual em ModeloBase1 (MgCardsVirtualGrid permanece no master Empresas)
const noCardsFork =
  !exists("src/ModeloBase1/cards/MakCardsVirtualGrid.jsx") &&
  !exists("src/ModeloBase1/search/modeloBase1SearchView.css") &&
  empresasMakModule.includes("SRCHEMP");
gate("G89 — Cards sem reimplementação em ModeloBase1", noCardsFork);

// G90 — Dock: MakContextPanel promovido do framework
const dockPromoted =
  motor.includes("MakContextPanel") &&
  !exists("src/ModeloBase1/layout/ModeloBase1Dock.jsx");
gate("G90 — Dock promovido (MakContextPanel)", dockPromoted);

// G91 — Tabela: MakTablePanel promovido (não tabela paralela)
const tablePromoted =
  toolbarConfig.includes("EmpresasTablePanel") &&
  panelSections.includes("MakTablePanel as EmpresasTablePanel") &&
  !exists("src/ModeloBase1/table/ModeloBase1Table.jsx");
gate("G91 — Tabela promovida (MakTablePanel)", tablePromoted);

// G92 — Formulário: MakFormPanel promovido
const formPromoted =
  toolbarConfig.includes("EmpresasFormPanel") &&
  panelSections.includes("MakFormPanel as EmpresasFormPanel") &&
  !exists("src/ModeloBase1/form/ModeloBase1Form.jsx");
gate("G92 — Formulário promovido (MakFormPanel)", formPromoted);

// G93 — Dialogs: única implementação em ModeloBase1PanelSections
const dialogsSingleSource =
  panelSections.includes("export const ModeloBase1ExtraDialogs") &&
  panelSections.includes("EmpresasDialogs = ModeloBase1ExtraDialogs") &&
  toolbarConfig.includes("ModeloBase1/render/ModeloBase1PanelSections");
gate("G93 — Dialogs promovidos (fonte única)", dialogsSingleSource);

// G94 — PAGEMP.sections: re-export, não cópia
const sectionsReexport =
  pagempSections.includes("@/ModeloBase1/render/ModeloBase1PanelSections") &&
  !pagempSections.includes("EmpConfiguracaoExportacaoDialog") &&
  pagempSections.includes("@deprecated");
gate("G94 — PAGEMP.sections é re-export (não cópia)", sectionsReexport);

// G95 — Empresas usa hooks master (useEmp*), não hooks genéricos reescritos
const hooksMaster =
  config.includes("useEmpFavorites") &&
  config.includes("useEmpresasInfiniteData") &&
  config.includes("useEmpViewModePreference") &&
  !config.includes("useModeloBase1Favorites") &&
  !config.includes("useModeloBase1InfiniteListData");
gate("G95 — Hooks master Empresas (não useModeloBase1* reescritos)", hooksMaster);

// G96 — Empresas não usa motor server reimplementado
const noServerMotorForEmpresas =
  layoutConfig.includes('listMode: "infinite"') && !config.includes('listMode: "server"');
gate("G96 — Empresas evita ModeloBase1ServerCadastroPage", noServerMotorForEmpresas);

// G97 — Proibido fork de SearchPanel genérico no caminho Empresas
const noGenericSearchInEmpPath =
  !toolbarConfig.includes("ModeloBase1GenericSearchPanel") &&
  !config.includes("MakGenericSearchPanel");
gate("G97 — Sem MakGenericSearchPanel no caminho Empresas", noGenericSearchInEmpPath);

// G98 — Inventário de reimplementações globais (devem ser eliminadas; gate informativo + fail)
const globalReimplementations = [];
if (exists("src/ModeloBase1/render/ModeloBase1ServerCadastroPage.jsx")) {
  globalReimplementations.push("ModeloBase1ServerCadastroPage");
}
if (exists("src/framework/mak/search/MakGenericSearchPanel.jsx")) {
  globalReimplementations.push("MakGenericSearchPanel");
}
if (exists("src/ModeloBase1/hooks/useModeloBase1Favorites.js")) {
  globalReimplementations.push("useModeloBase1Favorites");
}
// Empresas path is clean; global reimplementations remain for other modules
const empresasPathClean = results.every((r) => r.ok);
gate(
  "G98 — Caminho Empresas livre de reimplementação",
  empresasPathClean,
  empresasPathClean ? "" : "corrigir gates G86-G97"
);

// G99 — Resposta obrigatória: promoção direta no cadastro Empresas
const promotionAnswer =
  empresasPathClean &&
  pagemp.trim().split("\n").length < 20 &&
  config.includes("defineModeloBase1Config") &&
  config.includes("empresasToolbarComponents");
gate(
  "G99 — Empresas consome componentes promovidos (não equivalentes)",
  promotionAnswer
);

const passed = results.filter((r) => r.ok).length;
console.log(`\nG86-G99: ${passed}/${results.length} aprovados`);
if (globalReimplementations.length > 0) {
  console.log(
    `\nReimplementações globais pendentes (outros módulos): ${globalReimplementations.join(", ")}`
  );
}
process.exit(passed === results.length ? 0 : 1);
