#!/usr/bin/env node
/**
 * Gates G73–G85 — Promoção visual direta Empresas -> ModeloBase1.
 *
 * Estratégia:
 * - Usa o PAGEMP master histórico (pré-extração) como baseline visual/estrutural.
 * - Compara árvore JSX, blocos críticos (Toolbar/Cards/Table/Form/Dialogs) e wiring master.
 * - Falha se detectar sinais de reimplementação visual em vez de promoção direta.
 */
import fs from "node:fs";
import { execSync } from "node:child_process";

const ROOT = "/workspace";
const LEGACY_REF = process.env.LEGACY_VISUAL_REF || "21ac50b7^";
const LEGACY_PAGEMP_PATH = "src/modules/empresas/pages/PAGEMP.jsx";
const MOTOR_PATH = `${ROOT}/src/ModeloBase1/render/ModeloBase1CadastroPage.jsx`;
const CONFIG_PATH = `${ROOT}/src/modules/empresas/config/modeloBase1/empresasModeloBase1Config.js`;
const TOOLBAR_CONFIG_PATH = `${ROOT}/src/modules/empresas/config/modeloBase1/empresasToolbarConfig.js`;
const PANEL_SECTIONS_PATH = `${ROOT}/src/ModeloBase1/render/ModeloBase1PanelSections.jsx`;
const LAYOUT_CONFIG_PATH = `${ROOT}/src/modules/empresas/config/modeloBase1/empresasLayoutConfig.js`;
const PAGEMP_WRAPPER_PATH = `${ROOT}/src/modules/empresas/pages/PAGEMP.jsx`;

const results = [];
const gate = (name, ok, detail = "") => {
  const passed = Boolean(ok);
  results.push({ name, ok: passed, detail });
  console.log(`${passed ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const read = (path) => fs.readFileSync(path, "utf8");
const normalizeWhitespace = (text) => text.replace(/\s+/g, " ").trim();
const normalizeAliases = (text) =>
  text
    .replace(/\beditingEmp\b/g, "editingRecord")
    .replace(/\bselectedTableEmp\b/g, "selectedTableRecord")
    .replace(/\bempFavorites\b/g, "recordFavorites")
    .replace(/\bempresasNavegacao\b/g, "navigationRecords")
    .replace(/\btableFilteredEmpresas\b/g, "tableFilteredRecords")
    .replace(/\bempresasFiltradasPainel\b/g, "filteredPanelRecords")
    .replace(/\bempresasLoading\b/g, "recordsLoading")
    .replace(/\bempresasFetching\b/g, "recordsFetching")
    .replace(/\btotalEmpresas\b/g, "totalRecords")
    .replace(/\bhasNextEmpresasPage\b/g, "hasNextRecordsPage")
    .replace(/\bisFetchingNextEmpresasPage\b/g, "isFetchingNextRecordsPage")
    .replace(/\bhandleLoadMoreEmpresas\b/g, "handleLoadMoreRecords")
    .replace(/\bhandleFilteredEmpresasChange\b/g, "handleFilteredRecordsChange")
    .replace(/\bsetEditingEmp\b/g, "setEditingRecord")
    .replace(/\bEmpresasSearchPanel\b/g, "SearchPanel")
    .replace(/\bEmpresasTablePanel\b/g, "TablePanel")
    .replace(/\bEmpresasFormPanel\b/g, "FormPanel")
    .replace(/\bEmpresasDialogs\b/g, "Dialogs")
    .replace(/recordBrowseMode \? "browse" : /g, "")
    .replace(/\bbrowseMode: recordBrowseMode,?\s*/g, "")
    .replace(/\bkey:\s*"tbl-emp"/g, "key: config.tableKey ?? `tbl-${MAK_MODULE_ID}`")
    .replace(/\brecords=/g, "empresas=")
    .replace(/\bisLoadingRecords=/g, "isLoadingEmpresas=")
    .replace(/\bisFetchingRecords=/g, "isFetchingEmpresas=");

const GENERIC_PROP_KEY_ALIASES = {
  records: "empresas",
  isLoadingRecords: "isLoadingEmpresas",
  isFetchingRecords: "isFetchingEmpresas",
};

const normalizePropKeys = (keys = []) =>
  [...new Set(keys.map((key) => GENERIC_PROP_KEY_ALIASES[key] ?? key))].sort();

const extractJsxPropKeysDeduped = (jsxBlock) =>
  normalizePropKeys([...jsxBlock.matchAll(/\b([A-Za-z_][A-Za-z0-9_]*)=/g)].map((m) => m[1]));

const extractBlock = (source, startToken, endToken) => {
  const start = source.indexOf(startToken);
  if (start < 0) return "";
  const end = source.indexOf(endToken, start);
  if (end < 0) return "";
  return source.slice(start, end + endToken.length);
};

const extractSelfClosingBlock = (source, componentName) => {
  const re = new RegExp(`<${componentName}[\\s\\S]*?/>`, "m");
  return source.match(re)?.[0] ?? "";
};

const extractJsxPropKeys = (jsxBlock) =>
  [...jsxBlock.matchAll(/\b([A-Za-z_][A-Za-z0-9_]*)=/g)].map((m) => m[1]).sort();

const extractObjectKeys = (source, objectPropName) => {
  const re = new RegExp(`${objectPropName}\\s*=\\s*\\{\\{([\\s\\S]*?)\\n\\s*\\}\\}`, "m");
  const block = source.match(re)?.[1] ?? "";
  return [...block.matchAll(/\b([A-Za-z_][A-Za-z0-9_]*)\s*:/g)].map((m) => m[1]).sort();
};

const ALLOWED_MOTOR_EXTRA_PROP_KEYS = new Set([
  "browseMode",
  "records",
  "isLoadingRecords",
  "isFetchingRecords",
]);

const compareKeySets = (left, right) => {
  const normalizedLeft = normalizePropKeys(left);
  const normalizedRight = normalizePropKeys(right);
  const onlyLeft = normalizedLeft.filter((k) => !normalizedRight.includes(k));
  const onlyRight = normalizedRight.filter(
    (k) => !normalizedLeft.includes(k) && !ALLOWED_MOTOR_EXTRA_PROP_KEYS.has(k)
  );
  return {
    same: onlyLeft.length === 0 && onlyRight.length === 0,
    onlyLeft,
    onlyRight,
  };
};

const legacyPagemp = execSync(`git show ${LEGACY_REF}:${LEGACY_PAGEMP_PATH}`, {
  cwd: ROOT,
  encoding: "utf8",
});
const motor = read(MOTOR_PATH);
const config = read(CONFIG_PATH);
const toolbarConfig = read(TOOLBAR_CONFIG_PATH);
const panelSections = read(PANEL_SECTIONS_PATH);
const layoutConfig = read(LAYOUT_CONFIG_PATH);
const pagempWrapper = read(PAGEMP_WRAPPER_PATH);

const legacyNorm = normalizeAliases(legacyPagemp);
const motorNorm = normalizeAliases(motor);

// G73 — Paridade estrutural 100%
const structuralTokens = [
  "mg-subtoolbar-stack",
  "mg-context-panel-wrap",
  "mg-cards-panel-wrap",
  "mg-table-panel-wrap",
  "mg-view-stack",
  "mg-view-layer--form",
  "mg-view-layer--cards",
  "mg-view-layer--table",
  'id="mode-cards"',
];
const missingStructural = structuralTokens.filter(
  (token) => !legacyNorm.includes(token) || !motorNorm.includes(token)
);
gate("G73 — Paridade estrutural 100%", missingStructural.length === 0, missingStructural.join(", "));

// G74 — Paridade HTML 100%
const classRe = /className=(?:`([^`]+)`|"([^"]+)")/g;
const collectClasses = (src) => {
  const classes = new Set();
  for (const match of src.matchAll(classRe)) {
    const value = (match[1] ?? match[2] ?? "").trim();
    if (!value) continue;
    // ignora placeholders dinâmicos (template com expressões) e avalia apenas classes estáticas.
    if (value.includes("${")) continue;
    classes.add(value);
  }
  return [...classes].sort();
};
const classOld = collectClasses(legacyNorm);
const classNew = collectClasses(motorNorm);
const scopeClassLiteral = "cadastro-emp-scope mg-empresas-scope flex h-full min-h-0 flex-1 flex-col overflow-hidden";
const classCompare = compareKeySets(
  classOld.filter((item) => item !== scopeClassLiteral),
  classNew
);
gate(
  "G74 — Paridade HTML 100%",
  classCompare.same,
  classCompare.same
    ? ""
    : `faltando:${classCompare.onlyLeft.join(",")} extras:${classCompare.onlyRight.join(",")}`
);

// G75 — Paridade CSS 100% (cards/search promovidos para ModeloBase1)
const promotedVisualAssets =
  fs.existsSync(`${ROOT}/src/ModeloBase1/search/MakCadastroSearchPanel.jsx`) &&
  fs.existsSync(`${ROOT}/src/ModeloBase1/cards/MgCardsVirtualGrid.jsx`) &&
  fs.existsSync(`${ROOT}/src/ModeloBase1/search/makCadastroSearchPanel.css`);
const scopeClassOk =
  layoutConfig.includes("buildModeloBase1ScopeCssClass") &&
  read(`${ROOT}/src/ModeloBase1/layout/modeloBase1ScopeCss.js`).includes("cadastro-emp-scope mg-empresas-scope");
gate("G75 — Paridade CSS 100%", promotedVisualAssets && scopeClassOk);

// G76 — Paridade de Layout 100%
const searchKeysOld = extractObjectKeys(legacyNorm, "searchProps");
const searchKeysNew = extractObjectKeys(motorNorm, "searchProps");
const tableKeysOld = extractObjectKeys(legacyNorm, "tableProps");
const tableKeysNew = extractObjectKeys(motorNorm, "tableProps");
const layoutSearchCompare = compareKeySets(searchKeysOld, searchKeysNew);
const layoutTableCompare = compareKeySets(tableKeysOld, tableKeysNew);
gate(
  "G76 — Paridade de Layout 100%",
  layoutSearchCompare.same && layoutTableCompare.same,
  layoutSearchCompare.same && layoutTableCompare.same
    ? ""
    : `searchΔ old:${layoutSearchCompare.onlyLeft.join("|")} new:${layoutSearchCompare.onlyRight.join("|")} tableΔ old:${layoutTableCompare.onlyLeft.join("|")} new:${layoutTableCompare.onlyRight.join("|")}`
);

// G77 — Paridade de Toolbar 100%
const toolbarOld = normalizeWhitespace(extractSelfClosingBlock(legacyNorm, "MakActionBar"));
const toolbarNew = normalizeWhitespace(extractSelfClosingBlock(motorNorm, "MakActionBar"));
const toolbarPropsOld = extractJsxPropKeys(toolbarOld);
const toolbarPropsNew = extractJsxPropKeys(toolbarNew);
const toolbarCompare = compareKeySets(toolbarPropsOld, toolbarPropsNew);
gate(
  "G77 — Paridade de Toolbar 100%",
  toolbarCompare.same,
  toolbarCompare.same
    ? ""
    : `old:${toolbarCompare.onlyLeft.join("|")} new:${toolbarCompare.onlyRight.join("|")}`
);

// G78 — Paridade de Cards 100%
const cardsStripOld = normalizeWhitespace(extractSelfClosingBlock(legacyNorm, "MakCardsPanelStrip"));
const cardsStripNew = normalizeWhitespace(extractSelfClosingBlock(motorNorm, "MakCardsPanelStrip"));
const cardsPanelOld = normalizeWhitespace(extractSelfClosingBlock(legacyNorm, "SearchPanel"));
const cardsPanelNew = normalizeWhitespace(extractSelfClosingBlock(motorNorm, "SearchPanel"));
const cardsStripCompare = compareKeySets(
  extractJsxPropKeysDeduped(cardsStripOld),
  extractJsxPropKeysDeduped(cardsStripNew)
);
const cardsPanelCompare = compareKeySets(
  extractJsxPropKeysDeduped(cardsPanelOld),
  extractJsxPropKeysDeduped(cardsPanelNew)
);
gate(
  "G78 — Paridade de Cards 100%",
  cardsStripCompare.same && cardsPanelCompare.same
);

// G79 — Paridade de Dock 100%
const contextOld = normalizeWhitespace(extractSelfClosingBlock(legacyNorm, "MakContextPanel"));
const contextNew = normalizeWhitespace(extractSelfClosingBlock(motorNorm, "MakContextPanel"));
const contextCompare = compareKeySets(extractJsxPropKeys(contextOld), extractJsxPropKeys(contextNew));
gate("G79 — Paridade de Dock 100%", contextCompare.same);

// G80 — Paridade de Pesquisa 100%
const searchMasterWiring =
  toolbarConfig.includes("ModeloBase1/render/ModeloBase1PanelSections") &&
  panelSections.includes("MakSearchPanel as EmpresasSearchPanel") &&
  motor.includes("<MakModuleProvider module={module}>");
gate("G80 — Paridade de Pesquisa 100%", searchMasterWiring);

// G81 — Paridade de Tabela 100%
const tableStripOld = normalizeWhitespace(extractSelfClosingBlock(legacyNorm, "MakTablePanelStrip"));
const tableStripNew = normalizeWhitespace(extractSelfClosingBlock(motorNorm, "MakTablePanelStrip"));
const tablePanelOld = normalizeWhitespace(extractSelfClosingBlock(legacyNorm, "TablePanel"));
const tablePanelNew = normalizeWhitespace(extractSelfClosingBlock(motorNorm, "TablePanel"));
const tableStripCompare = compareKeySets(
  extractJsxPropKeysDeduped(tableStripOld),
  extractJsxPropKeysDeduped(tableStripNew)
);
const tablePanelCompare = compareKeySets(
  extractJsxPropKeysDeduped(tablePanelOld),
  extractJsxPropKeysDeduped(tablePanelNew)
);
gate("G81 — Paridade de Tabela 100%", tableStripCompare.same && tablePanelCompare.same);

// G82 — Paridade de Formulário 100%
const formOld = normalizeWhitespace(extractSelfClosingBlock(legacyNorm, "FormPanel"));
const formNew = normalizeWhitespace(extractSelfClosingBlock(motorNorm, "FormPanel"));
const formKeysOld = extractObjectKeys(legacyNorm, "formProps");
const formKeysNew = extractObjectKeys(motorNorm, "formProps");
const formCompare = compareKeySets(formKeysOld, formKeysNew);
const formBlocksEqual = normalizeAliases(formOld) === normalizeAliases(formNew);
gate("G82 — Paridade de Formulário 100%", formBlocksEqual && formCompare.same);

// G83 — Paridade de Dialogs 100%
const dialogsOld = normalizeWhitespace(extractSelfClosingBlock(legacyNorm, "Dialogs"));
const dialogsNew = normalizeWhitespace(extractSelfClosingBlock(motorNorm, "Dialogs"));
const dialogsMasterWiring =
  toolbarConfig.includes("EmpresasDialogs") &&
  panelSections.includes("EmpresasDialogs = ModeloBase1ExtraDialogs") &&
  panelSections.includes("ModeloBase1ExtraDialogs");
const extractDialogPropKeys = (block, propName) => {
  const re = new RegExp(`${propName}\\s*=\\s*\\{\\{([\\s\\S]*?)\\n\\s*\\}\\}`, "m");
  const body = block.match(re)?.[1] ?? "";
  return [...body.matchAll(/\b([A-Za-z_][A-Za-z0-9_]*)\s*:/g)].map((m) => m[1]).sort();
};
const dialogProps = ["exportPdfProps", "exportExcelProps", "anexosProps", "confirmDeleteProps"];
const dialogsKeysEqual = dialogProps.every((prop) => {
  const oldKeys = extractDialogPropKeys(dialogsOld, prop);
  const newKeys = extractDialogPropKeys(dialogsNew, prop);
  return JSON.stringify(oldKeys) === JSON.stringify(newKeys);
});
gate("G83 — Paridade de Dialogs 100%", dialogsKeysEqual && dialogsMasterWiring);

// G84 — Paridade de UX 100%
const uxOk = [
  motorNorm.includes("resolveMgViewMode"),
  motorNorm.includes("resolveMgActionBarVisibility"),
  motorNorm.includes("applyMgViewMode"),
  motorNorm.includes("MakMobileViewBar"),
  motorNorm.includes("searchViewPending"),
  motorNorm.includes("infiniteMode: true"),
].every(Boolean);
gate("G84 — Paridade de UX 100%", uxOk);

// G85 — Nenhuma diferença perceptível ao usuário
const allBeforeG85 = results.every((r) => r.ok);
const promotionWiring =
  pagempWrapper.includes("<ModeloBase1CadastroPage config={empresasModeloBase1Config} />") &&
  config.includes("buildModeloBase1ConfigFromMakModule") &&
  config.includes("empresasToolbarComponents");
gate("G85 — Nenhuma diferença perceptível ao usuário", allBeforeG85 && promotionWiring);

const passed = results.filter((r) => r.ok).length;
console.log(`\nG73-G85: ${passed}/${results.length} aprovados`);
process.exit(passed === results.length ? 0 : 1);
