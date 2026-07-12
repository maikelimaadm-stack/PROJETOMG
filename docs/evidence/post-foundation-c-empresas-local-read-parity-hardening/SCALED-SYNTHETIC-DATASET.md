# Scaled Synthetic Dataset

`createEmpresasScaledSyntheticDataset({ profile, size, seed, testRunId })`.

## Perfis

| Profile | Size | Tenants |
|---|---|---|
| tiny | 4 | 1–2 |
| small | 20 | 2 |
| medium | 250 | 4 |
| large | 2000 | 4 |

Cap absoluto: 5000 (não excedido). `large` limitado a 2000 neste slice.

## Garantias

- determinístico por `seed` (mesmo seed → registros idênticos; seed diferente → difere);
- IDs únicos; `codempresa`/`id_global` derivados por tenant;
- shape idêntico ao `Empresa` real; `campos_personalizados: null`;
- **sem dados reais**: `email`/`telefone` = null, `cpf_cnpj` sintético `00.xxx.xxx/0001-xx`,
  `razao_social` com prefixo `MAK_TEST_...`;
- metadata `__fixture` (fora do payload normalizado): testRunId, fixtureId, seed, synthetic,
  tenantId, erpEmpresaId, environment local_test, datasetProfile, source deterministic_scaled_fixture;
- cópias seguras; sem mutação interna.
