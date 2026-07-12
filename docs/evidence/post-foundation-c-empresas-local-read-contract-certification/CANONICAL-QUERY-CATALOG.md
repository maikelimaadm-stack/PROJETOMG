# Canonical Query Catalog

`createEmpresasCanonicalQueryCatalog({ fixtures })` — 32 cenários.

## Cobertura

list default/page1/page2; pageSize 1/max; search por nome/case-insensitive/espaços; filtro por
código/status/composto; sort asc/desc/estável; search+filter, search+sort, filter+sort, full; sem
resultado; página fora do range; tenant A/B; permission denied; header missing/invalid; token
expirado; getById válido/foreign; count filtrado; fallback flag off; parity mismatch simulado;
mutation attempt bloqueada.

## Cada cenário

`scenarioId, operation, query, contextProfile, expectedOutcome, expectedErrorCode, expectedDigest,
essential, notes`. Os cenários de leitura certificáveis carregam um `expectedDigest` determinístico
(paridade digest sobre a fixture certification-small). `essentialCount = 30`.
