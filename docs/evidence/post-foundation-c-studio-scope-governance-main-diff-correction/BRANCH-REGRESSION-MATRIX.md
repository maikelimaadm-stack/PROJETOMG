# Branch regression matrix

Todos os comandos executados no MESMO worktree, na branch
`claude/post-foundation-c-studio-scope-governance-main-diff-correction`.

## Nova fatia

| comando | exit | resultado |
|---|---|---|
| `test:runtime:studio-scope-governance-main-diff-correction` | 0 | ver CERTIFICATION-REPORT.md |
| `gate:g423-studio-scope-governance-main-diff-correction` | 0 | ver CERTIFICATION-REPORT.md |

## Governança anterior

| comando | exit | antes (main) | agora (branch) |
|---|---|---|---|
| `test:runtime:studio-scope-governance-chronological-migration` | 0 | 775/786 — 11 fail | **796/796 — 0 fail** |
| `gate:g423-studio-scope-governance-chronological-migration` | 0 | 698/708 — 10 fail | **713/713 — 0 fail** |
| `test:runtime:studio-scope-governance-maintenance` | 0 | 74/74 | 74/74 |
| `gate:g423-studio-scope-governance-maintenance` | 0 | 34/34 | 34/34 |

## Nove testes migrados

| teste | antes | agora |
|---|---|---|
| `...bridge-contract` | 626/627 — 1 fail | **627/627** |
| `...bridge-implementation-plan` | 664/665 — 1 fail | **665/665** |
| `...bridge` | 826/827 — 1 fail | **827/827** |
| `...app-integration-contract` | 411/412 — 1 fail | **412/412** |
| `...app-integration-implementation-plan` | 432/433 — 1 fail | **433/433** |
| `...app-integration` | 481/482 — 1 fail | **482/482** |
| `...authoring-foundation-contract` | 556/557 — 1 fail | **557/557** |
| `...authoring-implementation-plan` | 517/518 — 1 fail | **518/518** |
| `...authoring-runtime` | 683/684 — 1 fail | **684/684** |

## Vinte e dois gates Studio

Antes: 1 verde, 21 vermelhos. Agora: **22/22 exit 0**, zero `blocked: no_active_slice_resolved`,
zero `unit tests PASS — 0 scenarios`.

## Vinte e nove consumidores históricos

17 testes + 12 gates, todos exit 0, com o regex histórico literalmente preservado e a exceção
centralizada.

## Oficial

Ver CERTIFICATION-REPORT.md para os números finais de `gate:g423`, `npm run test:runtime`,
`lint`, `build`, `dist` e do sweep.
