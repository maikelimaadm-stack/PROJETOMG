# State Boundary

`createDevPreviewRuntimeShellStateBoundary()` declares which state kinds a future shell WOULD
expose (read-only metadata: idle … permissionDenied) and which are permanently blocked
(reactState, hookState, mutableRuntimeState, persistedState, storageState). `readOnlyState` is
`true`; `reactState`, `hooks`, `storage`, `persistence` are all `false`.
