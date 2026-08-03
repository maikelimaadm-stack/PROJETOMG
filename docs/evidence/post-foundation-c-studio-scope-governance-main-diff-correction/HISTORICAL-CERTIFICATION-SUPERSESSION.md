# Historical certification supersession — append-only

Este documento **supersede operacionalmente** a certificação da fatia 42
(`post-foundation-c-studio-scope-governance-chronological-migration`, PR #496).

A supersessão é declarada **aqui**, pela fatia posterior. Os documentos da fatia 42 **não** foram
editados e permanecem **byte-identical** à `main`.

## Regra de governança

```
evidência histórica mergeada é IMUTÁVEL;
supersessão é declarada pela fatia corretiva POSTERIOR;
não se reescreve retroativamente a certificação anterior.
```

Duas razões, ambas materiais:

1. **Integridade do registro.** Uma certificação mergeada é o registro do que foi medido e
   afirmado naquele momento. Reescrevê-la para declarar o próprio fracasso destrói a prova de
   que a medição foi feita daquele jeito.
2. **Integridade do escopo.** O diretório de evidências da fatia 42 é o `branchMarkerPattern`
   dela. Editar qualquer arquivo lá dentro coloca a fatia 42 como candidata ativa do diff desta
   branch, produzindo `ambiguous_active_slice` — corretamente. A rodada anterior desta fatia
   tentou contornar isso com uma regra implícita de "candidata emendada" dentro de
   `resolveActiveStudioSlice`. Essa regra foi **removida**: a causa era a edição retroativa, e a
   correção é remover a causa, não sofisticar a exceção.

## O que a fatia 42 afirmou, e o que aconteceu

A PR #496 foi mergeada na `main` pelo merge commit
`01e1b701c972869dd705fe90596cf2497a0fa19d` (pais `73d298e0` + `1ad97ccd`).

Na **branch** dela, tudo o que a certificação afirma era verdadeiro. Na **`main`**, não.
Baseline real medido em `01e1b701`, antes desta fatia 43:

| alvo | exit | resultado |
|---|---|---|
| `npm run test:runtime` | 1 | **20405 / 20425 — 20 fail** |
| nove testes agregados | 1 | 9/9, 1 cenário vermelho cada |
| teste da migration (seção T) | 1 | 775 / 786 — 11 fail |
| gate da migration | 1 | 698 / 708 — 10 fail |
| 22 gates Studio | — | **21 vermelhos** |
| sweep `gate:g423*` | — | 84 verdes / **22 vermelhos** |

## Os três blockers superseded

- **B1 — `B-POSTMERGE-EMPTY-DIFF-FAILS-CLOSED-ON-MAIN`** — os checks branch-relative tratam um
  diff VAZIO como branch Studio inválida. Na `main`,
  `git diff --name-only origin/main...HEAD` retorna vazio com sucesso, o guard `if (files === null)`
  não cobre esse caso, e `evaluateStudioBranchScope([])` falha fechado.
- **B2 — `B-TWO-EXTENSION-GATES-NOT-ACTIVE-BOUND`** — dois gates isentavam o blanket histórico com
  um filtro por caminho isolado, sem fatia ativa e sem ordinal.
- **B3 — `B-TEN-EXTENSION-GATES-PREFIX-BOUND`** — dez gates usavam
  `startsWith('studio-scope-governance-')`, que casa três fatias, duas delas anteriores, e sem
  checagem de autorização de caminho.

## O que continua valendo da fatia 42

O catálogo cronológico, os ordinais contíguos, a resolução de fatia ativa por markers, o
`explicitlyAuthorizedForbiddenPatterns` catalog-bound e a preservação literal dos regexes
históricos. Nada disso foi revertido. A fatia 43 corrige a **borda** e centraliza a **isenção**.

## Estado dos documentos da fatia 42

```
docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/CERTIFICATION-REPORT.md
docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/READINESS.md
```

Ambos byte-identical à `main` (`git diff --exit-code origin/main -- <ambos>` → exit 0) e
**ausentes** do diff desta PR. Nenhum documento da fatia 42 aparece em
`crossSliceAuthorizedPatterns` da fatia 43.

## Status

**POST_MERGE_REVALIDATION_REQUIRED.** Esta fatia não certifica a `main`. Ver
`POST-MERGE-REVALIDATION-PLAN.md`.
