# CERTIFICATION REPORT — Studio Scope Governance Self-Guard Fix

**Slice:** POST-FOUNDATION C — STUDIO SCOPE GOVERNANCE SELF-GUARD FIX
**Branch:** `claude/post-foundation-c-studio-scope-governance-self-guard-fix`

## Objetivo

Tornar o self-guard do gate `g423-studio-scope-governance-maintenance` tolerante a
`known_later_studio_headless_artifact`, eliminando o falso positivo branch-relative que
ele produzia ao rodar sobre uma branch de slice posterior legítimo (ex.: PR #462), sem
enfraquecer nenhum bloqueio.

## Causa raiz

O self-guard calculava `outsideOwn = files.filter(!OWN)` e não filtrava known-later. Ao
rodar na branch #462, os arquivos do Preview Sandbox (fonte + evidência) apareciam como
`outsideOwn`, falhando o check — embora `forbidden` estivesse vazio (nenhum path proibido).

## Correção

`outsideOwn = files.filter(!OWN).filter(!isKnownLaterStudioHeadlessArtifact)`. Forbidden
continua checado separadamente e sempre falha; unknown continua em `outsideOwn` e falha.
`isKnownLaterStudioHeadlessArtifact` retorna `false` para qualquer forbidden (forbidden
vence em `classify`), então tolerar known-later nunca libera um caminho proibido.

## Arquivos modificados

- `scripts/gates/g423-studio-scope-governance-maintenance.mjs` (self-guard + 2 checks novos)
- `scripts/gates/lib/studioScopeGovernanceRegistry.mjs` (evidência deste fix em known-later)
- `src/runtime/__tests__/studio-scope-governance-maintenance.test.js` (SG1-SG16)
- 6 docs de evidência.

`productionUiGuard` NÃO alterado; dependências NÃO alteradas; nenhum código produtivo do
Studio alterado; nenhum wildcard amplo.

## Segurança

src/modules, Empresas, backend, Prisma/schema, migrations, App/menu, UI/React, pages,
components, productionUiGuard, unknown → continuam bloqueados. Forbidden/unknown não viram
warning.

## Status: PASS
