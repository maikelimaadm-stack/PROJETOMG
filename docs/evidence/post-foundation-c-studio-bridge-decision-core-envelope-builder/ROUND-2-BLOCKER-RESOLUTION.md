# Round 2 — Blocker Resolution (PR #495)

Resolução verificada dos 9 blockers reportados no veredito FAIL / BLOQUEADA_POR_DEFEITO.

| Blocker | Estado | Prova |
|---|---|---|
| `B-TARGET-SSOT-NOT-EXACT` | RESOLVIDO | `builderConfig.js` deriva TODAS as listas do upstream real (`REAL_/REQUIRED_/SECURITY_/VERSION_/DIGEST_BRIDGE_TARGET_DESCRIPTOR_FIELDS`, `REAL_TARGET_DESCRIPTOR_INVARIANTS`). Cenários `R2-TSSOT` (teste) + `G423-BLD — R2 target …` (gate) comparam campo a campo, nos dois sentidos. |
| `B-TARGET-VERSION-TUPLE-NOT-EXACT` | RESOLVIDO | `validateTargetDescriptor.js` compara os 4 campos de versão + `sourceHandoffKind` contra as constantes upstream. `fake-runtime@9.9.9` (semver válido, semanticamente errado) é rejeitado — cenários `R2-VTUPLE`. |
| `B-COMPATIBILITY-VERIFIER-OVERCLAIMS-EXACTNESS` | RESOLVIDO | `subsetOf()` removido. Todas as comparações são set/order/value. Novo `evaluateBuilderCompatibilitySnapshot()` + `BUILDER_COMPATIBILITY_SNAPSHOT` permitem provar DETECÇÃO: subset, superset, reordenação e alteração de valor de invariante são blockers. `subsetComparisonsPerformed:false`. |
| `B-PIPELINE-23-STAGES-NOT-ACTUALLY-EXECUTED` | RESOLVIDO | `executeBuilderValidationPipeline.js` percorre os 23 stages canônicos e executa cada um explicitamente, incluindo 17–23. `executedStages` prova posição canônica de cada stage. |
| `B-FIRST-BLOCKER-NOT-STAGE-ATOMIC` | RESOLVIDO | Loop stage-atômico: o primeiro stage com blocker retorna imediatamente; `executedStages.length === index+1`; nenhum stage posterior roda; nenhum envelope/core escapa; todas as issues pertencem ao stage de parada. |
| `B-ISSUE-STAGE-ALLOWLIST-PERMISSIVE` | RESOLVIDO | Regex `/^[a-z_]{1,64}$/` eliminada. `ISSUE_STAGE_ALLOWLIST` = 23 stages canônicos + `config_normalization` + `public_boundary` (25). Tokens arbitrários colapsam para `unknown`. Stages inventados removidos do subtree. |
| `B-READINESS-STRING-NOT-FAIL-CLOSED` | RESOLVIDO | `readiness: ready ? READINESS_READY : READINESS_NEEDS_FIX` — derivado do verificador, nunca literal. |
| `B-BRANCH-MATRIX-CONTRADICTORY` | RESOLVIDO | `origin/main` restaurado para `73d298e0` via `git fetch origin --prune`; nenhuma ref movida nesta rodada; nenhum worktree sintético. Matriz completa medida no MESMO worktree em `BRANCH-VALIDATION-MATRIX.md`. |
| `B-PR-BODY-STALE` | RESOLVIDO | Corpo do PR #495 reescrito com o estado real desta rodada. |

## Não introduzido nesta rodada

`identityVerified` continua CONSUMER-owned (ARCHITECTURE 1): `builderDecision.identityVerified=true` fora do envelope, `coreEnvelope.identityVerified=false` sempre. Nenhum amendment ao Core Envelope.
