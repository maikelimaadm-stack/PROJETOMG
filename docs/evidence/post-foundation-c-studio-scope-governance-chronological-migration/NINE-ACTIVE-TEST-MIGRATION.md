# Nine active test migration

Os nove cenários que bloqueavam o `npm run test:runtime` oficial passaram a declarar a própria identidade de fatia e a consumir `evaluateStudioBranchScope`.

| teste | callerSliceId |
|---|---|
| `studio-authoring-runtime-to-preview-bridge-contract.test.js` | `authoring-runtime-to-preview-bridge-contract` |
| `studio-authoring-runtime-to-preview-bridge-implementation-plan.test.js` | `authoring-runtime-to-preview-bridge-implementation-plan` |
| `studio-authoring-runtime-to-preview-bridge.test.js` | `authoring-runtime-to-preview-bridge` |
| `studio-dev-preview-app-integration-contract.test.js` | `dev-preview-app-integration-contract` |
| `studio-dev-preview-app-integration-implementation-plan.test.js` | `dev-preview-app-integration-implementation-plan` |
| `studio-dev-preview-app-integration.test.js` | `dev-preview-app-integration` |
| `studio-module-blueprint-authoring-foundation-contract.test.js` | `module-blueprint-authoring-foundation-contract` |
| `studio-module-blueprint-authoring-implementation-plan.test.js` | `module-blueprint-authoring-implementation-plan` |
| `studio-module-blueprint-authoring-runtime.test.js` | `module-blueprint-authoring-runtime` |

## O que mudou

Somente a asserção branch-relative de escopo. A allowlist temporal local foi removida e substituída por:

```js
const scope = evaluateStudioBranchScope(changed, { callerSliceId: CALLER_SLICE_ID });
assert.deepEqual(scope.forbidden, []);
assert.deepEqual(scope.unknown, []);
assert.deepEqual(scope.chronologicalViolation, []);
assert.ok(scope.activeSliceOrdinal >= scope.callerSliceOrdinal);
assert.equal(scope.safe, true);
```

## O que NÃO mudou

Nenhuma lógica funcional, nenhum contrato, nenhum runtime, nenhuma contagem de cenários além do próprio cenário migrado. Proibido e desconhecido continuam fail-closed.
