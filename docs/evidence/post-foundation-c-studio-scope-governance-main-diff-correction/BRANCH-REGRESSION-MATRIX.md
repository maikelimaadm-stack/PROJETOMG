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

## Números finais medidos nesta branch

| comando | exit | resultado |
|---|---|---|
| `test:runtime:studio-scope-governance-main-diff-correction` | 0 | **469 / 469** |
| `gate:g423-studio-scope-governance-main-diff-correction` | 0 | **451 / 451** |
| `test:runtime:studio-scope-governance-chronological-migration` | 0 | **800 / 800** |
| `gate:g423-studio-scope-governance-chronological-migration` | 0 | **717 / 717** |
| `test:runtime:studio-scope-governance-maintenance` | 0 | 74 / 74 |
| `gate:g423-studio-scope-governance-maintenance` | 0 | 34 / 34 |
| nove testes migrados | 0 | 627 · 665 · 827 · 412 · 433 · 482 · 557 · 518 · 684 — 0 fail |
| dezessete testes históricos | 0 | 192 · 160 · 104 · 159 · 170 · 48 · 43 · 446 · 300 · 248 · 266 · 250 · 227 · 652 · 683 · 283 · 229 — 0 fail |
| vinte e dois gates Studio | 0 | 22 / 22 |
| doze gates históricos | 0 | 12 / 12 |
| **`gate:g423`** (oficial) | 0 | **7 / 7** |
| **`npm run test:runtime`** | 0 | **20908 / 20908 — 0 fail** |
| `npm run lint` | 0 | limpo |
| `npm run build` | 0 | ok |
| `dist` grep | — | **0 hits** |
| sweep `gate:g423*` | — | 108 gates, **95 verdes**, 12 vermelhos |

Os 12 vermelhos do sweep são **exclusivamente** pré-Studio, todos presentes em
`LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED`, e **nenhum gate Studio está vermelho**:

```
g423-modelobase2-prototype-adapter
g423-generic-model-multi-type-hardening
g423-modelobase2-operational-runtime-foundation
g423-modelobase2-fuel-headless-candidate
g423-modelobase2-fuel-beta-ui-sandbox
g423-modelobase2-fuel-dev-preview-route
g423-modelobase2-fuel-module-shell-readiness
g423-empresas-production-baseline-audit
g423-empresas-controlled-production-test-plan
g423-empresas-local-read-only-contract-pilot
g423-empresas-local-read-parity-hardening
g423-empresas-studio-compatibility-slice-1
```

Nenhum deles integra o `test:runtime` oficial nem o `gate:g423` oficial, nenhum foi alterado por
esta fatia, e nenhum representa falha funcional. Continuam **não migrados, não declarados PASS e
não mascarados**.

Zero gate com `blocked: no_active_slice_resolved`. Zero gate com `unit tests PASS — 0 scenarios`.

## Correção pós-auditoria

Os números acima foram medidos novamente após:

1. restaurar `CERTIFICATION-REPORT.md` e `READINESS.md` da fatia 42 exatamente de `origin/main`;
2. remover integralmente a regra de "candidata emendada" de `resolveActiveStudioSlice`;
3. remover os dois padrões de evidência da fatia 42 do `crossSliceAuthorizedPatterns` da fatia 43
   (cross list: 63 → **61 padrões únicos**).

Contagens finais pós-correção:

| alvo | antes da correção de auditoria | agora |
|---|---|---|
| `test:runtime:...main-diff-correction` | 424 | **469** |
| `gate:g423-...main-diff-correction` | 409 | **451** |
| `test:runtime:...chronological-migration` | 796 | **800** |
| `gate:g423-...chronological-migration` | 713 | **717** |
| `npm run test:runtime` | 20859 | **20908** |

Nenhuma cobertura funcional desapareceu. As provas que dependiam do mecanismo de "candidata
emendada" foram substituídas por provas de que ele **não existe**: `X001`–`X016` no teste da
fatia 43 e `S001`–`S004` no teste da fatia 42.

A branch passou a resolver a fatia 43 por um **único marker real** — o próprio diretório de
evidências dela — sem qualquer regra de amendment.
