# Synthetic Dataset Contract

`createEmpresasSyntheticDataset({ testRunId, tenantACount, tenantBCount })` — determinístico, puro.

## Conteúdo

- **14 empresas** por padrão (8 no Tenant A, 6 no Tenant B).
- **2 tenants** (`cliente_id`): `MAK_TEST_CLIENTE_A`, `MAK_TEST_CLIENTE_B`.
- **2 erpEmpresaId**: `erp_test_A`, `erp_test_B`.
- registros ativos e inativos (`status` alterna Ativa/Inativa).
- nomes/códigos/cidades/estados variados — suficientes para filtros, busca, sort e paginação.

## Identificação

- `razao_social` com prefixo `MAK_TEST_<TENANT>_EMPRESA_<NNN>`.
- `cpf_cnpj` sintético (padrão `00.xxx.xxx/0001-xx`, claramente não real).
- `email` e `telefone` = `null` (nunca dados reais).
- cada registro carrega `__fixture` (metadata fora do payload normalizado):
  `fixtureId`, `synthetic: true`, `tenantId`, `erpEmpresaId`, `environment: local_test`,
  `cleanupRequired: false`, `source: deterministic_fixture`.

## Garantias

- **inteiramente fictício**; nenhum dado copiado de produção.
- **determinístico**: duas construções produzem registros idênticos.
- `hasSensitiveData: false`.
- schema real **não** alterado — a metadata de fixture vive fora dos campos do `Empresa`, e a
  normalização (`normalizeEmpresaReadPayload`) nunca expõe `__fixture`.
- uniques respeitados dentro do tenant (`codempresa`/`id_global` derivados por tenant).
