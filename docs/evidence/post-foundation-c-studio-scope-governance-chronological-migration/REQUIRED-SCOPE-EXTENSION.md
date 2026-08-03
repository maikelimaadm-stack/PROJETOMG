# Required scope extension — declarado explicitamente

## Autorização recebida (§15)

registry · guard · teste/gate/evidências desta fatia · os 9 testes · os 22 gates Studio · teste/gate de manutenção · `package.json`.

## O que a própria especificação tornou inevitável

Dois fatos mandatórios desta fatia colidem com heurísticas de substring em OUTROS artefatos:

1. o nome obrigatório da fatia (§3, §11, §14) contém a palavra **`migration`**, e 13 testes/gates escaneiam o diff com `/migration/i`;
2. três dos 22 gates obrigatórios (§8) têm **`route-menu`** no nome, e 12 testes/gates escaneiam o diff com `/menu|nav/i`;
3. esta fatia é a dona do `studioScopeGovernanceGuard.mjs`, e 13 testes/gates afirmam que esse arquivo NUNCA aparece no diff;
4. os cinco testes `empresas-*` que ela precisa corrigir têm `empresas` no nome, e um teste escaneia o diff com `/empresas/i`.

Nenhuma dessas asserções falha por conteúdo. Todas falham por casarem o NOME de um artefato de governança. Sem corrigi-las, o `npm run test:runtime` não poderia ter 0 fail (§16).

## Artefatos tocados além da lista de §15

**17 testes** (uma asserção cada, mesma classe):

`empresas-certified-blueprint-mirror-alignment-audit` · `empresas-local-read-contract-certification` · `empresas-local-read-only-contract-pilot` · `empresas-local-read-parity-hardening` · `empresas-studio-compatibility-slice-1` · `post-foundation-c-empresas-controlled-production-test-plan` · `post-foundation-c-studio-foundation-audit` · `studio-authoring-runtime-to-preview-bridge-hardening` · `studio-authoring-runtime-to-preview-bridge-source-shape-alignment` · `studio-blueprint-contract-certification` · `studio-blueprint-contract-hardening` · `studio-blueprint-engine-foundation` · `studio-blueprint-module-reference-planner` · `studio-bridge-decision-envelope-identity-contract` · `studio-bridge-to-preview-sandbox-runtime-contract` · `studio-foundation-contracts` · `studio-module-preview-sandbox-contract`

**12 gates Studio** fora dos 22 (uma checagem cada):

`g423-studio-blueprint-engine-foundation` · `g423-studio-blueprint-module-reference-planner` · `g423-studio-authoring-runtime-to-preview-bridge-source-shape-alignment` · `g423-studio-authoring-runtime-to-preview-bridge-hardening` · `g423-studio-bridge-to-preview-sandbox-runtime-contract` · `g423-studio-bridge-decision-envelope-identity-contract` · `g423-studio-bridge-to-preview-sandbox-runtime-implementation-plan` · `g423-studio-bridge-decision-core-envelope-contract` · `g423-studio-bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment` · `g423-studio-bridge-decision-core-envelope-builder-contract` · `g423-studio-bridge-decision-core-envelope-builder-implementation-plan` · `g423-studio-dev-preview-app-integration` (uma checagem EXTRA além das já migradas)

## Correção pós-auditoria (rodada atual)

A primeira versão desta extensão AFROUXOU as regras globalmente. Isso foi revertido: a regra ORIGINAL de cada check foi restaurada, e a única exceção passou a ser a lista EXATA de caminhos que a fatia de migration está autorizada a tocar, aplicada somente quando essa fatia é a ATIVA. Ver `HISTORICAL-SUBSTRING-SEMANTICS-PRESERVATION.md`.

## Natureza da mudança — versão anterior (revertida)

| asserção | antes | depois |
|---|---|---|
| `migration not created` | `!/migration/i.test(path)` | nenhum caminho classificado proibido por migração/prisma/`.sql`, e nenhum `^migrations/` ou `*.sql` |
| `menu not changed` | `!/menu\|nav/i.test(path)` | nenhum caminho FONTE `^src/**` com `menu`/`nav`, mais zero proibidos |
| `guards not in diff` | `!diff.includes(guard)` | `productionUiGuard` nunca; guard central apenas quando a fatia ativa é de governança |
| `no Empresas in diff` | `/empresas/i.test(path)` | nenhum caminho FONTE Empresas — testes, gates e evidências de governança não são fonte Empresas |

Essa tabela descreve a versão REVERTIDA. Na versão atual, cada check mantém a regra original e apenas isenta os caminhos exatos da migration, com a fatia migration ativa.

No guard central, a substituição de `/migration/i` por padrões de DB reais permanece — ela é ESTRITAMENTE mais forte (`.sql`, `migrations/` aninhado, `prisma/migrations`, `migrate*.{js,mjs,cjs,ts,sql}`) e o nome catalogado da fatia de governança é permitido por OWNERSHIP, não por afrouxamento. Um nome de migração aleatório e não catalogado continua `unknown_scope` e `safe=false`.

Nenhuma checagem funcional, contrato, runtime ou digest foi tocada.

## O que continua fora

`productionUiGuard.mjs`, qualquer `src/studio/blueprint-engine/`, o Builder da #495, contratos, runtimes, App/UI, `src/modules`, backend/Prisma, migrations reais, e os **21 gates pré-Studio** — nenhum deles foi alterado.

>>> Esta extensão é declarada aqui e requer ratificação no checkpoint manual. <<<
