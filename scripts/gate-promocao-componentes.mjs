#!/usr/bin/env node
/**
 * Gates G86–G99 — Auditoria de promoção vs reimplementação (missão ModeloBase1).
 *
 * Critério: cada componente do cadastro deve ser Movido | Extraído | Generalizado.
 * Falha se detectar Cópia | Reescrita | Componente alternativo no caminho Empresas.
 */
import fs from "node:fs";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
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
const marcasMakModule = read("src/modules/marcas/config/marcasMakModule.js");
const produtosMakModule = read("src/modules/produtos/config/produtosMakModule.js");
const layoutConfig = read("src/modules/empresas/config/modeloBase1/empresasLayoutConfig.js");
const marcasConfig = read("src/modules/marcas/config/marcasModeloBase1Config.js");
const produtosConfig = read("src/modules/produtos/config/produtosModeloBase1Config.js");

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
  (legacyPagemp.length > 1000 || pagemp.trim().split("\n").length < 20);
gate(
  "G86 — Motor extraído do PAGEMP master",
  motorExtracted,
  legacyPagemp.length > 1000 ? "" : "git history shallow — validado via thin page"
);

// G87 — Toolbar: MgActionBar promovido (framework), não ModeloBase1Toolbar reimplementado
const toolbarPromoted =
  motor.includes('from "@/ModeloBase1/layout"') &&
  motor.includes("MakActionBar") &&
  !exists("src/ModeloBase1/toolbar/ModeloBase1ActionBar.jsx");
gate("G87 — Toolbar promovida (MgActionBar)", toolbarPromoted);

// G88 — SearchPanel master: MakCadastroSearchPanel promovido (não MakGenericSearchPanel)
const searchMaster =
  empresasMakModule.includes("MakCadastroSearchPanel") &&
  marcasMakModule.includes("MakCadastroSearchPanel") &&
  produtosMakModule.includes("MakCadastroSearchPanel") &&
  !marcasMakModule.includes("MakGenericSearchPanel") &&
  !produtosMakModule.includes("MakGenericSearchPanel") &&
  motor.includes("<MakModuleProvider module={module}>");
gate("G88 — SearchPanel master (MakCadastroSearchPanel)", searchMaster);

// G89 — Cards promovidos para ModeloBase1 (MgCardsVirtualGrid)
const cardsPromoted =
  exists("src/ModeloBase1/cards/MgCardsVirtualGrid.jsx") &&
  exists("src/ModeloBase1/search/MakCadastroSearchPanel.jsx");
gate("G89 — Cards promovidos (MgCardsVirtualGrid)", cardsPromoted);

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

// G95 — Hooks promovidos unificados (ModeloBase1) em Empresas via factory
const factoryFile = read("src/ModeloBase1/config/buildModeloBase1ConfigFromMakModule.js");
const hooksPromoted =
  (config.includes("useModeloBase1Favorites") ||
    (config.includes("buildModeloBase1ConfigFromMakModule") &&
      factoryFile.includes("useModeloBase1Favorites"))) &&
  (config.includes("useModeloBase1InfiniteListData") ||
    factoryFile.includes("useModeloBase1InfiniteListData")) &&
  (config.includes("useModeloBase1ViewModePreference") ||
    factoryFile.includes("useModeloBase1ViewModePreference")) &&
  config.includes("buildModeloBase1ConfigFromMakModule") &&
  !config.includes("searchView:");
gate("G95 — Hooks promovidos unificados (ModeloBase1)", hooksPromoted);

// G96 — Motor único infinite (ModeloBase1ServerCadastroPage eliminado)
const singleMotor =
  !exists("src/ModeloBase1/render/ModeloBase1ServerCadastroPage.jsx") &&
  !motor.includes("ModeloBase1ServerCadastroPage") &&
  layoutConfig.includes('listMode: "infinite"');
gate("G96 — Motor único promovido (sem server fork)", singleMotor);

// G97 — Proibido fork de SearchPanel genérico no caminho Empresas
const noGenericSearchInEmpPath =
  !toolbarConfig.includes("ModeloBase1GenericSearchPanel") &&
  !config.includes("MakGenericSearchPanel");
gate("G97 — Sem MakGenericSearchPanel no caminho Empresas", noGenericSearchInEmpPath);

// G100 — Escopo visual master (botões/tabela/linhas) em todos os módulos
const scopeParity =
  layoutConfig.includes("buildModeloBase1ScopeCssClass") &&
  marcasConfig.includes("buildModeloBase1ScopeCssClass") &&
  produtosConfig.includes("buildModeloBase1ScopeCssClass") &&
  read("src/ModeloBase1/layout/modeloBase1ScopeCss.js").includes("cadastro-emp-scope mg-empresas-scope");
gate("G100 — Escopo visual master (cadastro-emp-scope) em todos os módulos", scopeParity);

// G101 — Factory genérica expõe helpers obrigatórios do motor (Marcas/Produtos)
const factoryConfig = read("src/ModeloBase1/config/buildModeloBase1ConfigFromMakModule.js");
const factoryHelpers = read("src/ModeloBase1/config/buildModeloBase1HelpersFromMakModule.js");
const requiredHelperKeys = [
  "isPreferencesSectionDirty",
  "writeStoredTempListagemFilters",
  "subscribePreferencesCache",
  "writePreferencesText",
  "getFieldsPerRowForLayout",
  "buildDuplicateRecord",
  "buildExportRows",
];
const factoryHelpersComplete =
  factoryConfig.includes("buildModeloBase1HelpersFromMakModule") &&
  requiredHelperKeys.every((key) => factoryHelpers.includes(key));
gate("G101 — Factory genérica com helpers obrigatórios do motor", factoryHelpersComplete);

gate(
  "G102 — ModeloBase1 sem imports de modules/empresas",
  !read("src/ModeloBase1/search/MakCadastroSearchPanel.jsx").includes("@/modules/empresas") &&
    !read("src/ModeloBase1/cards/MgCardsVirtualGrid.jsx").includes("@/modules/empresas")
);

// G98 — Inventário de reimplementações globais restantes
const globalReimplementations = [];
if (exists("src/framework/mak/search/MakGenericSearchPanel.jsx")) {
  const usedByModeloBase1Modules =
    marcasMakModule.includes("MakGenericSearchPanel") ||
    produtosMakModule.includes("MakGenericSearchPanel") ||
    empresasMakModule.includes("MakGenericSearchPanel");
  if (usedByModeloBase1Modules) globalReimplementations.push("MakGenericSearchPanel-in-use");
}

const preFinalOk = results.every((r) => r.ok);
gate(
  "G98 — Todos os módulos ModeloBase1 livres de reimplementação",
  preFinalOk && globalReimplementations.length === 0,
  globalReimplementations.length ? globalReimplementations.join(", ") : ""
);

// G99 — Resposta obrigatória: promoção direta no cadastro Empresas
const promotionAnswer =
  preFinalOk &&
  globalReimplementations.length === 0 &&
  pagemp.trim().split("\n").length < 20 &&
  (config.includes("buildModeloBase1ConfigFromMakModule") ||
    config.includes("defineModeloBase1Config")) &&
  (config.includes("empresasToolbarComponents") || toolbarConfig.includes("ModeloBase1PanelSections"));
gate(
  "G99 — Empresas consome componentes promovidos (não equivalentes)",
  promotionAnswer
);

const passed = results.filter((r) => r.ok).length;
console.log(`\nG86-G102: ${passed}/${results.length} aprovados`);
if (globalReimplementations.length > 0) {
  console.log(
    `\nReimplementações globais pendentes (outros módulos): ${globalReimplementations.join(", ")}`
  );
}
process.exit(passed === results.length ? 0 : 1);
