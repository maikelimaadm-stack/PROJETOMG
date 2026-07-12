# Canonical Error Catalog

`createEmpresasCanonicalErrorCatalog()` — os 22 tipos endurecidos, certificados.

## Entradas

INVALID_QUERY, INVALID_PAGE, INVALID_PAGE_SIZE, INVALID_SORT, INVALID_DIRECTION, INVALID_FILTER,
INVALID_SEARCH, INVALID_CONTEXT, TENANT_REQUIRED, TENANT_MISMATCH, HEADER_REQUIRED, HEADER_INVALID,
TOKEN_EXPIRED, PERMISSION_DENIED, RECORD_NOT_FOUND, DATASET_INVALID, PARITY_MISMATCH, MUTATION_BLOCKED,
PRODUCTION_BLOCKED, BACKEND_BLOCKED, PRISMA_BLOCKED, FETCH_BLOCKED.

## Cada entrada

`code, type, category, messageTemplate (sanitizada), retryable, httpSemantic (documental), safe,
mutationExecuted:false, productionAccessed:false, backendAccessed:false, prismaAccessed:false,
fetchUsed:false`.

- **codes únicos** (validado);
- não contém secret/JWT/stack/DATABASE_URL/API_URL/payload sensível/dado pessoal;
- `errorCatalogDigest` determinístico.
