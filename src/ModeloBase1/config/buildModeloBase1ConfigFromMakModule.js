/**
 * Factory para config ModeloBase1 a partir de um makModule (modo server-pagination).
 */
import { defineModeloBase1Config } from "./defineModeloBase1Config.js";
import { useModeloBase1PreferencesBootstrap } from "@/ModeloBase1/hooks";
import {
  MakFormPanel,
  MakTablePanel,
  MakSearchPanel,
} from "@/framework/mak/page/MakCadastroPage.jsx";

const noopScopeAuth = () => ({
  selectorSnapshot: [],
  selectedScopeId: null,
  upsertInSelector: () => {},
  removeFromSelector: () => {},
  replaceInSelector: () => {},
});

export function buildModeloBase1ConfigFromMakModule(makModule, overrides = {}) {
  const moduleDefinition = makModule.moduleDefinition ?? makModule.definition;
  const labels = overrides.labels ?? {
    singular: moduleDefinition?.singularLabel ?? makModule.labels?.singular ?? "Registro",
    plural: moduleDefinition?.pluralLabel ?? makModule.labels?.plural ?? "Registros",
    title:
      overrides.title ??
      `Cadastro de ${moduleDefinition?.pluralLabel ?? makModule.labels?.plural ?? "Registros"}`,
    newRecord: overrides.newRecord ?? `Novo ${moduleDefinition?.singularLabel ?? "Registro"}`,
    duplicateRecord:
      overrides.duplicateRecord ??
      `Duplicar ${moduleDefinition?.singularLabel?.toLowerCase() ?? "registro"}`,
  };

  const defaultSort = makModule.metadata?.table?.defaultSort ?? { key: "codigo", direction: "asc" };
  const titleField = makModule.metadata?.search?.titleField ?? "nome";
  const codeField = makModule.metadata?.table?.columns?.[0]?.id ?? "codigo";

  return defineModeloBase1Config({
    moduleId: makModule.moduleId,
    makModule,
    moduleDefinition,
    listMode: "server",
    scopeCssClass: overrides.scopeCssClass ?? `cadastro-${makModule.moduleId}-scope`,
    tableKey: overrides.tableKey ?? `tbl-${makModule.moduleId}`,
    preferencesAdapter: makModule.preferencesAdapter,
    labels,
    components: {
      FormPanel: MakFormPanel,
      TablePanel: MakTablePanel,
      SearchPanel: makModule.components?.SearchPanel ?? MakSearchPanel,
      Dialogs: makModule.components?.Dialogs,
      ...(overrides.components ?? {}),
    },
    hooks: {
      useScopeAuth: overrides.hooks?.useScopeAuth ?? noopScopeAuth,
      usePreferencesBootstrap: useModeloBase1PreferencesBootstrap,
      ...(overrides.hooks ?? {}),
    },
    helpers: {
      readInitialQuerySort: () => defaultSort,
      readInitialColumnFiltersState: () => ({}),
      findRecordInList:
        makModule.findRecordInList ??
        ((list, record) => list.find((item) => item.id === record?.id) ?? record),
      normalizeRecord: makModule.normalizeRecord ?? ((record) => record),
      getRecordCode: (record) =>
        record?.[codeField] != null ? String(record[codeField]) : "",
      getRecordTitle: (record, moduleLabels) =>
        record?.[titleField] ?? moduleLabels?.singular ?? "Novo registro",
      getAttachmentTitle: (record) => record?.[titleField] ?? record?.[codeField] ?? "",
      matchRecordIdentity: (item, record) => item?.id === record?.id,
      ...(overrides.helpers ?? {}),
    },
    data: {
      listQueryKey: makModule.listQueryKey ?? [`${makModule.moduleId}-cadastro`],
      ...(overrides.data ?? {}),
    },
    ...overrides,
  });
}

export default buildModeloBase1ConfigFromMakModule;
