import { defineMakModule } from "@/framework/mak/runtime";
import { registerMakListFilterBuilder } from "@/framework/mak/filters";
import {
  buildGenericMakColumnFilters,
  mergeGenericMakListFilters,
} from "@/framework/mak/filters/buildGenericMakColumnFilters.js";
import MakCadastroSearchPanel from "@/ModeloBase1/search/MakCadastroSearchPanel.jsx";
import MakLoadBatchControls from "@/ModeloBase1/components/MakLoadBatchControls.jsx";
import { __MODULE_ID__ModuleDefinition } from "@/modules/__MODULE_ID__/config/moduleDefinition.js";
import { __MODULE_ID__ModuleMetadata } from "@/modules/__MODULE_ID__/config/__MODULE_ID__ModuleMetadata.js";
import { __MODULE_ID__PreferencesAdapter } from "@/modules/__MODULE_ID__/config/__MODULE_ID__PreferencesAdapter.js";
import { __MODULE_ID__CadastroConfig } from "@/modules/__MODULE_ID__/config/__MODULE_ID__CadastroConfig.js";
import {
  __MODULE_ID_UPPER___LIST_QUERY_KEY,
  patch__MODULE_ID_PASCAL__Cache,
} from "@/modules/__MODULE_ID__/data/__MODULE_ID__ListCache.js";
import __REPOSITORY_NAME__ from "@/modules/__MODULE_ID__/repositories/__REPOSITORY_NAME__.js";

registerMakListFilterBuilder("__MODULE_ID__", {
  buildColumnFilters: buildGenericMakColumnFilters,
  buildPanelFilters: () => ({}),
  merge: mergeGenericMakListFilters,
});

const normalize__MODULE_ID_PASCAL__Record = (record) => ({
  id: record?.id,
  codigo: record?.codigo,
  id_global: record?.id_global,
  nome: record?.nome ?? "",
  status: record?.status ?? "Ativo",
  observacoes: record?.observacoes ?? null,
});

export const __MODULE_ID__MakModule = defineMakModule(
  __MODULE_ID__ModuleDefinition,
  __MODULE_ID__ModuleMetadata,
  {
    listQueryKey: __MODULE_ID_UPPER___LIST_QUERY_KEY,
    patchListCache: patch__MODULE_ID_PASCAL__Cache,
    metricsEntityKey: "__MODULE_ID__",
    normalizeRecord: normalize__MODULE_ID_PASCAL__Record,
    findRecordInList: (list, record) => list.find((item) => item.id === record?.id) ?? record,
    repository: __REPOSITORY_NAME__,
    cadastroConfig: __MODULE_ID__CadastroConfig,
    components: {
      LoadBatchControls: MakLoadBatchControls,
      SearchPanel: MakCadastroSearchPanel,
    },
  },
  __MODULE_ID__PreferencesAdapter
);
