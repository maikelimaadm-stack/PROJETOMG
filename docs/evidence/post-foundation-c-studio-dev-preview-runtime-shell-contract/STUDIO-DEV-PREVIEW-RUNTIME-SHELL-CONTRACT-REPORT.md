# Studio Dev Preview Runtime Shell Contract — Report

## Purpose
Define, as headless metadata, the CONTRACT of a future dev-preview runtime shell: how it would
be configured, what phases it moves through, what it may mount, which events it exposes, how a
render request looks, and the boundaries (state / error / permission / data / isolation) it
must respect — WITHOUT implementing any runtime.

## Public surface (`index.js`)
- Config + flags: `RUNTIME_SHELL_*`, `RUNTIME_SHELL_LIFECYCLE_PHASES`, `RUNTIME_SHELL_EVENT_KINDS`,
  `ALLOWED_MOUNT_TARGET_KINDS`, `BLOCKED_MOUNT_TARGET_KINDS`, `ALLOWED_STATE_KINDS`,
  `BLOCKED_STATE_KINDS`, `RUNTIME_SHELL_HEADLESS_CAPABILITIES`, `is*Enabled`, `shellDigest`.
- Errors: `RUNTIME_SHELL_ERROR_CODES`, `DevPreviewRuntimeShellContractError`, `createDevPreviewRuntimeShellContractError`.
- Builders: session, lifecycle, mount boundary, event contract, render request, state boundary,
  error boundary, permission boundary, data boundary, isolation, policy, route/placement blocked,
  safety, readiness, manifest, verifier, compatibility, diagnostics, fallback.
- Composer: `createStudioDevPreviewRuntimeShellContract({ visualContract })`.

## Contract shape (top level)
`kind: studio-dev-preview-runtime-shell-contract`, `runtimeShellContractVersion:
studio-dev-preview-runtime-shell-contract@1.0.0`, `mode:
headless_dev_preview_runtime_shell_contract`, `readiness:
studio_dev_preview_runtime_shell_contract_ready`, `readyForDevPreviewRuntimeShellContract: true`,
`readyForDevPreviewRuntimeImplementation: false`, `readyForRealModuleGeneration: false`,
`readyForProduction: false`, `blockerCount: 0`, `warningCount: 0`, plus frozen `capabilities`
with every side-effect flag `false`.
