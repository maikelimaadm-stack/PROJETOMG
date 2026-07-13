# EMPRESAS FILTER/SORT BLUEPRINT MIRROR

Compara a superfície de busca/filtro/ordenação de Empresas com o contrato certificado
de leitura e a semântica de query canônica do Studio.

- supportedSearch: razao_social, nome_fantasia, cidade (maxSearchLen 120)
- supportedFilters: codempresa, razao_social, nome_fantasia, status, cidade, estado, tipo_pessoa
- supportedSorts: codempresa, razao_social, nome_fantasia, status, cidade, estado
- directions: asc, desc · pagination: page/pageSize (maxPageSize 100)

## Query alignment

emptyResultBehavior / invalidQueryBehavior (fail-closed) / defaultQueryBehavior
(tenant-scoped) — todos alinhados ao contrato certificado. Campos fora da superfície
certificada de query são registrados como gap (risco: UI expor coluna sem suporte de
query certificado).
