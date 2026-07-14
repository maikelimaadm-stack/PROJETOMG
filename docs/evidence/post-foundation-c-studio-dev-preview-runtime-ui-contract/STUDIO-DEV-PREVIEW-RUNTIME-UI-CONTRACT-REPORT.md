# Studio Dev Preview Runtime UI Contract — Report

## Purpose
Define, as headless metadata, the CONTRACT of a future dev-preview UI runtime by mapping the
isolated runtime's virtual preview frame into UI node / layout / component-binding /
interaction-binding / render-boundary / state / accessibility / theme projections plus
blocked-action metadata — WITHOUT creating any real UI.

## Public surface (`index.js`)
- Config + flags: `RUNTIME_UI_CONTRACT_*`, `UI_NODE_KINDS`, `BLOCKED_ACTION_KINDS`,
  `INTERACTION_KINDS`, `RUNTIME_UI_CONTRACT_CAPABILITIES`, `is*Enabled`, `uiContractDigest`.
- Errors: `RUNTIME_UI_CONTRACT_ERROR_CODES`, `RuntimeUiContractError`, `createRuntimeUiContractError`.
- Builders: session, virtual-frame mapping, UI node, layout, component binding, interaction
  binding, render boundary, state/accessibility/theme projections, blocked action, safety policy,
  readiness, manifest, verifier, compatibility, diagnostics, fallback.
- Composer: `createStudioDevPreviewRuntimeUiContract({ isolatedRuntime })`.

## Contract shape (top level)
`kind: studio-dev-preview-runtime-ui-contract`, `runtimeUiContractVersion:
studio-dev-preview-runtime-ui-contract@1.0.0`, `mode: headless_dev_preview_runtime_ui_contract`,
`readiness: studio_dev_preview_runtime_ui_contract_ready`, `readyForRuntimeUiContract: true`,
`readyForRuntimeUiImplementation: false`, `readyForRouteMenuIntegration: false`,
`readyForRealModuleGeneration: false`, `readyForProduction: false`, `blockerCount: 0`,
`warningCount: 0`, plus frozen `capabilities` with `visualRuntimeImplemented: false` and every
other forbidden flag `false`.
