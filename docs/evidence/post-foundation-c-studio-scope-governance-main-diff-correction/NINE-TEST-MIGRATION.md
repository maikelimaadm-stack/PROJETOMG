# Nine-test migration

Os nove testes agregados passaram a consumir `evaluateStudioBranchDiffScope` no lugar de
`evaluateStudioBranchScope`. O `callerSliceId` de cada um é inalterado.

| teste | caller | cenários |
|---|---|---|
| `studio-authoring-runtime-to-preview-bridge-contract.test.js` | `authoring-runtime-to-preview-bridge-contract` | 627 |
| `studio-authoring-runtime-to-preview-bridge-implementation-plan.test.js` | `authoring-runtime-to-preview-bridge-implementation-plan` | 665 |
| `studio-authoring-runtime-to-preview-bridge.test.js` | `authoring-runtime-to-preview-bridge` | 827 |
| `studio-dev-preview-app-integration-contract.test.js` | `dev-preview-app-integration-contract` | 412 |
| `studio-dev-preview-app-integration-implementation-plan.test.js` | `dev-preview-app-integration-implementation-plan` | 433 |
| `studio-dev-preview-app-integration.test.js` | `dev-preview-app-integration` | 482 |
| `studio-module-blueprint-authoring-foundation-contract.test.js` | `module-blueprint-authoring-foundation-contract` | 557 |
| `studio-module-blueprint-authoring-implementation-plan.test.js` | `module-blueprint-authoring-implementation-plan` | 518 |
| `studio-module-blueprint-authoring-runtime.test.js` | `module-blueprint-authoring-runtime` | 684 |

Nenhuma contagem foi reduzida; nenhum `test()` foi adicionado ou removido.

## Os dois blocos alterados por arquivo

### Bloco A — "guards not in diff"

Antes, a exceção era `scope.activeSliceId.startsWith('studio-scope-governance-')`. Agora é o
authorizer central, que exige a fatia ativa EXATA e que ela seja autorizada para aquele path:

```js
const authorizer = createResolvedActiveStudioSlicePathAuthorizer(files);
assert.ok(authorizer.ok && authorizer.isAuthorized('scripts/gates/lib/studioScopeGovernanceGuard.mjs'));
```

### Bloco B — "no prior gate/test altered"

```js
const scope = evaluateStudioBranchDiffScope(files, { callerSliceId: CALLER_SLICE_ID });
assert.equal(scope.callerSliceId, CALLER_SLICE_ID);
assert.deepEqual(scope.forbidden, []);
assert.deepEqual(scope.unknown, []);
assert.deepEqual(scope.chronologicalViolation, []);
if (scope.applicable) {
  assert.ok(scope.activeSliceOrdinal >= scope.callerSliceOrdinal, ...);
} else {
  assert.equal(scope.notApplicable, true);
  assert.equal(scope.reason, 'empty_branch_diff');
  assert.equal(scope.activeSliceId, null);
}
assert.equal(scope.safe, true, JSON.stringify(scope.blockers));
```

`forbidden`, `unknown` e `chronologicalViolation` continuam asseridos incondicionalmente — num
diff vazio eles são vazios por construção, não por afrouxamento. A exigência de cronologia só é
relaxada quando não há nada para julgar, e nesse caso as três propriedades da borda são asseridas
explicitamente.

O tratamento de `files === null` (git indisponível) permanece exatamente como estava.
