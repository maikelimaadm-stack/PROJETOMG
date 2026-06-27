import { defineMakModule } from "@/framework/mak/runtime";
import { registerMakListFilterBuilder } from "@/framework/mak/filters";
import {
  buildCadcpsColumnFilters,
  mergeCadcpsListFilters,
} from "@/shared/listing/buildCadcpsColumnFilters.js";
import MakCadastroSearchPanel from "@/ModeloBase1/search/MakCadastroSearchPanel.jsx";
import MakLoadBatchControls from "@/ModeloBase1/components/MakLoadBatchControls.jsx";
import { cadcpsModuleDefinition } from "@/modules/cadcps/config/moduleDefinition.js";
import { cadcpsModuleMetadata } from "@/modules/cadcps/config/cadcpsModuleMetadata.js";
import { cadcpsPreferencesAdapter } from "@/modules/cadcps/config/cadcpsPreferencesAdapter.js";
import { cadcpsCadastroConfig } from "@/modules/cadcps/config/cadcpsCadastroConfig.js";
import {
  CADCPS_LIST_QUERY_KEY,
  patchCadcpsCache,
} from "@/modules/cadcps/data/cadcpsListCache.js";
import repCps from "@/modules/cadcps/repositories/repCps.js";
import { mapCadcpsRecordToForm } from "@/modules/cadcps/runtime/cadcpsFormRuntime.jsx";

registerMakListFilterBuilder("cadcps", {
  buildColumnFilters: buildCadcpsColumnFilters,
  buildPanelFilters: () => ({}),
  merge: mergeCadcpsListFilters,
});

const normalizeCadcpsRecord = (record) => {
  if (!record) return record;
  return {
    id: record.id,
    codigo: record.codigo,
    id_global: record.id_global,
    nome: record.nome ?? "",
    field_name: record.field_name ?? "",
    tipo: record.tipo ?? "texto",
    ativo: record.ativo !== false,
    telas: record.telas ?? [],
    aplicacao_modo: record.aplicacao_modo ?? "todas",
    quantidade_empresas: record.quantidade_empresas ?? record.empresa_ids?.length ?? 0,
    obrigatorio: !!record.obrigatorio,
    empresa_ids: record.empresa_ids ?? [],
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    ...record,
  };
};

export const cadcpsMakModule = defineMakModule(
  cadcpsModuleDefinition,
  cadcpsModuleMetadata,
  {
    listQueryKey: CADCPS_LIST_QUERY_KEY,
    patchListCache: patchCadcpsCache,
    metricsEntityKey: "cadcps_campos",
    normalizeRecord: normalizeCadcpsRecord,
    findRecordInList: (list, record) => list.find((item) => item.id === record?.id) ?? record,
    repository: repCps,
    cadastroConfig: cadcpsCadastroConfig,
    mapRecordToForm: mapCadcpsRecordToForm,
    components: {
      LoadBatchControls: MakLoadBatchControls,
      SearchPanel: MakCadastroSearchPanel,
    },
  },
  cadcpsPreferencesAdapter
);
