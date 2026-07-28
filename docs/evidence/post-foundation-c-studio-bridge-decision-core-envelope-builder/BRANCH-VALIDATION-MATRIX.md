# Matriz de validação da branch (mesmo worktree, sem ref movida)

Todos os comandos abaixo foram executados no MESMO worktree, com:

- `HEAD` = `016e443167e2671edb203a8d4225f25ad440f156` (antes do commit desta rodada)
- `origin/main` = `73d298e09fea349f9bc836555360d6adcb74655c`
- `merge-base` = `73d298e09fea349f9bc836555360d6adcb74655c`

`origin/main` NÃO foi movido nesta rodada. Nenhum worktree sintético foi criado. Nenhum `git update-ref` foi executado.

## Correção da contradição reportada

O blocker `B-BRANCH-MATRIX-CONTRADICTORY` teve causa raiz identificada: em uma rodada anterior um `git update-ref refs/remotes/origin/main HEAD` executado dentro de um worktree sobrescreveu a ref compartilhada `origin/main` para `e253c4c1`, fazendo o diff `origin/main...HEAD` ficar quase vazio. Com isso os testes baseados em diff passavam enquanto o teste standalone da bridge falhava (826 pass / 1 fail). A ref foi restaurada com `git fetch origin --prune` para `73d298e0`, e a partir daí todas as medições foram feitas sobre o estado REAL da branch.

## Resultado

| Comando | Exit | Resultado |
|---|---|---|
| `node --test src/runtime/__tests__/studio-bridge-decision-core-envelope-builder.test.js` | 0 | 1583 / 1583 pass, 0 fail |
| `node scripts/gates/g423-studio-bridge-decision-core-envelope-builder.mjs` | 0 | 826 / 826 |
| `node --test src/runtime/__tests__/studio-bridge-decision-core-envelope-builder-implementation-plan.test.js` | 0 | 969 / 969 pass, 0 fail |
| `node scripts/gates/g423-studio-bridge-decision-core-envelope-builder-implementation-plan.mjs` | 0 | 353 / 353 |
| `node --test src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge.test.js` | 0 | 831 / 831 pass, 0 fail |
| `node scripts/gates/g423-studio-authoring-runtime-to-preview-bridge.mjs` | 0 | 241 / 241 |
| `node scripts/gates/g423-studio-module-preview-sandbox-contract.mjs` | 0 | 74 / 74 |
| `npm run test:runtime` | 0 | 21226 / 21226 pass, 0 fail |
| bateria completa `gate:g423*` (107 gates) | — | 86 verdes; 21 em KNOWN_PRIOR_GATE_SCOPE_LIMITATION (ver abaixo) |

Nenhum teste individual incluído em `test:runtime` falha; o agregado é PASS na mesma execução.

## KNOWN_PRIOR_GATE_SCOPE_LIMITATION (não introduzido nesta rodada)

21 gates anteriores ao programa Studio (`gate:g423-modelobase1-*`, `gate:g423-modelobase2-*`, `gate:g423-generic-model-*`, `gate:g423-empresas-*`) usam allowlists de escopo branch-relative próprias, anteriores ao registry central, e por isso classificam QUALQUER caminho `src/studio/...` da branch como fora de escopo. Eles ficam vermelhos em qualquer branch Studio e verdes em `main` (onde o diff é vazio).

Essa condição é determinística e independente das mudanças desta rodada: esses gates avaliam `git diff --name-only origin/main...HEAD`, que depende apenas do estado COMMITADO em `016e4431` — idêntico antes e depois das correções desta rodada. Nenhum desses gates foi alterado aqui.
