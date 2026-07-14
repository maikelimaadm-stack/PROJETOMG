# Table Preview Metadata

`createModulePreviewTableMetadata` deriva colunas do field/table/form plan do planner.
Colunas protegidas ficam fora de `visibleColumns` (marcadas `protectedColumn`); colunas
tenant marcadas `tenantColumn`. Ações de linha/toolbar de mutação ficam `enabled:false`.

Invariantes: `previewOnly:true`, `componentCreated:false`, `routeCreated:false`,
`dataFetched:false`, `mutationAllowed:false`, `previewRows:[]` (`syntheticMetadataOnly`).
Não busca dado real, não gera tabela React, não cria rota.
