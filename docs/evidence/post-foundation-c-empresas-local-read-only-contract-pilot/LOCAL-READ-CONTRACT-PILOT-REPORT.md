# Local Read-Only Contract Pilot — Report

## Objetivo

Harness **local, read-only, determinístico e isolado** que valida os contratos de leitura de
Empresas contra fixtures **sintéticas**, sem rede, sem backend produtivo, sem Prisma, sem mutation e
**sem alterar nenhum arquivo produtivo de Empresas**.

## Componentes (todos em `src/modules/empresas/local-read-contract-pilot/`, isolados)

| Arquivo | Papel |
|---|---|
| `empresasLocalReadContractConfig.js` | flags locais, allowlists de sort/filter/search, tokens de mutation |
| `errors.js` | erro tipado MAK-EMP-LOCAL-READ-001..005 |
| `blockEmpresasReadPilotMutation.js` | mutation blocker explícito |
| `createEmpresasSyntheticDataset.js` | 14 empresas sintéticas em 2 tenants / 2 erpEmpresaId |
| `createEmpresasSyntheticTenantContext.js` | contextos sintéticos (A/B + 5 fail-closed) |
| `createEmpresasReadOnlyRepository.js` | list/getById/count com tenant scope; write refuta |
| `createEmpresasReadOnlyApiAdapter.js` | espelha o envelope real da `EmpresaApi` sem rede |
| `validateEmpresaReadQuery.js` | valida page/pageSize/sort/direction/search/filters; bloqueia pollution/SQL/Prisma/URL |
| `applyEmpresaReadFilters.js` | filtros (contains para texto, exato para enum) + busca case-insensitive |
| `applyEmpresaReadSorting.js` | sort estável asc/desc |
| `applyEmpresaReadPagination.js` | paginação determinística; page fora do range seguro |
| `normalizeEmpresaReadPayload.js` | normalização espelhando os campos reais do `Empresa` |
| `createEmpresasRuntimeReadProjection.js` | projeção runtime-v2 read-only |
| `compareEmpresasReadParity.js` | paridade legacy × runtime (digest FNV; sem divergência silenciosa) |
| `createEmpresasReadContractDiagnostics.js` | diagnostics passivos |
| `createEmpresasReadContractFallback.js` | fallback fail-closed |
| `createEmpresasLocalReadContractPilot.js` | composer top-level |
| `index.js` | barrel puro |

## Contrato real espelhado (auditado, não alterado)

- `EmpresaApi.listEmpresas` → `{ items, total, page, pageSize, totalPages, nextCursor }` — o adapter
  local replica esse envelope exatamente.
- `EmpresaApi.getEmpresa(id)` → item | null.
- Campos do `Empresa` (id, cliente_id, id_global, codempresa, razao_social, nome_fantasia,
  tipo_pessoa, cpf_cnpj, cidade, estado, status, campos_personalizados, createdAt, updatedAt).
- Tenant scope: `cliente_id`; header: `empresaHeader`/`erpEmpresaId`.

## O que o harness responde

- quais registros sintéticos um tenant pode listar (só o seu `cliente_id`);
- quais devem ser bloqueados (tenant divergente, sem permissão, sem header, header inválido, token expirado);
- como filtros/busca/sort/paginação se comportam (determinístico, estável);
- como o payload é normalizado (sem vazar metadata de fixture);
- como erros são mapeados (fail-closed, erro tipado);
- como o runtimeReadModel recebe os dados (projeção read-only);
- como o fallback preserva o legado local quando seguro;
- se a paridade legacy × runtime é exata (score 1.0);
- se qualquer tentativa de mutation é bloqueada (nunca executada).

## Invariantes

`environment: local_test` · `synthetic: true` · `localOnly: true` · `readOnly: true` ·
`mutationAllowed: false` · `productionAccessed: false` · `backendAccessed: false` ·
`prismaAccessed: false` · `fetchUsed: false`.
