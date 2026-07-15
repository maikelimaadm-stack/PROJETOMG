# Lifecycle / Cleanup Contract — `createLifecycleCleanupContract`

Metadata only; asserts no lifecycle/cleanup is integrated:

- `lifecycleIntegrated: false`, `cleanupIntegrated: false`, `unmountIntegrated: false`;
- `autoStartAllowed: false`, `autoStopAllowed: false`;
- `futureCleanup: dev_only_contract`.

A future integration must define its own explicit start/stop/unmount lifecycle; nothing auto-starts
or auto-stops here.
