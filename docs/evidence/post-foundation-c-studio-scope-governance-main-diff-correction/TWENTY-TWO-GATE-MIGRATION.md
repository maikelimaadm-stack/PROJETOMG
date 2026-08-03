# Twenty-two-gate migration

Os 22 gates Studio passaram a consumir `evaluateStudioBranchDiffScope`. Cada um mantém seu
`CALLER_SLICE_ID` e o número de `gate(...)` inalterado.

```
g423-studio-foundation-audit.mjs
g423-studio-module-preview-sandbox-contract.mjs
g423-studio-dev-preview-contract-bridge.mjs
g423-studio-dev-preview-visual-contract.mjs
g423-studio-dev-preview-runtime-shell-contract.mjs
g423-studio-dev-preview-isolated-runtime-implementation-plan.mjs
g423-studio-dev-preview-isolated-runtime.mjs
g423-studio-dev-preview-runtime-ui-contract.mjs
g423-studio-dev-preview-runtime-ui-implementation-plan.mjs
g423-studio-dev-preview-runtime-ui.mjs
g423-studio-dev-preview-route-menu-contract.mjs
g423-studio-dev-preview-route-menu-implementation-plan.mjs
g423-studio-dev-preview-route-menu.mjs
g423-studio-dev-preview-app-integration-contract.mjs
g423-studio-dev-preview-app-integration-implementation-plan.mjs
g423-studio-dev-preview-app-integration.mjs
g423-studio-module-blueprint-authoring-foundation-contract.mjs
g423-studio-module-blueprint-authoring-implementation-plan.mjs
g423-studio-module-blueprint-authoring-runtime.mjs
g423-studio-authoring-runtime-to-preview-bridge-contract.mjs
g423-studio-authoring-runtime-to-preview-bridge-implementation-plan.mjs
g423-studio-authoring-runtime-to-preview-bridge.mjs
```

`g423-studio-foundation-audit`, embora já estivesse verde, usa o mesmo helper — não há divergência
de mecanismo entre os 22.

## A avaliação memoizada

```js
const evaluation = evaluateStudioBranchDiffScope(changed, { callerSliceId: CALLER_SLICE_ID });
```

## O check de cronologia

```js
const chronologyOk = !evaluation.applicable
  || (evaluation.activeSliceOrdinal !== null && evaluation.activeSliceOrdinal >= evaluation.callerSliceOrdinal);
noOldEdit = evaluation.safe && chronologyOk;
noOldEditDetail = !evaluation.applicable
  ? `branch diff not applicable: ${evaluation.reason}`
  : noOldEdit ? `no unauthorized prior gate/test (active ... >= ...)` : `blocked: ${evaluation.blockers.join(',')}`;
```

O detalhe reportado distingue explicitamente "nada para julgar" de "aprovado", em vez de exibir
`blocked:` com lista de blockers vazia. Nenhum gate fabrica `0 scenarios`: a cascata anterior
desapareceu porque os testes que esses gates executam voltaram ao verde.
