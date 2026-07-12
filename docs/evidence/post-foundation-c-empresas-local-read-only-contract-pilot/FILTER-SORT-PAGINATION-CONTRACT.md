# Filter / Sort / Pagination Contract

Funções puras; nunca mutam a entrada.

## Filtros (`applyEmpresaReadFilters`)

- **texto** (`razao_social`, `nome_fantasia`, `cidade`) → contains case-insensitive.
- **enum/curto** (`status`, `estado`, `tipo_pessoa`, `codempresa`, `id_global`) → igualdade exata
  case-insensitive (evita colisão de substring, ex.: "Ativa" ⊄ "Inativa").
- **busca** → contains case-insensitive nos campos `razao_social`/`nome_fantasia`/`cidade`.

## Sort (`applyEmpresaReadSorting`)

- campo único da allowlist; `asc`/`desc`.
- **estável** (desempate pelo índice original).
- numérico vs. string com `localeCompare` pt-BR numérico.

## Paginação (`applyEmpresaReadPagination`)

- determinística; 1-based.
- page fora do range → `items: []`, `hasNext: false` (estado seguro).
- dataset vazio → `total: 0`, `totalPages: 1`.
- envelope: `{ items, total, page, pageSize, totalPages, hasNext, nextCursor }`.

## Validação (`validateEmpresaReadQuery`)

Bloqueia: `page < 1`, `pageSize` fora de 1..100, sort fora da allowlist, direction ≠ asc/desc,
search > 120 chars, prototype pollution, funções, React elements, raw SQL, objeto Prisma, URL
externa, filtros fora da allowlist. Fail-closed: retorna `valid:false` + `blockers`.
