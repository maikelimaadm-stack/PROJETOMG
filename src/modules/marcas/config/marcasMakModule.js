import { defineMakModule } from "@/framework/mak/runtime";
import { registerMakListFilterBuilder } from "@/framework/mak/filters";
import {
  buildGenericMakColumnFilters,
  mergeGenericMakListFilters,
} from "@/framework/mak/filters/buildGenericMakColumnFilters.js";
import MakCadastroSearchPanel from "@/ModeloBase1/search/MakCadastroSearchPanel.jsx";
import MakLoadBatchControls from "@/ModeloBase1/components/MakLoadBatchControls.jsx";
import { marcasModuleDefinition } from "@/modules/marcas/config/moduleDefinition.js";
import { marcasModuleMetadata } from "@/modules/marcas/config/marcasModuleMetadata.js";
import { marcasPreferencesAdapter } from "@/modules/marcas/config/marcasPreferencesAdapter.js";
import { marcasCadastroConfig } from "@/modules/marcas/config/marcasCadastroConfig.js";
import {
  MARCAS_LIST_QUERY_KEY,
  patchMarcasCache,
} from "@/modules/marcas/data/marcasListCache.js";
import marcaRepository from "@/modules/marcas/repositories/marcaRepository.js";

registerMakListFilterBuilder("marcas", {
  buildColumnFilters: buildGenericMakColumnFilters,
  buildPanelFilters: () => ({}),
  merge: mergeGenericMakListFilters,
});

const normalizeMarcaRecord = (record) => ({
  id: record?.id,
  codigo: record?.codigo,
  id_global: record?.id_global,
  nome: record?.nome ?? "",
  status: record?.status ?? "Ativo",
  observacoes: record?.observacoes ?? null,
});

export const marcasMakModule = defineMakModule(
  marcasModuleDefinition,
  marcasModuleMetadata,
  {
    listQueryKey: MARCAS_LIST_QUERY_KEY,
    patchListCache: patchMarcasCache,
    metricsEntityKey: "marcas",
    normalizeRecord: normalizeMarcaRecord,
    findRecordInList: (list, record) => list.find((item) => item.id === record?.id) ?? record,
    repository: marcaRepository,
    cadastroConfig: marcasCadastroConfig,
    components: {
      LoadBatchControls: MakLoadBatchControls,
      SearchPanel: MakCadastroSearchPanel,
    },
  },
  marcasPreferencesAdapter
);
