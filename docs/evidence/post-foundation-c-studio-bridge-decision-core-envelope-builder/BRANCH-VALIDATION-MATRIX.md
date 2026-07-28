# Matriz de validação da branch (mesmo worktree, sem ref movida)

Medições finais no MESMO worktree, com:

- `HEAD` = `d965504b7ba8b192e606145ca8fb0a2c69c288bd`
- `origin/main` = `73d298e09fea349f9bc836555360d6adcb74655c`
- `merge-base` = `73d298e09fea349f9bc836555360d6adcb74655c`

`origin/main` NÃO foi movido nesta rodada. Nenhum worktree sintético foi criado. Nenhum `git update-ref` foi executado.

## Correção da contradição reportada (`B-BRANCH-MATRIX-CONTRADICTORY`)

Causa raiz identificada: em uma rodada anterior um `git update-ref refs/remotes/origin/main HEAD` executado dentro de um worktree sobrescreveu a ref compartilhada `origin/main` para `e253c4c1`, esvaziando quase por completo o diff `origin/main...HEAD`. Com isso os testes baseados em diff passavam enquanto o teste standalone da bridge falhava (826 pass / 1 fail) — a contradição reportada. A ref foi restaurada com `git fetch origin --prune` para `73d298e0` e todas as medições abaixo são sobre o estado REAL da branch.

## Testes

| Comando | Exit | Resultado |
|---|---|---|
| `node --test src/runtime/__tests__/studio-bridge-decision-core-envelope-builder.test.js` | 0 | 1583 / 1583 pass, 0 fail |
| `node --test src/runtime/__tests__/studio-bridge-decision-core-envelope-builder-implementation-plan.test.js` | 0 | 969 / 969 pass, 0 fail |
| `node --test src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge.test.js` | 0 | 831 / 831 pass, 0 fail |
| `npm run test:runtime` | 0 | **21226 / 21226 pass, 0 fail** |

Nenhum teste individual incluído em `test:runtime` falha; o agregado é PASS na mesma execução.

## Gates tratados nesta rodada

| Gate | Exit | Resultado |
|---|---|---|
| `gate:g423-studio-bridge-decision-core-envelope-builder` | 0 | 826 / 826 |
| `gate:g423-studio-bridge-decision-core-envelope-builder-implementation-plan` | 0 | 353 / 353 |
| `gate:g423-studio-authoring-runtime-to-preview-bridge` | 0 | 241 / 241 |
| `gate:g423-studio-module-preview-sandbox-contract` | 0 | 74 / 74 |
| `gate:g423-studio-scope-governance-maintenance` | 0 | 34 / 34 |

Zero vermelho nos gates tratados aqui. Nenhum `PASS_COM_LIMITAÇÃO` foi usado para nenhum deles.

## Bateria completa `gate:g423*` — 107 gates, 66 verdes, 41 em KNOWN_PRIOR_GATE_SCOPE_LIMITATION

Os 41 restantes falham exclusivamente em checagens de ESCOPO branch-relative próprias, anteriores ao registry central de governança, e por isso classificam qualquer caminho `src/studio/...` desta branch como fora de escopo. Nenhum deles falha por conteúdo, contrato, digest, segurança ou runtime.

Divisão:

- **21 gates pré-Studio** (`gate:g423-modelobase1-*`, `gate:g423-modelobase2-*`, `gate:g423-generic-model-*`, `gate:g423-empresas-*`) — nunca foram ligados ao registry.
- **20 gates Studio** (`gate:g423-studio-foundation-audit`, `gate:g423-studio-dev-preview-*`, `gate:g423-studio-module-blueprint-authoring-*`, `gate:g423-studio-authoring-runtime-to-preview-bridge-contract`, `…-implementation-plan`) — cada um com exatamente 1 check vermelho, do mesmo tipo (`prior gates/tests altered` / `authorized scope only`).

### Prova de que a condição é PRÉ-EXISTENTE e não foi introduzida aqui

Esses gates avaliam `git diff --name-only origin/main...HEAD`, que depende apenas do estado COMMITADO. Em `016e4431` (antes desta rodada) o diff já continha todo o subtree do builder, e o código desses gates não foi alterado nesta rodada. Logo o resultado deles é idêntico antes e depois — determinístico e independente das correções entregues aqui.

### Por que não foram corrigidos aqui

A correção foi tentada e revertida (commit `d965504b`). Trazer esses 20 gates para o diff da branch introduz seus caminhos — incluindo caminhos com `menu` no nome e um gate ainda não registrado — no escopo avaliado por TODAS as outras fatias, virando 22 testes antes verdes para vermelho. A correção não é auto-consistente dentro desta fatia: ela pertence a uma fatia dedicada de `scope-governance-maintenance`, com autorização própria.
