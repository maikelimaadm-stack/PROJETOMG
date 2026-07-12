# Composite Query Matrix

`createEmpresasCompositeQueryMatrix({ dataset, context })` — 26 cenários.

## Aceitos (comportamento válido)

search/filter/sort/page isolados; todas as combinações 2/3/4 (search+filter, search+sort,
search+page, filter+sort, filter+page, sort+page, search+filter+sort, search+filter+page,
filter+sort+page, search+sort+page, full); page-beyond-range (vazio seguro); pageSize 1; pageSize
máximo (100); search com espaços; search case-insensitive; filtro sem resultado (vazio).

## Rejeitados (fail-closed)

filtro inválido (fora da allowlist); sort inválido; direction inválida; page inválido; pageSize
inválido (>100).

## Resultado

`{ total, passed, failed, allMatched, scenarios[] }`. `allMatched: true` — cada cenário aceito
retorna ok e cada rejeitado falha fechado. Nenhum suporte inventado além do contrato real.
