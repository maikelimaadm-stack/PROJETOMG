# Canonical Contract — empresas-local-read-contract@1.0.0

## Empresa record

- **requiredFields**: id, cliente_id, codempresa, razao_social
- **optionalFields**: nome_fantasia, tipo_pessoa, cpf_cnpj, cidade, estado, status, id_global, campos_personalizados, createdAt, updatedAt
- **nullableFields**: nome_fantasia, cpf_cnpj, cidade, estado, campos_personalizados
- **identifierFields**: id, codempresa, id_global
- **tenantFields**: cliente_id
- **sortableFields / filterableFields / searchableFields**: allowlists do piloto
- **protectedFields**: cliente_id
- **omittedSensitiveFields**: telefone, email, __fixture

## List envelope (espelha `EmpresaApi` real)

`items, total, page, pageSize, totalPages, nextCursor` (diagnostics só no harness local).

## getById / count / query

- getById → `item | null`; outcomes: found/not_found/permission_denied/tenant_mismatch/invalid_id
- count → `total`; scopedBy: tenant/permission/filters
- query → page/pageSize/search/filters/sort/direction/context; maxPageSize 100

## Safety

`readOnly: true`, `mutationAllowed: false`, `productionAccessed/backendAccessed/prismaAccessed/fetchUsed: false`.

## Versionamento

- mudança incompatível → **major**; campo opcional novo → **minor**; correção sem mudança → **patch**.
- nenhuma mudança automática; nenhuma publicação externa; nenhuma alteração no schema real.
