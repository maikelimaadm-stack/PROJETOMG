/**
 * Transforma cópia de PAGEMP → ModeloBase1CadastroPage (config-driven).
 */
import fs from "node:fs";

const file = "src/ModeloBase1/render/ModeloBase1CadastroPage.jsx";
let out = fs.readFileSync(file, "utf8");

// --- 1. Replace import block (line 1 to line 92) ---
const newImports = `import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { showError, showInfo } from "@/shared/feedback";
import { printCadastroTable } from "@/ModeloBase1/export";
import { MakMasterHistory } from "@/ModeloBase1/components";
import { MAK_PRINT_PLACEHOLDER_MESSAGE } from "@/framework/mak/ux/makPlaceholderActions";
import {
  MakActionBar,
  MakCardsPanelStrip,
  MakTablePanelStrip,
  MakFilterPanel,
  MakContextPanel,
  MakMobileViewBar,
  useMakChrome,
  applyMgViewMode,
  resolveMgViewMode,
  resolveMgActionBarVisibility,
  buildMgFilterFields,
  buildPanelFilterColumnMap,
} from "@/ModeloBase1/layout";
import { useMakPermissions } from "@/ModeloBase1/permissions";
import { useIsMobile } from "@/hooks/use-mobile";
import { useServerRecordNavigation } from "@/ModeloBase1/pagination";
import {
  LIST_DROPDOWN_MAX_ITEMS,
  LIST_DROPDOWN_MAX_PAGES,
  LIST_SEARCH_DEBOUNCE_MS,
} from "@/shared/listing/listQueryConfig";
import {
  buildMakColumnFilters,
  buildMakPanelFilters,
  mergeMakListFilters,
} from "@/ModeloBase1/filters";
import { normalizeSearchQuery, stableJsonEqual, isPendingRecordId, isErpFilterActive } from "@/ModeloBase1/utils";
import { MetricsApi } from "@/apis/metrics/MetricsApi";
import { useSaveCycle } from "@/ModeloBase1/hooks";
import { syncColumnsIntoPanelFilters, useMakListFilters } from "@/ModeloBase1/filters";
import { useMakSearchHandlers, useMakRecordSubmit, useMakRecordDelete, useMakRecordExport } from "@/ModeloBase1/actions";
import { ModeloBase1Provider, useModeloBase1Config } from "@/ModeloBase1/config";

const DROPDOWN_PAGE_SIZE = 30;
`;

out = out.replace(/^import React[\s\S]*?^const DROPDOWN_PAGE_SIZE = 30;\r?\n/m, newImports);

// --- 2. Remove module-level constants and PAGEMP function header ---
out = out.replace(
  /^const MAK_MODULE_ID[\s\S]*?^export default function PAGEMP\(\) \{\r?\n/m,
  `function ModeloBase1CadastroPageContent() {
  const config = useModeloBase1Config();
  const hooks = config.hooks;
  const helpers = config.helpers;
  const data = config.data;
  const exp = config.export ?? {};

  const FormPanel = config.components.FormPanel;
  const SearchPanel = config.components.SearchPanel;
  const TablePanel = config.components.TablePanel;
  const Dialogs = config.components.Dialogs;
  const FilterFieldsConfigDialog = config.components.FilterFieldsConfigDialog;

  const module = config.makModule;
  const moduleDefinition = config.moduleDefinition;
  const moduleRepository = moduleDefinition.repository;
  const moduleLabels = config.labels ?? module.labels;
  const MAK_MODULE_ID = config.moduleId;

  const {
    selectorSnapshot,
    selectedScopeId,
    upsertInSelector,
    removeFromSelector,
    replaceInSelector,
  } = hooks.useScopeAuth();

`
);

// --- 3. Body replacements (order matters — longer first) ---
const replacements = [
  ["useEmpresasPreferencesBootstrapState()", "hooks.usePreferencesBootstrap()"],
  ['useEmpViewModePreference("table")', 'hooks.useViewModePreference("table")'],
  ["useEmpFilterFieldsLayout(catalogFilterFields)", "hooks.useFilterFieldsLayout(catalogFilterFields)"],
  ["useEmpSearchDropdownFields()", "hooks.useSearchDropdownFields()"],
  ["useEmpresasInfiniteData({", "hooks.useInfiniteListData({"],
  ["useEmpCamposPersonalizados()", "hooks.useCustomFields()"],
  ["useEmpCardsVisFields()", "hooks.useCardsVisFields()"],
  ["useEmpFavorites()", "hooks.useFavorites()"],
  ["empresasMakModule.moduleId", "module.moduleId"],
  ["empresasMakModule.moduleLabels", "module.labels"],
  ["empresasMakModule.schema", "module.schema"],
  ["empresasMakModule.listQueryKey", "module.listQueryKey"],
  ["empresasMakModule.patchListCache", "module.patchListCache"],
  ["empresasMakModule.entityName", "module.entityName"],
  ["empresasMakModule.metricsEntityKey", "module.metricsEntityKey"],
  ["empresasMakModule.findRecordInList", "module.findRecordInList"],
  ["empresasMakModule.getPdfExportConfig", "module.getPdfExportConfig"],
  ["empresasMakModule.buildExportRows", "module.buildExportRows"],
  ["empresasMakModule.attachmentPersistErrorMessage", "module.attachmentPersistErrorMessage"],
  ["empresasMakModule.metadata?.table?.columns", "module.metadata?.table?.columns"],
  ["empresasMakModule", "module"],
  ["empresasModuleDefinition", "moduleDefinition"],
  ["findEmpresaInList", "helpers.findRecordInList"],
  ["normalizeEmpresaRecord", "helpers.normalizeRecord"],
  ["getEmpPdfExportConfig()", "exp.getPdfExportConfig()"],
  ["getEmpExcelExportConfig()", "exp.getExcelExportConfig()"],
  ["saveEmpPdfExportConfig(config)", "exp.savePdfExportConfig(config)"],
  ["saveEmpExcelExportConfig(config)", "exp.saveExcelExportConfig(config)"],
  ["getEmpPdfExportConfig", "exp.getPdfExportConfig"],
  ["getEmpExcelExportConfig", "exp.getExcelExportConfig"],
  ["saveEmpPdfExportConfig", "exp.savePdfExportConfig"],
  ["saveEmpExcelExportConfig", "exp.saveExcelExportConfig"],
  ["buildEmpresaExportRows", "helpers.buildExportRows"],
  ["readStoredEmpLoadBatchSize()", "data.readStoredLoadBatchSize()"],
  ["EMP_INFINITE_PAGE_SIZE", "data.infinitePageSize"],
  ["EMP_LOAD_BATCH_STORAGE_KEY", "data.loadBatchStorageKey"],
  ["readStoredTempListagemFilters", "helpers.readStoredTempListagemFilters"],
  ["writeStoredTempListagemFilters", "helpers.writeStoredTempListagemFilters"],
  ["isEmpPreferencesSectionDirty", "helpers.isPreferencesSectionDirty"],
  ["isRemoteTabPreferenceEvent", "helpers.isRemoteTabPreferenceEvent"],
  ["subscribeEmpPreferencesCache", "helpers.subscribePreferencesCache"],
  ["readEmpPreferencesJson", "helpers.readPreferencesJson"],
  ["writeEmpPreferencesText", "helpers.writePreferencesText"],
  ["EmpConfiguracaoFiltrosDialog", "FilterFieldsConfigDialog"],
  ["EmpresasFormPanel", "FormPanel"],
  ["EmpresasSearchPanel", "SearchPanel"],
  ["EmpresasTablePanel", "TablePanel"],
  ["EmpresasDialogs", "Dialogs"],
  ["empresasSelector", "selectorSnapshot"],
  ["selectedEmpresaId", "selectedScopeId"],
  ["upsertEmpresaInSelector", "upsertInSelector"],
  ["removeEmpresasFromSelector", "removeFromSelector"],
  ["replaceEmpresasInSelector", "replaceInSelector"],
  ["patchEmpresasCache", "data.patchListCache"],
  ["getFieldsPerRowForLayout", "helpers.getFieldsPerRowForLayout"],
];

for (const [from, to] of replacements) {
  out = out.split(from).join(to);
}

// Remove readInitialQuerySort/readInitialColumnFilters at module level - use helpers inline
out = out.replace(
  /^const readInitialQuerySort = \(\) => \{[\s\S]*?^const moduleLabels = \{[\s\S]*?\};\r?\n/m,
  ""
);

// Fix useState initializers
out = out.replace("useState(readInitialQuerySort)", "useState(helpers.readInitialQuerySort)");
out = out.replace("useState(readInitialColumnFiltersState)", "useState(helpers.readInitialColumnFiltersState)");
out = out.replace("useRef(readInitialColumnFiltersState())", "useRef(helpers.readInitialColumnFiltersState())");
out = out.replace("const storedColumnFilters = readInitialColumnFiltersState();", "const storedColumnFilters = helpers.readInitialColumnFiltersState();");

// Remove MakModuleProvider wrapper
out = out.replace(/^\s*<MakModuleProvider module=\{module\}>\r?\n/m, "");
out = out.replace(/\r?\n\s*<\/MakModuleProvider>\r?\n(\s*\);\r?\n\})/m, "\n$1");

// Scope class
out = out.replace(
  'className="cadastro-emp-scope mg-empresas-scope flex h-full min-h-0 flex-1 flex-col overflow-hidden"',
  'className={`${config.scopeCssClass} flex h-full min-h-0 flex-1 flex-col overflow-hidden`}'
);

out = out.replace(
  "Number(metricsContadores?.empresas || 0)",
  "Number(metricsContadores?.[config.metricsCounterKey] || 0)"
);

out = out.replace(/\["emp-cadastro-dropdown"/g, '[`${config.dropdownQueryKeyPrefix}`');
out = out.replace(/\["emp-cadastro-dropdown-fav"/g, '[`${config.dropdownQueryKeyPrefix}-fav`');

out = out.replace(
  /const \{ id, created_date, updated_date, created_by, codempresa, id_global, _isPersisting, \.\.\.dup \} = emp;\r?\n    setEditingEmp\(\{ \.\.\.dup, _isDuplicate: true \}\);/,
  "setEditingEmp(helpers.buildDuplicateRecord(emp));"
);

out = out.replace(
  /const recordCode = formBridge\?\.recordMeta\?\.codigo[\s\S]*?const recordTitle =[\s\S]*?"Novo registro";/m,
  `const recordCode = formBridge?.recordMeta?.codigo
    ? String(formBridge.recordMeta.codigo).padStart(6, "0")
    : helpers.getRecordCode(editingEmp);
  const recordTitle = helpers.getRecordTitle(editingEmp, moduleLabels, formBridge, {
    showForm,
    isDuplicating: editingEmp?._isDuplicate,
    isNew: showForm && !editingEmp?.id && !editingEmp?._isDuplicate,
  });`
);

out = out.replace('key: "tbl-emp"', "key: config.tableKey ?? `tbl-${MAK_MODULE_ID}`");

// Remove duplicate useAuth block
out = out.replace(
  /const makPermissions = useMakPermissions\(\);\r?\n  const \{\r?\n    user,\r?\n    empresas: selectorSnapshot,\r?\n    selectedScopeId,\r?\n    upsertInSelector,\r?\n    removeFromSelector,\r?\n    replaceInSelector,\r?\n  \} = useAuth\(\);\r?\n  const \{/m,
  "const makPermissions = useMakPermissions();\n  const {"
);

// Remove PAGEMP.sections import remnants
out = out.replace(/import \{[\s\S]*?\} from "\.\/PAGEMP\.sections";\r?\n/, "");

// Remove orphaned module-level vars
out = out.replace(/^const moduleRepository = moduleDefinition\.repository;\r?\nconst moduleLabels = \{[\s\S]*?\};\r?\n/m, "");

// Footer export
out = out.replace(
  /\}\s*$/,
  `}

/** Motor ModeloBase1 — cadastro enterprise reutilizável. */
export default function ModeloBase1CadastroPage({ config }) {
  if (!config) {
    throw new Error("ModeloBase1CadastroPage: prop config é obrigatória");
  }
  return (
    <ModeloBase1Provider config={config}>
      <ModeloBase1CadastroPageContent />
    </ModeloBase1Provider>
  );
}
`
);

// Verify no empresas imports left in motor
const empImports = out.match(/@\/modules\/empresas/g);
if (empImports?.length) {
  console.warn("AVISO: ainda existem", empImports.length, "imports de @/modules/empresas no motor");
}

fs.writeFileSync(file, out);
console.log("OK:", out.split("\n").length, "linhas");
