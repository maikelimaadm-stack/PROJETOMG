# Migração dos nove testes agregados para a fronteira de aplicabilidade

## O que mudou

Cada um dos nove testes agregados julgava o diff da branch com
`evaluateStudioBranchDiffScope(files, { callerSliceId: CALLER_SLICE_ID })` e exigia
`safe === true`. Numa branch cuja fatia ativa é **anterior** ao caller — o caso da PR #495 —
essa chamada devolve `active_slice_before_caller` e o teste reprova, mesmo com a branch
perfeitamente sã do ponto de vista do seu próprio dono.

Agora cada um pergunta pela **própria aplicabilidade**:

```js
const scope = evaluateStudioBranchConsumerScope(files, { callerSliceId: CALLER_SLICE_ID });
assert.deepEqual(scope.forbidden, []);
assert.deepEqual(scope.unknown, []);
assert.deepEqual(scope.chronologicalViolation, []);
if (scope.consumerApplicable) {
  assert.equal(scope.applicable, true);
  assert.ok(scope.activeSliceOrdinal >= scope.consumerSliceOrdinal);
} else if (scope.reason === 'consumer_slice_after_active_slice') {
  assert.equal(scope.notApplicable, true);
  assert.equal(scope.certifiedAgainstActiveSlice, true);
  assert.equal(scope.evaluatedAsSliceId, scope.activeSliceId);
  assert.ok(scope.activeSliceOrdinal < scope.consumerSliceOrdinal);
} else {
  assert.equal(scope.notApplicable, true);
  assert.equal(scope.reason, 'empty_branch_diff');
  assert.equal(scope.activeSliceId, null);
}
assert.equal(scope.safe, true, JSON.stringify(scope.blockers));
```

Três pontos que impedem isto de virar máscara:

1. `forbidden`, `unknown` e `chronologicalViolation` são exigidos vazios **antes** de qualquer
   ramificação — inaplicável ou não.
2. `safe === true` é exigido **sempre**, no fim, em todos os ramos.
3. O ramo inaplicável só é aceito com `certifiedAgainstActiveSlice === true`, isto é, a branch
   foi recertificada contra a fatia que realmente a possui.

## Os nove arquivos

| # | teste | `CALLER_SLICE_ID` | ordinal |
|---|---|---|---|
| 1 | `studio-authoring-runtime-to-preview-bridge-contract.test.js` | `authoring-runtime-to-preview-bridge-contract` | 28 |
| 2 | `studio-authoring-runtime-to-preview-bridge-implementation-plan.test.js` | `authoring-runtime-to-preview-bridge-implementation-plan` | 29 |
| 3 | `studio-authoring-runtime-to-preview-bridge.test.js` | `authoring-runtime-to-preview-bridge` | 31 |
| 4 | `studio-dev-preview-app-integration-contract.test.js` | `dev-preview-app-integration-contract` | 22 |
| 5 | `studio-dev-preview-app-integration-implementation-plan.test.js` | `dev-preview-app-integration-implementation-plan` | 23 |
| 6 | `studio-dev-preview-app-integration.test.js` | `dev-preview-app-integration` | 24 |
| 7 | `studio-module-blueprint-authoring-foundation-contract.test.js` | `module-blueprint-authoring-foundation-contract` | 25 |
| 8 | `studio-module-blueprint-authoring-implementation-plan.test.js` | `module-blueprint-authoring-implementation-plan` | 26 |
| 9 | `studio-module-blueprint-authoring-runtime.test.js` | `module-blueprint-authoring-runtime` | 27 |

## Verificação

- Varredura de fonte (`S001`/`S002` no teste da fatia, `G423-HBC` no gate): cada arquivo declara
  `const CALLER_SLICE_ID = '<id>';`, usa `evaluateStudioBranchConsumerScope(` e **não** contém
  mais `evaluateStudioBranchDiffScope(`.
- Nenhum dos nove ganhou exceção local, `migrationExempt`, prefixo `studio-scope-governance-`
  ou lista de caminhos tolerados.
- `CALLER_SLICE_ID` continua sendo a identidade real da fatia dona daquele teste — nenhum foi
  reapontado para uma fatia mais antiga para escapar da cronologia.
