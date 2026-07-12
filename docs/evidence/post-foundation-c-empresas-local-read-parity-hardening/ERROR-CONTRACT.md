# Error Contract

`createEmpresasReadErrorContract()` / `createEmpresasReadError(code, { operation })`.

## Tipos (22)

INVALID_QUERY, INVALID_PAGE, INVALID_PAGE_SIZE, INVALID_SORT, INVALID_DIRECTION, INVALID_FILTER,
INVALID_SEARCH, INVALID_CONTEXT, TENANT_REQUIRED, TENANT_MISMATCH, HEADER_REQUIRED, HEADER_INVALID,
TOKEN_EXPIRED, PERMISSION_DENIED, RECORD_NOT_FOUND, DATASET_INVALID, PARITY_MISMATCH, MUTATION_BLOCKED,
PRODUCTION_BLOCKED, BACKEND_BLOCKED, PRISMA_BLOCKED, FETCH_BLOCKED.

## Shape de cada erro

`{ code, type, message (sanitizada), operation, retryable, safe, mutationExecuted:false,
productionAccessed:false, backendAccessed:false, prismaAccessed:false, fetchUsed:false, diagnostics }`.

## Nunca inclui

secret · JWT · DATABASE_URL · API_URL · stack produtiva · dado pessoal · payload sensível completo.
