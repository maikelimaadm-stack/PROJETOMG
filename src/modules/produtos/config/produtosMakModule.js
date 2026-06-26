import { defineMakModule } from "@/framework/mak/runtime";
import { registerMakListFilterBuilder } from "@/framework/mak/filters";
import {
  buildGenericMakColumnFilters,
  mergeGenericMakListFilters,
} from "@/framework/mak/filters/buildGenericMakColumnFilters.js";
import MakCadastroSearchPanel from "@/ModeloBase1/search/MakCadastroSearchPanel.jsx";
import MakLoadBatchControls from "@/ModeloBase1/components/MakLoadBatchControls.jsx";
import { produtosModuleDefinition } from "@/modules/produtos/config/moduleDefinition.js";
import { produtosModuleMetadata } from "@/modules/produtos/config/produtosModuleMetadata.js";
import { produtosPreferencesAdapter } from "@/modules/produtos/config/produtosPreferencesAdapter.js";
import { produtosCadastroConfig } from "@/modules/produtos/config/produtosCadastroConfig.js";
import {
  PRODUTOS_LIST_QUERY_KEY,
  patchProdutosCache,
} from "@/modules/produtos/data/produtosListCache.js";
import produtoRepository from "@/modules/produtos/repositories/produtoRepository.js";

registerMakListFilterBuilder("produtos", {
  buildColumnFilters: buildGenericMakColumnFilters,
  buildPanelFilters: () => ({}),
  merge: mergeGenericMakListFilters,
});

const normalizeProdutoRecord = (record) => ({
  id: record?.id,
  codigo: record?.codigo,
  id_global: record?.id_global,
  nome: record?.nome ?? "",
  status: record?.status ?? "Ativo",
  descricao: record?.descricao ?? null,
  preco: record?.preco ?? null,
});

export const produtosMakModule = defineMakModule(
  produtosModuleDefinition,
  produtosModuleMetadata,
  {
    listQueryKey: PRODUTOS_LIST_QUERY_KEY,
    patchListCache: patchProdutosCache,
    metricsEntityKey: "produtos",
    normalizeRecord: normalizeProdutoRecord,
    findRecordInList: (list, record) => list.find((item) => item.id === record?.id) ?? record,
    repository: produtoRepository,
    cadastroConfig: produtosCadastroConfig,
    components: {
      LoadBatchControls: MakLoadBatchControls,
      SearchPanel: MakCadastroSearchPanel,
    },
  },
  produtosPreferencesAdapter
);
