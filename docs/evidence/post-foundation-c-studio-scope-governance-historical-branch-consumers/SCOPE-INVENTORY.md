# Inventário de escopo — fatia 44

## Entrada no catálogo

```
sliceId       studio-scope-governance-historical-branch-consumers
sliceOrdinal  44
title         Studio Scope Governance Historical Branch Consumers
status        active_slice
```

Catálogo: 44 fatias, ordinais contíguos 1..44, ids únicos, entradas congeladas, dez chaves em
todas (a décima é `historicalBranchConsumerCompatibility`). Exatamente uma fatia com `status: active_slice` — esta. A fatia 43 passou a `merged`.

## primaryArtifactPatterns — 3

```
^src\/runtime\/__tests__\/studio-scope-governance-historical-branch-consumers\.test\.js$
^scripts\/gates\/g423-studio-scope-governance-historical-branch-consumers\.mjs$
^docs\/evidence\/post-foundation-c-studio-scope-governance-historical-branch-consumers\/
```

## branchMarkerPatterns — 1

```
^docs\/evidence\/post-foundation-c-studio-scope-governance-historical-branch-consumers\/
```

Subconjunto estrito do primary. Não casa com o teste nem com o gate desta fatia: arquivo de
teste e de gate nunca elegem fatia ativa.

## sharedGovernancePatterns — 4

```
^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$
^scripts\/gates\/lib\/studioScopeGovernanceGuard\.mjs$
^package\.json$
^package-lock\.json$
```

## historicalBranchConsumerCompatibility — false

Esta fatia **não** autoriza consumidores posteriores sobre a própria branch. O campo é obrigatório
em todas as 44 entradas do catálogo; 43 são `false` e apenas a fatia 41 (Builder, PR #495) é
`true`. Nenhuma fatia `merged` é autorizada. Ver
[`CATALOG-BOUND-COMPATIBILITY-AUTHORIZATION.md`](./CATALOG-BOUND-COMPATIBILITY-AUTHORIZATION.md).

## explicitlyAuthorizedForbiddenPatterns — 0

Esta fatia não toca produção. Nada de `src/App.jsx`, nada de `productionUiGuard.mjs`.

## crossSliceAuthorizedPatterns — 36

Exatos, ancorados, sem curinga de diretório, sem caminho de evidência, sem caminho do Builder:

- **9** testes agregados migrados;
- **22** gates Studio migrados;
- **5** consumidores de governança que julgam diff de branch.

`36 = 9 + 22 + 5`. Cada padrão corresponde a um arquivo **realmente tocado** nesta branch.
`src/runtime/__tests__/studio-scope-governance-maintenance.test.js` está fora de propósito:
não julga branch, não foi tocado, não recebe autorização.

## Diff da branch — 55 caminhos

| bloco | caminhos |
|---|---|
| evidência própria (primary + marker) | 14 |
| teste próprio (primary) | 1 |
| gate próprio (primary) | 1 |
| registry + guard (shared) | 2 |
| `package.json` (shared) | 1 |
| 9 testes agregados (cross) | 9 |
| 22 gates Studio (cross) | 22 |
| 5 consumidores de governança (cross) | 5 |

Nenhum caminho `forbidden`, nenhum `unknown`, nenhum `chronologicalViolation`.
`resolveActiveStudioSlice` resolve exatamente um candidato: a fatia 44.

## O que não está no escopo

- `src/studio/blueprint-engine/**` — nada;
- `src/runtime/**` fora de `__tests__` — nada;
- `src/App.jsx`, `src/pages/**`, `src/components/**`, `src/modules/**` — nada;
- `backend/**`, `prisma/**`, `migrations/**` — nada;
- `scripts/gates/lib/productionUiGuard.mjs` — nada;
- qualquer artefato do Builder (fatia 41 / PR #495) — nada;
- os 21 gates pré-Studio não migrados — nada.
