# Performance Baseline

`createEmpresasReadPerformanceBaseline({ iterations, profiles, clock })` — **não é SLA de produção**.

## Perfis × operações

Perfis: tiny/small/medium/large. Operações: list-no-filter, list-search, list-filter, list-sort,
list-page, query-composite, runtime-projection, parity-digest → 8 × 4 = 32 medições.

## Métricas

datasetSize, operation, iterations, minMs, maxMs, avgMs, p50Ms, p95Ms, complexityNote.

## Regras

- clock injetável (evita flakiness);
- sem limite absoluto de hardware — valida apenas: resultado completo, ausência de explosão
  (tempos finitos), complexidade esperada (filtros/sort O(n)/O(n log n); digest O(n));
- large limitado a 2000; sem benchmark longo;
- `network/backend/prisma/mutation = false`; `isSla: false`; `hasAnomaly: false`.
