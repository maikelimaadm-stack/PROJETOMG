# Inventário de escopo — fatia 45

## Entrada no catálogo

```
sliceId       studio-builder-lifecycle-normalization
sliceOrdinal  45
title         Studio Builder Lifecycle Normalization
status        merged   (nasce em repouso — ver ROOT-CAUSE.md)
historicalBranchConsumerCompatibility  false
```

## primaryArtifactPatterns — 3

```
^src\/runtime\/__tests__\/studio-builder-lifecycle-normalization\.test\.js$
^scripts\/gates\/g423-studio-builder-lifecycle-normalization\.mjs$
^docs\/evidence\/post-foundation-c-studio-builder-lifecycle-normalization\/
```

## branchMarkerPatterns — 1

```
^docs\/evidence\/post-foundation-c-studio-builder-lifecycle-normalization\/
```

Subconjunto estrito do primary. Teste e gate não são marcadores.

## crossSliceAuthorizedPatterns — 6, exatos

Os consumidores de governança que **afirmam** o ciclo de vida normalizado por esta fatia:

```
^src\/runtime\/__tests__\/studio-scope-governance-chronological-migration\.test\.js$
^scripts\/gates\/g423-studio-scope-governance-chronological-migration\.mjs$
^src\/runtime\/__tests__\/studio-scope-governance-main-diff-correction\.test\.js$
^scripts\/gates\/g423-studio-scope-governance-main-diff-correction\.mjs$
^src\/runtime\/__tests__\/studio-scope-governance-historical-branch-consumers\.test\.js$
^scripts\/gates\/g423-studio-scope-governance-historical-branch-consumers\.mjs$
```

Em nomes simples:

```
studio-scope-governance-chronological-migration.test.js
g423-studio-scope-governance-chronological-migration.mjs
studio-scope-governance-main-diff-correction.test.js
g423-studio-scope-governance-main-diff-correction.mjs
studio-scope-governance-historical-branch-consumers.test.js
g423-studio-scope-governance-historical-branch-consumers.mjs
```

Todos ancorados `^…$`, um arquivo por padrão. Nenhum diretório, nenhuma evidência histórica,
nenhum guard, nenhum caminho de produção.

**Ausentes de propósito:** o teste e o gate do próprio Builder
(`studio-bridge-decision-core-envelope-builder`) e os do implementation plan. A varredura
confirmou que nenhum deles carrega asserção viva de `status` ou de compatibilidade — por isso não
são modificados e, consequentemente, não são autorizados. Autorização sem modificação é escopo
morto.

`studio-scope-governance-maintenance` também está fora: ele não afirma o ciclo de vida do Builder.

## sharedGovernancePatterns — 3

```
^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$
^package\.json$
^package-lock\.json$
```

## explicitlyAuthorizedForbiddenPatterns — 0

Esta fatia não toca produção.

## O que não está no escopo

```
src/studio/blueprint-engine/**            (nenhum arquivo)
scripts/gates/lib/studioScopeGovernanceGuard.mjs
src/runtime/** fora de __tests__
src/App.jsx · src/pages/** · src/components/** · src/modules/**
backend/** · prisma/** · migrations/**
evidência histórica das fatias 41, 42, 43 e 44
qualquer dependência nova
```
