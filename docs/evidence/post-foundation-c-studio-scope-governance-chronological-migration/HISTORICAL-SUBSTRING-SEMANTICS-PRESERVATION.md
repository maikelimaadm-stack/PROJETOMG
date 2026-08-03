# Preservação da semântica dos checks históricos

## Defeito corrigido (B-HISTORICAL-SUBSTRING-GUARDS-GLOBALLY-WEAKENED)

Na rodada anterior, três famílias de check histórico foram afrouxadas GLOBALMENTE:

- `/migration/i` virou "somente caminhos de DB";
- `/menu|nav/i` virou "somente `src/...`";
- `/empresas/i` passou a ignorar qualquer test/gate/evidence.

Isso deixaria passar caminhos SEMELHANTES e não autorizados em branches futuras.

## Correção

A regra ORIGINAL de cada check foi restaurada literalmente. A única exceção é uma isenção EXATA e condicionada:

```js
const MIGRATION_SLICE_ID = 'studio-scope-governance-chronological-migration';
const migrationExempt = (changedPaths) => {
  const active = resolveActiveStudioSlice(changedPaths);
  if (!active.ok || active.sliceId !== MIGRATION_SLICE_ID) return () => false;
  return (p) => isPathAuthorizedForStudioSlice(p, MIGRATION_SLICE_ID);
};
// … assert.ok(f.filter((x) => !exempt(x)).every((x) => !/migration/i.test(x)));
```

- a isenção só existe quando a fatia ATIVA é a migration;
- ela cobre apenas os caminhos que a migration está autorizada a tocar, lidos do catálogo;
- todos os demais caminhos continuam sujeitos à regra original, sem alteração;
- não há liberação por categoria: nem "qualquer teste", nem "qualquer gate", nem "qualquer evidência", nem "qualquer coisa fora de `src`".

Helpers puros adicionados ao guard: `getAuthorizedPatternsForStudioSlice(sliceId)` e `isPathAuthorizedForStudioSlice(path, sliceId)` — ambos falham fechado para um sliceId desconhecido.

## Regex originais restauradas

| arquivo | check | regex |
|---|---|---|
| 5 testes `empresas-*`, `studio-blueprint-*`, `studio-module-preview-sandbox-contract`, `post-foundation-c-studio-foundation-audit`, `studio-foundation-contracts` | migration not created | `/migration/i` |
| `post-foundation-c-empresas-controlled-production-test-plan` | migration not created | `/migration\|migrations\//i` |
| os mesmos + `studio-blueprint-engine-foundation` | menu / menu-nav not changed | `/menu\|nav/i` |
| `studio-dev-preview-app-integration` | no Empresas in diff | `/empresas/i` |

## Caminhos apenas SEMELHANTES continuam falhando

Provado, um a um, que nenhum deles é autorizado para NENHUMA fatia do catálogo e que todos bloqueiam numa branch de migration:

```
docs/random-migration-plan.md
tools/custom-migration-helper.js
config/menu.json
tools/navigation-generator.js
scripts/gates/g423-unregistered-route-menu.mjs
src/runtime/__tests__/unlisted-empresas-change.test.js
scripts/gates/g423-unlisted-empresas-change.mjs
docs/evidence/unregistered-empresas-change/file.md
```

## O mesmo path exato com outra fatia ativa

Provado que um caminho autorizado para a migration (por exemplo
`src/runtime/__tests__/studio-module-blueprint-authoring-runtime.test.js`) NÃO é isento quando a fatia ativa é o Builder: ele entra em `chronologicalViolation` e o branch fica `safe=false`.

Provado também, para cada um dos 31 caminhos exatos da migration, que ele é autorizado APENAS para a migration — excluídas apenas a fatia que o POSSUI, a fatia de manutenção (autorização anterior, provada separadamente) e o par de lifecycle do próprio Builder.
