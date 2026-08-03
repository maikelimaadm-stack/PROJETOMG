# Migração dos vinte e dois gates Studio para a fronteira de aplicabilidade

## O que mudou

Os vinte e dois gates julgavam o diff com `evaluateStudioBranchDiffScope` e reprovavam quando a
fatia ativa da branch era anterior ao próprio caller. Agora julgam a própria aplicabilidade:

```js
const evaluation = evaluateStudioBranchConsumerScope(branchPaths, { callerSliceId: CALLER_SLICE_ID });
const chronologyOk = evaluation.consumerApplicable
  ? (evaluation.activeSliceOrdinal !== null && evaluation.activeSliceOrdinal >= evaluation.consumerSliceOrdinal)
  : (evaluation.reason === 'empty_branch_diff'
    || (evaluation.reason === 'consumer_slice_after_active_slice' && evaluation.certifiedAgainstActiveSlice === true));
gate('... — branch scope', evaluation.safe === true && chronologyOk);
```

`evaluation.safe === true` permanece obrigatório em todos os ramos. O ramo inaplicável exige
`certifiedAgainstActiveSlice === true`: sem recertificação contra a fatia dona, a branch não passa.

## Os vinte e dois arquivos

```
scripts/gates/g423-studio-foundation-audit.mjs
scripts/gates/g423-studio-module-preview-sandbox-contract.mjs
scripts/gates/g423-studio-dev-preview-contract-bridge.mjs
scripts/gates/g423-studio-dev-preview-visual-contract.mjs
scripts/gates/g423-studio-dev-preview-runtime-shell-contract.mjs
scripts/gates/g423-studio-dev-preview-isolated-runtime-implementation-plan.mjs
scripts/gates/g423-studio-dev-preview-isolated-runtime.mjs
scripts/gates/g423-studio-dev-preview-runtime-ui-contract.mjs
scripts/gates/g423-studio-dev-preview-runtime-ui-implementation-plan.mjs
scripts/gates/g423-studio-dev-preview-runtime-ui.mjs
scripts/gates/g423-studio-dev-preview-route-menu-contract.mjs
scripts/gates/g423-studio-dev-preview-route-menu-implementation-plan.mjs
scripts/gates/g423-studio-dev-preview-route-menu.mjs
scripts/gates/g423-studio-dev-preview-app-integration-contract.mjs
scripts/gates/g423-studio-dev-preview-app-integration-implementation-plan.mjs
scripts/gates/g423-studio-dev-preview-app-integration.mjs
scripts/gates/g423-studio-module-blueprint-authoring-foundation-contract.mjs
scripts/gates/g423-studio-module-blueprint-authoring-implementation-plan.mjs
scripts/gates/g423-studio-module-blueprint-authoring-runtime.mjs
scripts/gates/g423-studio-authoring-runtime-to-preview-bridge-contract.mjs
scripts/gates/g423-studio-authoring-runtime-to-preview-bridge-implementation-plan.mjs
scripts/gates/g423-studio-authoring-runtime-to-preview-bridge.mjs
```

## Verificação

- Cada gate declara `const CALLER_SLICE_ID = '...';`, usa `evaluateStudioBranchConsumerScope(`
  e não contém mais `evaluateStudioBranchDiffScope(`.
- Nenhum ganhou exceção local: `migrationExempt`, allowlist de caminhos, casamento por prefixo
  ou verificação por nome de branch continuam ausentes.
- As exceções históricas continuam vindo exclusivamente de
  `createResolvedActiveStudioSlicePathAuthorizer`, a fonte única já certificada na fatia 43.
- `g423-studio-dev-preview-app-integration.mjs` mantém, além disso, as asserções diretas sobre
  `isKnownLaterStudioHeadlessArtifact` — elas são afirmações de API, não isenções.
